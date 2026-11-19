// GoldenSteal DJ Studio — Foundation 02 enhancements
// No private API keys are stored in this browser application.
const $x = (id) => document.getElementById(id);
const studio = window.GoldenStealStudio;

function clampX(value, min, max) { return Math.max(min, Math.min(max, value)); }
function showMessage(message) { if (studio?.toast) studio.toast(message); else console.info(message); }

function renderKnob(el, value) {
  const min = Number(el.getAttribute('aria-valuemin') || -24);
  const max = Number(el.getAttribute('aria-valuemax') || 6);
  const val = clampX(Number(value), min, max);
  const ratio = (val - min) / (max - min);
  el.dataset.value = String(val);
  el.style.setProperty('--knob-angle', `${-135 + ratio * 270}deg`);
  el.setAttribute('aria-valuenow', String(val));
  const band = el.dataset.knob;
  const deck = el.dataset.deck;
  const output = $x(`${band}${deck}`);
  if (output) output.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
  if (studio?.engine) studio.engine.setEQ(deck, band, val);
}

function setupRotaryKnobs() {
  document.querySelectorAll('.rotary-knob[data-knob]').forEach(el => {
    renderKnob(el, Number(el.dataset.value || 0));
    let pointerId = null;
    let startY = 0;
    let startValue = 0;
    el.addEventListener('pointerdown', event => {
      pointerId = event.pointerId; startY = event.clientY; startValue = Number(el.dataset.value || 0);
      el.setPointerCapture(pointerId); el.classList.add('turning'); event.preventDefault();
    });
    el.addEventListener('pointermove', event => {
      if (pointerId !== event.pointerId) return;
      const min = Number(el.getAttribute('aria-valuemin') || -24);
      const max = Number(el.getAttribute('aria-valuemax') || 6);
      renderKnob(el, startValue + (startY - event.clientY) * ((max - min) / 180));
    });
    const finish = event => { if (pointerId !== null && event.pointerId === pointerId) { pointerId = null; el.classList.remove('turning'); } };
    el.addEventListener('pointerup', finish); el.addEventListener('pointercancel', finish);
    el.addEventListener('keydown', event => {
      if (!['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const min = Number(el.getAttribute('aria-valuemin') || -24);
      const max = Number(el.getAttribute('aria-valuemax') || 6);
      const now = Number(el.dataset.value || 0);
      renderKnob(el, event.key === 'Home' ? min : event.key === 'End' ? max : now + (['ArrowUp','ArrowRight'].includes(event.key) ? 1 : -1));
    });
    el.addEventListener('wheel', event => {
      event.preventDefault();
      renderKnob(el, Number(el.dataset.value || 0) + (event.deltaY < 0 ? 1 : -1));
    }, {passive:false});
  });
}

function setDeckUiForRemote(deckId, title, sourceLabel, durationLabel) {
  const state = studio.deckState[deckId];
  const audio = state.audio;
  state.cue = 0; state.cueSet = false; state.jogRotation = 0; state.hotCues = Array(8).fill(null); state.loop = null;
  $x('platter' + deckId).style.setProperty('--jog-angle', '0deg');
  $x('title' + deckId).textContent = title;
  $x('filename' + deckId).textContent = sourceLabel;
  $x('format' + deckId).textContent = state.isStream ? 'LIVE RADIO' : 'FREE TO USE';
  $x('duration' + deckId).textContent = durationLabel || 'LIVE';
  $x('loadStatus' + deckId).textContent = state.isStream ? 'LIVE STREAM • NO TRACK SEEK' : 'REMOTE TRACK READY';
  $x('state' + deckId).innerHTML = '<span class="state-dot"></span> READY TO PLAY';
  $x('state' + deckId).classList.remove('playing');
  $x('scopeStatus' + deckId).textContent = state.isStream ? 'LIVE STREAM' : 'REMOTE TRACK READY';
  $x('playText' + deckId).textContent = 'PLAY'; $x('playGlyph' + deckId).textContent = '▶';
  $x('play' + deckId).classList.remove('is-playing');
  $x('seek' + deckId).disabled = state.isStream;
  document.querySelectorAll(`#deck${deckId} [data-action="hotcue"], #deck${deckId} [data-action="loop"], #deck${deckId} [data-action="loop-off"], #deck${deckId} [data-action="cue"], #deck${deckId} [data-action="set-cue"]`).forEach(control => control.disabled = state.isStream);
  $x('seek' + deckId).value = '0';
  document.querySelectorAll(`#deck${deckId} [data-action="hotcue"]`).forEach(btn => btn.classList.remove('set'));
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    $x('remaining' + deckId).textContent = formatSeconds(audio.duration);
  } else {
    $x('remaining' + deckId).textContent = '--:--';
  }
  $x('elapsed' + deckId).textContent = '00:00';
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds)) return '--:--';
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`;
}

async function loadRadioToDeck(deckId) {
  const raw = ($x('radioStreamUrl').value || '').trim();
  const name = ($x('radioStationName').value || 'Live Radio').trim();
  let url;
  try { url = new URL(raw); } catch { showMessage('Enter a valid radio stream URL.'); return; }
  if (url.protocol !== 'https:') { showMessage('Use an HTTPS stream on the secure GoldenSteal website.'); return; }
  const state = studio.deckState[deckId];
  try {
    await studio.ensureAudio();
    state.audio.pause();
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
    state.isStream = true; state.isRemote = false;
    state.file = { name: name + '.live-stream', size: 0, type: 'audio/mpeg', stream: true };
    state.cue = 0; state.hotCues = Array(8).fill(null); state.tapTimes = []; state.loop = null; state.waveform = null;
    state.audio.crossOrigin = 'anonymous';
    state.audio.src = url.href;
    state.audio.load();
    studio.engine.attachDeck(deckId, state.audio);
    const values = { low:0, mid:0, high:0 };
    for (const [band,value] of Object.entries(values)) { studio.engine.setEQ(deckId,band,value); const knob=$x('knob-'+band+'-'+deckId); if(knob) renderKnob(knob,value); }
    studio.engine.setFilter(deckId, Number($x('filter'+deckId).value));
    studio.engine.setChannelVolume(deckId, Number($x('channel'+deckId).value));
    setDeckUiForRemote(deckId, name, url.hostname + url.pathname, 'LIVE');
    drawEmptyWave(deckId);
    $x('radioStatus').textContent = `STREAM ASSIGNED TO DECK ${deckId}`;
    showMessage(`Radio stream loaded on Deck ${deckId}. Press PLAY to start it.`);
  } catch (error) {
    console.error(error);
    $x('radioStatus').textContent = 'STREAM LOAD FAILED';
    showMessage(error.message || 'Could not load this stream. Confirm it is a direct audio stream URL.');
  }
}

function drawEmptyWave(deckId) {
  studio.drawWaveform(deckId, null);
}

let freeTracks = [];
function trackArtist(track) {
  return (track.artists || []).map(pair => Array.isArray(pair) ? pair[1]?.name : pair?.name).filter(Boolean).join(', ') || 'Independent artist';
}
function renderFreeTracks(tracks) {
  const host = $x('musicResults'); host.innerHTML = '';
  if (!tracks.length) { host.innerHTML = '<div class="music-empty">No tracks returned. Try a different search.</div>'; return; }
  tracks.filter(track => !track.is_premium && track.files?.mp3).forEach(track => {
    const card = document.createElement('article'); card.className='music-result';
    const title = document.createElement('div'); title.className='music-result-title'; title.textContent=track.title || 'Untitled track';
    const artist = document.createElement('div'); artist.className='music-result-artist'; artist.textContent=trackArtist(track);
    const meta = document.createElement('div'); meta.className='music-result-meta'; meta.textContent=[track.genre || 'MUSIC',formatSeconds(track.duration), 'LICENSE TERMS APPLY'].join(' • ');
    const actions = document.createElement('div'); actions.className='music-result-actions';
    for(const deckId of ['A','B']) {
      const button=document.createElement('button'); button.textContent='LOAD '+deckId;
      button.addEventListener('click',()=>loadFreeTrack(deckId,track)); actions.appendChild(button);
    }
    card.append(title,artist,meta,actions); host.appendChild(card);
  });
  if (!host.children.length) host.innerHTML='<div class="music-empty">No non-premium tracks with a playable MP3 were returned.</div>';
}
async function fetchFreeTracks(query='') {
  const host=$x('musicResults');
  host.innerHTML='<div class="music-empty">Searching the music catalog…</div>';
  try {
    const url = query
      ? 'https://api.freetouse.com/v3/music/tracks/search?query='+encodeURIComponent(query)+'&limit=18&order=staff_order&sort=desc'
      : 'https://api.freetouse.com/v3/music/tracks/all?limit=18&order=staff_order&sort=desc';
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error('Music catalog returned HTTP '+response.status);
    const payload=await response.json();
    freeTracks=Array.isArray(payload.data)?payload.data:[];
    renderFreeTracks(freeTracks);
  } catch(error) {
    console.error(error);
    host.innerHTML='<div class="music-empty">The Free To Use catalog could not be reached from this browser. You can still load local music. Check the network or try again later.</div>';
    showMessage('Music catalog connection failed.');
  }
}
async function loadFreeTrack(deckId, track) {
  const state=studio.deckState[deckId];
  try {
    await studio.ensureAudio();
    const url=track.files?.mp3;
    if(!url) throw new Error('This track has no MP3 file.');
    state.audio.pause();
    if(state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl=null; state.isStream=false; state.isRemote=true;
    state.file={name:(track.title||'Free To Use track')+'.mp3',size:0,type:'audio/mpeg',remote:true};
    state.cue=0; state.hotCues=Array(8).fill(null); state.tapTimes=[]; state.loop=null;
    state.audio.crossOrigin='anonymous';
    state.audio.src=url; state.audio.load();
    studio.engine.attachDeck(deckId,state.audio);
    for(const band of ['low','mid','high']) { studio.engine.setEQ(deckId,band,0); const knob=$x('knob-'+band+'-'+deckId); if(knob) renderKnob(knob,0); }
    studio.engine.setFilter(deckId,Number($x('filter'+deckId).value));
    studio.engine.setChannelVolume(deckId,Number($x('channel'+deckId).value));
    const artist=trackArtist(track);
    setDeckUiForRemote(deckId,track.title||'Free To Use track',artist+' • Free To Use',formatSeconds(track.duration));
    if(Array.isArray(track.waveform)) {
      state.waveform=Float32Array.from(track.waveform,v=>Number(v)/100);
      drawRemoteWave(deckId,state.waveform);
    } else drawEmptyWave(deckId);
    $x('loadStatus'+deckId).textContent='REMOTE TRACK • CORS / STREAM TEST REQUIRED';
    showMessage('Loaded '+(track.title||'track')+' on Deck '+deckId+'. Press PLAY to test audio routing.');
  } catch(error) {
    console.error(error); showMessage(error.message||'Track could not be loaded.');
  }
}
function drawRemoteWave(deckId,peaks) {
  studio.drawWaveform(deckId, peaks);
}

function playFxPad(kind) {
  const context=studio.engine.context;
  const master=studio.engine.master;
  if(!context || !master) { showMessage('Load a track or press a deck control to start audio first.'); return; }
  const now=context.currentTime;
  const out=context.createGain(); out.gain.setValueAtTime(.0001,now); out.connect(master);
  const duration=kind==='riser'?1.8:kind==='siren'?1.4:kind==='drop'?1.1:.55;
  const envelope=out.gain;
  envelope.gain.exponentialRampToValueAtTime(kind==='horn'?.22:.18,now+.03);
  envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);
  const frequencies=kind==='horn'?[440,554.37,659.25]:kind==='siren'?[600,900]:kind==='drop'?[95,48]:[220,330,440];
  frequencies.forEach((frequency,index)=>{
    const osc=context.createOscillator(); const gain=context.createGain();
    osc.type=kind==='horn'?'sawtooth':kind==='drop'?'triangle':'sine';
    osc.frequency.setValueAtTime(frequency,now);
    if(kind==='siren') osc.frequency.linearRampToValueAtTime(index%2?520:1100,now+duration);
    if(kind==='riser') osc.frequency.exponentialRampToValueAtTime(frequency*5,now+duration);
    if(kind==='drop') osc.frequency.exponentialRampToValueAtTime(Math.max(24,frequency*.35),now+duration);
    gain.gain.value=1/frequencies.length; osc.connect(gain); gain.connect(out);
    osc.start(now); osc.stop(now+duration+.03);
  });
}

const midiMapKey='goldensteal-midi-map-v1';
let midiAccess=null, midiLearnArmed=false;
let midiMappings=JSON.parse(localStorage.getItem(midiMapKey)||'{}');
function midiTargetElement(selector){ try{return document.querySelector(selector);}catch{return null;} }
function applyMidiValue(selector,value,isButton) {
  const element=midiTargetElement(selector); if(!element)return;
  if(element.matches('.rotary-knob')) {
    const min=Number(element.getAttribute('aria-valuemin')||-24),max=Number(element.getAttribute('aria-valuemax')||6);
    renderKnob(element,min+(value/127)*(max-min)); return;
  }
  if(element instanceof HTMLInputElement && element.type==='range') {
    const min=Number(element.min||0),max=Number(element.max||1);
    element.value=String(min+(value/127)*(max-min));
    element.dispatchEvent(new Event('input',{bubbles:true})); return;
  }
  if(isButton && value>0) element.click();
}
function midiMessage(event) {
  const [status,data1,data2]=event.data;
  const command=status&0xf0;
  const key=event.currentTarget.id+':'+command+':'+data1;
  if(midiLearnArmed) {
    const selector=$x('midiTarget').value;
    midiMappings[key]=selector; localStorage.setItem(midiMapKey,JSON.stringify(midiMappings));
    midiLearnArmed=false; $x('midiLearn').textContent='LEARN CONTROL';
    $x('midiStatus').textContent='MAPPED '+selector+' TO MIDI '+data1;
    showMessage('MIDI control mapped.'); return;
  }
  const selector=midiMappings[key]; if(!selector)return;
  const isButton=command===0x90 || command===0x80;
  if(command===0xb0 || command===0x90) applyMidiValue(selector,data2,isButton);
}
async function connectMidi() {
  if(!navigator.requestMIDIAccess) { $x('midiStatus').textContent='WEB MIDI NOT SUPPORTED IN THIS BROWSER'; showMessage('Try desktop Chrome or Edge for MIDI controllers.'); return; }
  try {
    midiAccess=await navigator.requestMIDIAccess({sysex:false});
    const bind=()=>midiAccess.inputs.forEach(input=>{input.onmidimessage=midiMessage;});
    bind(); midiAccess.onstatechange=bind;
    const count=midiAccess.inputs.size;
    $x('midiStatus').textContent=count?count+' MIDI INPUT(S) READY':'NO MIDI INPUT DETECTED';
    showMessage(count?'MIDI connected. Select a control and press LEARN.':'MIDI access enabled; connect a controller and retry.');
  } catch(error) { $x('midiStatus').textContent='MIDI ACCESS DENIED'; showMessage(error.message||'MIDI permission was denied.'); }
}
function setupMidi() {
  $x('midiConnect')?.addEventListener('click',connectMidi);
  $x('midiLearn')?.addEventListener('click',()=>{
    if(!midiAccess) { showMessage('Connect a MIDI controller first.'); return; }
    midiLearnArmed=true; $x('midiLearn').textContent='MOVE A CONTROL…'; $x('midiStatus').textContent='WAITING FOR MIDI MESSAGE';
  });
}

let authClient=null;
let authUser=null;
async function setupEmailDoor() {
  const door=$x('frontDoor'), form=$x('emailAccessForm');
  const emailInput=$x('accessEmail'), sendButton=$x('sendAccessLink');
  const status=$x('accessStatus'), signOutButton=$x('signOutButton');
  const accountButton=$x('accountButton');
  const previewKey='goldensteal_preview_mode';
  const cooldownKey='goldensteal_magiclink_last_sent_v1';
  const cooldownMs=60*1000;
  let sending=false, cooldownTimer=0;
  const getItem=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const setItem=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
  const removeItem=k=>{try{localStorage.removeItem(k);}catch{}};
  const setStatus=(msg,state='info')=>{if(status){status.textContent=msg;status.dataset.state=state;}};
  const showDoor=()=>{door?.classList.remove('hidden');door?.setAttribute('aria-hidden','false');document.documentElement.classList.add('front-door-open');document.body.classList.add('front-door-open');};
  const hideDoor=mode=>{
    door?.classList.add('hidden');door?.setAttribute('aria-hidden','true');document.documentElement.classList.remove('front-door-open');document.body.classList.remove('front-door-open');
    if(mode==='preview')sessionStorage.setItem(previewKey,'1');
    if(mode==='authenticated')sessionStorage.removeItem(previewKey);
  };
  const updateAccount=()=>{
    if(!accountButton)return;
    accountButton.textContent=authUser?'SIGNED IN ✓':'ACCOUNT / SIGN IN';
    accountButton.title=authUser?'Signed in as '+(authUser.email||'your GoldenSteal account'):'Sign in to GoldenSteal DJ Studio';
  };
  const lastSentAt=()=>Number(getItem(cooldownKey)||0);
  const renderSendState=()=>{
    if(!sendButton)return;
    if(cooldownTimer){clearTimeout(cooldownTimer);cooldownTimer=0;}
    if(!authClient){sendButton.disabled=true;sendButton.textContent='SIGN-IN NOT CONNECTED';return;}
    if(sending){sendButton.disabled=true;sendButton.textContent='SENDING…';return;}
    const left=Math.max(0,Math.ceil((lastSentAt()+cooldownMs-Date.now())/1000));
    if(left>0){sendButton.disabled=true;sendButton.textContent='RESEND IN '+left+'s';cooldownTimer=window.setTimeout(renderSendState,1000);return;}
    sendButton.disabled=false;sendButton.textContent='SEND SECURE SIGN-IN LINK';
  };

  $x('guestPreviewButton')?.addEventListener('click',()=>hideDoor('preview'));
  accountButton?.addEventListener('click',()=>{
    showDoor();
    if(authUser)setStatus('You are already signed in as '+(authUser.email||'your GoldenSteal account')+'. Your session is saved on this device.','success');
    else emailInput?.focus();
    if(signOutButton)signOutButton.hidden=!authUser;
  });
  signOutButton?.addEventListener('click',async()=>{
    if(!authClient||!authUser)return;
    signOutButton.disabled=true;
    try{
      const {error}=await authClient.auth.signOut();
      if(error)throw error;
      authUser=null;updateAccount();
      setStatus('You are signed out. You can sign in again or continue in preview mode.','success');
      signOutButton.hidden=true;
    }catch(error){setStatus('Could not sign out: '+(error.message||'Please try again.'),'error');}
    finally{signOutButton.disabled=false;}
  });

  const config=window.GOLDENSTEAL_AUTH_CONFIG||{};
  const configured=typeof config.url==='string'&&config.url.startsWith('https://')&&
    typeof config.publishableKey==='string'&&config.publishableKey.length>10;
  if(!configured){
    setStatus('Account sign-in is not connected yet. GoldenSteal needs its dedicated Supabase project settings before it can send or verify sign-in links.','error');
    renderSendState();
    if(sessionStorage.getItem(previewKey)==='1')hideDoor('preview');
    form?.addEventListener('submit',event=>{
      event.preventDefault();
      setStatus('Sign-in is not active yet. No email was sent because the GoldenSteal authentication service has not been connected.','error');
    });
    return;
  }

  try{
    const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
    authClient=createClient(config.url,config.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storage:window.localStorage}
    });
    const {data,error}=await authClient.auth.getSession();
    if(error)throw error;
    authUser=data?.session?.user||null;
    updateAccount();
    if(authUser){
      hideDoor('authenticated');
      setStatus('Welcome back. Your GoldenSteal session was restored automatically.','success');
    }else if(sessionStorage.getItem(previewKey)==='1')hideDoor('preview');
    else{
      showDoor();
      setStatus('Enter your email to receive a secure sign-in link. Returning users with a saved session are signed in automatically.');
    }
    if(signOutButton)signOutButton.hidden=!authUser;
    renderSendState();
    authClient.auth.onAuthStateChange((event,session)=>{
      authUser=session?.user||null;updateAccount();
      if(signOutButton)signOutButton.hidden=!authUser;
      if(session){hideDoor('authenticated');setStatus('Signed in. Your session is saved on this device.','success');}
      else if(event==='SIGNED_OUT'){showDoor();setStatus('You are signed out. Sign in again or use preview mode.');}
    });
  }catch(error){
    authClient=null;updateAccount();
    setStatus('GoldenSteal sign-in could not initialize: '+(error.message||'Check the Supabase project URL and publishable key.'),'error');
    renderSendState();showDoor();return;
  }

  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(sending)return;
    const email=(emailInput?.value||'').trim().toLowerCase();
    if(!email||!emailInput?.checkValidity()){setStatus('Enter a valid email address to continue.','error');emailInput?.focus();return;}
    const left=Math.max(0,Math.ceil((lastSentAt()+cooldownMs-Date.now())/1000));
    if(left>0){setStatus('A sign-in email was just requested. Wait '+left+' seconds before requesting another one.','error');renderSendState();return;}
    // Persist cooldown before awaiting the request, preventing rapid double-clicks or second-tab duplicates.
    setItem(cooldownKey,String(Date.now()));
    sending=true;renderSendState();
    try{
      const {error}=await authClient.auth.signInWithOtp({
        email,
        options:{emailRedirectTo:new URL('./',location.href).toString(),shouldCreateUser:true}
      });
      if(error)throw error;
      setStatus('Secure sign-in link sent to '+email+'. Open it on this device. GoldenSteal will remember you after verification. Another email can be requested in 60 seconds.','success');
    }catch(error){
      removeItem(cooldownKey);
      setStatus('Could not send the sign-in link: '+(error.message||'Please try again later.'),'error');
    }finally{sending=false;renderSendState();}
  });
}

let autoBlendAnimation=0;
async function runAutoBlend() {
  if(autoBlendAnimation) { cancelAnimationFrame(autoBlendAnimation); autoBlendAnimation=0; $x('autoBlendButton').textContent='✦ AUTO BLEND'; showMessage('Auto blend cancelled; manual control restored.'); return; }
  const A=studio.deckState.A,B=studio.deckState.B;
  const playingA=!A.audio.paused&&!A.audio.ended, playingB=!B.audio.paused&&!B.audio.ended;
  let outgoing=playingA&&!playingB?'A':playingB&&!playingA?'B':Number($x('crossfader').value)<=50?'A':'B';
  const incoming=outgoing==='A'?'B':'A';
  const outState=studio.deckState[outgoing],inState=studio.deckState[incoming];
  if(!outState.file||!inState.file){showMessage('Load a track on both decks before Auto Blend.');return;}
  if(outState.isStream||inState.isStream){showMessage('Auto Blend BPM matching needs two track files. Use the crossfader manually with live radio.');return;}
  if(!playingA&&!playingB){showMessage('Start one deck first, then Auto Blend will bring in the other.');return;}
  const targetRate=(outState.bpm*outState.audio.playbackRate)/Math.max(1,inState.bpm);
  if(targetRate<0.84||targetRate>1.16){showMessage('Manual BPM gap exceeds the ±16% tempo range. Adjust BPM before blending.');return;}
  await studio.ensureAudio();
  const newTempo=(targetRate-1)*100;
  $x('tempo'+incoming).value=String(newTempo); studio.setTempo(incoming,newTempo);
  if(inState.audio.paused) { await inState.audio.play(); studio.setDeckPlayingUI(incoming,true); }
  const startX=Number($x('crossfader').value);
  const endX=incoming==='B'?100:0;
  const duration=Number($x('autoBlendDuration').value)*1000;
  const startTime=performance.now();
  const outKnob=$x('knob-low-'+outgoing),inKnob=$x('knob-low-'+incoming);
  const outStart=Number(outKnob?.dataset.value||0),inStart=Number(inKnob?.dataset.value||0);
  $x('autoBlendButton').textContent='CANCEL AUTO BLEND';
  const animate=now=>{
    const progress=clampX((now-startTime)/duration,0,1);
    const eased=progress*progress*(3-2*progress);
    const x=startX+(endX-startX)*eased;
    $x('crossfader').value=String(x); studio.engine.setCrossfader(x/100);
    if(outKnob) renderKnob(outKnob,outStart+(-18-outStart)*eased);
    if(inKnob) renderKnob(inKnob,inStart+(0-inStart)*eased);
    if(progress<1){autoBlendAnimation=requestAnimationFrame(animate);}
    else{autoBlendAnimation=0;$x('autoBlendButton').textContent='✦ AUTO BLEND';showMessage('Auto blend complete. New deck is in control.');}
  };
  autoBlendAnimation=requestAnimationFrame(animate);
  showMessage('Auto blend started: manual BPM match and smooth crossfade. Beat-phase alignment is a later upgrade.');
}

function bindUpgrades() {
  setupRotaryKnobs();
  $x('autoBlendButton')?.addEventListener('click',runAutoBlend);
  $x('radioLoadA').addEventListener('click',()=>loadRadioToDeck('A'));
  $x('radioLoadB').addEventListener('click',()=>loadRadioToDeck('B'));
  $x('radioLoadForm').addEventListener('submit',event=>{event.preventDefault();loadRadioToDeck('A');});
  document.querySelectorAll('[data-fx-pad]').forEach(button=>button.addEventListener('click',()=>playFxPad(button.dataset.fxPad)));
  $x('quickPicksButton').addEventListener('click',()=>fetchFreeTracks(''));
  $x('musicSearchForm').addEventListener('submit',event=>{event.preventDefault();fetchFreeTracks($x('musicSearchInput').value.trim());});
  setupMidi();
  setupEmailDoor();
  fetchFreeTracks('');
  // Make the app's loading and radio controls available in the top navigation on small screens.
  if(location.hash==='#radio-studio') $x('radio-studio').scrollIntoView();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindUpgrades,{once:true});
else bindUpgrades();
window.addEventListener('beforeunload',()=>{if(studio){Object.values(studio.deckState).forEach(state=>{state.isStream=false;});}});
