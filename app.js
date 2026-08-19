const frameFiles = Array.from({ length: 40 }, (_, i) => `./Nike%20shoes%20frames/frame_${(i * 0.2).toFixed(2)}.jpg`);
const shoe = document.querySelector('[data-shoe]');
const context = shoe.getContext('2d', { alpha: true, desynchronized: true });
const progressFill = document.querySelector('[data-progress-fill]');
const progressLabel = document.querySelector('[data-progress-label]');
const sceneMeta = document.querySelector('[data-scene-meta]');
const sceneStage = document.querySelector('.scene-stage');
const progressName = document.querySelector('[data-progress-name]');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const sectionNames = ['FORM', 'DETAIL', 'MATERIAL', 'RESPONSE', 'REVEAL', 'SHOP'];
const sections = [...document.querySelectorAll('[data-section]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const frameCache = new Array(frameFiles.length);
const frameState = new Uint8Array(frameFiles.length);
const desktopFrameBudget = 4;
const frameCacheRadius = 9;
let targetProgress = 0;
let visualProgress = 0;
let currentFrame = -1;
let lastTime = performance.now();
let lastLabelFrame = -1;
let lastProgress = -1;
let lastTrimFrame = -1;
const lastSectionFocus = sections.map(() => -1);
let raf;

function loadFrame(index) {
  if (index < 0 || index >= frameFiles.length || frameState[index] === 2) return frameCache[index];
  if (frameState[index] === 1) return null;
  frameState[index] = 1;
  const image = new Image();
  image.decoding = 'async'; image.src = frameFiles[index];
  image.decode().catch(() => {}).finally(() => { frameCache[index] = image; frameState[index] = 2; if (index === 0) drawFrame(0); });
  return null;
}

function preload() {
  for (let index = 0; index <= desktopFrameBudget; index += 1) loadFrame(index);
  const queue = frameFiles.map((_, index) => index).filter(index => index > desktopFrameBudget);
  const pump = () => { const next = queue.shift(); if (next === undefined) return; loadFrame(next); setTimeout(pump, 18); };
  setTimeout(pump, 0);
}

function trimFrameCache(center) {
  if (Math.abs(center - lastTrimFrame) < 3) return;
  lastTrimFrame = center;
  frameCache.forEach((image, index) => {
    if (!image || frameState[index] !== 2 || index === currentFrame || index < 2) return;
    if (Math.abs(index - center) > frameCacheRadius) { image.src = ''; frameCache[index] = null; frameState[index] = 0; }
  });
}

function drawFrame(index) {
  const image = frameCache[index] || frameCache[currentFrame] || frameCache[0];
  if (!image || !image.naturalWidth) return;
  const width = shoe.clientWidth || innerWidth; const height = shoe.clientHeight || innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.75);
  if (shoe.width !== Math.round(width * dpr) || shoe.height !== Math.round(height * dpr)) {
    shoe.width = Math.round(width * dpr); shoe.height = Math.round(height * dpr); context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  context.clearRect(0, 0, width, height);
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale; const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  currentFrame = index;
}

function updateFromScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  targetProgress = max ? Math.max(0, Math.min(1, scrollY / max)) : 0;
}

function render(progress) {
  const targetFrame = progress * (frameFiles.length - 1);
  const nearestFrame = Math.max(0, Math.min(frameFiles.length - 1, Math.round(targetFrame)));
  loadFrame(nearestFrame); loadFrame(nearestFrame - 1); loadFrame(nearestFrame + 1);
  trimFrameCache(nearestFrame);
  if (nearestFrame !== currentFrame && frameState[nearestFrame] === 2) drawFrame(nearestFrame);
  if (nearestFrame !== lastLabelFrame) { sceneMeta.textContent = `AERA / 001 · ${sectionNames[Math.min(5, Math.floor(progress * 6))]}`; lastLabelFrame = nearestFrame; }
  if (Math.abs(progress - lastProgress) > .002) { progressFill.style.transform = `scaleX(${progress})`; lastProgress = progress; }
  const active = Math.min(5, Math.floor(progress * 6));
  const nextLabel = `${String(active + 1).padStart(2, '0')} / 06`;
  if (progressLabel.textContent !== nextLabel) progressLabel.textContent = nextLabel;
  progressName.textContent = sectionNames[active];
  const stageFocus = Math.max(0, Math.min(1, (progress - .12) / .16, (.88 - progress) / .18));
  sceneStage.style.setProperty('--stage-focus', String(stageFocus * .42));
  navLinks.forEach(link => { const isActive = Number(link.dataset.navLink) === active; link.classList.toggle('active', isActive); if (isActive) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  shoe.style.transform = `translate(-50%, -48%) scale(${1 + Math.sin(progress * Math.PI) * .05})`;
  sections.forEach((section, index) => { const distance = Math.abs(progress * 5 - index); const focus = Math.max(0, 1 - distance * 1.8); if (Math.abs(focus - lastSectionFocus[index]) > .02) { section.style.setProperty('--section-focus', String(focus)); section.style.setProperty('--section-opacity', String(.42 + focus * .58)); lastSectionFocus[index] = focus; } });
}

function tick(now) {
  const delta = Math.min(64, now - lastTime); lastTime = now;
  const response = reduceMotion ? 1 : 1 - Math.exp(-delta / (targetProgress - visualProgress > .18 ? 72 : 105));
  visualProgress += (targetProgress - visualProgress) * response;
  if (Math.abs(targetProgress - visualProgress) < .0001) visualProgress = targetProgress;
  render(visualProgress); raf = requestAnimationFrame(tick);
}
addEventListener('scroll', updateFromScroll, { passive: true });
addEventListener('resize', () => { updateFromScroll(); if (currentFrame >= 0) drawFrame(currentFrame); });
render(0); preload(); updateFromScroll(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);

document.querySelectorAll('.sizes button').forEach(button => button.addEventListener('click', () => { document.querySelector('.sizes .selected')?.classList.remove('selected'); button.classList.add('selected'); }));
document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => { document.querySelector('.swatch.active')?.classList.remove('active'); button.classList.add('active'); }));
const cart = document.querySelector('[data-cart]');
const drawer = document.querySelector('[data-cart-drawer]');
function setCart(open) { drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open)); drawer.inert = !open; if (open) drawer.querySelector('[data-cart-close]').focus(); }
cart.addEventListener('click', () => setCart(true));
document.querySelector('[data-cart-close]').addEventListener('click', () => { setCart(false); cart.focus(); });
addEventListener('keydown', event => { if (event.key === 'Escape' && drawer.classList.contains('open')) { setCart(false); cart.focus(); } });
setCart(false);
