# GOLDENSTEAL DJ STUDIO

**The Sound. The Skill. The Set.**

GoldenSteal DJ Studio is a responsive, touch-ready DJ performance workstation designed around the needs of a live DJ. It is intended to run on laptops, tablets, and phones, with a full desktop performance layout and adaptive tablet/mobile controls.

> This is a real-audio application, not a DJ-themed visual mockup. The first milestone is to prove reliable playback, mixing, cueing, and output routing before expanding the feature set.

## GitHub repository

- **Repository name:** `goldensteal-dj-studio`
- **GitHub description:** `GoldenSteal’s responsive DJ performance workstation: dual decks, jog-wheel scratching, beatmatching, headphone cueing, loops, hot cues, EQ, effects, sampler, MIDI controller mapping, local music library, recording, and radio-ready workflows.`
- **Suggested visibility:** Private during development.
- **Primary deployment:** Cloudflare Pages (free tier to start), connected to this GitHub repository.

## Product vision

Create GoldenSteal's own branded DJ console, with the controls and audio behavior a working DJ expects. The product should feel like a performance instrument: large jog wheels, immediate tactile controls, readable waveforms, dependable transport controls, clear audio meters, and a mixer that stays usable during a live set.

The GoldenSteal identity should appear on the console header, platter centers, loading screens, and install icon. Initial visual direction: deep charcoal/black surfaces, brushed-gold accents, precise typography, and clear high-contrast control states. The interface should be premium and functional, not cluttered.

## Core principles

1. **Real audio first.** Playback, scratching, cueing, mixing, and recording must work with actual audio files. Animations must never pretend an audio feature works when it does not.
2. **Local-first music library.** Tracks are selected from the DJ's device. The first version does not upload songs to a server.
3. **Responsive, not reduced to a toy.** Laptop gets the complete console; tablet gets a landscape-first two-deck view; phone gets a compact touch layout with essential mixer controls always reachable.
4. **Hardware-aware.** Support standard MIDI devices through browser MIDI where available, plus a learn/mapping system. Never claim a controller is supported until it has been tested.
5. **No paid AI or music API dependency.** Core DJ functions must work without an AI key, subscription, or third-party music-streaming account.
6. **Safe live performance.** Provide clear audio-device status, clipping warnings, loading/error states, and a master stop/mute control.

## Initial platform

- **Frontend:** React + TypeScript
- **Build tooling:** Vite
- **Installable experience:** Progressive Web App (PWA)
- **Audio engine:** Web Audio API with AudioWorklet for custom real-time DSP
- **Hardware control:** Web MIDI API with MIDI Learn and saved mappings
- **Local metadata/settings:** IndexedDB (browser-local)
- **Deployment:** Cloudflare Pages connected to GitHub
- **Source control:** GitHub

The app must use HTTPS in deployment because important browser audio and MIDI capabilities require a secure context.

### Browser and hardware reality

- Primary performance target: desktop Chrome or Edge on a laptop/computer.
- Chrome/Edge desktop is the first target for external MIDI controller support and selectable output devices.
- Android Chrome can be a useful touch-first target, but connected hardware and audio-device behavior must be tested on the actual device.
- iPhone/iPad Safari can provide a touch-operated interface, but Safari on iOS does not currently provide Web MIDI. Do not promise external MIDI controller support on iOS Safari.
- Separate master and headphone/cue outputs depend on browser support, device permissions, and the connected audio hardware. Build a capability test and graceful fallback. A compatible multi-output audio interface/controller may be required for reliable booth-style cueing.
- A browser is not a substitute for testing with the DJ's actual laptop, headphones, controller, and speakers. Latency varies by hardware, operating system, browser, and audio driver.

## Product layout

### Laptop: Performance Console

- Two full-size decks, A and B
- Large jog wheels / platters with touch and mouse interaction
- Center mixer with channel controls and crossfader
- Parallel, readable beat waveforms and track overview waveforms
- Track browser / crate and queue
- Master and headphone cue controls
- MIDI controller and audio-device setup panel

### Tablet: Landscape Performance

- Two touch-friendly decks and visible mixer
- Larger hit areas for PLAY, CUE, SYNC, loops, hot cues, and effects
- Persistent crossfader and master controls
- Optional simplified portrait layout

### Phone: Compact Performance

- Single-deck focus with fast deck switching
- Large PLAY/CUE and jog controls
- Persistent crossfader, channel selection, and master controls
- Crate and queue optimized for touch
- Phone mode is a compact performance surface, not a promise of full multi-output club hardware support

## Feature plan

### Phase 0 — Audio foundation and proof-of-sound

Do this before spending time polishing the console UI.

- Create the audio engine and audio-device capability check.
- Load one local audio file and play/pause/stop it reliably.
- Load two local files and mix both through a real crossfader.
- Add master metering, channel gain, and a basic three-band EQ.
- Test latency, seeking, audio continuity, and memory use on the target laptop.
- Test master/headphone routing with the actual audio hardware; document what works and what needs a fallback.

**Exit condition:** two real tracks play, mix, and stop reliably without relying on a visual simulation.

### Phase 1 — Essential two-deck DJ console

- Two independent decks with load/eject, play, pause, cue, stop, seek, and track position.
- Track title, duration, elapsed/remaining time, BPM display, and track status.
- Scrollable beat waveform plus full-track overview waveform.
- Jog wheel for pitch bend, seek, and platter interaction.
- Pitch/tempo fader, tempo range, nudge +/- and reset.
- Channel gain/trim, high/mid/low EQ, filter, channel faders, and crossfader.
- Crossfader curves: smooth blend and sharp cut.
- VU meters, master volume, limiter/clipping warning, and mute.
- Track crate, queue, search, and local playlist metadata.
- Keyboard shortcuts that do not interfere with normal text entry.

### Phase 2 — Real performance controls

- **Baby scratch and manual scratching:** platter movement controls the audio read position and speed, including forward/backward motion. This must be implemented in the audio engine, not faked with a rotating CSS disc.
- Vinyl/CD jog modes, pitch bend, backspin/brake, reverse, and slip-style behavior where technically supported.
- Cue point setting and recall; at least four hot cues per deck initially.
- Beat loops (1, 2, 4, 8, 16 beats), loop in/out, reloop/exit, and quantize.
- Beatgrid and BPM detection, manual BPM tap/edit, and beat alignment.
- Sync assistance with manual override; the DJ remains in control.
- Key-lock/time-stretch evaluation and implementation only after audio quality is validated.
- MIDI Learn for knobs, faders, buttons, jog wheels, and pads.
- Save controller mappings by device and provide a generic MIDI mapping profile.

### Phase 3 — Performance expansion

- Sampler pads for drops, air horns, sirens, risers, one-shots, and custom user samples.
- Effects: echo, reverb, flanger, phaser, high-pass/low-pass, beat roll, and filter sweeps.
- Microphone/aux input with gain and talkover controls, subject to browser/device support.
- Recording of the master mix to a downloadable audio file.
- Session history, set notes, and crate organization.
- Radio/broadcast output integration using an authorized station or streaming endpoint. This may require a compatible streaming relay/server; it is not assumed to be a free, direct browser-to-radio connection.

### Phase 4 — Advanced options

- Optional four-deck mode.
- More controller profiles after physical testing.
- Improved library metadata and supported-format expansion.
- Optional video decks and video mixing, only after the audio experience is stable.
- Optional cloud sync/account features only if there is a real need. These are not required for the first release.

## Audio-engine design notes

- Keep real-time playback and DSP out of React rendering. React controls the interface; the audio engine owns timing-sensitive playback.
- Use AudioWorklet for custom playback, scratch behavior, metering, and real-time processing where appropriate.
- Design each deck as an independent audio source feeding its channel strip, then the master mix bus.
- Keep headphone cue/PFL routing separate from the master mix path. Validate actual output routing before claiming true split cue support.
- Perform BPM analysis and waveform preparation in a Worker so the interface remains responsive.
- Add smoothing/ramping to gain, EQ, and crossfader changes to avoid clicks and abrupt jumps.
- Treat track decoding and long-track memory usage as core engineering concerns. Test long files on real target devices.
- Make the app recover gracefully when a track fails to decode or an audio device is disconnected.

## Music source and rights policy

The first release loads music files that the DJ selects from their own device. Browser file pickers are user-controlled; the app cannot silently scan every folder or bypass device permissions.

Do not rip, extract, or bypass DRM from Spotify, Apple Music, YouTube, or other protected streaming services. Do not promise that a streaming playlist can be routed into the mixer. SoundCloud's published API guidance specifically restricts mixing its content with other content. Any future catalog or streaming integration must be separately authorized and must comply with that provider's terms and music licensing requirements.

Initial codec support must be tested in the target browsers. Start with common formats such as MP3 and WAV; add M4A/AAC, FLAC, AIFF, or other formats only after verifying reliable decode and playback on supported devices.

## First-release acceptance checklist

- [ ] The app installs as a PWA on supported devices.
- [ ] Laptop layout shows two usable decks and a center mixer without horizontal page drift.
- [ ] Tablet landscape layout keeps both decks and the mixer usable by touch.
- [ ] Phone layout provides usable transport, jog, crate, and mixer controls.
- [ ] A local track loads and plays on Deck A.
- [ ] A second local track loads and plays on Deck B.
- [ ] Crossfader and channel faders change the actual mixed audio.
- [ ] EQ and filter controls change the actual audio signal.
- [ ] Waveforms and track positions remain synchronized with playback.
- [ ] Jog movement changes playback behavior; scratch is actual audio manipulation.
- [ ] Master output is identified and tested.
- [ ] Headphone cue is either verified on the selected hardware or clearly marked unsupported with an available fallback.
- [ ] MIDI devices are detected where supported; MIDI Learn saves and restores mappings.
- [ ] No music file is uploaded without a separate, explicit feature and consent.
- [ ] Audio failure, device disconnect, and unsupported codec states are visible and recoverable.

## Out of scope for the first release

- Paid AI services or API keys.
- Paid streaming music catalogs.
- Automatic YouTube/Spotify/Apple Music audio extraction.
- Claims of universal controller compatibility without hardware tests.
- Claims of professional headphone cueing on every phone/tablet browser.
- AI stem separation until there is a validated, affordable implementation.

## Development rule

Build in working increments. Every milestone must be playable and testable with real music before moving to the next one. Never replace a working audio path with a visual mockup, synthetic demo track, or nonfunctional button and call it complete.

---

**Project owner:** GoldenSteal  
**Build partner:** RO’Lyfe  
**Product:** GOLDENSTEAL DJ STUDIO
