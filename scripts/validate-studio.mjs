import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const fail = message => { console.error('FAIL:', message); process.exitCode = 1; };
const pass = message => console.log('PASS:', message);

const html = read('index.html');
const main = read('src/main.js');
const guide = read('src/dj-guide.js');
const questions = read('src/coach-voice-questions.js');
const controls = read('src/studio-controls.js');
const picker = read('src/crate-picker.js');
const upgrades = read('src/studio-upgrades.js');
const serviceWorker = read('sw.js');
const deckCss = read('src/deck-performance.css');
const studioCss = read('src/studio-controls.css');



const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) fail('Duplicate HTML IDs: ' + [...new Set(duplicates)].join(', '));
else pass('HTML IDs are unique');

const layoutIds = ['crate-dock', 'decks', 'crossfader-dock', 'mixer'];
const positions = layoutIds.map(id => html.indexOf('id="' + id + '"'));
if (positions.some(position => position < 0) || positions.some((position, index) => index && position <= positions[index - 1])) {
  fail('Expected layout order: crate → two decks / wheels → crossfader → Central Mixer');
} else pass('Crate, decks, crossfader and Central Mixer are in the requested order');

const themes = ['golden-signature', 'midnight-blue', 'ocean-teal', 'violet-pulse', 'crimson-club', 'arctic-silver'];
if (themes.some(theme => !html.includes(theme) && !controls.includes(theme))) fail('One or more of the six themes are missing');
else pass('All six selectable theme identifiers are present');

if (!main.includes('GoldenStealCratePicker.open(deckId)') || !picker.includes('loadFileIntoDeck(activeDeck, file)')) {
  fail('Deck LOAD does not route through the saved-crate picker');
} else pass('Deck LOAD routes to saved local tracks before browsing for a new file');

const questionCount = (questions.match(/^\s+\["/gm) || []).length;
if (questionCount !== 30) fail('Expected 30 coach questions; found ' + questionCount);
else pass('Exactly 30 coach questions are present');

if (!questions.includes('MediaRecorder') || !questions.includes("indexedDB.open('goldensteal-coach-voice-clips'")) {
  fail('Personal voice recording is missing microphone recording or local persistence');
} else pass('Personal voice clips use MediaRecorder and device-local storage');

if (!guide.includes('djGuideVoiceChoice') || !guide.includes('djGuideVoiceVolume') || !guide.includes('GoldenStealCoachStopCustomVoice')) {
  fail('Coach voice selection, independent volume or Voice OFF behavior is missing');
} else pass('Coach voice selection, volume and mute hooks are present');

if (!html.includes('id="fxDrawerToggle"') || !controls.includes('function playSample') || !upgrades.includes("document.querySelectorAll('[data-fx-pad]')")) {
  fail('FX drawer / sample pad integration is incomplete');
} else pass('FX drawer and sample-pad hooks are present');

if (!serviceWorker.includes('./src/crate-picker.js')
  || !serviceWorker.includes('./src/coach-voice-questions.js')
  || !serviceWorker.includes('./src/studio-controls.js')
  || !serviceWorker.includes('./src/studio-controls.css')) {
  fail('Service worker is missing one or more new app-shell files');
} else pass('Service worker app shell includes all new studio modules and styles');

if (!html.includes('id="deckWorkspace" open') || !html.includes('id="crate-dock" open')) {
  fail('Deck workspace and music crate should both start open and be collapsible');
} else pass('Dual decks and music crate both start open and can collapse');

if (!main.includes('state.jogScratchActive') || !main.includes('audio.playbackRate = clamp') || !main.includes('audio.currentTime = clamp')) {
  fail('Jog wheel scratch handler is missing live audio position/speed response');
} else pass('Touch Scratch changes audio position bidirectionally and varies playback speed');

if (!guide.includes('function getLiveDJGuidance()') || !guide.includes('function announceLiveNext()') || !html.includes('id="djGuideLiveNext"')) {
  fail('Live DJ state guidance is missing');
} else pass('DJ Coach reads loaded / playing deck state and offers a guided next action');

if (!deckCss.includes('.platter.scratch-armed') || !deckCss.includes('.decks-panel-summary')) {
  fail('Deck workspace / scratch feedback styling is missing');
} else pass('Collapsible deck and scratch touch feedback styles are present');

if (!serviceWorker.includes('./src/deck-performance.css')) {
  fail('Service worker is missing deck-performance.css');
} else pass('Service worker caches the deck performance styles');

JSON.parse(read('assets/starter-crate/manifest.json'));
pass('Starter Crate manifest is valid JSON');


if (!html.includes('id="topDjGuideButton"') || !guide.includes('topDjGuideButton')) {
  fail('Top Show Me How to DJ control is missing or not connected to the coach');
} else pass('Top Show Me How to DJ button opens the existing DJ Coach');

if (!html.includes('id="topQuickMixButton"') || !main.includes("event.target.closest('#mobileMixToggle, #topQuickMixButton')")) {
  fail('Top Quick Mix control is missing or not wired into the Quick Mixer');
} else pass('Top Quick Mix and floating MIX buttons share the same open/close action');

if (!main.includes('window.GoldenStealQuickMixer') || !main.includes('panel.setAttribute(\'aria-hidden\', String(!open))')) {
  fail('Quick Mixer does not expose reliable open / close state');
} else pass('Quick Mixer opens, closes and updates its accessibility state');

if (!studioCss.includes('.mobile-mix-panel { z-index:1610!important; }')
  || !studioCss.includes('.mobile-mix-toggle { z-index:1620!important;')) {
  fail('Quick Mixer panel and floating button are not above competing overlays');
} else pass('Quick Mixer overlay and floating control have priority stacking');

if (process.exitCode) process.exit(process.exitCode);
