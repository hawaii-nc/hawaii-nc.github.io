"""Web assets for the Overworld universe, built from art.py (the Minecraft-style portfolio's procedural art).

Everything is drawn procedurally by art.py; no game assets. Run from the repo root:
    python3 tools/craft/build_web.py
Writes assets/img/craft/*. Images are shipped at 1 art pixel = 1 image pixel and scaled up in the browser
with image-rendering:pixelated (or imageSmoothingEnabled=false on canvas), which keeps files tiny.
"""
import os, random, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'img', 'craft')
sys.path.insert(0, HERE)
import art  # noqa: E402

os.makedirs(OUT, exist_ok=True)
art.make_textures()
art.sprites()


def save(im, name):
    p = os.path.join(OUT, name)
    if name.endswith('.webp'):
        im.save(p, lossless=True, quality=100, method=6)
    else:
        im.save(p, optimize=True)
    print(f'{name:22s} {im.size[0]}x{im.size[1]}  {os.path.getsize(p) // 1024} KB')


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


def sprite_of(world, size=(200, 160)):
    """Render a small voxel model on transparency and trim it to its pixels."""
    xs, ys, zs = zip(*world)
    cx, cy, cz = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (min(zs) + max(zs)) / 2
    return trim(art.render(world, cx, cy, cz, size[0], size[1], 1))


# ---- hero: the title world as a floating island; the planes are left out so they can fly live
real_plane = art.plane
art.plane = lambda *a, **k: None
world = art.title_scene()
art.plane = real_plane
# a wide window of the island, then 3/4 size with nearest-neighbour, like the PDF's title page: smaller blocks, more world
pano = art.render(world, art.C, art.C, 0, 2400, 1200, 1).resize((1800, 900), Image.NEAREST)
save(pano, 'hero-world.webp')

# ---- sprites the hero animates: the two RAAR aircraft, voxel clouds, Nathan
w = {}; art.plane(w, 0, 0, 0, 'white', 'orange', accent='orange'); save(sprite_of(w), 'plane-mother.png')
w = {}; art.plane(w, 0, 0, 0, 'grey', 'blue', n=4, span=2, accent='magenta'); save(sprite_of(w), 'plane-drone.png')
for k in range(3):
    r, w = random.Random(40 + k), {}
    for x in range(10 + 2 * k):
        for y in range(6 + k):
            if r.random() < .82 and (x - 5 - k) ** 2 / (5 + k) ** 2 + (y - 3 - k / 2) ** 2 / (3 + k / 2) ** 2 < 1.15:
                w[(x, y, 0)] = 'white'
    save(sprite_of(w, (360, 240)), f'cloud{k}.png')

av = art.avatar()
save(av, 'avatar.png')
wave = av.copy()
for y in range(0, 20):                       # right arm up: clear the arm, redraw it raised
    for x in range(12, 16):
        wave.putpixel((x, y), (0, 0, 0, 0))
for y in range(1, 8):
    for x in range(12, 16):
        wave.putpixel((x, y), (0xD9, 0xA8, 0x77, 255))
for y in range(8, 11):
    for x in range(12, 16):
        wave.putpixel((x, y), (0x2B, 0x2D, 0x33, 255))
save(wave, 'avatar-wave.png')

# ---- project scenes (panel art) and world icons (mission cards), as in the PDF
for name, fn in (('raar', art.raar_scene), ('rma', art.rma_scene), ('petal', art.petal_scene), ('urc', art.urc_scene)):
    im = art.render(fn(), art.C, art.C, 0, 1600, 900, 2, bg=(18, 20, 28, 255)).convert('RGB').resize((800, 450), Image.NEAREST)
    save(im, f'scene-{name}.webp')
for b in ('desert', 'vegas', 'ocean', 'shop'):
    save(trim(art.render(art.mini(b), 2, 2, 0, 176, 176, 1)), f'mini-{b}.png')

# ---- textures: 16px tiles for CSS backgrounds, and one atlas strip for pixel-world.js
for n in ('dirt', 'stone', 'planks', 'cobble'):
    save(art.TEX[n], f't-{n}.png')
# page backgrounds: pre-scaled 4x (64px) and darkened like a menu backdrop, so CSS needs no
# image-rendering on whole sections (that would pixelate the photos too)
for n, k in (('dirt', .34), ('stone', .38), ('planks', 1.0), ('cobble', .42)):
    im = art.TEX[n].convert('RGB').point(lambda v, k=k: int(v * k)).resize((64, 64), Image.NEAREST)
    save(im, f'bg-{n}.png')
btn = art.TEX['stone'].convert('RGB').resize((64, 64), Image.NEAREST)
save(btn, 'bg-button.png')
ATLAS = ['grass_side', 'grass_top', 'dirt', 'stone', 'sand', 'water', 'planks', 'log', 'leaves', 'leaves_dark', 'cobble',
         'snow', 'cactus', 'redsand', 'terra_a', 'terra_b', 'terra_c', 'terra_d', 'asphalt', 'amber_glow', 'copper', 'black']
atlas = Image.new('RGB', (16 * len(ATLAS), 16))
for i, n in enumerate(ATLAS):
    atlas.paste(art.TEX[n].convert('RGB'), (16 * i, 0))
save(atlas, 'atlas.png')
print('atlas order:', ','.join(ATLAS))

# ---- item icons (16px) in one sheet, row-major, 8 per row
names = list(art.ICONS)
sheet = Image.new('RGBA', (16 * 8, 16 * ((len(names) + 7) // 8)))
for i, n in enumerate(names):
    sheet.alpha_composite(art.icon(art.ICONS[n]) if callable(art.ICONS[n]) else art.ICONS[n], (16 * (i % 8), 16 * (i // 8)))
save(sheet, 'icons.png')
print('icon order:', ','.join(names))
