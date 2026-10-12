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
  nav?.classList.remove('open');
  menu?.setAttribute('aria-expanded','false');
  window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  if(target.dataset.page === 'watch') loadTwitch();
  if(target.dataset.page === 'schedule') updateSchedule();
  document.body.dataset.page = target.dataset.page;
  document.getElementById('rippy-companion')?.classList.toggle('home-hidden', target.dataset.page === 'home');
}

routes.forEach(el => el.addEventListener('click', e => {
  const name = el.dataset.route;
  if(!name) return;
  e.preventDefault();
  history.pushState({}, '', `#${name}`);
  routeTo(name);
}));
window.addEventListener('popstate', () => routeTo(location.hash.slice(1) || 'home'));
menu?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(isOpen));
});

function setStreamStatus(isOnline){
  const status = document.getElementById('stream-status');
  const dot = document.getElementById('status-dot');
  const home = document.getElementById('home-status-label');
  if(dot){
    dot.classList.toggle('online', isOnline);
    dot.classList.toggle('offline', !isOnline);
  }
  if(status) status.textContent = isOnline ? 'RIPPY IS LIVE NOW' : 'RIPPY IS CURRENTLY OFFLINE';
  if(home) home.textContent = isOnline ? 'RIPPY IS LIVE — COME YAP' : 'COMFY CHAOS ONLINE';
  sessionStorage.setItem('rippyLive', isOnline ? '1' : '0');
}

function loadTwitch(){
  if(twitchLoaded) return;
  const host = window.location.hostname;
  const mount = document.getElementById('twitch-player');
  if(!mount) return;
  if(!host){
    mount.innerHTML = `<div class="player-placeholder"><img src="assets/rippy-idle.gif" alt="Rippy idle"><p>Open the published site to watch Twitch here.</p></div>`;
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
  if(moodArt) { moodArt.src = btn.dataset.src; moodArt.style.setProperty('--art-shift', btn.dataset.shift || '0px'); }
  if(moodLine) moodLine.textContent = btn.dataset.line;
}));

// Questionably intelligent easter egg
const intValues = ['???','404','3-ish','PENDING','ASK CHAT','PROBABLY','[REDACTED]','BIG BRAIN?'];
let intIndex = 0;
const intStat = document.getElementById('int-stat');
intStat?.addEventListener('click', () => {
  intIndex = (intIndex + 1) % intValues.length;
  const value = document.getElementById('int-value');
  if(value) value.textContent = intValues[intIndex];
  showToast(intIndex === 1 ? 'Intelligence not found.' : 'Testing remains inconclusive.');
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
  return {dow:dayMap[o.weekday], hour:+o.hour, minute:+o.minute};
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
  const dateEl = document.getElementById('next-stream-date');
  const localEl = document.getElementById('next-stream-local');
  if(next && dateEl && localEl){
    dateEl.textContent = next.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    localEl.textContent = `${next.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})} in your local time • 7:45 PM PT`;
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
const socialArt = gallery.find(item => item.src.endsWith('/archive/archive-01.webp'));
if(socialArt){ socialArt.title = 'Rippy artwork'; socialArt.credit = 'Art by @leraje06'; }
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('art-modal');
const modalImg = modal?.querySelector('img');
const modalTitle = document.getElementById('modal-title');
const modalCredit = document.getElementById('modal-credit');

function openArt(src,title,credit=''){
  if(!modal || !modalImg) return;
  modalImg.src = src;
  modalImg.alt = title;
  if(modalTitle) modalTitle.textContent = title;
  if(modalCredit) modalCredit.textContent = credit;
  modal.showModal();
}

if(galleryGrid){
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
}

document.querySelectorAll('.gallery-filter').forEach(filter => filter.addEventListener('click', () => {
  document.querySelectorAll('.gallery-filter').forEach(b => b.classList.toggle('active', b===filter));
  const cat = filter.dataset.filter;
  galleryGrid?.querySelectorAll('.gallery-item').forEach(item => item.classList.toggle('hidden', cat !== 'all' && item.dataset.category !== cat));
}));

modal?.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
modal?.addEventListener('click', e => { if(e.target === modal) modal.close(); });
document.getElementById('open-reference')?.addEventListener('click', () => openArt('assets/rippy-reference.webp','Rippy character reference','Full character reference sheet'));

// Business inquiry form: fields adapt to the kind of opportunity.
const form = document.getElementById('business-form');
const inquiryType = document.getElementById('inquiry-type');
const contextTitle1 = document.getElementById('context-title-1');
const contextTitle2 = document.getElementById('context-title-2');
const contextInput1 = document.getElementById('context-input-1');
const contextInput2 = document.getElementById('context-input-2');
const messageTitle = document.getElementById('message-title');
const inquiryMessage = document.getElementById('inquiry-message');
const formHelper = document.getElementById('form-helper');

const inquiryConfigs = {
  'Sponsorship': {
    field1: ['CAMPAIGN BUDGET', 'e.g. $500–$1,000'],
    field2: ['CAMPAIGN TIMELINE', 'Launch date / deadline'],
    message: ['SPONSORSHIP DETAILS', 'Tell me about the product, requested deliverables, usage rights, exclusivity, key dates, or anything else I should know.'],
    helper: 'Budget is optional, but sharing a range makes it much easier to understand the scope of a paid campaign.'
  },
  'Collaboration': {
    field1: ['YOUR CHANNEL / PROJECT LINK', 'https://…'],
    field2: ['PREFERRED DATE / WINDOW', 'e.g. November weekends'],
    message: ['COLLAB IDEA', 'What would you like to make together? Include the platform, format, other creators involved, and any scheduling details.'],
    helper: 'No budget field here — creator collaborations can just focus on the idea, fit, and timing.'
  },
  'Affiliate / Ambassador': {
    field1: ['COMMISSION / COMPENSATION', 'e.g. 15% commission, gifted product, flat bonus'],
    field2: ['PROGRAM TERM', 'Ongoing / 3 months / launch window'],
    message: ['PROGRAM DETAILS', 'Tell me about the product, tracking method, payout structure, posting requirements, codes/links, and any minimum commitments.'],
    helper: 'For affiliate or ambassador programs, compensation structure matters more than a traditional campaign budget.'
  },
  'Appearance / Event': {
    field1: ['EVENT DATE', 'Date or date range'],
    field2: ['LOCATION / VIRTUAL', 'City, venue, convention, or online'],
    message: ['APPEARANCE DETAILS', 'Tell me about the event, audience, requested segment, expected time commitment, compensation, travel support, and any other requirements.'],
    helper: 'Include compensation and travel details in the message when they apply.'
  },
  'Product Gifting / Review': {
    field1: ['PRODUCT / SERVICE', 'What would you like Rippy to try?'],
    field2: ['COMPENSATION', 'Gifted only / paid / affiliate / other'],
    message: ['PRODUCT DETAILS', 'Tell me what the product is, what content you are requesting (if any), shipping or digital delivery details, and whether posting is required.'],
    helper: 'Gifting does not automatically guarantee coverage; requested deliverables should be stated clearly.'
  },
  'Press / Podcast / Interview': {
    field1: ['OUTLET / SHOW', 'Publication, podcast, channel, etc.'],
    field2: ['RECORDING / PUBLISH DATE', 'Date or preferred window'],
    message: ['INTERVIEW DETAILS', 'Tell me about the outlet, topic, format, expected length, whether it is live or recorded, and any questions or themes you plan to cover.'],
    helper: 'A link to the outlet or show is helpful if it is not already obvious from the organization name above.'
  },
  'Other Business Inquiry': {
    field1: ['TIMELINE', 'Optional'],
    field2: ['BUDGET / COMPENSATION', 'Only if relevant'],
    message: ['BUSINESS DETAILS', 'Tell me what you have in mind and include any context, links, timing, or terms that would help me understand the opportunity.'],
    helper: 'Use this for anything that does not cleanly fit one of the categories above.'
  }
};

let activeInquiryConfig = inquiryConfigs['Sponsorship'];
function updateInquiryFields(){
  activeInquiryConfig = inquiryConfigs[inquiryType?.value] || inquiryConfigs['Other Business Inquiry'];
  if(contextTitle1) contextTitle1.textContent = activeInquiryConfig.field1[0];
  if(contextInput1) contextInput1.placeholder = activeInquiryConfig.field1[1];
  if(contextTitle2) contextTitle2.textContent = activeInquiryConfig.field2[0];
  if(contextInput2) contextInput2.placeholder = activeInquiryConfig.field2[1];
  if(messageTitle) messageTitle.textContent = activeInquiryConfig.message[0];
  if(inquiryMessage) inquiryMessage.placeholder = activeInquiryConfig.message[1];
  if(formHelper) formHelper.textContent = activeInquiryConfig.helper;
}
inquiryType?.addEventListener('change', updateInquiryFields);
updateInquiryFields();

form?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = `[${data.type}] Business Inquiry for Rippy_VT — ${data.company}`;
  const contextLines = [
    `${activeInquiryConfig.field1[0]}: ${data.context1 || 'Not provided'}`,
    `${activeInquiryConfig.field2[0]}: ${data.context2 || 'Not provided'}`
  ].join('\n');
  const body = `Hello Rippy,\n\nName: ${data.name}\nCompany / Creator / Organization: ${data.company}\nReply Email: ${data.email}\nInquiry Type: ${data.type}\n${contextLines}\n\n${activeInquiryConfig.message[0]}:\n${data.message}\n\nThank you!`;
  window.location.href = `mailto:rippyvt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById('copy-email')?.addEventListener('click', async () => {
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
companion?.addEventListener('click', () => {
  lineIndex = (lineIndex + 1) % lines.length;
  if(bubble) bubble.textContent = lines[lineIndex];
  companion.classList.add('chatty');
  clearTimeout(window.__companion);
  window.__companion = setTimeout(()=>companion.classList.remove('chatty'),2600);
});

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(()=>t.classList.remove('show'),1800);
}

const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();
updateSchedule();
routeTo(location.hash.slice(1) || 'home');
