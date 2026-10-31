# Nathan Chong — Portfolio

My personal portfolio site: **https://hawaii-nc.github.io/**

Projects in robotics, autonomy, and embedded systems — NASA Armstrong flight software, UNLV NSF REU autonomous racing, satellite ground software, and lunar power systems.

## About This Site

Static site built with HTML / CSS / JavaScript and hosted on GitHub Pages. No build step — the repo root is the deployed site.

### Themes

Three universes. Every new visit lands in one of them at random; the **Universe** button in the header switches:

- **Spider-Verse**: comic-book pages, a swinging spider, web shooting, a painted comic-book city in the hero, narration captions, and a comic back cover in the footer.
- **Night City**: a Cyberpunk: Edgerunners style skin. The hero is a city painted in code (megabuildings, katakana neon, rain, flying cars, an elevated train, a hologram pyramid, a halftone moon) on a 120 BPM pulse. Click the city for an anime impact frame, or hit **Sandevistan** to slow time and smear everything into rainbow afterimages. Tap the NASA photo (or **Poster mode**) and it cracks into 13 wedges and becomes an animated Edgerunners-style poster: cel-shaded figure, flame halo, halftone, sunburst, flying low-poly shapes and tilted title rows, all in WebGL. The expensive image work is pre-baked into `assets/img/nasa-armstrong-er.png` so it runs live in the browser. The sections turn into Gigs, Builds and a Night City trace map, with netrunner extras: hex-code rain, quickhack overlays on Builds, a braindance HUD, a terminal contact box, and a playable Breach Protocol on the encrypted Summer 2027 gig.
- **Hail Mary**: a Project Hail Mary mission-console skin. The hero is the Tau Ceti system drawn in code: Tau Ceti, the Petrova line with Astrophage streaming to the planet Adrian, a Blip-A contact, and the Hail Mary herself. **Spin drive** burns to 1.5 g and the stars stretch past. Sections become the Mission log, Nav and Experiments, with the Hail Mary and Rocky's ship flying from Sol and 40 Eridani to Tau Ceti in the hero; Contact has an Eridian translator that turns your message into chords (with sound), and the footer launches a Beetle (John, Paul, George or Ringo) with the résumé.

The switch plays a "multiverse jump" (a web shot, then a pixel-block screen wipe), and the choice sticks for the rest of the visit. Link straight to one with `?theme=spider`, `?theme=cyber` or `?theme=hail`.

### Pixel worlds

`assets/js/pixel-world.js` closes every section with a living pixel-art strip of the current universe, Terraria style, and perches pixel critters on the section titles:

| Section | Spider-Verse | Night City |
|---|---|---|
| Missions / Gigs | Comic rooftops, cabs, pigeons, and a web-slinger swinging past | Megablocks, flickering neon, flying cars with light trails, rain |
| Tracker / Trace | A suspension bridge, boats, gulls, twinkling stars | The badlands highway, wind turbines, a biker, the city glowing on the horizon |
| Projects / Builds | Storefronts over a subway cross-section with a passing train | Neon street over the undercity: data cables, the metro, a netrunner den |
| Contact | Night rooftops, a blinking antenna, the hero crouched on a ledge | Black rooftops on hazard yellow, an OPEN sign, a cat, a drone |

Only strips on screen animate (about 30 fps, drawn at 1/3 resolution). Lite mode and reduced motion get a single still frame.
Hail Mary has no pixel strips: its sections stay clean mission-console panels.

## Run Locally

Open `index.html` in a browser, or serve the folder with: python3 -m http.server 8000, then visit http://localhost:8000

## Links

- Live site: https://hawaii-nc.github.io/
- GitHub: https://github.com/hawaii-nc
- LinkedIn: https://www.linkedin.com/in/nathan-chong-378248346
