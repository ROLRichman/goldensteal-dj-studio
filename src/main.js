import { GoldenStealAudioEngine } from './audio-engine.js';

const engine = new GoldenStealAudioEngine();
const deckState = {
  A: { audio: document.getElementById('audioA'), objectUrl: null, file: null, cue: 0, hotCues: [null, null, null, null], loop: null, waveform: null, bpm: 120, jogPointer: null, jogLastX: 0, jogLastTime: 0, jogLastMoveAt: 0 },
  B: { audio: document.getElementById('audioB'), objectUrl: null, file: null, cue: 0, hotCues: [null, null, null, null], loop: null, waveform: null, bpm: 120, jogPointer: null, jogLastX: 0, jogLastTime: 0, jogLastMoveAt: 0 }
};
const library = [];
let toastTimer = null;
let sessionStartedAt = performance.now();
let recorder = null;
let recordingChunks = [];
let recordingStartedAt = 0;

const $ = (id) => document.getElementById(id);
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const extensionOf = (name) => name.includes('.') ? name.split('.').pop().toUpperCase() : 'AUDIO';
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2800);
}

function setAudioStatus(ready, message = '') {
  $('audioStatusLed').classList.toggle('on', ready);
  $('audioStatusText').textContent = message || (ready ? 'AUDIO ENGINE READY' : 'AUDIO STANDBY');
}

async function ensureAudio() {
  await engine.ensure();
  setAudioStatus(true, 'AUDIO ENGINE READY');
}

async function loadFileIntoDeck(deckId, file) {
  if (!file) return;
  const state = deckState[deckId];
  const audio = state.audio;
  try {
    await ensureAudio();
    audio.pause();
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.file = file;
    state.objectUrl = URL.createObjectURL(file);
    state.cue = 0;
    state.hotCues = [null, null, null, null];
    state.loop = null;
    state.waveform = null;
    state.bpm = 120;
    audio.src = state.objectUrl;
    audio.load();
    engine.attachDeck(deckId, audio);
    engine.setEQ(deckId, 'low', Number($(`low${deckId}`).value));
    engine.setEQ(deckId, 'mid', Number($(`mid${deckId}`).value));
    engine.setEQ(deckId, 'high', Number($(`high${deckId}`).value));
    engine.setFilter(deckId, Number($(`filter${deckId}`).value));
    engine.setChannelVolume(deckId, Number($(`channel${deckId}`).value));
    engine.setEcho(deckId, Number($('echoAmount').value));
    $('tempo' + deckId).value = '0';
    setTempo(deckId, 0);
    $('title' + deckId).textContent = file.name.replace(/\.[^.]+$/, '');
    $('filename' + deckId).textContent = file.name;
    $('format' + deckId).textContent = extensionOf(file.name);
    $('duration' + deckId).textContent = 'LOADING';
    $('loadStatus' + deckId).textContent = 'DECODING TRACK…';
    $('state' + deckId).innerHTML = '<span class="state-dot"></span> LOADING';
    $('state' + deckId).classList.remove('playing');
    $('playText' + deckId).textContent = 'PLAY';
    $('playGlyph' + deckId).textContent = '▶';
    $('platter' + deckId).classList.remove('spinning');
    $('seek' + deckId).value = '0';
    drawWaveform(deckId, null);
    toast(`Deck ${deckId}: ${file.name} loaded from your device`);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Unable to start the audio engine in this browser.');
    setAudioStatus(false, 'AUDIO ERROR');
  }
}

async function buildWaveform(deckId, file) {
  const state = deckState[deckId];
  const maxBytes = 70 * 1024 * 1024;
  if (file.size > maxBytes) {
    state.waveform = null;
    drawWaveform(deckId, null);
    $('loadStatus' + deckId).textContent = 'READY • WAVEFORM SKIPPED (LARGE FILE)';
    return;
  }
  try {
    const buffer = await file.arrayBuffer();
    const decoded = await engine.context.decodeAudioData(buffer.slice(0));
    const channel = decoded.getChannelData(0);
    const bars = 420;
    const blockSize = Math.max(1, Math.floor(channel.length / bars));
    const peaks = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      const start = i * blockSize;
      let peak = 0;
      for (let j = 0; j < blockSize && start + j < channel.length; j++) peak = Math.max(peak, Math.abs(channel[start + j]));
      peaks[i] = peak;
    }
    if (state.file !== file) return;
    state.waveform = peaks;
    drawWaveform(deckId, peaks);
    $('loadStatus' + deckId).textContent = 'READY • LOCAL AUDIO';
  } catch (error) {
    console.warn('Waveform analysis unavailable:', error);
    state.waveform = null;
    drawWaveform(deckId, null);
    $('loadStatus' + deckId).textContent = 'READY • WAVEFORM UNAVAILABLE';
  }
}

function drawWaveform(deckId, peaks) {
  const canvas = $('wave' + deckId);
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0b100e';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(224,184,99,.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(224,184,99,.12)';
  ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
  if (peaks) {
    const barWidth = width / peaks.length;
    for (let i = 0; i < peaks.length; i++) {
      const amp = Math.max(2, peaks[i] * height * 0.88);
      const x = i * barWidth;
      ctx.fillStyle = i % 6 === 0 ? '#d8ad56' : '#a9874a';
      ctx.globalAlpha = 0.78;
      ctx.fillRect(x, (height - amp) / 2, Math.max(1, barWidth * 0.58), amp);
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#a9874a';
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < width; i += 8) {
      const h = 3 + Math.abs(Math.sin(i * 0.052) * Math.cos(i * 0.016)) * 13;
      ctx.fillRect(i, (height - h) / 2, 3, h);
    }
    ctx.globalAlpha = 1;
  }
  drawPlayhead(deckId);
}

function drawPlayhead(deckId) {
  const canvas = $('wave' + deckId);
  const ctx = canvas.getContext('2d');
  const duration = deckState[deckId].audio.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const x = clamp(deckState[deckId].audio.currentTime / duration, 0, 1) * canvas.width;
  ctx.save();
  ctx.strokeStyle = '#f4d48e';
  ctx.shadowColor = '#f4d48e';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  ctx.restore();
}

function setDeckPlayingUI(deckId, playing) {
  $('state' + deckId).classList.toggle('playing', playing);
  $('state' + deckId).innerHTML = playing ? '<span class="state-dot"></span> PLAYING' : '<span class="state-dot"></span> LOADED / PAUSED';
  $('playText' + deckId).textContent = playing ? 'PAUSE' : 'PLAY';
  $('playGlyph' + deckId).textContent = playing ? 'Ⅱ' : '▶';
  $('playGlyph' + deckId).parentElement.classList.toggle('is-playing', playing);
  $('platter' + deckId).classList.toggle('spinning', playing);
}

async function togglePlay(deckId) {
  const state = deckState[deckId];
  if (!state.file) { toast(`Load a track on Deck ${deckId} first.`); return; }
  try {
    await ensureAudio();
    if (state.audio.paused) {
      await state.audio.play();
      setDeckPlayingUI(deckId, true);
    } else {
      state.audio.pause();
      setDeckPlayingUI(deckId, false);
    }
  } catch (error) {
    console.error(error);
    toast(error.name === 'NotAllowedError' ? 'Tap PLAY again to allow audio playback.' : 'Playback could not start. Check the audio format.');
  }
}

function setCue(deckId) {
  const state = deckState[deckId];
  if (!state.file) { toast(`Load a track on Deck ${deckId} first.`); return; }
  state.cue = state.audio.currentTime || 0;
  toast(`Deck ${deckId} cue saved at ${formatTime(state.cue)}.`);
}

function goCue(deckId) {
  const state = deckState[deckId];
  if (!state.file) { toast(`Load a track on Deck ${deckId} first.`); return; }
  state.audio.currentTime = state.cue || 0;
  state.audio.pause();
  setDeckPlayingUI(deckId, false);
}

function useHotCue(deckId, pad) {
  const state = deckState[deckId];
  if (!state.file) { toast(`Load a track on Deck ${deckId} first.`); return; }
  if (state.hotCues[pad] === null) {
    state.hotCues[pad] = state.audio.currentTime || 0;
    $(`deck${deckId}`).querySelectorAll(`[data-action="hotcue"][data-pad="${pad}"]`)[0].classList.add('set');
    toast(`Deck ${deckId} hot cue ${pad + 1} saved.`);
  } else {
    state.audio.currentTime = state.hotCues[pad];
    if (state.audio.paused) togglePlay(deckId);
  }
}

function toggleLoop(deckId, beats) {
  const state = deckState[deckId];
  if (!state.file || !Number.isFinite(state.audio.duration)) { toast(`Load a track on Deck ${deckId} first.`); return; }
  const seconds = (60 / state.bpm) * beats;
  const start = state.audio.currentTime;
  const end = Math.min(state.audio.duration, start + seconds);
  if (end - start < 0.08) { toast('Not enough track remaining to set this loop.'); return; }
  state.loop = { start, end };
  $(`deck${deckId}`).querySelector(`[data-action="loop"][data-beats="${beats}"]`).classList.add('active');
  toast(`${beats}-beat loop active on Deck ${deckId}.`);
}

function exitLoop(deckId) {
  deckState[deckId].loop = null;
  $(`deck${deckId}`).querySelectorAll('[data-action="loop"]').forEach(button => button.classList.remove('active'));
}

function setTempo(deckId, value) {
  const state = deckState[deckId];
  const percent = Number(value);
  const factor = 1 + percent / 100;
  state.audio.playbackRate = factor;
  $('tempoValue' + deckId).textContent = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
}

function ejectDeck(deckId) {
  const state = deckState[deckId];
  state.audio.pause();
  state.audio.removeAttribute('src');
  state.audio.load();
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
  state.file = null;
  state.cue = 0;
  state.hotCues = [null, null, null, null];
  state.loop = null;
  state.waveform = null;
  $('title' + deckId).textContent = 'No track loaded';
  $('filename' + deckId).textContent = 'Choose a music file from your device';
  $('duration' + deckId).textContent = '--:--';
  $('format' + deckId).textContent = 'LOCAL FILE';
  $('elapsed' + deckId).textContent = '00:00';
  $('remaining' + deckId).textContent = '--:--';
  $('seek' + deckId).value = '0';
  $('bpm' + deckId).textContent = '120 BPM*';
  $('loadStatus' + deckId).textContent = 'READY TO LOAD';
  $('state' + deckId).classList.remove('playing');
  $('state' + deckId).innerHTML = '<span class="state-dot"></span> EMPTY DECK';
  $('playText' + deckId).textContent = 'PLAY';
  $('playGlyph' + deckId).textContent = '▶';
  $('playGlyph' + deckId).parentElement.classList.remove('is-playing');
  $('platter' + deckId).classList.remove('spinning');
  $(`deck${deckId}`).querySelectorAll('[data-action="hotcue"]').forEach(button => button.classList.remove('set'));
  exitLoop(deckId);
  drawWaveform(deckId, null);
  toast(`Deck ${deckId} ejected.`);
}

function updateDeckUI(deckId) {
  const state = deckState[deckId];
  const audio = state.audio;
  const duration = audio.duration;
  if (!state.file) return;
  $('elapsed' + deckId).textContent = formatTime(audio.currentTime);
  $('remaining' + deckId).textContent = Number.isFinite(duration) ? formatTime(Math.max(0, duration - audio.currentTime)) : '--:--';
  if (Number.isFinite(duration) && duration > 0) {
    $('seek' + deckId).value = String(Math.round((audio.currentTime / duration) * 1000));
    $('platter' + deckId).setAttribute('aria-valuenow', $('seek' + deckId).value);
  }
  drawPlayhead(deckId);
  if (state.loop && audio.currentTime >= state.loop.end - 0.025) audio.currentTime = state.loop.start;
}

function addToLibrary(files) {
  for (const file of files) {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|flac|ogg|opus|aiff?)$/i.test(file.name)) continue;
    if (library.some(item => item.file.name === file.name && item.file.size === file.size)) continue;
    library.push({ file });
  }
  renderLibrary();
  if (library.length) toast(`${files.length} file(s) checked. Your crate is local to this session.`);
}

function renderLibrary() {
  const body = $('libraryRows');
  body.innerHTML = '';
  if (!library.length) {
    body.innerHTML = '<tr class="empty-row"><td colspan="4"><span class="empty-library-icon">♫</span><strong>Your crate is waiting.</strong><span>Add audio files to build this session\'s library.</span></td></tr>';
    return;
  }
  library.forEach((item, index) => {
    const row = document.createElement('tr');
    const name = document.createElement('td'); name.className = 'library-track-name'; name.textContent = item.file.name;
    const format = document.createElement('td'); format.className = 'library-track-format'; format.textContent = extensionOf(item.file.name);
    const size = document.createElement('td'); size.className = 'library-track-size'; size.textContent = formatSize(item.file.size);
    const actions = document.createElement('td');
    for (const deckId of ['A', 'B']) {
      const button = document.createElement('button'); button.className = 'table-load'; button.textContent = `DECK ${deckId}`; button.style.marginRight = '5px';
      button.addEventListener('click', () => loadFileIntoDeck(deckId, item.file));
      actions.appendChild(button);
    }
    row.append(name, format, size, actions);
    body.appendChild(row);
  });
}

function pointerDownJog(deckId, event) {
  const state = deckState[deckId];
  if (!state.file) { toast(`Load a track on Deck ${deckId} before using the jog wheel.`); return; }
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  state.jogPointer = event.pointerId;
  state.jogLastX = event.clientX;
  state.jogLastTime = performance.now();
  state.jogLastMoveAt = state.jogLastTime;
  event.currentTarget.classList.add('touching');
}

function pointerMoveJog(deckId, event) {
  const state = deckState[deckId];
  if (state.jogPointer !== event.pointerId) return;
  const delta = event.clientX - state.jogLastX;
  const now = performance.now();
  const dt = Math.max(8, now - state.jogLastMoveAt);
  state.jogLastX = event.clientX;
  state.jogLastMoveAt = now;
  const audio = state.audio;
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = clamp(audio.currentTime + delta * 0.018, 0, Math.max(0, audio.duration - 0.02));
  }
  const velocity = clamp(delta / dt, -1.5, 1.5);
  const tempo = Number($('tempo' + deckId).value) / 100;
  audio.playbackRate = clamp(1 + tempo + velocity * 0.17, 0.5, 1.5);
}

function pointerUpJog(deckId, event) {
  const state = deckState[deckId];
  if (state.jogPointer !== event.pointerId) return;
  state.jogPointer = null;
  event.currentTarget.classList.remove('touching');
  setTempo(deckId, $('tempo' + deckId).value);
}

function startRecording() {
  if (!deckState.A.file && !deckState.B.file) { toast('Load at least one track before recording the mix.'); return; }
  if (!engine.getRecordingStream() || !window.MediaRecorder) {
    toast('Mix recording is not supported by this browser. Try current Chrome or Edge.');
    return;
  }
  try {
    recordingChunks = [];
    const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus' } : undefined;
    recorder = new MediaRecorder(engine.getRecordingStream(), options);
    recorder.addEventListener('dataavailable', event => { if (event.data && event.data.size) recordingChunks.push(event.data); });
    recorder.addEventListener('stop', () => {
      const blob = new Blob(recordingChunks, { type: recorder.mimeType || 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GoldenSteal-Mix-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      $('recordButton').classList.remove('recording');
      $('recordLabel').textContent = 'RECORD MIX';
      $('recordNote').textContent = 'RECORDING SAVED TO DEVICE';
      toast('Mix recording saved as a WebM audio file.');
      recorder = null;
    });
    recorder.start(1000);
    recordingStartedAt = Date.now();
    $('recordButton').classList.add('recording');
    $('recordLabel').textContent = 'STOP RECORDING';
    $('recordNote').textContent = 'RECORDING MASTER MIX…';
    toast('Recording the master mix.');
  } catch (error) {
    console.error(error);
    toast('Unable to start recording in this browser.');
  }
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
}

function bindEvents() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const deckId = button.dataset.deck;
    if (action === 'load') $('file' + deckId).click();
    if (action === 'play') togglePlay(deckId);
    if (action === 'cue') goCue(deckId);
    if (action === 'set-cue') setCue(deckId);
    if (action === 'hotcue') useHotCue(deckId, Number(button.dataset.pad));
    if (action === 'loop') toggleLoop(deckId, Number(button.dataset.beats));
    if (action === 'loop-off') exitLoop(deckId);
    if (action === 'tempo-reset') { $('tempo' + deckId).value = '0'; setTempo(deckId, 0); }
    if (action === 'eject') ejectDeck(deckId);
  });

  for (const deckId of ['A', 'B']) {
    const state = deckState[deckId];
    const audio = state.audio;
    $('file' + deckId).addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (file) loadFileIntoDeck(deckId, file);
      event.target.value = '';
    });
    audio.addEventListener('loadedmetadata', () => {
      $('duration' + deckId).textContent = formatTime(audio.duration);
      $('remaining' + deckId).textContent = formatTime(audio.duration);
      $('loadStatus' + deckId).textContent = 'ANALYZING WAVEFORM…';
      buildWaveform(deckId, state.file);
    });
    audio.addEventListener('timeupdate', () => updateDeckUI(deckId));
    audio.addEventListener('play', () => setDeckPlayingUI(deckId, true));
    audio.addEventListener('pause', () => setDeckPlayingUI(deckId, false));
    audio.addEventListener('ended', () => { setDeckPlayingUI(deckId, false); if (state.loop) audio.currentTime = state.loop.start; });
    audio.addEventListener('error', () => { if (state.file) toast(`Deck ${deckId}: this audio format could not be decoded by the browser.`); });
    $('seek' + deckId).addEventListener('input', event => {
      if (Number.isFinite(audio.duration)) audio.currentTime = (Number(event.target.value) / 1000) * audio.duration;
    });
    $('tempo' + deckId).addEventListener('input', event => setTempo(deckId, event.target.value));
    $('platter' + deckId).addEventListener('pointerdown', event => pointerDownJog(deckId, event));
    $('platter' + deckId).addEventListener('pointermove', event => pointerMoveJog(deckId, event));
    $('platter' + deckId).addEventListener('pointerup', event => pointerUpJog(deckId, event));
    $('platter' + deckId).addEventListener('pointercancel', event => pointerUpJog(deckId, event));
    $('platter' + deckId).addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (Number.isFinite(audio.duration)) audio.currentTime = clamp(audio.currentTime + (event.key === 'ArrowRight' ? 0.15 : -0.15), 0, audio.duration);
      }
    });
  }

  document.querySelectorAll('[data-eq]').forEach(input => input.addEventListener('input', event => {
    const deckId = event.target.dataset.deck;
    const band = event.target.dataset.eq;
    const value = Number(event.target.value);
    engine.setEQ(deckId, band, value);
    $(`${band}${deckId}`).textContent = `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`;
  }));

  for (const deckId of ['A', 'B']) {
    $('filter' + deckId).addEventListener('input', event => {
      const value = Number(event.target.value);
      engine.setFilter(deckId, value);
      $('filterValue' + deckId).textContent = value === 50 ? 'NEUTRAL' : value < 50 ? 'LOW-PASS' : 'HIGH-PASS';
    });
    $('channel' + deckId).addEventListener('input', event => {
      const value = Number(event.target.value);
      engine.setChannelVolume(deckId, value);
      $('channelValue' + deckId).textContent = `${Math.round(value * 100)}%`;
    });
  }

  $('crossfader').addEventListener('input', event => engine.setCrossfader(Number(event.target.value) / 100));
  $('centerCrossfader').addEventListener('click', () => { $('crossfader').value = '50'; engine.setCrossfader(0.5); });
  $('masterVolume').addEventListener('input', event => {
    const value = Number(event.target.value);
    engine.setMasterVolume(value);
    $('masterVolumeValue').textContent = `${Math.round(value * 100)}%`;
  });
  $('muteMaster').addEventListener('click', () => {
    const muted = engine.toggleMasterMute();
    $('muteMaster').textContent = muted ? 'UNMUTE MASTER' : 'MASTER MUTE';
    $('muteMaster').classList.toggle('muted', muted);
    toast(muted ? 'Master output muted.' : 'Master output restored.');
  });
  $('echoAmount').addEventListener('input', event => {
    const value = Number(event.target.value);
    engine.setEcho('A', value);
    engine.setEcho('B', value);
    $('echoValue').textContent = value === 0 ? 'OFF' : `${Math.round(value * 100)}%`;
  });
  $('recordButton').addEventListener('click', () => recorder ? stopRecording() : startRecording());
  $('addLibraryButton').addEventListener('click', () => $('libraryFiles').click());
  $('libraryFiles').addEventListener('change', event => {
    addToLibrary(Array.from(event.target.files || []));
    event.target.value = '';
  });
  $('loadFirstButton').addEventListener('click', () => $('fileA').click());
}

function animateMeters() {
  const meter = engine.getMeter();
  $('masterMeter').style.width = `${Math.round(meter * 100)}%`;
  $('masterDb').textContent = meter > 0.001 ? `${(20 * Math.log10(meter / 2.6)).toFixed(1)} dBFS` : '— dB';
  const elapsed = Math.floor((performance.now() - sessionStartedAt) / 1000);
  $('sessionTimer').textContent = `${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  requestAnimationFrame(animateMeters);
}

function initPWA() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker not registered:', error));
    });
  }
}

bindEvents();
renderLibrary();
setAudioStatus(false);
requestAnimationFrame(animateMeters);
initPWA();
window.addEventListener('beforeunload', () => {
  for (const state of Object.values(deckState)) if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  if (recorder && recorder.state !== 'inactive') recorder.stop();
});