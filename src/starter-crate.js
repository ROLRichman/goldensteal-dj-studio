// GoldenSteal DJ Studio — shared Batch 1 starter crate
// Hosted starter files are fetched on demand, then handed to the existing
// deck loader so IndexedDB persistence, waveforms and real audio routing remain shared.
(() => {
  'use strict';

  const MANIFEST_URL = './assets/starter-crate/manifest.json';
  const FALLBACK_TRACKS = [
    { id:'project-1', title:'R..O.L- PROJECT. 1.wav', format:'WAV', asset:'01-r-o-l-project-1.wav' },
    { id:'production-2', title:'R.O.L- PRODUCTION 2.wav', format:'WAV', asset:'02-r-o-l-production-2.wav' },
    { id:'project-one-staff', title:'R.O.L- PROJECT ONE STAFF.wav', format:'WAV', asset:'03-r-o-l-project-one-staff.wav' },
    { id:'rol-fest-1', title:'ROL FEST 1...%.wav', format:'WAV', asset:'04-rol-fest-1.wav' },
    { id:'rol-swfolder-1', title:'ROL-SWFOLDER 1.mp3', format:'MP3', asset:'05-rol-swfolder-1.mp3' },
    { id:'traffic-4', title:'TRAFFIC 4.mp3', format:'MP3', asset:'06-traffic-4.mp3' }
  ];

  const $ = (id) => document.getElementById(id);
  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '—';
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.ceil(bytes / 1024) + ' KB';
  };

  let tracks = [];
  let readyCount = 0;

  function setStatus(message, tone = 'neutral') {
    const status = $('starterCrateStatus');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function render() {
    const host = $('starterCrateRows');
    const count = $('starterCrateCount');
    if (!host) return;
    host.replaceChildren();
    if (count) count.textContent = readyCount + ' / ' + tracks.length + ' AUDIO FILES HOSTED';

    tracks.forEach((track) => {
      const row = document.createElement('article');
      row.className = 'starter-track';
      row.dataset.trackId = track.id;
      row.draggable = track.status === 'ready';
      row.title = row.draggable
        ? 'Drag this starter track onto Deck A or Deck B, or use a LOAD button.'
        : 'This starter track becomes draggable when its original audio file is hosted.';
      if (row.draggable) {
        row.addEventListener('dragstart', (event) => {
          event.dataTransfer?.setData('application/x-goldensteal-starter-track', track.id);
          event.dataTransfer?.setData('text/plain', track.title);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
          row.classList.add('starter-dragging');
        });
        row.addEventListener('dragend', () => row.classList.remove('starter-dragging'));
      }

      const art = document.createElement('div');
      art.className = 'starter-track-art';
      art.textContent = '♫';

      const info = document.createElement('div');
      info.className = 'starter-track-info';
      const title = document.createElement('strong');
      title.textContent = track.title;
      const meta = document.createElement('span');
      meta.textContent = [track.format || 'AUDIO', track.size ? formatBytes(track.size) : 'BATCH 1'].join(' · ');
      const state = document.createElement('small');
      state.className = 'starter-track-state';
      state.textContent = track.statusText || 'CHECKING AUDIO FILE…';
      info.append(title, meta, state);

      const actions = document.createElement('div');
      actions.className = 'starter-track-actions';
      for (const deckId of ['A', 'B']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'starter-load-button';
        button.textContent = 'LOAD TO ' + deckId;
        button.disabled = track.status !== 'ready';
        button.addEventListener('click', () => loadToDeck(track, deckId, button));
        actions.appendChild(button);
      }
      row.append(art, info, actions);
      host.appendChild(row);
    });
  }

  async function checkTrack(track) {
    try {
      const url = new URL(track.url, document.baseURI);
      if (url.origin !== location.origin) {
        track.status = 'blocked';
        track.statusText = 'STARTER FILE MUST USE THE APPROVED SAME-ORIGIN HOST';
        return;
      }
      const response = await fetch(url.href, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const type = response.headers.get('content-type') || '';
      if (!type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aiff)(\?|$)/i.test(url.pathname)) {
        throw new Error('The hosted file is not identified as audio');
      }
      track.size = Number(response.headers.get('content-length')) || 0;
      track.status = 'ready';
      track.statusText = 'READY · SHARED AUDIO AVAILABLE';
      readyCount++;
    } catch (error) {
      track.status = 'pending';
      track.statusText = 'AUDIO NOT PUBLISHED YET';
      track.error = error.message;
    }
  }

  async function loadToDeck(track, deckId, button = null) {
    const studio = window.GoldenStealStudio;
    if (!studio?.loadFileIntoDeck) {
      setStatus('THE DECK AUDIO LOADER IS NOT READY. REFRESH THE STUDIO AND TRY AGAIN.', 'error');
      return;
    }
    const originalText = button?.textContent || '';
    if (button) {
      button.disabled = true;
      button.textContent = 'FETCHING…';
    }
    setStatus('DOWNLOADING ' + track.title + ' FOR DECK ' + deckId + '…');
    try {
      const response = await fetch(track.url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Audio download failed (HTTP ' + response.status + ').');
      const blob = await response.blob();
      if (!blob.size) throw new Error('The hosted audio file is empty.');
      const file = new File([blob], track.title, { type: blob.type || (track.format === 'MP3' ? 'audio/mpeg' : 'audio/wav'), lastModified: Date.now() });
      await studio.loadFileIntoDeck(deckId, file);
      setStatus(track.title + ' SENT TO DECK ' + deckId + '. PRESS PLAY WHEN READY.', 'success');
      track.statusText = 'READY · LAST SENT TO DECK ' + deckId;
      render();
    } catch (error) {
      console.error('Starter crate load failed:', error);
      setStatus('COULD NOT LOAD ' + track.title + ': ' + error.message, 'error');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  async function init() {
    if (!$('starterCrateRows')) return;
    try {
      const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Starter crate manifest unavailable (HTTP ' + response.status + ').');
      const manifest = await response.json();
      if (!Array.isArray(manifest.tracks) || manifest.tracks.length !== 6) {
        throw new Error('Batch 1 manifest must contain exactly six track records.');
      }
      tracks = manifest.tracks.map((item) => ({
        ...item,
        url: new URL(item.asset, new URL('./assets/starter-crate/', document.baseURI)).href,
        format: item.format || (item.title.split('.').pop() || 'AUDIO').toUpperCase(),
        status: 'checking',
        statusText: 'CHECKING AUDIO FILE…'
      }));
      render();
      setStatus('CHECKING THE SIX SHARED BATCH 1 AUDIO FILES…');
      const checks = await Promise.all(tracks.map(checkTrack));
      render();
      if (readyCount === tracks.length) {
        setStatus('ALL SIX STARTER TRACKS ARE HOSTED AND READY ON THIS DEVICE.', 'success');
      } else if (readyCount > 0) {
        setStatus(readyCount + ' OF 6 STARTER TRACKS ARE HOSTED. THE REST ARE STILL WAITING FOR THEIR AUDIO FILES.', 'warning');
      } else {
        setStatus('THE SIX TRACKS ARE LISTED, BUT THEIR AUDIO FILES HAVE NOT BEEN DEPLOYED TO SHARED HOSTING YET.', 'warning');
      }
    } catch (error) {
      console.error('Starter crate could not initialize:', error);
      tracks = FALLBACK_TRACKS.map((item) => ({
        ...item,
        url: new URL(item.asset, new URL('./assets/starter-crate/', document.baseURI)).href,
        status: 'pending',
        statusText: 'AUDIO NOT PUBLISHED YET'
      }));
      render();
      setStatus('STARTER CRATE SETUP FOUND, BUT THE SHARED AUDIO MANIFEST COULD NOT BE READ: ' + error.message, 'error');
    }
  }

  // The platter drop handler calls this public bridge with the exact starter-track ID.
  window.GoldenStealStarterCrate = {
    loadToDeck(trackId, deckId) {
      const track = tracks.find((item) => item.id === trackId);
      if (!track || track.status !== 'ready') {
        setStatus('THAT STARTER TRACK IS NOT HOSTED YET. ADD ITS ORIGINAL AUDIO FILE FIRST.', 'warning');
        return;
      }
      if (deckId !== 'A' && deckId !== 'B') return;
      return loadToDeck(track, deckId);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
