const pages = [...document.querySelectorAll('[data-page]')];
const routes = [...document.querySelectorAll('[data-route]')];
const nav = document.querySelector('.main-nav');
const menu = document.querySelector('.menu-toggle');
let twitchLoaded = false;

function routeTo(name){
  const target = pages.find(p => p.dataset.page === name) || pages[0];
  pages.forEach(p => p.classList.toggle('active', p === target));
  routes.forEach(a => a.classList.toggle('active', a.dataset.route === target.dataset.page && a.closest('nav')));
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  if(target.dataset.page === 'watch') loadTwitch();
}

routes.forEach(el => el.addEventListener('click', e => {
  const name = el.dataset.route;
  if(!name) return;
  e.preventDefault();
  history.pushState({}, '', `#${name}`);
  routeTo(name);
}));

window.addEventListener('popstate', () => routeTo(location.hash.slice(1) || 'home'));
menu.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(isOpen));
});

function loadTwitch(){
  if(twitchLoaded) return;
  const host = window.location.hostname;
  const mount = document.getElementById('twitch-player');
  if(!host){
    mount.innerHTML = `<div class="player-placeholder"><img src="assets/rippy-idle.gif" alt="Rippy idle"><p>The Twitch player will load after this site is hosted on GitHub Pages or a custom domain.</p></div>`;
    return;
  }
  const src = `https://player.twitch.tv/?channel=rippy_vt&parent=${encodeURIComponent(host)}&autoplay=false&muted=true`;
  mount.innerHTML = `<iframe src="${src}" title="Rippy_VT Twitch stream" allowfullscreen="true" scrolling="no" frameborder="0" allow="autoplay; fullscreen"></iframe>`;
  twitchLoaded = true;
}

const gallery = [
  ['assets/gallery/commission-01.webp','Rippy commission 01'],
  ['assets/gallery/commission-02.webp','Rippy commission 02'],
  ['assets/gallery/commission-03.webp','Rippy commission 03'],
  ['assets/gallery/commission-04.webp','Rippy commission 04'],
  ['assets/gallery/commission-05.webp','Rippy commission 05'],
  ['assets/gallery/commission-06.webp','Rippy commission 06'],
  ['assets/gallery/commission-07.webp','Rippy commission 07'],
  ['assets/gallery/commission-08.webp','Rippy commission 08'],
  ['assets/gallery/commission-09.webp','Rippy commission 09'],
  ['assets/gallery/commission-10.webp','Rippy commission 10']
];
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('art-modal');
const modalImg = modal.querySelector('img');
const modalText = modal.querySelector('p');

gallery.forEach(([src,label],i) => {
  const btn = document.createElement('button');
  btn.className = 'gallery-item';
  btn.type = 'button';
  btn.setAttribute('aria-label',`Open ${label}`);
  btn.innerHTML = `<img loading="lazy" src="${src}" alt="${label}">`;
  btn.addEventListener('click', () => {
    modalImg.src = src; modalImg.alt = label; modalText.textContent = label;
    modal.showModal();
  });
  galleryGrid.appendChild(btn);
});
modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if(e.target === modal) modal.close(); });

document.getElementById('copy-email').addEventListener('click', async () => {
  try{ await navigator.clipboard.writeText('rippyvt@gmail.com'); showToast('Email copied ♡'); }
  catch{ showToast('rippyvt@gmail.com'); }
});
function showToast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>t.classList.remove('show'),1800);
}

document.getElementById('year').textContent = new Date().getFullYear();
routeTo(location.hash.slice(1) || 'home');
