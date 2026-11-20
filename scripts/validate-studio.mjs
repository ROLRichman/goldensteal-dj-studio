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

JSON.parse(read('assets/starter-crate/manifest.json'));
pass('Starter Crate manifest is valid JSON');

if (process.exitCode) process.exit(process.exitCode);
