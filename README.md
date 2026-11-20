# GOLDENSTEAL DJ STUDIO

**Your Music. Your Mix. Your Moment.**

GoldenSteal DJ Studio is a browser-based two-deck DJ workstation for practicing, mixing local music, working with supported radio streams, and exploring performance controls on desktop, tablet, and phone.

## Open the studio

https://rolrichman.github.io/goldensteal-dj-studio/

The preview opens without an account. Select **Enter Studio** to begin.

## What is included

- Two independent decks with local music loading and playback.
- A local music crate that saves imported audio on the current device and browser.
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

1. Open **Beat Starters** and choose **Load Both Starters**.
2. Press Play on Deck A, then Deck B.
3. Move the crossfader fully to A, through the center, and fully to B.
4. Adjust the channel levels and master level from the quick mixer.
5. Drag a finger across either waveform to scrub within the visible section.
6. Set a cue, try the hot cue pads and beat loops, then test the EQ knobs by dragging up and down.
7. Try the sound-effect pads and record a short mix.

For the first tablet test, use the same steps in landscape and portrait orientation. The quick mixer button remains available on narrower tablet layouts.

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
