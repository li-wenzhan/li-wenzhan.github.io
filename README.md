# Wenzhan Li · Academic Homepage

[Visit the website](https://li-wenzhan.github.io/) · [MERL project](https://merl-project.github.io/)

A bilingual academic homepage for research exchanges, collaborations, internships,
and sharing work in embodied AI, world-action models, and robot learning.
The design combines warm paper tones, forest-green ink, editorial typography,
real research figures, a personal portrait, and restrained interactions.

English is the default at `/`; the complete Chinese edition lives at `/zh/`.
The language control preserves the current page and fragment. Paper titles, author lists,
and BibTeX retain their official bibliographic form in both editions.

## Preview and publish

Requires Node.js 22 or later; there are no package dependencies.

```sh
npm run build
npm run dev
# Open http://127.0.0.1:4179
```

`npm run build` generates eight static pages and `dist/`, and verifies local assets,
publication data, font files, JavaScript, and disclosure boundaries. A push to
`main` deploys `dist/` using GitHub Actions. The site is served at the root of
`li-wenzhan.github.io`; no `/academic-homepage/` prefix is used.

## Keep the website current

| What to update | Where |
| --- | --- |
| Biography, contact details, status | [`_data/profile.json`](_data/profile.json) |
| Chinese content overrides | [`_data/profile.zh.json`](_data/profile.zh.json) |
| English/Chinese interface labels | [`_data/i18n.json`](_data/i18n.json) |
| Language menu names and paths | [`_data/languages.json`](_data/languages.json) |
| Dated news | `news` array; automatically sorted newest first at build time |
| Papers and contribution statements | `publications` array |
| Honors and awards (currently hidden) | [`_data/honors.json`](_data/honors.json); empty lists render no section |
| Education and employment | `education`, `experience`, `appointment` |
| Research directions | `research`, `collaboration`, `future` |
| CV PDF | `assets/documents/Wenzhan_Li_CV.pdf`; update `cvDate` |
| Portrait, paper thumbnails, logos | `assets/images/` |
| Layout | `_layouts/default.html`, `tools/build.mjs` |
| Colors and responsive typography | `assets/css/global.css` |
| Filters, citations, theme and navigation | `assets/js/main.js` |

After changing the data, run `npm run build` and commit the regenerated HTML.
Edit the data files rather than generated HTML so future builds preserve updates.
See the [Chinese content editing guide](docs/EDITING.md) for News, dates, and the
reserved honors section.
Set `updated` and `updatedLabel` when making a substantive content update.
New publications should include the full verified author list, equal-contribution
markers, publication status, links, a thumbnail with alt text, and a concise
description. Add BibTeX only when its metadata is established. CoRL 2026 entries
are accepted papers; no official proceedings citation is invented.

The current CV is the author-supplied **September 2026** edition. It is linked
as an unchanged PDF. The webpage's October update date is separate from the CV.
When adding new Chinese characters, run `python tools/chinese-fonts.py` to refresh
the self-hosted Noto font subsets (requires `fonttools[woff]` and network access).

## Interaction and accessibility

- Publication filters with accessible result announcements.
- About, Publications, Experience, and Research pages with a consistent profile sidebar.
- News in reverse chronological order, with a keyboard-accessible scroll area.
- Institution logos alongside education, research appointments, and industry roles.
- DADA's WPBP @ ICRA 2026 oral extended abstract grouped with its RA-L paper.
- Complete English/Chinese pages with reciprocal `hreflang` metadata.
- Globe language picker with native-language labels, a current-language mark,
  keyboard navigation, and a functional no-JavaScript dropdown.
- Native contribution disclosures and paper/video controls.
- Citation dialogs with keyboard dismissal and clipboard fallback.
- Light/dark themes with a saved preference.
- Mobile navigation, active page markers, and a reading progress line.
- Gentle scroll reveals and image hover response; reduced-motion support.
- Complete server-rendered content with local fonts and no tracking scripts.

## Provenance and attribution

Started from [Shitong Luo's academic-homepage](https://github.com/luost26/academic-homepage),
retaining the original MIT notice in `LICENSE`. The original data/layout/assets
organization informed this customized static site; the demo content and Jekyll
runtime have been replaced.

See [content and asset notes](docs/CONTENT_AND_ASSETS.md) for the factual baseline,
figure sources, and font notices. Academic papers, photos, logos, and research
figures retain their respective authors' or institutions' rights and are not
relicensed by the template's software license.
