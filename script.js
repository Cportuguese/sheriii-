const envelopeButton = document.getElementById('envelope-button');
const introScreen = document.getElementById('intro-screen');
const mainScreenContainer = document.getElementById('main-container');

/* Open intro */
if (envelopeButton && introScreen && mainScreenContainer) {
  envelopeButton.addEventListener('click', () => {
    introScreen.classList.add('hidden');
    mainScreenContainer.classList.remove('hidden');
    mainScreenContainer.classList.add('fade-in');

    setTimeout(() => {
      mainScreenContainer.classList.remove('fade-in');
    }, 500);
  });
}

/* Player elements */
const btnLoop = document.getElementById('btn-loop');
const btnPrev = document.getElementById('btn-prev');
const btnPlay = document.getElementById('btn-play');
const btnNext = document.getElementById('btn-next');
const btnVol = document.getElementById('btn-vol');
const progress = document.getElementById('progress');
const audio = document.getElementById('audio-player');
const imageHolder = document.getElementById('image-holder');
const songArtist = document.getElementById('song-artist');
const volumeControl = document.getElementById('volume-control');
const volDown = document.getElementById('vol-down');
const volUp = document.getElementById('vol-up');
const volumeRange = document.getElementById('volume-range');

const defaultImg = 'imgs/img-place.png';
const fallbackMcs = ['imgs/mc1.png', 'imgs/mc2.png', 'imgs/mc3.png'];

/* Playlist built from your audio/ folder - update entries if filenames differ */
const playlist = [
  { src: 'audio/Mac DeMarco - No Other Heart.mp3', title: 'No Other Heart', artist: 'Mac DeMarco', img: 'imgs/mc1.png' },
  { src: 'audio/IV OF SPADES - Captivated.mp3', title: 'Captivated', artist: 'IV OF SPADES', img: 'imgs/mc2.png' },
  { src: 'audio/IV OF SPADES - Kabisado.mp3', title: 'Kabisado', artist: 'IV OF SPADES', img: 'imgs/mc3.png' },
  { src: 'audio/Los Retros - Someone To Spend Time With.mp3', title: 'Someone To Spend Time With', artist: 'Los Retros', img: 'imgs/mc1.png' },
  { src: 'audio/Mac DeMarco - My Kind Of Woman .mp3', title: 'My Kind Of Woman', artist: 'Mac DeMarco', img: 'imgs/mc2.png' },
  { src: 'audio/Antukin - Rico Blanco.mp3', title: 'Antukin', artist: 'Rico Blanco', img: 'imgs/mc1.png' },
  { src: 'audio/Orange & Lemons - Yakap Sa Dilim.mp3', title: 'Yakap Sa Dilim', artist: 'Orange & Lemons', img: 'imgs/mc2.png' },
  { src: 'audio/The 1975 - About You.mp3', title: 'About You', artist: 'The 1975', img: 'imgs/mc3.png' },
  { src: 'audio/WALTZ OF FOUR LEFT FEET- SHIREBOUND AND BUSKING.mp3', title: 'Waltz of Four Left Feet', artist: 'shirebound', img: 'imgs/mc1.png' },
  { src: 'audio/pahintulot - shirebound.mp3', title: 'Pahintulot', artist: 'shirebound', img: 'imgs/mc2.png' },
  { src: 'audio/wave to earth - seasons.mp3', title: 'seasons', artist: 'wave to earth', img: 'imgs/mc3.png' }
];

let currentIndex = 0;
let isPlaying = false;
let isLoop = false;
let slideshowInterval = null;
// simple cache to track which images are loaded or failed
const imageCache = Object.create(null);

function preloadImages() {
  const seen = new Set();
  (playlist || []).forEach((t) => {
    const src = (t && t.img) ? t.img : defaultImg;
    if (seen.has(src)) return;
    seen.add(src);
    const img = new Image();
    img.onload = () => { imageCache[src] = true; };
    img.onerror = () => { imageCache[src] = false; };
    img.src = src;
  });
  // also preload the mc fallback images
  fallbackMcs.forEach((m) => {
    if (seen.has(m)) return;
    seen.add(m);
    const im = new Image();
    im.onload = () => { imageCache[m] = true; };
    im.onerror = () => { imageCache[m] = false; };
    im.src = m;
  });
}

// start preloading right away
preloadImages();

function loadTrack(index) {
  const track = playlist[index];
  if (!track) return;
  audio.src = track.src;
  // show preloaded image immediately when available, otherwise use
  // the safe loader which will fall back to the placeholder on error
  // prefer track's image when valid; otherwise use a rotating mc fallback
  const trackImg = track.img;
  const mcFallback = fallbackMcs[index % fallbackMcs.length];
    if (trackImg && imageCache[trackImg] === true) {
    if (imageHolder) imageHolder.src = trackImg;
  } else if (trackImg && imageCache[trackImg] === false) {
    // track image is known-bad -> use mc fallback
    if (imageHolder) imageHolder.src = (imageCache[mcFallback] === true) ? mcFallback : defaultImg;
  } else if (trackImg) {
    // unknown status for track image: try it, but fall back to mc on error
    if (imageHolder) safeSetImage(trackImg, mcFallback);
    // ensure mc fallback is preloaded/shown if trackImg fails asynchronously
    // safeSetImage will handle fallback to defaultImg; so also start preloading mcFallback
    if (!imageCache[mcFallback]) {
      const p = new Image();
      p.onload = () => { imageCache[mcFallback] = true; };
      p.onerror = () => { imageCache[mcFallback] = false; };
      p.src = mcFallback;
    }
  } else {
    // no track image: show mc fallback (or default if mc missing)
    if (imageHolder) imageHolder.src = (imageCache[mcFallback] === true) ? mcFallback : defaultImg;
  }
  songArtist.textContent = `${track.title} - ${track.artist}`;
  progress.value = 0;
}

/* Safely set image with onerror fallback to placeholder */
function safeSetImage(src) {
  if (!imageHolder) return;
  const tester = new Image();
  const fallback = arguments.length > 1 ? arguments[1] : defaultImg;
  tester.onload = () => { imageHolder.src = src; };
  tester.onerror = () => {
    console.warn('Image failed to load:', src, ' — falling back to', fallback);
    imageHolder.src = fallback;
  };
  tester.src = src;
}

function playTrack() {
  audio.play();
  isPlaying = true;
  btnPlay.classList.add('playing');
  if (btnPlay) btnPlay.src = 'imgs/btn-pause.png';
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  btnPlay.classList.remove('playing');
  if (btnPlay) btnPlay.src = 'imgs/btn-play.png';
}

function togglePlay() {
  if (!audio.src) loadTrack(currentIndex);
  if (audio.paused) playTrack(); else pauseTrack();
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadTrack(currentIndex);
  if (isPlaying) playTrack();
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
  if (isPlaying) playTrack();
}

function toggleLoop() {
  isLoop = !isLoop;
  audio.loop = isLoop;
  if (btnLoop) btnLoop.classList.toggle('active', isLoop);
}

function toggleMute() {
  // old mute behavior retained for backward compatibility
  audio.muted = !audio.muted;
  if (btnVol) btnVol.classList.toggle('muted', audio.muted);
}

/* Volume control behavior (increase/decrease and range) */
function showVolumeControl() {
  if (!volumeControl) return;
  volumeControl.classList.toggle('hidden');
}

function setVolume(v) {
  const normalized = Math.max(0, Math.min(1, v));
  audio.volume = normalized;
  if (normalized > 0 && audio.muted) {
    audio.muted = false;
    if (btnVol) btnVol.classList.remove('muted');
  }
  if (volumeRange) volumeRange.value = normalized;
}

function changeVolume(delta) {
  setVolume(audio.volume + delta);
}

if (btnVol) btnVol.addEventListener('click', showVolumeControl);
if (volDown) volDown.addEventListener('click', () => changeVolume(-0.1));
if (volUp) volUp.addEventListener('click', () => changeVolume(0.1));
if (volumeRange) volumeRange.addEventListener('input', (e) => { setVolume(parseFloat(e.target.value)); });

/* Update progress UI */
function updateProgress() {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = percent;
}

/* Slideshow of mc1/mc2/mc3 while playing */
function startSlideshow() {
  stopSlideshow();
  // only slideshow for first three images
  const imgs = ['imgs/mc1.png','imgs/mc2.png','imgs/mc3.png'];
  let i = 0;
  slideshowInterval = setInterval(() => {
    // try load, fallback handled by safeSetImage
    safeSetImage(imgs[i % imgs.length], defaultImg);
    i++;
  }, 1500);
}

function stopSlideshow() {
  if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; }
  // restore current track art
  const t = playlist[currentIndex];
  const mcFallback = fallbackMcs[currentIndex % fallbackMcs.length];
  safeSetImage((t && t.img) ? t.img : mcFallback, mcFallback);
}

function seekTo(value) {
  if (!audio.duration) return;
  audio.currentTime = (value / 100) * audio.duration;
}

/* Event listeners */
if (btnPlay) btnPlay.addEventListener('click', togglePlay);
if (btnNext) btnNext.addEventListener('click', nextTrack);
if (btnPrev) btnPrev.addEventListener('click', prevTrack);
if (btnLoop) btnLoop.addEventListener('click', toggleLoop);

if (progress) {
  // allow dragging to seek
  progress.addEventListener('input', (e) => {
    seekTo(e.target.value);
  });
  // clicking / pointerup also seeks
  progress.addEventListener('change', (e) => {
    seekTo(e.target.value);
  });
}

if (audio) {
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', () => {
    if (!audio.loop) {
      // advance to next track and ensure playback continues
      nextTrack();
      // Some browsers dispatch a 'pause' before 'ended', which can
      // set `isPlaying` false — force a play to continue the queue.
      try {
        playTrack();
      } catch (e) {
        // play() might return a promise that rejects in some contexts;
        // swallowing errors keeps behavior graceful in deployments.
        console.warn('Auto-play of next track failed:', e);
      }
    }
  });
  audio.addEventListener('play', () => { 
    if (btnPlay) btnPlay.classList.add('playing'); 
    if (btnPlay) btnPlay.src = 'imgs/btn-pause.png';
    isPlaying = true; 
    startSlideshow(); 
  });
  audio.addEventListener('pause', () => { 
    if (btnPlay) btnPlay.classList.remove('playing'); 
    if (btnPlay) btnPlay.src = 'imgs/btn-play.png';
    isPlaying = false; 
    stopSlideshow(); 
  });
}

/* Initialize first track (does not auto-play) */
loadTrack(currentIndex);

/* Helpful note in console where to replace album placeholder image */
console.log('To replace album placeholder image, edit imgs/img-place.png or change playlist[i].img in script.js');