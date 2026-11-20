# GOLDENSTEAL DJ STUDIO

**Your Music. Your Mix. Your Moment.**

GoldenSteal DJ Studio is a browser-based two-deck DJ workstation for practicing, mixing local music, working with supported radio streams, and exploring performance controls on desktop, tablet, and phone.

## Open the studio

https://rolrichman.github.io/goldensteal-dj-studio/

The preview opens without an account. Select **Enter Studio** to begin.

## What is included

- Two independent decks with local music loading and playback.
- A crate dock directly above the decks, with the shared Starter Crate first and the personal Music & Sample Crate beneath it.
- A local music crate that saves imported audio on the current device and browser.
- A dedicated crossfader strip directly below the crate dock and above the jog wheels.
- Per-deck quick controls beside each jog wheel: pre-EQ input TRIM (-12 to +12 dB), BASS EQ, and channel LEVEL. The quick level fader stays synchronized with the Central Mixer channel fader, and the quick bass slider stays synchronized with the Central Mixer LOW EQ dial.
- A per-deck PAUSE SPIN / RESUME SPIN control for the decorative idle wheel animation. The signature idle spin remains on by default; pausing its visual animation does not pause audio or disable jog interaction.
- Restore Last Set for the most recently loaded local tracks on Deck A and Deck B.
- Dual scrolling waveforms with mouse and touchscreen scrubbing.
- Play, pause, cue, hot cues, beat loops, tempo controls, jog wheels, and manual BPM entry / tap tempo.
- Per-deck EQ, filters, channel levels, master level, crossfader, echo, and mix recording where supported.
- A quick mobile / tablet mixer panel, focus mode, session timer, and local date / time.
- Color-coded cue points and eight one-touch synthesized performance effects.
- Radio ACID — Everything Chill listening player, plus a direct stream input for supported station streams.
- Shortcuts to YouTube and YouTube Music. These services open separately and are not treated as downloadable deck audio.
- Two original starter practice beats: 96 BPM and 100 BPM, each approximately 77–80 seconds.

## First mix: what to test

1. Open the **Music & Sample Crate** dock above the decks. The shared Starter Crate is listed first; your personal crate follows it.
2. When the original starter audio files are hosted, drag a ready track icon onto Deck A or Deck B. On touchscreens, drag the icon with your finger or use **LOAD TO A / LOAD TO B**.
3. Press Play on Deck A, then Deck B.
4. Use the per-deck TRIM, BASS and LEVEL faders beside the wheels, or use the full HIGH / MID / LOW EQ and FILTER controls in the Central Mixer.
5. Move the crossfader strip directly below the crate dock from A through CENTER to B.
6. Adjust the channel levels and master level from the Central Mixer or the mobile Quick Mixer.
7. Drag a finger across either waveform to scrub within the visible section.
8. Set a cue, try the hot cue pads and beat loops, then test the EQ knobs by dragging up and down.
9. Try the sound-effect pads and record a short mix.

For the first tablet test, use the same steps in landscape and portrait orientation. The quick mixer button remains available on narrower tablet layouts.

## Shared Starter Crate — Batch 1

The Starter Crate is a separate shared library from **My Crate**. It lists the six original Batch 1 track names on every device and checks the same-origin audio assets before enabling **LOAD TO A** and **LOAD TO B**. A selected track is fetched as a real audio file and passed to the existing two-deck loader, then saved in that device's IndexedDB crate.

The Starter Crate UI, manifest and deck-loading connection are now in the codebase. The six audio binaries still need to be published in `assets/starter-crate/`; until each actual file is present and returns successfully, its load buttons remain disabled and the app says that the audio is not published. No silent placeholder or fake track is used.

The crate dock sits immediately below Master Transport and opens above the jog wheels. The shared Starter Crate appears first, followed by the personal Music & Sample Crate. The dedicated live crossfader strip sits below both decks and above the full Central Mixer. The full Central Mixer remains below the decks with both channel strips and performance pads.

When a starter track is hosted, its icon supports mouse drag-and-drop and touch/pen drag onto either platter. The **LOAD TO A** and **LOAD TO B** buttons remain available as direct touch controls. The existing platter jog, waveform seek, cue, loop, tempo, and mixer controls remain active.

## Music and device storage

Your imported music is saved in browser storage on the device where it was added. It is not automatically synchronized to another phone, tablet, or computer. Add the same music files on each device where you want to use them.

There is no fixed track-count limit set by the app. The practical limit is the available storage and memory on the device and browser. Large files can take longer to load, decode, and analyze. Clearing browser site data or using a private browsing session may remove locally saved music.

## Radio and streaming sources

The Radio ACID — Everything Chill player is included for listening. A direct HTTPS stream address is also prefilled in the radio input so it can be assigned to Deck A or Deck B. Live-station mixing depends on the station host allowing the browser to access the audio for processing. If the stream plays in the listening player but will not load into a deck, use another direct stream source that permits mixing.

When a direct radio stream is paused for 30 seconds or longer, pressing Play reloads the stream so the deck can return to the current live broadcast instead of continuing an older buffered segment. Short pauses continue from the same position.

The YouTube and YouTube Music links open those services. Music from those services is not extracted into local audio files or converted into deck sources.

## Current limitations

This is an evolving DJ workstation. The jog wheels currently provide touch seeking and jog interaction, but full reverse-audio vinyl scratching is not complete. Some advanced stream functions such as waveform analysis, seeking, beat grids, and loops are unavailable on live radio. Browser, device, audio output, and controller compatibility vary and require testing on the actual hardware.

Deck C and Deck D with a four-channel mixer are planned for a future milestone. They are not part of the current two-deck preview.

## Privacy and practical notes

Local music remains in the browser storage on the current device. The app does not require an account to enter the preview. Use audio files and streams you have permission to play and mix, and check the relevant terms for public, commercial, or broadcast use.



## Pilot polish build — touch, media and controller clarity

- Jog platters rotate slowly while idle, including when no track is loaded; playback spins faster and touch gestures rotate the platter without requiring audio.
- Deck A and Deck B waveforms use separate multi-colour palettes.
- The session card shows elapsed session time plus the full local calendar date and clock.
- Touching buttons, pads, knobs, sliders and platters produces a visible highlight.
- Discovery is not a radio station. It searches the Free To Use catalog; eligible catalog MP3s can be saved to the local crate when the source permits browser downloads.
- Download sources are linked for Pixabay Music, Free Music Archive, Freesound samples and Mixkit sound effects. Download from the source, review that exact item's license, then use **Add Tracks** to import it. Do not assume every item permits commercial use, remixing, public performance or broadcast.
- Radio ACID / Just Listening remains in **Radio & Live Stream**. The app does not rip or record a station feed into the sample crate.
- The audio mix recorder captures the master output from both active audio decks. The video recorder captures the blended program picture and that same master audio output.
- Video deck picture-opacity sliders affect transparency only. Use the Central Mixer for audio level, channel volume and master volume.
- Universal MIDI connection is for a physical controller attached to the laptop. Phone/tablet remote pairing over Wi-Fi is not active yet; it needs a secure pairing session and a real-time relay service.
- AI DJ Coach is planned as a secured server-side feature. No API key is placed in the browser.

## Download source license notes

- Pixabay explains that items are downloadable under its Content License, while standalone redistribution is prohibited and some content may involve third-party rights: https://pixabay.com/service/license-summary/.
- Free Music Archive assigns licenses per track; check the song's own license before adapting, performing, recording or using it commercially: https://freemusicarchive.org/License_Guide.
- Freesound uploads use CC0, Attribution or Attribution-NonCommercial terms; review each sound's license and attribution requirements: https://freesound.org/help/faq/.
- Mixkit's free sound-effects license is separate from its stock-music license; check the item type and terms before use: https://mixkit.co/license/.


## Guided DJ controls and Auto Blend

- **Auto Blend is an audio transition, not only a visual fade.** Load a track on each deck and start at least one deck. Press **AUTO BLEND** and the studio starts the waiting deck, moves the real audio crossfader over the selected 4, 8, 12 or 16 seconds, then pauses the outgoing deck when the transition finishes.
- Press **AUTO BLEND** again during a transition to cancel it. Both decks remain playing so the DJ can take over manually.
- Auto Blend uses the current track positions and the crossfader. It does **not** automatically detect BPM, build beat grids or phase-align kicks. BPM values in this build are manual starting values; tap or edit them and use **SYNC** before a transition when a tempo match is needed. Live radio streams are not supported by Auto Blend.
- **Show Me How to DJ** opens step-by-step lessons for the first mix, Auto Blend, manual crossfading, BPM / Sync, cues / loops and FX pads. Each step highlights the next control with a pulsing gold spotlight.
- **Voice On** reads the lesson using the device browser's built-in speech voice. **Control Help** lets a DJ tap a labeled control to hear what it does. Voice processing is local to the browser; it does not use a cloud AI voice.
- The guide is an in-app operating coach, not a replacement for practice or manual control. Hardware timing, audio output and transitions still need testing on the actual phone, tablet and laptop used by the DJ.


## Foundation 08 — Performance expansion

- The crate dock remains first, directly below Master Transport. Each deck's LOAD button and the top LOAD TRACK button now open a picker showing music already saved in My Crate on this device before offering the device file browser.
- The crossfader / echo / Center Mix strip is positioned after both deck wheels and immediately before the Central Mixer.
- A visible six-theme picker offers Golden Signature, Midnight Blue, Ocean Teal, Violet Pulse, Crimson Club and Arctic Silver. The selection is saved in this browser.
- A bright, fixed DECKS shortcut jumps back to the two live decks on phone and tablet.
- A right-side FX + Samples drawer holds the eight synthesized GoldenSteal performance sounds, a separate FX / sample output level and eight user-assignable sample pads.
- Custom sample files are saved in a local sample bank and are also added to My Crate when browser storage accepts the file.
- Show Me How to DJ now includes a selectable device speech voice, independent coach volume and a continuous-talk setting for each Next step.
- The coach contains 30 selectable quick-answer topics covering loading, mixing, EQ, effects, recording, radio, BPM, crates, waveforms and controllers.
- Record My Voice captures a personal answer for the selected coach topic. Recordings are saved locally and can be replayed or used instead of the device voice for that topic. This is personal recorded audio, not voice cloning or generated speech in the user's voice.
- The More Channels menu identifies Deck C and Deck D as a future four-channel expansion. The current audio engine remains a real two-deck mixer; C / D are not active channels yet.

### Foundation 08 testing notes

- The app does not deliberately pause the decks when a coach answer is spoken. Android browser / device audio-focus behavior can differ, so coach narration over music still needs a real tablet listening test.
- Device voice choices depend on the voices installed and exposed by the browser. Microphone recording requires HTTPS, browser support and microphone permission.
- Custom sample storage, personal voice recordings and imported music are device-local. They are not synced between phones, tablets or computers.
- The side drawer, theme selector, crate picker and coach voice controls have not yet been physically tested on the target Android tablet.
- Full reverse-audio vinyl scratching and live Deck C / Deck D remain future engine work. The existing Scratch Arm state must not be described as finished vinyl scratching.


## Foundation 09 — Jog-wheel performance and collapsible workspace

- The full dual-deck workspace (Deck A, center waveform monitor and Deck B) is now wrapped in an open-by-default collapsible section. It preserves the existing deck arrangement and can be folded to reclaim phone or tablet space.
- The Music & Sample Crate remains open by default and is independently collapsible.
- The actual platters are enlarged modestly for phone use while retaining the existing TRIM / BASS / LEVEL side controls and transport layout.
- Scratch OFF retains normal jog / seek behavior. Scratch ON applies higher-sensitivity bidirectional playhead movement while a loaded local track is playing, and varies positive playback rate / pitch with finger speed. On release, the deck returns to its selected tempo.
- This is an audible touch-scratch / stutter response, not yet a dedicated reverse-buffer vinyl emulation. Browser HTMLMediaElement playback does not provide portable negative playback-rate support, and live radio cannot be scratched.
- The DJ Coach now reads actual Deck A / Deck B loaded, playing, paused and stream states. It shows the next appropriate control and offers a spoken, highlighted "What should I do next?" action.
- The Master Transport Auto Blend status now updates to show whether tracks need loading, both decks are ready to start, or Auto Blend can be triggered. Auto Blend remains user-started: with two loaded music files and one deck playing, press Auto Blend to start the waiting deck and run the selected transition.
- The coach spotlight automatically opens a collapsed section before highlighting a control.
- Added a Jog Wheel & Scratch guided lesson.
- The phone-friendly mixer knobs, crossfader position and existing Central Mixer are unchanged.

### Foundation 09 testing notes

- Static JS syntax and layout checks run in the GoldenSteal validation workflow.
- The touch-scratch response and tempo restoration still require real audio listening on Android Chrome; the pointer timing and seeking feel can vary by device.
- The expanded platters, collapsible sections, live coach state and hidden-panel spotlight need phone and tablet testing in portrait and landscape.


## Foundation 10 — Top Coach and Quick Mixer repair

- Add an always-visible top studio action strip with the LIVE AUDIO PATH status and a top SHOW ME HOW TO DJ button. The top Coach button opens the same guided panel as the original Central Mixer button.
- Add a top QUICK MIX shortcut as an additional entry point to the same floating on-the-go mixer.
- Rework Quick Mixer open / close handling into one delegated action shared by the top button and floating MIX button. The panel now updates its open state and aria controls together, synchronizes all readouts on opening, and closes from its close button, scrim or Escape.
- Raise the Quick Mixer scrim, panel and floating control above the other floating tools and drawers.
- Keep the original LIVE AUDIO PATH badge and SHOW ME HOW TO DJ button in the Central Mixer header as well.
