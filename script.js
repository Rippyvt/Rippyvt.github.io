const pages = [...document.querySelectorAll('[data-page]')];
const routes = [...document.querySelectorAll('[data-route]')];
const nav = document.querySelector('.main-nav');
const menu = document.querySelector('.menu-toggle');
let twitchPlayer = null;
let twitchLoaded = false;

function routeTo(name){
  const target = pages.find(p => p.dataset.page === name) || pages[0];
  pages.forEach(p => p.classList.toggle('active', p === target));
  routes.forEach(a => a.classList.toggle('active', a.dataset.route === target.dataset.page && a.closest('nav')));
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  if(target.dataset.page === 'watch') loadTwitch();
  if(target.dataset.page === 'schedule') updateSchedule();
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

function setStreamStatus(isOnline){
  const status = document.getElementById('stream-status');
  const dot = document.getElementById('status-dot');
  const home = document.getElementById('home-status-label');
  dot.classList.toggle('online', isOnline);
  dot.classList.toggle('offline', !isOnline);
  status.textContent = isOnline ? 'RIPPY IS LIVE NOW' : 'RIPPY IS CURRENTLY OFFLINE';
  home.textContent = isOnline ? 'RIPPY IS LIVE — COME YAP' : 'COMFY CHAOS ONLINE';
  sessionStorage.setItem('rippyLive', isOnline ? '1' : '0');
}

function loadTwitch(){
  if(twitchLoaded) return;
  const host = window.location.hostname;
  const mount = document.getElementById('twitch-player');
  if(!host){
    mount.innerHTML = `<div class="player-placeholder"><img src="assets/rippy-idle.gif" alt="Rippy idle"><p>The Twitch player loads after this site is hosted.</p></div>`;
    return;
  }
  if(!window.Twitch || !window.Twitch.Player){
    setTimeout(loadTwitch, 250);
    return;
  }
  mount.innerHTML = '';
  twitchPlayer = new Twitch.Player('twitch-player', {
    channel: 'rippy_vt',
    parent: [host],
    width: '100%',
    height: '100%',
    autoplay: false,
    muted: true
  });
  twitchPlayer.addEventListener(Twitch.Player.ONLINE, () => setStreamStatus(true));
  twitchPlayer.addEventListener(Twitch.Player.OFFLINE, () => setStreamStatus(false));
  twitchLoaded = true;
}

const priorLive = sessionStorage.getItem('rippyLive');
if(priorLive !== null) setStreamStatus(priorLive === '1');

// Mood selector
const moodArt = document.getElementById('mood-art');
const moodLine = document.getElementById('mood-line');
document.querySelectorAll('.mood').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.mood').forEach(b => b.classList.toggle('active', b === btn));
  moodArt.src = btn.dataset.src;
  moodLine.textContent = btn.dataset.line;
}));

// Questionably intelligent easter egg
const intValues = ['???','404','3-ish','PENDING','ASK CHAT','PROBABLY','[REDACTED]','BIG BRAIN?'];
let intIndex = 0;
document.getElementById('int-stat').addEventListener('click', () => {
  intIndex = (intIndex + 1) % intValues.length;
  document.getElementById('int-value').textContent = intValues[intIndex];
  showToast(intIndex === 1 ? 'Intelligence endpoint not found.' : 'Extensive testing remains inconclusive.');
});

// Schedule helper: iterate UTC moments and inspect them in Pacific time.
const pacificParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', weekday:'short', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false
});
const dayMap = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
const streamDays = new Set([1,3,5]);
function getPacificParts(date){
  const o = {};
  for(const p of pacificParts.formatToParts(date)) if(p.type !== 'literal') o[p.type] = p.value;
  return {dow:dayMap[o.weekday], hour:+o.hour, minute:+o.minute, y:o.year, m:o.month, d:o.day};
}
function nextOccurrence(targetDay=null){
  const step = 15*60*1000;
  const start = Math.floor(Date.now()/step)*step;
  for(let i=0;i<8*24*4+4;i++){
    const d = new Date(start + i*step);
    const p = getPacificParts(d);
    const goodDay = targetDay == null ? streamDays.has(p.dow) : p.dow === targetDay;
    if(goodDay && p.hour === 19 && p.minute === 45 && d.getTime() > Date.now()+60000) return d;
  }
  return null;
}
function updateSchedule(){
  const next = nextOccurrence();
  if(next){
    document.getElementById('next-stream-date').textContent = next.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    document.getElementById('next-stream-local').textContent = `${next.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})} in your local time • 7:45 PM PT`;
  }
  document.querySelectorAll('.local-slot').forEach(el => {
    const d = nextOccurrence(+el.dataset.day);
    if(d) el.textContent = `Your local time: ${d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}`;
  });
}

// Gallery
const gallery = [
  ...Array.from({length:10},(_,i)=>({src:`assets/gallery/commission-${String(i+1).padStart(2,'0')}.webp`, title:`Rippy commission ${String(i+1).padStart(2,'0')}`, category:'commission', credit:'Artist credit to add'})),
  ...Array.from({length:4},(_,i)=>({src:`assets/gallery/model/model-${String(i+1).padStart(2,'0')}.webp`, title:`Rippy model view ${i+1}`, category:'model', credit:'Character / model reference'})),
  ...Array.from({length:7},(_,i)=>({src:`assets/gallery/emotes/emote-${String(i+1).padStart(2,'0')}.webp`, title:`Rippy expression ${i+1}`, category:'emote', credit:'Expression art'})),
  ...Array.from({length:5},(_,i)=>({src:`assets/gallery/archive/archive-${String(i+1).padStart(2,'0')}.webp`, title:`Rippy archive ${i+1}`, category:'archive', credit:'Earlier / concept artwork'}))
];
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('art-modal');
const modalImg = modal.querySelector('img');
const modalTitle = document.getElementById('modal-title');
const modalCredit = document.getElementById('modal-credit');

function openArt(src,title,credit=''){
  modalImg.src = src; modalImg.alt = title; modalTitle.textContent = title; modalCredit.textContent = credit;
  modal.showModal();
}

gallery.forEach(item => {
  const btn = document.createElement('button');
  btn.className = 'gallery-item';
  btn.type = 'button';
  btn.dataset.category = item.category;
  btn.setAttribute('aria-label',`Open ${item.title}`);
  btn.innerHTML = `<span class="gallery-badge">${item.category.toUpperCase()}</span><img loading="lazy" src="${item.src}" alt="${item.title}">`;
  btn.addEventListener('click', () => openArt(item.src,item.title,item.credit));
  galleryGrid.appendChild(btn);
});

document.querySelectorAll('.gallery-filter').forEach(filter => filter.addEventListener('click', () => {
  document.querySelectorAll('.gallery-filter').forEach(b => b.classList.toggle('active', b===filter));
  const cat = filter.dataset.filter;
  galleryGrid.querySelectorAll('.gallery-item').forEach(item => item.classList.toggle('hidden', cat !== 'all' && item.dataset.category !== cat));
}));

modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if(e.target === modal) modal.close(); });
document.getElementById('open-reference').addEventListener('click', () => openArt('assets/rippy-reference.webp','Rippy character reference','Full character/model reference'));

// Business form - creates a pre-filled mailto so no server secrets are needed.
const form = document.getElementById('business-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = `[${data.type}] Business Inquiry for Rippy_VT — ${data.company}`;
  const body = `Hello Rippy,\n\nName: ${data.name}\nCompany / Brand: ${data.company}\nReply Email: ${data.email}\nCampaign Type: ${data.type}\nBudget Range: ${data.budget || 'Not provided'}\nTimeline: ${data.timeline || 'Not provided'}\n\nCampaign Details:\n${data.message}\n\nThank you!`;
  window.location.href = `mailto:rippyvt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById('copy-email').addEventListener('click', async () => {
  try{ await navigator.clipboard.writeText('rippyvt@gmail.com'); showToast('Email copied ♡'); }
  catch{ showToast('rippyvt@gmail.com'); }
});

// Tiny Rippy companion
const companion = document.getElementById('rippy-companion');
const bubble = document.getElementById('companion-bubble');
const lines = [
  'pspspsps… click me',
  'Chat says my INT stat is generous.',
  'Did you drink water today?',
  'Sponsor me. I can be normal. Probably.',
  'I have never made a bad decision on stream.',
  'That last statement was reviewed by nobody.',
  'Certified catboy behavior ♡'
];
let lineIndex = 0;
companion.addEventListener('click', () => {
  lineIndex = (lineIndex + 1) % lines.length;
  bubble.textContent = lines[lineIndex];
  companion.classList.add('chatty');
  clearTimeout(window.__companion);
  window.__companion = setTimeout(()=>companion.classList.remove('chatty'),2600);
});

function showToast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>t.classList.remove('show'),1800);
}

document.getElementById('year').textContent = new Date().getFullYear();
updateSchedule();
routeTo(location.hash.slice(1) || 'home');
