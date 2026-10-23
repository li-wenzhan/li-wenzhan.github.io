(() => {
  'use strict';
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const ui = JSON.parse($('#ui-data').textContent);
  const languageLinks = $$('[data-language]');
  const languagePicker = $('#language-picker');
  const languageToggle = $('.language-toggle',languagePicker);
  const closeLanguage = (restoreFocus=false) => {languagePicker.open=false;if(restoreFocus)languageToggle.focus();};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const announce = text => { $('#announcement').textContent = text; };
  const themeButton = $('#theme-toggle');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label',theme==='dark'?ui.themeToLight:ui.themeToDark);
    themeButton.setAttribute('aria-pressed',String(theme==='dark'));
    themeButton.title=themeButton.getAttribute('aria-label');
    $('meta[name="theme-color"]').content = theme==='dark'?'#18241f':'#f7f6f1';
  }
  let savedTheme;
  try { savedTheme=localStorage.getItem('wenzhan-theme'); } catch {}
  setTheme(savedTheme==='dark'?'dark':'light');
  themeButton.addEventListener('click',() => {
    const theme = document.documentElement.dataset.theme==='dark'?'light':'dark';
    setTheme(theme); try { localStorage.setItem('wenzhan-theme',theme); } catch {}
  });
  const menu = $('#menu-toggle'), nav = $('#main-nav');
  const closeMenu = () => {nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',ui.openMenu);};
  menu.addEventListener('click',()=>{
    const open = menu.getAttribute('aria-expanded')!=='true';
    if(open)closeLanguage();
    nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?ui.closeMenu:ui.openMenu);
  });
  $$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
  languagePicker.addEventListener('toggle',()=>{if(languagePicker.open)closeMenu();});
  languageToggle.addEventListener('keydown',event=>{
    if(event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;
    event.preventDefault();languagePicker.open=true;
    languageLinks[event.key==='ArrowDown'?0:languageLinks.length-1].focus();
  });
  languageLinks.forEach((link,index)=>{
    link.addEventListener('click',()=>closeLanguage(true));
    link.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowDown')next=(index+1)%languageLinks.length;
      else if(event.key==='ArrowUp')next=(index-1+languageLinks.length)%languageLinks.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=languageLinks.length-1;
      else return;
      event.preventDefault();languageLinks[next].focus();
    });
  });
  languagePicker.addEventListener('focusout',event=>{if(!languagePicker.contains(event.relatedTarget))closeLanguage();});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(languagePicker.open){event.preventDefault();closeLanguage(true);}
    else if(nav.classList.contains('open')){closeMenu();menu.focus();}
  });
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();if(!languagePicker.contains(event.target))closeLanguage();});
  window.addEventListener('resize',()=>{if(innerWidth>640)closeMenu();},{passive:true});
  let progressQueued=false;
  function updateProgress() {
    progressQueued=false;
    const total=document.documentElement.scrollHeight-innerHeight;
    document.documentElement.style.setProperty('--progress',String(total>0?Math.min(1,scrollY/total):0));
    languageLinks.forEach(link=>{link.href=link.dataset.base+location.hash;});
  }
  window.addEventListener('hashchange',updateProgress);
  window.addEventListener('scroll',()=>{if(!progressQueued){progressQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});
  updateProgress();
  if('IntersectionObserver' in window&&!reduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.06});
    $$('.reveal').forEach(e=>{if(e.getBoundingClientRect().top>innerHeight+20)e.classList.add('reveal-ready');observer.observe(e);});
    reduced.addEventListener('change',event=>{if(event.matches){$$('.reveal').forEach(e=>e.classList.add('is-visible'));observer.disconnect();}});
  }
  const filterButtons=$$('[data-filter]'), publications=$$('[data-category]');
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let visible=0;
    publications.forEach(article=>{const show=filter==='all'||article.dataset.category===filter;article.hidden=!show;if(show){visible++;article.classList.add('is-visible');}else $$('video',article).forEach(v=>v.pause());});
    $('#filter-status').textContent=ui.filtered.replace('{count}',visible);
    updateProgress();
  }));
  const video=$('#research-video');
  // Playback is opt-in; don't keep a background or off-screen video running.
  if(video){
    document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause();},{threshold:0}).observe(video);
  }
  const citations=JSON.parse($('#citation-data')?.textContent||'[]');
  const dialog=$('#citation-dialog');
  let citationTrigger;
  $$('[data-cite]').forEach(button=>button.addEventListener('click',()=>{
    const citation=citations.find(c=>c.id===button.dataset.cite);if(!citation)return;
    citationTrigger=button;$('#citation-title').textContent=ui.citeWork.replace('{name}',citation.short);$('#citation-code').textContent=citation.bibtex;
    $('#citation-note').textContent=citation.id==='merl'?ui.arxivNote:ui.journalNote;
    $('#copy-status').textContent='';dialog.showModal();$('#close-citation').focus();
  }));
  $('#close-citation')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>citationTrigger?.focus({preventScroll:true}));
  async function copyText(text){
    if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true;}catch{}}
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';(dialog?.open?dialog:document.body).append(area);area.select();let success=false;try{success=document.execCommand('copy');}catch{}area.remove();return success;
  }
  $('#copy-citation')?.addEventListener('click',async()=>{$('#copy-status').textContent=await copyText($('#citation-code').textContent)?ui.copiedBib:ui.manualBib;});
  $('#copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget;const success=await copyText(button.dataset.email);announce(success?ui.copiedEmail:`${ui.emailLabel}: ${button.dataset.email}`);button.innerHTML=success?ui.emailCopied:ui.manualEmail;});
})();
