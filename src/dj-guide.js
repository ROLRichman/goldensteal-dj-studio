// GoldenSteal DJ Studio — Auto Blend + Guided DJ lessons
// Runs locally in the browser. No cloud voice API or private key is used.
const guideStudio = window.GoldenStealStudio;
const guide$ = id => document.getElementById(id);

let autoBlendFrame = 0;
let autoBlendRun = 0;
let guideMode = false;
let voiceOn = true;
let continuousCoach = true;
let activeLesson = "autoBlend";
let activeStep = 0;
let highlightedElement = null;

const DJ_LESSONS = {
  autoBlend: {
    title: "Auto Blend · automatic transition",
    steps: [
      { target: '#deckA [data-action="load"]', title: "Load the track playing now", text: "Load the song you want to play first onto Deck A. Auto Blend needs two audio tracks loaded before it can make the transition.", note: "DECK A · LOAD" },
      { target: '#deckB [data-action="load"]', title: "Load the next track", text: "Put your next song on Deck B. The automatic transition works between two loaded music tracks. Live radio streams are not included in this Auto Blend version.", note: "DECK B · LOAD" },
      { target: "#playA", title: "Start the music", text: "Press Play on Deck A. You only need one deck playing. When Auto Blend starts, it will launch the waiting deck for you.", note: "DECK A · PLAY" },
      { target: "#autoBlendDuration", title: "Choose your fade time", text: "Choose 4 seconds for a quick switch, 8 seconds for a balanced transition, or 12 to 16 seconds for a slower blend.", note: "FADE · 4 / 8 / 12 / 16 SECONDS" },
      { target: "#autoBlendButton", title: "Let GoldenSteal make the transition", text: "Press Auto Blend. GoldenSteal starts the other deck, smoothly moves the actual audio crossfader, then pauses the outgoing deck. Press the same button again to cancel and take manual control. It does not detect or phase-align beats automatically; use your BPM and Sync controls first when needed.", note: "ONE PRESS · AUTOMATIC AUDIO CROSSFADE" }
    ]
  },
  firstMix: {
    title: "First Mix · two decks",
    steps: [
      { target: '#deckA [data-action="load"]', title: "Load Deck A", text: "Choose your first track. This is the first side of your mix.", note: "DECK A · LOAD" },
      { target: '#deckB [data-action="load"]', title: "Load Deck B", text: "Choose a second track. Two decks let you keep one song playing while you prepare the next.", note: "DECK B · LOAD" },
      { target: "#playA", title: "Start Deck A", text: "Press Play on Deck A and listen through your master output or headphones.", note: "DECK A · PLAY" },
      { target: "#playB", title: "Bring in Deck B", text: "Press Play on Deck B when you are ready. You can now blend both tracks with the crossfader.", note: "DECK B · PLAY" },
      { target: "#crossfader", title: "Blend the two tracks", text: "Move left for Deck A, right for Deck B, and use the center for both. Move slowly to make a smooth transition. The slider changes the real audio mix.", note: "A ← CENTER → B" }
    ]
  },
  manualFade: {
    title: "Manual Fade · crossfader",
    steps: [
      { target: "#crossfader", title: "Meet the crossfader", text: "The left end is Deck A. The right end is Deck B. The middle lets both decks play together.", note: "A · CENTER · B" },
      { target: "#channelA", title: "Set Deck A channel level", text: "This slider controls Deck A's channel volume before the master output. Lower it to soften Deck A without changing Deck B.", note: "CHANNEL A LEVEL" },
      { target: "#channelB", title: "Set Deck B channel level", text: "This slider controls Deck B's channel volume. Use it with the crossfader for more control over the blend.", note: "CHANNEL B LEVEL" },
      { target: "#centerCrossfader", title: "Return to the center", text: "Center Mix moves the crossfader to the middle. It does not start or stop either deck.", note: "CENTER MIX" }
    ]
  },
  bpmSync: {
    title: "BPM · tap and sync",
    steps: [
      { target: '[data-action="tap-bpm"][data-deck="A"]', title: "Tap the beat", text: "With Deck A loaded, tap this button in time with the music at least three times. It estimates a BPM from your taps.", note: "DECK A · TAP BPM" },
      { target: "#bpmA", title: "Check or edit the BPM", text: "Tap the BPM number to enter a known track BPM. The displayed BPM is a manual starting value until you tap or edit it.", note: "DECK A · BPM VALUE" },
      { target: '[data-action="sync"][data-deck="B"]', title: "Match Deck B's tempo", text: "Load both tracks, set their BPM values, then press Sync on the deck you want to adjust. Sync changes playback tempo using those values within the supported range. It is not automatic beat-grid or phase alignment.", note: "DECK B · SYNC" },
      { target: "#autoBlendButton", title: "Blend after tempo preparation", text: "Once the tempos are close, Auto Blend can perform the crossfade. For the tightest mix, listen and make any final timing adjustment yourself.", note: "AUTO BLEND · YOUR FINAL EAR CHECK" }
    ]
  },
  cuesLoops: {
    title: "Hot Cues · beat loops",
    steps: [
      { target: '[data-action="set-cue"][data-deck="A"]', title: "Set a starting cue", text: "Pause or play Deck A at the point you want to return to, then press Set Cue. Live radio cannot save track cue points.", note: "DECK A · SET CUE" },
      { target: '[data-action="hotcue"][data-deck="A"][data-pad="0"]', title: "Save a hot cue", text: "Tap an unused numbered hot-cue pad to save the current point. Tap that pad again later to jump back to it.", note: "HOT CUE 1" },
      { target: '[data-action="loop"][data-deck="A"][data-beats="4"]', title: "Create a four-beat loop", text: "Press 4 to repeat a four-beat section. Press Exit to leave the loop. Beat loops require a loaded local or supported track, not a live radio stream.", note: "4 BEAT LOOP" }
    ]
  },
  effects: {
    title: "Performance · FX pads",
    steps: [
      { target: '[data-fx-pad="horn"]', title: "Add an air horn accent", text: "Tap Air Horn for a short performance accent. Keep effects in time and use them intentionally rather than over every transition.", note: "AIR HORN · ONE-SHOT FX" },
      { target: '[data-fx-pad="riser"]', title: "Build anticipation", text: "The Riser effect creates a short build-up for a transition or drop.", note: "RISER · BUILD-UP" },
      { target: "#echoAmount", title: "Shape the echo send", text: "Raise Echo Send to add echo to the deck output. Start low, listen, and bring it back down after the effect.", note: "ECHO SEND · CONTROLLED EFFECT" },
      { target: '[data-fx-pad="vinyl"]', title: "Use a vinyl stop", text: "Tap Vinyl Stop for a quick stop-style effect. Try it in practice first so you know exactly how it changes your mix.", note: "VINYL STOP · PERFORMANCE FX" }
    ]
  }
};

function guideToast(message) {
  if (guideStudio && typeof guideStudio.toast === "function") guideStudio.toast(message);
  else console.info(message);
}

function setFader(value) {
  const fader = guide$("crossfader");
  if (!fader) return;
  fader.value = String(Math.max(0, Math.min(100, value)));
  fader.dispatchEvent(new Event("input", { bubbles: true }));
}

function resetBlendButton() {
  const button = guide$("autoBlendButton");
  const zone = document.querySelector(".crossfader-zone");
  if (button) {
    button.textContent = "✦ AUTO BLEND";
    button.classList.remove("is-running");
    button.setAttribute("aria-pressed", "false");
  }
  if (zone) zone.classList.remove("auto-blending");
}

let autoBlendActive = false;
let autoBlendCleanup = null;

function cancelAutoBlend(message) {
  if (!autoBlendActive && !autoBlendFrame) return;
  autoBlendRun++;
  if (autoBlendFrame) cancelAnimationFrame(autoBlendFrame);
  autoBlendFrame = 0;
  autoBlendActive = false;
  if (autoBlendCleanup) {
    try { autoBlendCleanup(); } catch (error) { console.warn("Could not restore incoming deck level:", error); }
    autoBlendCleanup = null;
  }
  resetBlendButton();
  const status = guide$("autoBlendStatus");
  if (status) status.textContent = "MANUAL CONTROL";
  if (message) guideToast(message);
}

function animateFaderSegment(runId, from, to, durationMs, statusPrefix) {
  return new Promise(resolve => {
    const began = performance.now();
    const tick = now => {
      if (runId !== autoBlendRun) {
        autoBlendFrame = 0;
        resolve(false);
        return;
      }
      const progress = Math.max(0, Math.min(1, (now - began) / durationMs));
      const eased = progress * progress * (3 - 2 * progress);
      setFader(from + (to - from) * eased);
      const status = guide$("autoBlendStatus");
      if (status) status.textContent = statusPrefix + " · " + Math.round(progress * 100) + "%";
      if (progress < 1) {
        autoBlendFrame = requestAnimationFrame(tick);
      } else {
        autoBlendFrame = 0;
        resolve(true);
      }
    };
    autoBlendFrame = requestAnimationFrame(tick);
  });
}

async function runAutoBlend() {
  if (!guideStudio || !guideStudio.deckState || !guideStudio.engine) {
    guideToast("The audio engine is not ready yet. Reload the studio and try again.");
    return;
  }
  if (autoBlendActive) {
    cancelAutoBlend("Auto Blend cancelled. Both decks remain available for manual mixing.");
    return;
  }

  const deckA = guideStudio.deckState.A;
  const deckB = guideStudio.deckState.B;
  if (!deckA.file || !deckB.file) {
    guideToast("Load one music track on Deck A and another on Deck B before Auto Blend.");
    return;
  }
  if (deckA.isStream || deckB.isStream) {
    guideToast("Auto Blend needs two track files. Live radio streams are not supported for this transition.");
    return;
  }

  const playing = ["A", "B"].filter(id => !guideStudio.deckState[id].audio.paused);
  if (!playing.length) {
    guideToast("Start one deck first. Auto Blend will start the waiting deck for you.");
    return;
  }

  const fader = guide$("crossfader");
  const currentFader = Number(fader.value);
  const outgoingId = playing.length === 1 ? playing[0] : (currentFader <= 50 ? "A" : "B");
  const incomingId = outgoingId === "A" ? "B" : "A";
  const incoming = guideStudio.deckState[incomingId];
  const outgoing = guideStudio.deckState[outgoingId];
  const target = incomingId === "B" ? 100 : 0;
  const outgoingEdge = outgoingId === "A" ? 0 : 100;
  const durationMs = Math.max(1000, Number(guide$("autoBlendDuration").value || 8) * 1000);
  const oneDeckWasPlaying = playing.length === 1;
  const incomingChannel = guide$("channel" + incomingId);
  const incomingLevel = incomingChannel ? Number(incomingChannel.value) : 1;
  const shouldReposition = oneDeckWasPlaying && Math.abs(currentFader - outgoingEdge) > 1;

  try {
    await guideStudio.ensureAudio();

    // If the fader was already parked on the incoming side, start the incoming
    // track silently, return the fader to the playing deck, then make the blend.
    // This avoids an accidental full-volume jump when the waiting deck starts.
    if (incoming.audio.paused && shouldReposition) {
      guideStudio.engine.setChannelVolume(incomingId, 0);
      autoBlendCleanup = () => guideStudio.engine.setChannelVolume(incomingId, incomingLevel);
    }
    if (incoming.audio.paused) {
      if (incoming.audio.ended) {
        try { incoming.audio.currentTime = 0; } catch {}
      }
      await incoming.audio.play();
      guideStudio.setDeckPlayingUI(incomingId, true);
    }
  } catch (error) {
    if (autoBlendCleanup) {
      autoBlendCleanup();
      autoBlendCleanup = null;
    }
    console.error("Auto Blend could not start the incoming deck:", error);
    guideToast(error && error.name === "NotAllowedError"
      ? "The browser blocked the second deck. Press PLAY on that deck once, then try Auto Blend again."
      : "The next deck could not start. Check its audio file and try again.");
    return;
  }

  autoBlendActive = true;
  const runId = ++autoBlendRun;
  const button = guide$("autoBlendButton");
  const status = guide$("autoBlendStatus");
  const zone = document.querySelector(".crossfader-zone");
  if (button) {
    button.textContent = "CANCEL BLEND";
    button.classList.add("is-running");
    button.setAttribute("aria-pressed", "true");
  }
  if (zone) zone.classList.add("auto-blending");

  if (shouldReposition) {
    const prepared = await animateFaderSegment(runId, currentFader, outgoingEdge, Math.min(650, durationMs * 0.18), "PREPARING DECK " + outgoingId);
    if (!prepared) return;
    if (autoBlendCleanup) {
      autoBlendCleanup();
      autoBlendCleanup = null;
    }
  }

  const start = Number(fader.value);
  const completed = await animateFaderSegment(runId, start, target, durationMs, "BLENDING " + outgoingId + " → " + incomingId);
  if (!completed) return;

  autoBlendActive = false;
  if (autoBlendCleanup) {
    autoBlendCleanup();
    autoBlendCleanup = null;
  }
  outgoing.audio.pause();
  guideStudio.setDeckPlayingUI(outgoingId, false);
  resetBlendButton();
  if (status) status.textContent = "COMPLETE · DECK " + incomingId + " PLAYING";
  guideToast("Auto Blend complete. Deck " + incomingId + " is playing; Deck " + outgoingId + " is paused.");
}

function populateGuideVoices() {
  const selector = guide$("djGuideVoiceChoice");
  if (!selector || !("speechSynthesis" in window)) return;
  const saved = localStorage.getItem("goldensteal-coach-voice-uri") || "";
  const voices = window.speechSynthesis.getVoices();
  selector.replaceChildren(new Option("DEVICE DEFAULT", ""));
  voices.forEach(voice => selector.add(new Option(voice.name + " · " + voice.lang, voice.voiceURI)));
  selector.value = voices.some(voice => voice.voiceURI === saved) ? saved : "";
}
function speak(text) {
  if (!voiceOn) return;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    const status = guide$("djGuideStatus");
    if (status) status.textContent = "Your browser does not provide built-in speech. Follow the on-screen lesson instead.";
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(String(text || ""));
    const selector = guide$("djGuideVoiceChoice");
    const selectedVoice = selector && selector.value
      ? window.speechSynthesis.getVoices().find(voice => voice.voiceURI === selector.value)
      : null;
    if (selectedVoice) line.voice = selectedVoice;
    const volume = Number(guide$("djGuideVoiceVolume")?.value ?? 0.85);
    line.volume = Math.max(0, Math.min(1, volume));
    line.rate = 0.96;
    line.pitch = 1;
    window.speechSynthesis.speak(line);
  } catch (error) {
    console.warn("Local voice narration is unavailable:", error);
  }
}
window.GoldenStealCoachSpeak = speak;

function clearHighlight() {
  if (highlightedElement) highlightedElement.classList.remove("dj-guide-highlight", "dj-guide-highlight-persistent");
  highlightedElement = null;
}

function highlightTarget(selector, persistent) {
  clearHighlight();
  if (!selector) return null;
  const target = document.querySelector(selector);
  if (!target) return null;
  highlightedElement = target;
  target.classList.add("dj-guide-highlight");
  if (persistent) target.classList.add("dj-guide-highlight-persistent");
  else target.classList.remove("dj-guide-highlight-persistent");
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  return target;
}

function renderGuideStep(shouldSpeak) {
  const lesson = DJ_LESSONS[activeLesson];
  const step = lesson.steps[activeStep];
  if (!step) return;
  guide$("djGuideTitle").textContent = "Show Me How to DJ";
  guide$("djGuideStepTitle").textContent = step.title;
  guide$("djGuideStepText").textContent = step.text;
  guide$("djGuideTargetNote").textContent = step.note || "FOLLOW THE HIGHLIGHT";
  guide$("djGuideProgress").textContent = "STEP " + (activeStep + 1) + " OF " + lesson.steps.length;
  guide$("djGuideProgressFill").style.width = ((activeStep + 1) / lesson.steps.length * 100) + "%";
  guide$("djGuidePrevious").disabled = activeStep === 0;
  guide$("djGuideNext").textContent = activeStep === lesson.steps.length - 1 ? "RESTART LESSON ↻" : "NEXT STEP →";
  const target = highlightTarget(step.target, true);
  guide$("djGuideStatus").textContent = target
    ? "Highlighted: " + step.note + ". Follow the spotlight, then choose Next."
    : "Read this step, then choose Next. The matching control may be in another part of the page.";
  if (shouldSpeak && continuousCoach) speak(step.title + ". " + step.text);
}

function openGuide() {
  const panel = guide$("djGuidePanel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  activeLesson = guide$("djGuideLesson").value || "autoBlend";
  activeStep = 0;
  renderGuideStep(true);
}

function closeGuide() {
  const panel = guide$("djGuidePanel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  clearHighlight();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

const CONTROL_HELP = [
  ["#autoBlendButton", "Auto Blend starts the waiting deck, moves the real audio crossfader over your selected fade time, then pauses the outgoing deck. It needs two loaded tracks and one deck already playing."],
  ["#autoBlendDuration", "Choose how long the Auto Blend transition takes: four, eight, twelve or sixteen seconds."],
  ["#crossfader", "The crossfader changes the audio balance between Deck A on the left and Deck B on the right. The center lets both play together."],
  ["#centerCrossfader", "Center Mix returns the crossfader to the middle. It does not start or stop a song."],
  ["#masterVolume", "Master controls the overall output level for the combined mix."],
  ["#channelA", "Channel A controls Deck A volume before the master output."],
  ["#channelB", "Channel B controls Deck B volume before the master output."],
  ["#filterA", "Deck A Filter sweeps the tone between low-pass and high-pass. The center position is neutral."],
  ["#filterB", "Deck B Filter sweeps the tone between low-pass and high-pass. The center position is neutral."],
  ["#echoAmount", "Echo Send adds an echo effect to the deck audio. Start low and listen before increasing it."],
  ["#muteMaster", "Master Mute silences the combined master output. Press it again to restore the sound."],
  ["#recordButton", "Record Both Decks captures the combined master audio mix. Press it again to stop and save the recording."],
  ["#mobileMixToggle", "Quick Mix opens the compact mixer for channel levels, crossfader and master output on a phone or tablet."],
  ["#focusModeButton", "Focus Mode expands the studio view and reduces distractions while you mix."],
  ["#playA", "Deck A Play starts or pauses the track loaded on the left deck."],
  ["#playB", "Deck B Play starts or pauses the track loaded on the right deck."],
  ["#syncA", "Deck A Sync adjusts its tempo to the BPM value on Deck B. BPM values are manual or tap-estimated in this build."],
  ["#syncB", "Deck B Sync adjusts its tempo to the BPM value on Deck A. BPM values are manual or tap-estimated in this build."],
  ['#deckA [data-action="cue"]', "Cue returns Deck A to its saved cue position."],
  ['#deckB [data-action="cue"]', "Cue returns Deck B to its saved cue position."],
  ['#deckA [data-action="set-cue"]', "Set Cue saves the current play position on Deck A."],
  ['#deckB [data-action="set-cue"]', "Set Cue saves the current play position on Deck B."],
  ['#deckA [data-action="loop"]', "Beat Loop repeats the selected number of beats on Deck A. Use Exit to stop the loop."],
  ['#deckB [data-action="loop"]', "Beat Loop repeats the selected number of beats on Deck B. Use Exit to stop the loop."],
  ['#deckA [data-action="tap-bpm"]', "Tap BPM measures the tempo from repeated taps. Tap at least three times in time with the beat."],
  ['#deckB [data-action="tap-bpm"]', "Tap BPM measures the tempo from repeated taps. Tap at least three times in time with the beat."],
  ['#deckA [data-action="load"]', "Load opens your device audio picker so you can choose a track for Deck A."],
  ['#deckB [data-action="load"]', "Load opens your device audio picker so you can choose a track for Deck B."]
];

function installControlHelp() {
  CONTROL_HELP.forEach(([selector, description]) => {
    document.querySelectorAll(selector).forEach(element => element.dataset.djHelp = description);
  });
  const actionHelp = {
    load: deck => "Load opens your device audio picker so you can choose a track for Deck " + deck + ".",
    play: deck => "Play starts or pauses the music on Deck " + deck + ".",
    cue: deck => "Cue returns Deck " + deck + " to its saved cue position.",
    "set-cue": deck => "Set Cue saves the current play position on Deck " + deck + ".",
    "tap-bpm": deck => "Tap BPM estimates the tempo from repeated taps. Tap at least three times in rhythm on Deck " + deck + ".",
    "bpm-edit": deck => "Tap the BPM number to enter a known tempo for Deck " + deck + ". The value is manual until you enter or tap it.",
    stop: deck => "Stop pauses Deck " + deck + " and returns it to the beginning.",
    skip: deck => "Skip moves Deck " + deck + " forward by fifteen seconds.",
    sync: deck => "Sync adjusts Deck " + deck + " playback tempo using the other deck's BPM value. It does not phase-align the beat grid.",
    "nudge-up": deck => "Nudge plus makes a small tempo increase on Deck " + deck + ".",
    "nudge-down": deck => "Nudge minus makes a small tempo decrease on Deck " + deck + ".",


    "loop-off": deck => "Exit Loop turns off the active beat loop on Deck " + deck + ".",
    "tempo-reset": deck => "Tempo Reset returns Deck " + deck + " to zero percent pitch adjustment.",
    eject: deck => "Eject unloads the track from Deck " + deck + ".",
    "scratch-toggle": deck => "Scratch Arm enables the platter jog gesture. Full reverse-audio vinyl scratching is not included in this build.",
    radio: deck => "Radio opens the live stream input so you can assign a supported station to Deck " + deck + "."
  };
  document.querySelectorAll("[data-action][data-deck]").forEach(element => {
    const action = element.dataset.action;
    const deck = element.dataset.deck;
    let description = actionHelp[action];
    if (action === "hotcue") {
      const pad = Number(element.dataset.pad) + 1;
      description = () => "Hot Cue " + pad + " saves or recalls a marked point on Deck " + deck + ".";
    }
    if (action === "loop") {
      const beats = element.dataset.beats;
      description = () => "Beat Loop repeats a " + beats + "-beat section on Deck " + deck + ".";
    }
    if (typeof description === "function") element.dataset.djHelp = description(deck);
    else if (description) element.dataset.djHelp = description(deck);
  });
  document.querySelectorAll("[data-fx-pad]").forEach(element => {
    const label = element.textContent.trim();
    element.dataset.djHelp = label + " is a one-touch performance sound. Use it as a short accent and listen to the level in your mix.";
  });
  document.querySelectorAll(".tempo-row input[type=range]").forEach(element => {
    const deck = element.id.endsWith("A") ? "A" : "B";
    element.dataset.djHelp = "Deck " + deck + " Tempo changes playback speed. Use small adjustments to bring the tracks closer before a transition.";
  });
  document.querySelectorAll(".rotary-knob").forEach(element => {
    const deck = element.dataset.deck;
    const band = element.dataset.knob.toUpperCase();
    element.dataset.djHelp = "Deck " + deck + " " + band + " EQ adjusts that frequency range. Turn gently and listen to the change.";
  });
}

function controlHelpEvent(event) {
  if (!guideMode) return;
  if (guide$("djGuidePanel").contains(event.target)) return;
  const target = event.target.closest("[data-dj-help]");
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  clearHighlight();
  target.classList.add("dj-guide-highlight");
  highlightedElement = target;
  const message = target.dataset.djHelp;
  guide$("djGuideStatus").textContent = message;
  speak(message);
}

function bindGuide() {
  if (!guideStudio) {
    console.warn("GoldenSteal DJ Guide loaded before the audio studio.");
    return;
  }

  installControlHelp();
  populateGuideVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = populateGuideVoices;
  const voiceChoice = guide$("djGuideVoiceChoice");
  voiceChoice?.addEventListener("change", () => {
    localStorage.setItem("goldensteal-coach-voice-uri", voiceChoice.value);
    guide$("djGuideStatus").textContent = voiceChoice.value ? "Voice preference saved on this device." : "Using the device default voice.";
  });
  const volumeControl = guide$("djGuideVoiceVolume");
  const volumeOutput = guide$("djGuideVoiceVolumeValue");
  if (volumeControl) {
    const savedVolume = localStorage.getItem("goldensteal-coach-volume");
    if (savedVolume !== null) volumeControl.value = savedVolume;
    if (volumeOutput) volumeOutput.textContent = Math.round(Number(volumeControl.value) * 100) + "%";
    volumeControl.addEventListener("input", () => {
      localStorage.setItem("goldensteal-coach-volume", volumeControl.value);
      if (volumeOutput) volumeOutput.textContent = Math.round(Number(volumeControl.value) * 100) + "%";
    });
  }
  const continuous = guide$("djGuideContinuous");
  continuousCoach = localStorage.getItem("goldensteal-coach-continuous") !== "off";
  if (continuous) {
    continuous.checked = continuousCoach;
    continuous.addEventListener("change", () => {
      continuousCoach = continuous.checked;
      localStorage.setItem("goldensteal-coach-continuous", continuousCoach ? "on" : "off");
    });
  }

  guide$("autoBlendButton")?.addEventListener("click", runAutoBlend);
  guide$("crossfader")?.addEventListener("pointerdown", () => {
    if (autoBlendActive) cancelAutoBlend("Manual crossfader movement took over. Auto Blend cancelled.");
  });
  guide$("crossfader")?.addEventListener("keydown", () => {
    if (autoBlendFrame) cancelAutoBlend("Manual crossfader movement took over. Auto Blend cancelled.");
  });

  guide$("djGuideButton")?.addEventListener("click", openGuide);
  guide$("djGuideClose")?.addEventListener("click", closeGuide);
  guide$("djGuideLesson")?.addEventListener("change", () => {
    activeLesson = guide$("djGuideLesson").value;
    activeStep = 0;
    renderGuideStep(true);
  });
  guide$("djGuidePrevious")?.addEventListener("click", () => {
    activeStep = Math.max(0, activeStep - 1);
    renderGuideStep(true);
  });
  guide$("djGuideNext")?.addEventListener("click", () => {
    const lesson = DJ_LESSONS[activeLesson];
    activeStep = activeStep >= lesson.steps.length - 1 ? 0 : activeStep + 1;
    renderGuideStep(true);
  });
  guide$("djGuideReplay")?.addEventListener("click", () => renderGuideStep(true));
  guide$("djGuideVoice")?.addEventListener("click", () => {
    voiceOn = !voiceOn;
    const button = guide$("djGuideVoice");
    button.textContent = voiceOn ? "VOICE ON" : "VOICE OFF";
    button.setAttribute("aria-pressed", String(voiceOn));
    if (!voiceOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
    else speak(guide$("djGuideStepTitle").textContent + ". " + guide$("djGuideStepText").textContent);
    guide$("djGuideStatus").textContent = voiceOn
      ? "Voice is on. Instructions use your device's built-in speech."
      : "Voice is off. Follow the highlighted controls and on-screen instructions.";
  });
  guide$("djGuideHelpMode")?.addEventListener("click", () => {
    guideMode = !guideMode;
    const button = guide$("djGuideHelpMode");
    button.textContent = guideMode ? "CONTROL HELP ON" : "CONTROL HELP OFF";
    button.setAttribute("aria-pressed", String(guideMode));
    guide$("djGuideStatus").textContent = guideMode
      ? "Control Help is on. Tap any highlighted DJ control, button or slider to hear what it does. Tap Control Help again to use controls normally."
      : "Control Help is off. Controls now perform their normal DJ actions.";
    if (guideMode) speak("Control help is on. Tap any DJ control to hear what it does. Tap Control Help again to turn this mode off.");
  });

  document.addEventListener("pointerdown", controlHelpEvent, true);
  document.addEventListener("click", controlHelpEvent, true);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && guide$("djGuidePanel").classList.contains("open")) closeGuide();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindGuide, { once: true });
else bindGuide();
window.addEventListener("beforeunload", () => {
  if (autoBlendFrame) cancelAnimationFrame(autoBlendFrame);
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
