import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const english = JSON.parse(await read('_data/profile.json'));
const chinese = JSON.parse(await read('_data/profile.zh.json'));
const translations = JSON.parse(await read('_data/i18n.json'));
const languages = JSON.parse(await read('_data/languages.json'));
const linkSources = JSON.parse(await read('_data/links.json'));
const aliases = new Map(linkSources.flatMap(item => item.labels.map(label => [label, item.url])));
const linkPattern = new RegExp('(' + [...aliases.keys()].sort((a,b) => b.length-a.length).map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
const linked = text => String(text ?? '').split(linkPattern).map(part => aliases.has(part) ? `<a class="inline-link" href="${esc(aliases.get(part))}" target="_blank" rel="noopener">${esc(part)}</a>` : esc(part)).join('');
const honors = JSON.parse(await read('_data/honors.json'));
const template = await read('_layouts/default.html');
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const routes = {about: '', publications: 'publications/', experience: 'experience/', research: 'research/'};
const outputs = [];

const icons = `<svg class="icon-defs" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6"/></symbol>
<symbol id="i-code" viewBox="0 0 24 24"><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></symbol>
<symbol id="i-theme" viewBox="0 0 24 24"><path d="M20.8 13a8.9 8.9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18"/></symbol>
<symbol id="i-chevron" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
</defs></svg>`;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const arrow = icon('arrow');
const ext = (url, label, classes = '') => `<a class="${classes}" href="${esc(url)}" target="_blank" rel="noopener">${label} ${arrow}</a>`;

for (const locale of ['en', 'zh']) {
  const t = translations[locale];
  const data = locale === 'en' ? english : {...english, ...chinese, publications: english.publications.map(p => ({...p, ...chinese.publications[p.id]}))};
  const displayName = data.displayName || data.name;
  const prefix = locale === 'zh' ? 'zh/' : '';
  const route = value => `/${prefix}${value}`;
  const authors = p => p.authors.map(author => `${author === english.name ? `<strong>${esc(author)}</strong>` : linked(author)}${p.equalAuthors.includes(author) ? '<sup>*</sup>' : ''}`).join(', ');
  const badge = p => `<span class="venue ${p.year === 2024 ? 'journal' : ''}">${esc(p.venue)}</span>${p.workshop ? ext(p.workshop.url, esc(p.workshop.label), 'workshop-badge') : ''}`;
  const pubLinks = p => `<div class="pub-links">${ext(p.pdf, `${icon('file')} ${t.paper}`)}${p.project ? ext(p.project, t.project) : ''}${p.arxiv ? ext(p.arxiv, 'arXiv') : ''}${p.doi ? ext(p.doi, 'DOI') : ''}${p.code ? ext(p.code, `${icon('code')} ${t.code}`) : ''}${p.workshop ? ext(p.workshop.pdf, t.workshopPaper) : ''}${p.bibtex ? `<button class="cite-button" data-cite="${p.id}" aria-label="${esc(t.citeWork.replace('{name}', p.short))}">${t.citeButton} ${icon('copy')}</button>` : ''}</div>`;
  const paper = (p, compact = false) => `<article class="publication ${compact ? 'compact' : ''} reveal" id="${compact ? 'selected' : 'pub'}-${p.id}" ${compact ? '' : `data-category="${p.category}"`}>
    <a class="pub-visual ${p.id}" href="${compact ? route(`publications/#pub-${p.id}`) : p.pdf}" ${compact ? '' : 'target="_blank" rel="noopener"'} aria-label="${esc(t.readPaper)} ${p.short}"><img src="${p.image}" alt="${esc(p.imageAlt)}" width="1183" height="500" loading="lazy"><span class="visual-label">${esc(p.short)}</span></a>
    <div class="pub-body"><div class="pub-meta">${badge(p)}${compact ? '' : `<span class="publication-status">${p.status === 'Accepted' ? t.accepted : t.published}</span>`}</div>
    <${compact ? 'h3' : 'h2'}><a href="${compact ? route(`publications/#pub-${p.id}`) : p.pdf}" ${compact ? '' : 'target="_blank" rel="noopener"'}>${esc(p.title)}</a></${compact ? 'h3' : 'h2'}>
    <p class="pub-authors">${authors(p)}</p>${compact ? '' : `<p class="pub-summary">${esc(p.summary)}</p><div class="pub-role">${esc(p.role)}</div><details class="contribution"><summary>${t.contribution} <span>+</span></summary><p>${esc(p.contribution)}</p></details>${pubLinks(p)}${p.workshop ? `<p class="workshop-note">${esc(p.workshopNote || p.workshop.note)}</p>` : ''}`}</div>
    ${!compact && p.video ? `<figure class="demo-figure"><video id="research-video" controls muted playsinline loop preload="none" poster="${p.image}" aria-label="${esc(t.videoLabel)}"><source src="${p.video}" type="video/mp4"></video><figcaption><strong>MERL</strong><span>${esc(t.videoNote)}</span>${ext(p.project, t.project)}</figcaption></figure>` : ''}
  </article>`;
  const sidebar = `<aside class="profile-sidebar" aria-label="${esc(displayName)}"><div class="profile-top"><figure class="profile-photo"><img src="${data.portrait}" alt="${esc(t.portraitAlt)}" width="381" height="381" fetchpriority="high"><figcaption>${esc(t.portraitCaption)}</figcaption></figure><div class="profile-identity"><a class="profile-name" href="${route('')}">${esc(displayName)}<span>.</span></a><p class="profile-position">${esc(t.profilePosition)}</p><p class="profile-affiliations">${t.profileAffiliations.split('\n').map(linked).join('<br>')}</p><p class="profile-location"><span class="location-dot" aria-hidden="true"></span>${esc(t.profileLocation)}</p></div></div>
    <div class="profile-contact"><a class="profile-email" href="mailto:${data.email}">${icon('mail')} ${data.email}</a><div class="profile-links">${ext(data.cv, `${icon('file')} ${t.cvNav}`)}${ext(data.github, `${icon('code')} GitHub`)}</div></div>
    <div class="profile-interests"><span class="eyebrow">${t.profileInterests}</span><ul>${data.interests.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div><div class="profile-logos"><a class="sysu" href="${aliases.get('Sun Yat-sen University')}" target="_blank" rel="noopener"><img src="assets/images/sysu-white.png" alt="Sun Yat-sen University" width="112" height="32"></a><a class="slai" href="${aliases.get('SLAI')}" target="_blank" rel="noopener"><img src="assets/images/slai-white.png" alt="Shenzhen Loop Area Institute" width="112" height="32"></a></div></aside>`;
  const heading = (title, description = '') => `<header class="page-heading"><p class="eyebrow">${esc(displayName)} <span>/</span> ${t.heroEyebrow}</p><h1>${title}</h1>${description ? `<p>${esc(description)}</p>` : ''}</header>`;
  const sectionHeading = (title, extra = '') => `<div class="section-heading"><h2>${title}</h2>${extra}</div>`;
  const news = [...data.news].sort((a, b) => b.date.localeCompare(a.date));
  const contact = `<section class="contact-section content-section" id="contact">${sectionHeading(t.contactTitle)}<p>${esc(data.contact)}</p><div class="contact-links"><a href="mailto:${data.email}">${data.email} ${arrow}</a><button id="copy-email" data-email="${data.email}" aria-label="${t.copyEmail}">${icon('copy')}<span>${t.copyEmail}</span></button></div></section>`;
  const entry = (item, headingTag = 'h3') => {
    const url = aliases.get(item.institution);
    const logoTag = url ? 'a' : 'div';
    return `<article class="experience-entry"><${logoTag} class="institution-logo ${item.brand || ''}"${url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : ''}>${item.logo ? `<img src="${item.logo}" alt="${esc(item.institution)} logo" width="104" height="60" loading="lazy">` : ''}</${logoTag}><div class="entry-body"><div class="entry-heading"><${headingTag}>${linked(item.institution)}</${headingTag}>${item.dates ? `<p class="entry-date">${esc(item.dates)}</p>` : ''}</div>${item.qualification ? `<p class="entry-role">${esc(item.qualification)}</p>` : ''}${item.detail ? `<p class="entry-detail">${linked(item.detail)}</p>` : ''}</div></article>`;
  };
  const appointment = `<article class="appointment-group" id="research-appointment"><header class="entry-heading"><h3>${esc(data.appointment.qualification)}</h3><p class="entry-date">${esc(data.appointment.dates)}</p></header><p class="appointment-summary">${linked(data.appointment.detail)}</p><div class="appointment-stages">${data.appointment.stages.map(stage => entry(stage, 'h4')).join('')}</div></article>`;
  const honorsSection = honors[locale].length ? `<section class="content-section" id="honors">${sectionHeading(locale === 'en' ? 'Honors & awards' : '荣誉与奖励')}<ul class="honors-list">${honors[locale].map(h => `<li><time>${esc(h.year)}</time><div><h3>${h.url ? ext(h.url, esc(h.title)) : esc(h.title)}</h3><p>${esc(h.organization)}</p></div></li>`).join('')}</ul></section>` : '';
  const content = {
    about: `${heading(t.aboutTitle)}<section class="biography" id="about" aria-label="${t.aboutTitle}"><p class="bio-lead">${linked(data.bio)}</p><p class="research-affiliation">${linked(data.researchAffiliation)}</p><p>${esc(data.intro)} ${linked(data.background)}</p><p class="bio-invitation">${esc(data.contact)} <a href="mailto:${data.email}">${t.touch} ${arrow}</a></p></section>
      <section class="content-section news-section" id="news">${sectionHeading(t.news, `<span class="news-hint" id="news-hint">${t.newsHint} <span aria-hidden="true">↓</span></span>`)}<div class="news-scroll" tabindex="0" role="region" aria-label="${t.newsRegion}" aria-describedby="news-hint"><ol class="news-list">${news.map(n => `<li data-news-id="${n.id}"><time datetime="${n.date}">${esc(n.label)}</time><div><span class="news-tag">${esc(n.tag)}</span><p>${n.anchor ? `<a href="${route(n.anchor)}">${esc(n.text)}</a>` : esc(n.text)}</p></div></li>`).join('')}</ol></div></section>
      <section class="content-section selected-publications" id="publications">${sectionHeading(t.selected, `<a class="text-link" href="${route('publications/')}">${t.viewAll} ${arrow}</a>`)}<div class="publication-list">${data.publications.map(p => paper(p, true)).join('')}</div><p class="authors-note">${t.equal}</p></section>
      <section class="experience-preview content-section" id="experience">${sectionHeading(t.moreExperience, `<a class="text-link" href="${route('experience/')}">${t.readMore} ${arrow}</a>`)}<p>${linked(t.experienceOverview)}</p></section>${contact}`,
    publications: `${heading(t.pagePublications, t.pubIntro)}<div class="pub-toolbar"><div class="pub-filters" role="group" aria-label="${t.filterLabel}"><button data-filter="all" aria-pressed="true">${t.all} <span>${data.publications.length}</span></button><button data-filter="robot" aria-pressed="false">${t.robot} <span>${data.publications.filter(p => p.category === 'robot').length}</span></button><button data-filter="prediction" aria-pressed="false">${t.prediction} <span>${data.publications.filter(p => p.category === 'prediction').length}</span></button></div><span class="authors-note">${t.equal}</span></div><div class="publication-list full-publications" id="publications">${data.publications.map(p => paper(p)).join('')}</div><p class="pub-footnote">${t.proceedings}</p><p class="sr-only" id="filter-status" role="status" aria-live="polite"></p>`,
    experience: `${heading(t.pageExperience, t.experienceIntro)}<nav class="page-contents" aria-label="${t.tocLabel}"><a href="#education">${t.education}</a><a href="#industry">${t.industry}</a><a href="#skills">${t.skillsTitle}</a>${honors[locale].length ? `<a href="#honors">${locale === 'en' ? 'Honors' : '荣誉'}</a>` : ''}</nav><section class="experience-group" id="education">${sectionHeading(t.education)}${data.education.map(item => entry(item)).join('')}</section><section class="experience-group content-section" id="industry">${sectionHeading(t.industry)}${appointment}${data.experience.map(item => entry(item)).join('')}</section><section class="content-section" id="skills">${sectionHeading(t.skillsTitle)}<ul class="skills-list">${data.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul></section>${honorsSection}<p class="cv-note">${ext(data.cv, `${t.fullCV} · PDF`)}<span>${t.cvNote}</span></p>`,
    research: `${heading(t.pageResearch, data.researchIntro)}<section id="directions" class="research-directions" aria-label="${t.pageResearch}">${data.research.map(r => `<article class="research-thread reveal"><span class="thread-number">${esc(r.number)}</span><div><h2>${esc(r.title)}</h2><p>${esc(r.text)}</p><span class="thread-note">${esc(r.note)}</span></div></article>`).join('')}</section><section class="content-section research-note">${sectionHeading(t.collaborationTitle)}<p>${linked(data.collaboration)}</p><span class="note-caption">${linked('SLAI / EACV')} · ${t.researchStatus}</span></section><section class="content-section research-note">${sectionHeading(t.futureTitle)}<p>${esc(data.future.replace('Looking ahead, ', ''))}</p></section><a class="text-link research-next" href="${route('publications/')}">${t.viewAll} ${arrow}</a>${contact}`
  };
  const dialog = `<dialog class="citation-dialog" id="citation-dialog" aria-labelledby="citation-title"><div class="dialog-heading"><div><span class="eyebrow">${t.reference}</span><h2 id="citation-title">${t.citeTitle}</h2></div><button id="close-citation" class="icon-button" aria-label="${t.closeCitation}">${icon('close')}</button></div><pre><code id="citation-code"></code></pre><p class="citation-note" id="citation-note"></p><button class="button primary" id="copy-citation">${icon('copy')} ${t.copyBib}</button><span class="copy-status" id="copy-status" role="status"></span></dialog><script type="application/json" id="citation-data">${json(data.publications.filter(p => p.bibtex).map(({id, short, bibtex}) => ({id, short, bibtex})))}</script>`;
  const schema = json({'@context': 'https://schema.org', '@type': 'Person', name: displayName, alternateName: locale === 'zh' ? english.name : chinese.displayName, url: data.url, image: `${data.url}${data.portrait}`, email: `mailto:${data.email}`, jobTitle: data.role, sameAs: [data.github], knowsAbout: ['Embodied artificial intelligence', 'World-action models', 'Robot learning'], affiliation: [{'@type': 'Organization', name: 'Sun Yat-sen University', url: aliases.get('Sun Yat-sen University')}, {'@type': 'Organization', name: 'Shenzhen Loop Area Institute', url: aliases.get('SLAI')}], memberOf: [{'@type': 'Organization', name: 'Center for Embodied Artificial Intelligence and Computer Vision', url: aliases.get('EACV'), parentOrganization: {'@type': 'Organization', name: 'Shenzhen Loop Area Institute'}}, {'@type': 'Organization', name: 'Spatial Artificial Intelligence Lab', url: aliases.get('SAIL'), parentOrganization: {'@type': 'Organization', name: 'Sun Yat-sen University'}}], alumniOf: [{'@type': 'CollegeOrUniversity', name: 'Tsinghua University'}, {'@type': 'CollegeOrUniversity', name: "Xi'an Jiaotong University"}]});
  for (const [page, slug] of Object.entries(routes)) {
    const pageTitle = {about: t.siteTitle, publications: `${t.pagePublications} · ${displayName}`, experience: `${t.pageExperience} · ${displayName}`, research: `${t.pageResearch} · ${displayName}`}[page];
    const labels = {about: t.about, publications: t.publicationsNav, experience: t.experienceNav, research: t.researchNav};
    const navigation = Object.entries(routes).map(([key, value]) => `<a href="${route(value)}"${key === page ? ' class="active" aria-current="page"' : ''}>${labels[key]}</a>`).join('');
    const currentLanguage = languages.find(language => language.locale === locale);
    const languagePicker = `<details class="language-picker" id="language-picker"><summary class="language-toggle" aria-label="${esc(t.languageLabel)}" title="${esc(t.languageSelect)}" aria-controls="language-options">${icon('globe')}<span class="language-code">${esc(currentLanguage.shortName)}</span>${icon('chevron')}</summary><nav class="language-options" id="language-options" aria-label="${esc(t.languageSelect)}"><span class="language-caption">${esc(t.languageCaption)}</span>${languages.map(language => {const href = `/${language.path}${slug}`;return `<a href="${href}" data-language data-base="${href}" lang="${language.lang}" hreflang="${language.lang}"${language.locale === locale ? ' aria-current="true"' : ''}><span>${esc(language.name)}</span>${icon('check')}</a>`;}).join('')}</nav></details>`;
    const values = {...t, displayName: esc(displayName), page, navigation, title: esc(pageTitle), description: esc(t.description), url: data.url + prefix + slug, homeHref: route(''), cv: data.cv, cvDate: data.cvDate, imageUrl: data.url + 'assets/images/social-preview.png', icons, sidebar, main: content[page], dialog: (page === 'publications' ? dialog : '') + `<script type="application/json" id="ui-data">${json(t)}</script>`, schema, arrow, themeIcon: icon('theme'), updatedPrefix: t.updated, updated: data.updatedLabel, languageHref: `/${locale === 'en' ? 'zh/' : ''}${slug}`, otherLang: locale === 'en' ? 'zh-CN' : 'en', alternateLinks: `<link rel="alternate" hreflang="en" href="${data.url}${slug}"><link rel="alternate" hreflang="zh-CN" href="${data.url}zh/${slug}"><link rel="alternate" hreflang="x-default" href="${data.url}${slug}">`};
    let html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => key === 'languagePicker' ? languagePicker : values[key] ?? '');
    html = html.replace(/(href|src|poster)="assets\//g, '$1="/assets/').replace(/[ \t]+$/gm, '');
    const filename = `${prefix}${slug}index.html`;
    await mkdir(path.dirname(path.join(root, filename)), {recursive: true});
    await writeFile(path.join(root, filename), html);
    outputs.push(filename);
  }
}
await writeFile(path.join(root, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · Wenzhan Li</title><link rel="stylesheet" href="/assets/css/global.css"></head><body><main class="not-found wrap"><p class="eyebrow">404 / A small detour</p><h1>This path ends here.</h1><p>The research continues. Let's get you back to the homepage.</p><a class="button primary" href="/">Back to Wenzhan's homepage ↗</a></main></body></html>`);
await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${outputs.map(file => `<url><loc>${english.url}${file.replace(/index\.html$/, '')}</loc><lastmod>${english.updated}</lastmod></url>`).join('')}</urlset>\n`);
await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${english.url}sitemap.xml\n`);
await import('./verify.mjs');
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Invalid build destination');
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const file of ['index.html', '404.html', 'zh', 'publications', 'experience', 'research', 'assets', 'sitemap.xml', 'robots.txt']) await cp(path.join(root, file), path.join(output, file), {recursive: true});
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Built ${outputs.length} bilingual academic pages in dist/. No runtime or third-party scripts required.`);
