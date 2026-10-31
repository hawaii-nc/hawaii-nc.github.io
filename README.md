# Nathan Chong — Portfolio

My personal portfolio site: **https://hawaii-nc.github.io/**

Projects in robotics, autonomy, and embedded systems — NASA Armstrong flight software, UNLV NSF REU autonomous racing, satellite ground software, and lunar power systems.

## About This Site

Static site built with HTML / CSS / JavaScript and hosted on GitHub Pages. No build step — the repo root is the deployed site.

### Themes

Two universes. Every new visit lands in one of them at random; the button in the header switches:

- **Spider-Verse**: comic-book pages, a swinging spider, web shooting, a Hero File with a Marvel-handbook power grid (edit the `--v` numbers in `index.html`), narration captions, and a comic back cover in the footer.
- **Night City**: a Cyberpunk: Edgerunners style skin. The hero is a city painted in code (megabuildings, katakana neon, rain, flying cars, an elevated train, a hologram pyramid, a halftone moon) on a 120 BPM pulse. Click the city for an anime impact frame, or hit **Sandevistan** to slow time and smear everything into rainbow afterimages. The sections turn into Gigs, Builds and a Night City trace map, with netrunner extras: hex-code rain, quickhack overlays on Builds, a braindance HUD, a terminal contact box, and a playable Breach Protocol on the encrypted Summer 2027 gig.

The switch plays a "multiverse jump" (a web shot, then a pixel-block screen wipe), and the choice sticks for the rest of the visit. Link straight to one with `?theme=cyber` or `?theme=spider`.

### Pixel worlds

`assets/js/pixel-world.js` closes every section with a living pixel-art strip of the current universe, Terraria style, and perches pixel critters on the section titles:

| Section | Spider-Verse | Night City |
|---|---|---|
| Missions / Gigs | Comic rooftops, cabs, pigeons, and a web-slinger swinging past | Megablocks, flickering neon, flying cars with light trails, rain |
| Tracker / Trace | A suspension bridge, boats, gulls, twinkling stars | The badlands highway, wind turbines, a biker, the city glowing on the horizon |
| Projects / Builds | Storefronts over a subway cross-section with a passing train | Neon street over the undercity: data cables, the metro, a netrunner den |
| Contact | Night rooftops, a blinking antenna, the hero crouched on a ledge | Black rooftops on hazard yellow, an OPEN sign, a cat, a drone |

Only strips on screen animate (about 30 fps, drawn at 1/3 resolution). Lite mode and reduced motion get a single still frame.

## Run Locally

Open `index.html` in a browser, or serve the folder with: python3 -m http.server 8000, then visit http://localhost:8000

## Links

- Live site: https://hawaii-nc.github.io/
- GitHub: https://github.com/hawaii-nc
- LinkedIn: https://www.linkedin.com/in/nathan-chong-378248346
