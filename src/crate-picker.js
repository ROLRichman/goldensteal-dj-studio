// GoldenSteal — choose tracks already saved in My Crate before browsing the device.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const overlay = $('cratePickerOverlay');
  let activeDeck = 'A';

  const fmtSize = bytes => bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + ' MB'
    : Math.max(1, Math.round(bytes / 1024)) + ' KB';

  function close() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
  }

  function render() {
    const selectedDeck=activeDeck;
    const host = $('cratePickerList');
    if (!host) return;
    host.replaceChildren();
    const starter=window.GoldenStealStarterCrate;
    const ready=starter?.listReady()||[];
    if(ready.length){
      const heading=document.createElement('strong');heading.textContent='STARTER PACK · SAVED TRACKS';host.append(heading);
      for(const track of ready){
        const row=document.createElement('article');row.className='crate-picker-track';
        const title=document.createElement('strong');title.textContent=track.title;
        const meta=document.createElement('small');meta.textContent=track.local?'SAVED ON THIS DEVICE':'SHARED AUDIO';
        const load=document.createElement('button');load.type='button';load.className='crate-picker-load';load.textContent='LOAD TO '+selectedDeck;
        load.addEventListener('click',async()=>{const deck=selectedDeck;load.disabled=true;load.textContent='LOADING…';try{if(await starter.loadToDeck(track.id,deck)){if(activeDeck===deck)close();}else throw new Error('Track not loaded');}catch(e){load.disabled=false;load.textContent='TRY AGAIN';window.GoldenStealStudio?.toast?.(e.message);}});
        row.append(title,meta,load);host.append(row);
      }
    }
    const tracks = (window.GoldenStealStudio?.library || []).filter(item=>!starter?.matchesFile(item.file?.name||''));
    if (!tracks.length && ready.length) return;
    if (!tracks.length) {
      const empty = document.createElement('div');
      empty.className = 'crate-picker-empty';
      empty.textContent = 'No imported tracks are saved in My Crate on this device yet. Add one new file, or open the Starter Pack.';
      host.appendChild(empty);
      return;
    }
    const heading=document.createElement('strong');heading.textContent='MY OTHER TRACKS';host.append(heading);
    tracks.forEach(item => {
      const file = item.file;
      if (!file) return;
      const row = document.createElement('article');
      row.className = 'crate-picker-track';
      const name = document.createElement('strong');
      name.textContent = file.name;
      const meta = document.createElement('small');
      meta.textContent = (file.type || 'AUDIO') + ' · ' + fmtSize(file.size);
      const load = document.createElement('button');
      load.type = 'button';
      load.className = 'crate-picker-load';
      load.textContent = 'LOAD TO ' + selectedDeck;
      load.addEventListener('click', async () => {
        const studio = window.GoldenStealStudio;
        if (!studio?.loadFileIntoDeck) return;
        load.disabled = true;
        load.textContent = 'LOADING…';
        try {
          if(await studio.loadFileIntoDeck(selectedDeck, file)===false)throw new Error('Deck audio could not load.');
          if(activeDeck===selectedDeck)close();
        } catch (error) {
          load.disabled = false;
          load.textContent = 'TRY AGAIN';
          studio.toast?.(error.message || 'This saved track could not be loaded.');
        }
      });
      row.append(name, meta, load);
      host.appendChild(row);
    });
  }

  function open(deckId) {
    if(!['A','B'].includes(deckId))return;
    activeDeck = deckId;
    const title = $('cratePickerTitle');
    if (title) title.textContent = 'Choose a track for Deck ' + activeDeck;
    render();
    overlay?.classList.add('open');
    overlay?.setAttribute('aria-hidden', 'false');
  }

  $('cratePickerClose')?.addEventListener('click', close);
  $('cratePickerOverlay')?.addEventListener('click', event => {
    if (event.target === overlay) close();
  });
  $('cratePickerBrowse')?.addEventListener('click', () => {
    close();
    $('file' + activeDeck)?.click();
  });
  $('cratePickerStarter')?.addEventListener('click', () => {
    close();
    const dock = $('crate-dock');
    if (dock) dock.open = true;
    $('starter-crate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay?.classList.contains('open')) close();
  });

  window.addEventListener('goldensteal-starter-changed',()=>{if(overlay?.classList.contains('open'))render();});
  window.GoldenStealCratePicker = { open, close, refresh: render };
})();