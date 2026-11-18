# GOLDENSTEAL DJ STUDIO

**The Sound. The Skill. The Set.**

GoldenSteal DJ Studio is an independent, browser-based DJ performance workstation built for GoldenSteal. It does not depend on Serato, Rekordbox, VirtualDJ, or another commercial DJ application. External DJ software may be considered later as an optional source of compatible history or metadata, never as the playback engine.

## Live app

- https://rolrichman.github.io/goldensteal-dj-studio/
- Repository: https://github.com/ROLRichman/goldensteal-dj-studio

## Current foundation build — Foundation 03

The first working milestone focuses on a real audio path rather than a decorative mixer:

- Two independent local-file decks.
- Browser Web Audio engine with independent channel strips.
- Actual master mix and equal-power crossfader.
- Per-deck 3-band EQ, high-pass / low-pass filter sweep, channel level, and shared echo send.
- Play, pause, cue, set cue, four hot cues per deck, a manual 4-beat loop, seek bar, tempo / pitch adjustment, and jog-wheel seek/pitch nudge.
- Local waveform visualization generated from the loaded audio file (waveform analysis is skipped for files over 70 MB to avoid excessive memory use).
- Master output meter and local WebM mix recording where MediaRecorder is supported.
- Responsive laptop / tablet / phone layouts, an installable PWA shell, a welcome / preview front door, and section navigation.
- Larger touch platters, raised controls, 8 hot cues, extra loop sizes, EQ rotary knobs, quick transport controls, and basic synth performance pads.
- Free To Use catalog search / quick-load UI, plus a radio stream input path for authorized HTTPS streams (subject to CORS support).
- Standard MIDI Learn for selected faders, EQ knobs, and transport buttons in supporting desktop browsers.
- Email magic-link screen scaffold; account authentication remains inactive until a dedicated GoldenSteal Supabase project and public client settings are connected.
- The music files are selected by the user and remain on the user's device. The app does not upload them.

## Honest feature status

This is the first playable foundation, not a claim that every professional DJ function is finished. The current jog interaction provides touch seek and pitch nudging; it is **not yet true reverse-audio vinyl scratching**. The new SCRATCH ARMED control is a workflow toggle only, not a claim that the reverse-audio scratch engine is complete. The advanced reverse-audio scratch engine, beat-grid / phase analysis, automatic BPM and key detection, time-stretch, full effects suite, expanded sample-bank management, microphone routing, separate headphone cue bus, four-deck mode, AudioShake stem processing, and radio broadcast output remain planned milestones. Manual BPM entry, tap tempo, BPM-ratio sync, and a smooth manual-BPM Auto Blend are available. Basic MIDI Learn is available for standard MIDI messages, but does not make every proprietary HID controller feature compatible. Each must be implemented and tested against real audio and hardware before being represented as complete.

## Technical approach

- Static ES modules (no frontend framework or build step required for the foundation release).
- Web Audio API for real mixing, EQ, filtering, echo, metering, and mix capture.
- HTML media playback for local file decode and transport in this first milestone.
- Canvas waveform renderer.
- Indexed permissions remain browser-controlled; this release does not scan a user's device or upload music.
- GitHub Pages serves the app directly from the repository root.

The project can move to a larger TypeScript / AudioWorklet architecture as the DSP engine grows. Timing-sensitive reverse scratch and advanced time-stretch should use a dedicated AudioWorklet or another carefully benchmarked audio engine rather than UI animation.

## Audio and browser requirements

- Use a current desktop Chrome or Edge browser for the first live-performance tests.
- Audio begins only after a user gesture, as required by modern browsers.
- Supported file formats depend on the browser's built-in decoders. MP3 and WAV are the initial expected formats; test other formats on the target device.
- Latency, output selection, headphone cue routing, and hardware support vary by browser, operating system, audio driver, and controller. This release does not claim universal controller or booth-headphone support.
- The app should be served over HTTPS (GitHub Pages supplies HTTPS).

## Planned milestones

1. **Audio foundation:** reliable two-deck playback, mixing, EQ, output meter, recording, local crate.
2. **Turntable performance:** AudioWorklet-based forward / reverse scratch, platter behavior, brake, slip, beatgrid, beat sync, and pitch tools.
3. **Performance suite:** expanded loops and cues, sampler, FX, MIDI Learn and tested controller profiles.
4. **Studio intelligence:** BPM / key analysis, stems through an authorized AudioShake backend, session history, recording upgrades, and optional broadcast destinations.
5. **Advanced:** four-deck mode, more supported hardware, and optional video performance tools.

## API and secret policy

No API key is required for the core player. The AudioShake API key must remain in Supabase Edge Function secrets and must never be placed in browser JavaScript, HTML, the PWA cache, or this repository. Stem Lab will be added only through a server-side integration with explicit user action and usage / credit controls. Optional music-catalog APIs must be integrated with their applicable music licenses and commercial / broadcast terms.

## Development rule

Build in working increments. Verify every milestone with real audio files and the target controller / audio interface. Never fake an audio feature with a visual animation and call it complete.

**Project owner:** GoldenSteal  
**Build partner:** RO’Lyfe  
**Product:** GOLDENSTEAL DJ STUDIO

## Foundation 02 configuration notes

- The welcome page supports a preview entry immediately.
- Email magic-link sign-in is scaffolded but will not send until `auth-config.js` contains the dedicated Supabase project URL and publishable key, and the deployed site URL is allowed in Supabase Auth redirect settings.
- Do not use the Trading Intelligence Classroom project's service-role key in the public DJ site. Use a dedicated GoldenSteal project and its publishable key for browser authentication.
- Radio stream URLs must be HTTPS on this site and their hosts must allow cross-origin audio requests for Web Audio mixing. Arbitrary streams are not guaranteed to work.
- Free To Use catalog tracks are retrieved by their public API. Its license terms differ by usage; the catalog being searchable does not automatically grant commercial or broadcast rights.
- MIDI Learn maps standard MIDI input messages for selected controls; controller compatibility must be tested with the actual model.


## Foundation 03 — video performance

The video panel accepts local MP4 and other browser-supported video files on Deck A and Deck B. It uses a program canvas to blend the pictures with the same central crossfader used by the audio mixer. CUT A / CUT B and AUTO FADE move that shared fader, and the program canvas can be captured together with the master audio mix as a WebM recording.

Video previews are muted to avoid doubling the sound. When possible, the same local video file is also loaded into its matching audio deck so the audio and picture can play together. If the browser cannot decode audio from the selected video container, load a separate audio track on that deck. This is a local-file video mixer, not a video-streaming service.
