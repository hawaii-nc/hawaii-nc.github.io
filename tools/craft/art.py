"""Original pixel art for the portfolio: block textures, isometric voxel scenes, item icons, avatar.
Everything here is drawn procedurally. No game assets are used."""
import math, random
from PIL import Image, ImageDraw

OUT = '/home/claude/mc/img/'
T = 16


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c[:3])


def noise_tex(pal, seed, weights=None):
    r = random.Random(seed)
    im = Image.new('RGB', (T, T))
    px = im.load()
    cols = [hexc(p) for p in pal]
    for y in range(T):
        for x in range(T):
            px[x, y] = r.choices(cols, weights)[0]
    return im


def blotch(im, col, seed, n=5, size=(2, 4)):
    r = random.Random(seed)
    px = im.load()
    for _ in range(n):
        cx, cy = r.randrange(T), r.randrange(T)
        for _ in range(r.randint(*size) * 2):
            px[(cx + r.randint(-1, 1)) % T, (cy + r.randint(-1, 1)) % T] = hexc(col)
    return im


TEX = {}


def make_textures():
    g = noise_tex(['#5E9C3A', '#69A843', '#55913A', '#74B34C', '#4E8733'], 1, [4, 4, 3, 2, 2])
    TEX['grass_top'] = g
    d = noise_tex(['#8A5F3C', '#7A5233', '#96694A', '#6B4729', '#8A5F3C'], 2, [4, 3, 2, 2, 2])
    TEX['dirt'] = d
    gs = d.copy()
    r = random.Random(3)
    for x in range(T):
        depth = r.choice([3, 3, 4, 4, 5, 2])
        for y in range(depth):
            gs.putpixel((x, y), g.getpixel((x, y)))
    TEX['grass_side'] = gs
    TEX['stone'] = blotch(noise_tex(['#7F7F7F', '#757575', '#8A8A8A', '#6C6C6C'], 4, [4, 3, 3, 1]), '#5E5E5E', 5, 4)
    TEX['sand'] = noise_tex(['#DCCB95', '#E4D5A3', '#D2BF86', '#EADDAE'], 6, [4, 4, 2, 2])
    TEX['redsand'] = noise_tex(['#B8622B', '#C26D33', '#A95724', '#CB7A3E'], 7, [4, 4, 2, 2])
    for name, pal in {
        'terra_a': ['#9A4E2E', '#A2573A', '#8F4526'],
        'terra_b': ['#C78A5B', '#D0946A', '#BC7F50'],
        'terra_c': ['#E3D2C0', '#D8C6B3', '#EADBCB'],
        'terra_d': ['#7B3B32', '#84433A', '#70332B'],
        'terra_e': ['#B8733A', '#C17D45', '#AD6A31'],
        'moon': ['#B9BBC0', '#AEB0B6', '#C4C6CB', '#A3A5AB'],
        'moon_dark': ['#8D9097', '#84878E', '#979AA1', '#7B7E85'],
        'asphalt': ['#3B3D42', '#35373B', '#424449', '#2F3134'],
        'white': ['#EDEFF2', '#E4E6EA', '#F5F6F8'],
        'orange': ['#E8742A', '#DD6B22', '#F07E36'],
        'red': ['#C8372D', '#BD2F26', '#D24137'],
        'blue': ['#2F6FD0', '#2965C2', '#397ADB'],
        'black': ['#1F2125', '#1A1C1F', '#26282C'],
        'grey': ['#8E9299', '#868A91', '#989CA3'],
        'yellow': ['#F2C230', '#E8B826', '#F9CC42'],
        'leaves': ['#3F7A2A', '#356B23', '#4A8A33', '#2C5C1D'],
        'leaves_dark': ['#2F6A3E', '#285E36', '#387548'],
        'snow': ['#F4F8FA', '#E9F0F4', '#FFFFFF'],
        'water': ['#3B76D6', '#356DCB', '#4480DF', '#3B76D6'],
        'cactus': ['#4F8F3A', '#478433', '#5A9B44'],
        'copper': ['#D0764A', '#C46B40', '#DB8257'],
        'cyan_glow': ['#7DF3F0', '#A6FBF8', '#5DE6E2'],
        'amber_glow': ['#FFC75A', '#FFD67E', '#FFB53A'],
        'lime': ['#7CD63C', '#70C932', '#88E048'],
        'magenta': ['#D94FC2', '#CC44B5', '#E35DCD'],
        'tan': ['#C9A66B', '#BF9C61', '#D2B077'],
    }.items():
        TEX[name] = noise_tex(pal, hash(name) % 9999)
    # planks
    pl = Image.new('RGB', (T, T))
    r = random.Random(11)
    for y in range(T):
        for x in range(T):
            base = hexc(r.choice(['#B58B4F', '#A97F45', '#BE955A']))
            if y % 4 == 3:
                base = hexc('#7E5C2E')
            pl.putpixel((x, y), base)
    TEX['planks'] = pl
    lg = Image.new('RGB', (T, T))
    for y in range(T):
        for x in range(T):
            lg.putpixel((x, y), hexc(['#5E4526', '#6B4F2C', '#523B1F', '#6B4F2C'][(x + r.randint(0, 1)) % 4]))
    TEX['log'] = lg
    cb = noise_tex(['#7C7C7C', '#8B8B8B', '#6A6A6A'], 12)
    dr = ImageDraw.Draw(cb)
    for (x0, y0, x1, y1) in [(0, 0, 6, 4), (7, 0, 15, 5), (0, 5, 4, 10), (5, 6, 11, 10), (12, 6, 15, 11), (0, 11, 7, 15), (8, 11, 15, 15)]:
        dr.rectangle((x0, y0, x1, y1), outline=hexc('#555555'))
    TEX['cobble'] = cb
    # runway centreline, glass window, panel
    rw = TEX['asphalt'].copy()
    ImageDraw.Draw(rw).rectangle((6, 2, 9, 13), fill=hexc('#E9E9E2'))
    TEX['runway_line'] = rw
    ws = TEX['white'].copy()
    ImageDraw.Draw(ws).rectangle((3, 3, 12, 12), fill=hexc('#6EC3E8'), outline=hexc('#3C5B73'))
    TEX['window'] = ws
    ip = TEX['grey'].copy()
    ImageDraw.Draw(ip).rectangle((0, 0, 15, 15), outline=hexc('#6B6F76'))
    TEX['panel'] = ip
    sp = TEX['black'].copy()
    d2 = ImageDraw.Draw(sp)
    for i in range(0, 16, 4):
        d2.line((i, 0, i, 15), fill=hexc('#3A6BC4'))
        d2.line((0, i, 15, i), fill=hexc('#3A6BC4'))
    TEX['solar'] = sp
    tr = TEX['asphalt'].copy()
    ImageDraw.Draw(tr).rectangle((0, 0, 15, 2), fill=hexc('#D9382E'))
    ImageDraw.Draw(tr).rectangle((4, 0, 7, 2), fill=hexc('#F2F2F2'))
    ImageDraw.Draw(tr).rectangle((12, 0, 15, 2), fill=hexc('#F2F2F2'))
    TEX['kerb'] = tr


# block name -> (top texture, side texture)
BLOCKS = {
    'grass': ('grass_top', 'grass_side'), 'dirt': ('dirt', 'dirt'), 'stone': ('stone', 'stone'),
    'sand': ('sand', 'sand'), 'redsand': ('redsand', 'redsand'), 'water': ('water', 'water'),
    'planks': ('planks', 'planks'), 'log': ('planks', 'log'), 'cobble': ('cobble', 'cobble'),
    'runway_line': ('runway_line', 'asphalt'), 'window': ('white', 'window'), 'kerb': ('kerb', 'asphalt'),
    'solar': ('solar', 'grey'),
}
for n in ['terra_a', 'terra_b', 'terra_c', 'terra_d', 'terra_e', 'moon', 'moon_dark', 'asphalt', 'white', 'orange', 'red',
          'blue', 'black', 'grey', 'yellow', 'leaves', 'leaves_dark', 'snow', 'cactus', 'copper', 'cyan_glow',
          'amber_glow', 'lime', 'magenta', 'tan', 'panel']:
    BLOCKS[n] = (n, n)
GLOW = {'cyan_glow', 'amber_glow'}
SPR = {}


def make_sprite(name):
    top, side = (TEX[t].load() for t in BLOCKS[name])
    im = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    px = im.load()
    lf, rf = (1.0, 1.0) if name in GLOW else (0.80, 0.60)
    for y in range(32):
        for x in range(32):
            sx, sy = x + 0.5 - 16, y + 0.5
            u, v = sy + sx / 2, sy - sx / 2
            if 0 <= u < 16 and 0 <= v < 16:
                px[x, y] = top[int(u), int(v)] + (255,)
                continue
            if x < 16:
                tv = y + 0.5 - (8 + (x + 0.5) / 2)
                if 0 <= tv < 16:
                    px[x, y] = shade(side[x, int(tv)], lf) + (255,)
            else:
                tv = y + 0.5 - (16 - (x - 16 + 0.5) / 2)
                if 0 <= tv < 16:
                    px[x, y] = shade(side[x - 16, int(tv)], rf) + (255,)
    return im


def sprites():
    for n in BLOCKS:
        SPR[n] = make_sprite(n)


def render(world, cx, cy, cz, w, h, scale, bg=(0, 0, 0, 0)):
    """Render a voxel dict {(x,y,z): block} so that world point (cx,cy,cz) lands in the image centre."""
    bw, bh = w // scale + 2, h // scale + 2
    im = Image.new('RGBA', (bw, bh), bg)
    ox = bw // 2 - (cx - cy) * 16 - 16
    oy = bh // 2 - (cx + cy) * 8 + cz * 16 - 8
    for (x, y, z) in sorted(world, key=lambda p: (p[0] + p[1], p[2], p[0])):
        sx = int((x - y) * 16 + ox)
        sy = int((x + y) * 8 - z * 16 + oy)
        if sx < -32 or sy < -32 or sx > bw or sy > bh:
            continue
        if (x + 1, y, z) in world and (x, y + 1, z) in world and (x, y, z + 1) in world:
            continue
        s = SPR[world[(x, y, z)]]
        im.alpha_composite(s, (sx, sy)) if 0 <= sx <= bw - 32 and 0 <= sy <= bh - 32 else im.paste(s, (sx, sy), s)
    return im.resize((bw * scale, bh * scale), Image.NEAREST).crop((scale, scale, scale + w, scale + h))


def smooth_noise(n, seed, octaves=((14, 1.0), (7, 0.5), (3.5, 0.2))):
    r = random.Random(seed)
    out = [[0.0] * n for _ in range(n)]
    for period, amp in octaves:
        gsz = int(n / period) + 3
        grid = [[r.random() for _ in range(gsz)] for _ in range(gsz)]
        for y in range(n):
            for x in range(n):
                fx, fy = x / period, y / period
                x0, y0 = int(fx), int(fy)
                tx, ty = fx - x0, fy - y0
                tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
                a = grid[y0][x0] * (1 - tx) + grid[y0][x0 + 1] * tx
                b = grid[y0 + 1][x0] * (1 - tx) + grid[y0 + 1][x0 + 1] * tx
                out[y][x] += (a * (1 - ty) + b * ty) * amp
    return out


def column(world, x, y, h, top, under, base='stone', floor=-3):
    for z in range(max(floor, h - 3), h + 1):
        world[(x, y, z)] = top if z == h else (under if z >= h - 2 else base)


def box(world, x0, y0, z0, x1, y1, z1, b):
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            for z in range(z0, z1 + 1):
                world[(x, y, z)] = b


def tree(world, x, y, z, h=4, leaf='leaves'):
    for i in range(h):
        world[(x, y, z + i)] = 'log'
    for dz, rad in ((h - 2, 2), (h - 1, 2), (h, 1), (h + 1, 1)):
        for dx in range(-rad, rad + 1):
            for dy in range(-rad, rad + 1):
                if abs(dx) == rad and abs(dy) == rad and rad == 2 and (dx * 7 + dy * 3 + dz) % 2:
                    continue
                if (dx, dy) != (0, 0) or dz >= h:
                    world[(x + dx, y + dy, z + dz)] = leaf


def plane(world, x, y, z, body, wing, n=6, span=4, accent=None):
    """Tiny voxel aircraft pointing toward -x (up-left on screen)."""
    for i in range(n):
        world[(x + i, y, z)] = body
    world[(x, y, z)] = accent or body
    for d in range(-span, span + 1):
        world[(x + 2, y + d, z + 1)] = wing
    for d in (-1, 0, 1):
        world[(x + n - 1, y + d, z)] = wing
    world[(x + n - 1, y, z + 1)] = accent or wing


N = 76
C = N // 2
SCALE = 1.5


def at(dx, dy, scale=SCALE):
    """World x,y that lands dx,dy screen pixels from the image centre (at z=0)."""
    a, b = dx / (16 * scale), dy / (8 * scale)
    return round(C + (a + b) / 2), round(C + (b - a) / 2)


def scene_overworld():
    w = {}
    hm = smooth_noise(N, 21)
    H = {}
    for y in range(N):
        for x in range(N):
            v = hm[y][x] / 1.7
            h = int(v * 11) - 3
            H[(x, y)] = h
            if h <= 0:
                column(w, x, y, 0, 'sand' if h == 0 else 'water', 'sand' if h == 0 else 'dirt')
            elif h >= 6:
                column(w, x, y, h, 'snow' if h >= 7 else 'stone', 'stone')
            else:
                column(w, x, y, h, 'grass', 'dirt')
    r = random.Random(5)
    for _ in range(210):
        x, y = r.randrange(2, N - 2), r.randrange(2, N - 2)
        if 1 <= H[(x, y)] <= 4 and all(abs(H[(x + a, y + b)] - H[(x, y)]) <= 1 for a in (-1, 1) for b in (-1, 1)):
            tree(w, x, y, H[(x, y)] + 1, r.choice([3, 4, 4, 5]), r.choice(['leaves', 'leaves', 'leaves_dark']))
    return w, H


def flatten(w, H, x0, y0, x1, y1, h, top, under='dirt'):
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            for z in range(-3, 14):
                w.pop((x, y, z), None)
            column(w, x, y, h, top, under)
            H[(x, y)] = h


def title_scene():
    w, H = scene_overworld()
    # a little workshop with a rover parked outside, bottom-right of the page
    bx, by = at(520, 190)
    flatten(w, H, bx - 4, by - 4, bx + 6, by + 5, 2, 'grass')
    for k in list(w):
        if bx - 6 <= k[0] <= bx + 8 and by - 6 <= k[1] <= by + 7 and k[2] > 2 and w[k] in ('log', 'leaves', 'leaves_dark'):
            del w[k]
    box(w, bx - 2, by - 2, 3, bx + 2, by + 2, 5, 'planks')
    box(w, bx - 1, by - 1, 3, bx + 1, by + 1, 5, 'planks')
    for c in ((bx - 2, by - 2), (bx + 2, by - 2), (bx - 2, by + 2), (bx + 2, by + 2)):
        for z in (3, 4, 5):
            w[c + (z,)] = 'log'
    box(w, bx - 3, by - 3, 6, bx + 3, by + 3, 6, 'cobble')
    box(w, bx - 2, by - 2, 7, bx + 2, by + 2, 7, 'cobble')
    w[(bx, by + 2, 4)] = 'window'
    w[(bx + 2, by, 4)] = 'window'
    w[(bx + 2, by + 3, 3)] = 'amber_glow'
    # path
    for i in range(0, 9):
        column(w, bx + 3 + i // 2, by + 3 + i, H.get((bx + 3 + i // 2, by + 3 + i), 2), 'tan', 'dirt')
    rover(w, bx + 5, by - 1, 3)
    # two planes flying over the top-left
    px_, py_ = at(-610, 470)
    plane(w, px_, py_, 13, 'white', 'orange', accent='orange')
    plane(w, px_ + 5, py_ + 5, 11, 'grey', 'blue', n=4, span=2, accent='magenta')
    return w


def rover(w, x, y, z):
    for a in (0, 2, 4):
        w[(x + a, y, z)] = 'black'
        w[(x + a, y + 2, z)] = 'black'
    box(w, x, y, z + 1, x + 4, y + 2, z + 1, 'grey')
    w[(x + 1, y + 1, z + 2)] = 'yellow'
    w[(x + 4, y + 1, z + 2)] = 'panel'
    w[(x + 4, y + 1, z + 3)] = 'panel'
    w[(x + 4, y + 1, z + 4)] = 'white'
    w[(x, y + 1, z + 2)] = 'solar'
    w[(x + 2, y + 1, z + 2)] = 'solar'


def desert_base(seed, top='sand', under='sand', amp=3):
    w, H = {}, {}
    hm = smooth_noise(N, seed, ((16, 1.0), (6, 0.35)))
    for y in range(N):
        for x in range(N):
            h = int(hm[y][x] / 1.35 * amp)
            H[(x, y)] = h
            column(w, x, y, h, top, under, base='stone')
    return w, H


def raar_scene():
    w, H = desert_base(31)
    r = random.Random(8)
    # runway running along x through the lower middle of the page
    rx, ry = at(0, 330)
    for x in range(0, N):
        for y in range(ry - 2, ry + 3):
            for z in range(-3, 12):
                w.pop((x, y, z), None)
            column(w, x, y, 1, 'runway_line' if (y == ry and x % 4 < 2) else 'asphalt', 'sand')
            H[(x, y)] = 1
    # hangar, right side
    hx, hy = at(420, 60)
    flatten(w, H, hx - 4, hy - 4, hx + 5, hy + 4, 1, 'sand', 'sand')
    box(w, hx - 3, hy - 3, 2, hx + 3, hy + 3, 5, 'tan')
    box(w, hx - 3, hy - 3, 6, hx + 3, hy + 3, 6, 'white')
    box(w, hx - 2, hy + 3, 2, hx + 2, hy + 3, 4, 'grey')
    w[(hx, hy + 3, 5)] = 'blue'
    for _ in range(70):
        x, y = r.randrange(1, N - 1), r.randrange(1, N - 1)
        if abs(y - ry) > 4 and not (hx - 6 < x < hx + 7 and hy - 6 < y < hy + 6):
            hh = H[(x, y)]
            for i in range(r.choice([1, 2, 2, 3])):
                w[(x, y, hh + 1 + i)] = 'cactus'
    # mothership (Cub, orange and white) with the docker (Albatross) closing in underneath
    ax, ay = at(170, 300)
    plane(w, ax, ay, 9, 'white', 'orange', n=7, span=4, accent='orange')
    w[(ax + 3, ay, 8)] = 'red'            # the magnetic latch
    plane(w, ax + 4, ay + 1, 5, 'grey', 'blue', n=5, span=3, accent='magenta')
    w[(ax + 5, ay + 1, 6)] = 'red'
    return w


def rma_scene():
    w, H = desert_base(44, amp=1)
    for k in list(w):
        if k[2] > 0:
            del w[k]
    for x in range(N):
        for y in range(N):
            column(w, x, y, 0, 'sand', 'sand')
    cx_, cy_ = at(215, 150)
    # rounded-rectangle track
    def on_track(x, y, inner):
        dx, dy = abs(x - cx_), abs(y - cy_)
        a, b = (8, 5) if not inner else (4, 1)
        qx, qy = max(dx - (a - 3 if not inner else a - 1), 0), max(dy - (b - 3 if not inner else b - 1), 0)
        return math.hypot(qx, qy) <= (3 if not inner else 1)
    for x in range(cx_ - 12, cx_ + 13):
        for y in range(cy_ - 9, cy_ + 10):
            o, i = on_track(x, y, False), on_track(x, y, True)
            if o and not i:
                w[(x, y, 0)] = 'asphalt'
            elif i:
                w[(x, y, 0)] = 'grass'
    for x in range(cx_ - 12, cx_ + 13):
        for y in range(cy_ - 9, cy_ + 10):
            if w.get((x, y, 0)) == 'asphalt':
                nb = [w.get((x + a, y + b, 0)) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))]
                if any(n in ('sand', 'grass') for n in nb) and (x + y) % 2 == 0:
                    w[(x, y, 0)] = 'kerb'
    # start line, car, cones
    for y in range(cy_ + 2, cy_ + 6):
        if w.get((cx_, y, 0)) in ('asphalt', 'kerb'):
            w[(cx_, y, 0)] = 'white' if y % 2 else 'black'
    car_x, car_y = cx_ - 4, cy_ + 3
    box(w, car_x, car_y, 1, car_x + 2, car_y + 1, 1, 'black')
    w[(car_x, car_y, 2)] = 'blue'
    w[(car_x + 1, car_y, 2)] = 'cyan_glow'   # lidar
    for (a, b) in ((cx_ + 5, cy_ - 7), (cx_ - 10, cy_ - 2), (cx_ + 10, cy_ + 2), (cx_ - 6, cy_ + 7), (cx_ + 3, cy_ + 7)):
        w[(a, b, 1)] = 'orange'
    r = random.Random(3)
    for _ in range(60):
        x, y = r.randrange(1, N - 1), r.randrange(1, N - 1)
        if abs(x - cx_) > 12 or abs(y - cy_) > 9:
            for i in range(r.choice([1, 2, 3])):
                w[(x, y, 1 + i)] = 'cactus'
    return w


def petal_scene():
    w, H = {}, {}
    hm = smooth_noise(N, 61, ((18, 1.0), (5, 0.3)))
    r = random.Random(9)
    craters = [(r.randrange(N), r.randrange(N), r.choice([2, 3, 3, 4])) for _ in range(34)]
    for y in range(N):
        for x in range(N):
            h = int(hm[y][x] / 1.3 * 3)
            for (cx_, cy_, rad) in craters:
                d = math.hypot(x - cx_, y - cy_)
                if d < rad - 0.5:
                    h -= 1
                elif d < rad + 0.6:
                    h += 1
            H[(x, y)] = h
            column(w, x, y, h, 'moon' if r.random() > 0.12 else 'moon_dark', 'moon_dark', base='moon_dark')
    bx, by = at(250, 190)
    flatten(w, H, bx - 9, by - 7, bx + 9, by + 8, 1, 'moon', 'moon_dark')
    # 8 reactors in a 2x4 grid
    for i in range(4):
        for j in range(2):
            x, y = bx - 7 + i * 3, by - 5 + j * 3
            w[(x, y, 2)] = 'grey'
            w[(x, y, 3)] = 'panel'
            w[(x, y, 4)] = 'cyan_glow'
            w[(x, y + (1 if j == 0 else -1), 2)] = 'copper'
    for x in range(bx - 7, bx + 6):
        w[(x, by - 3, 2)] = 'copper'
    # thermal vault mound
    vx, vy = bx + 5, by + 3
    box(w, vx - 2, vy - 2, 2, vx + 2, vy + 2, 3, 'moon_dark')
    box(w, vx - 1, vy - 1, 4, vx + 1, vy + 1, 4, 'moon_dark')
    w[(vx, vy, 5)] = 'amber_glow'
    w[(vx, vy + 2, 3)] = 'amber_glow'
    w[(vx + 2, vy, 3)] = 'amber_glow'
    for y in range(by - 3, vy - 2):
        w[(bx + 5, y, 2)] = 'copper'
    # habitat
    hx, hy = bx - 5, by + 4
    box(w, hx - 1, hy - 1, 2, hx + 2, hy + 2, 3, 'white')
    box(w, hx, hy, 4, hx + 1, hy + 1, 4, 'white')
    w[(hx, hy + 2, 3)] = 'window'
    w[(hx + 2, hy, 3)] = 'window'
    for x in range(hx + 3, bx + 3):
        w[(x, hy, 2)] = 'copper'
    box(w, hx - 3, hy + 4, 2, hx - 1, hy + 4, 2, 'solar')
    rover(w, bx + 1, by + 6, 2)
    return w


def urc_scene():
    w, H = {}, {}
    hm = smooth_noise(N, 77, ((11, 1.0), (5, 0.45)))
    bands = ['terra_d', 'terra_a', 'terra_b', 'terra_c', 'terra_e', 'terra_a', 'terra_c', 'terra_b', 'terra_d']
    rx, ry = at(230, 150)
    for y in range(N):
        for x in range(N):
            v = hm[y][x] / 1.45
            h = int(max(0, v - 0.42) * 16)
            if math.hypot(x - rx, y - ry) < 7:
                h = 0
            H[(x, y)] = h
            for z in range(max(-3, h - 4), h + 1):
                w[(x, y, z)] = 'redsand' if h == 0 else bands[z % len(bands)]
    rover(w, rx - 2, ry - 1, 1)
    w[(rx + 2, ry, 5)] = 'white'
    w[(rx + 2, ry, 6)] = 'red'
    w[(rx + 4, ry + 4, 1)] = 'orange'       # the bucket from the photo
    # base station mast
    mx, my = rx - 5, ry + 5
    box(w, mx, my, 1, mx + 1, my + 1, 1, 'grey')
    for z in range(2, 7):
        w[(mx, my, z)] = 'panel'
    w[(mx, my, 7)] = 'red'
    w[(mx + 1, my, 5)] = 'white'
    return w


def mini(biome):
    """5x5 floating chunk used as a world icon."""
    w = {}
    tops = {'desert': ('sand', 'sand'), 'vegas': ('asphalt', 'sand'), 'ocean': ('grass', 'dirt'), 'shop': ('planks', 'cobble')}
    top, under = tops[biome]
    for x in range(5):
        for y in range(5):
            w[(x, y, 0)] = top
            w[(x, y, -1)] = under
            if (x + y) % 3 == 0 or 1 <= x <= 3 and 1 <= y <= 3:
                w[(x, y, -2)] = 'stone'
            if x == y == 2:
                w[(x, y, -3)] = 'stone'
    if biome == 'desert':
        plane(w, 0, 2, 2, 'white', 'orange', n=4, span=2, accent='orange')
        w[(4, 0, 1)] = 'cactus'; w[(4, 0, 2)] = 'cactus'
    if biome == 'vegas':
        box(w, 1, 2, 1, 3, 3, 1, 'black'); w[(1, 2, 2)] = 'blue'; w[(2, 2, 2)] = 'cyan_glow'
        w[(4, 0, 1)] = 'orange'; w[(0, 4, 1)] = 'orange'
        for i in range(5):
            w[(i, 0, 0)] = 'kerb' if i % 2 else 'asphalt'
    if biome == 'ocean':
        for x in range(5):
            for y in range(5):
                if x + y >= 6:
                    w[(x, y, 0)] = 'water'
        w[(1, 1, 1)] = 'panel'; w[(1, 1, 2)] = 'panel'; w[(1, 1, 3)] = 'white'
        box(w, 0, 3, 3, 1, 4, 3, 'solar'); w[(1, 3, 3)] = 'yellow'      # a little cubesat overhead
    if biome == 'shop':
        box(w, 1, 1, 1, 3, 2, 1, 'grey'); w[(2, 1, 2)] = 'panel'; w[(2, 1, 3)] = 'panel'
        w[(2, 2, 3)] = 'red'; w[(0, 4, 1)] = 'yellow'
    return w


# ---------------------------------------------------------------- icons
def icon(fn):
    im = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    fn(ImageDraw.Draw(im), im)
    return im


def P(d, pts, c):
    for p in pts:
        d.point(p, fill=hexc(c) + (255,))


def R(d, box_, c, o=None):
    d.rectangle(box_, fill=hexc(c) + (255,), outline=(hexc(o) + (255,)) if o else None)


def i_book(cover, band='#F2D36B'):
    def f(d, im):
        R(d, (3, 2, 12, 13), cover, '#2A1B12')
        R(d, (4, 12, 12, 13), '#EDE6D2'); d.line((3, 2, 3, 13), fill=hexc('#2A1B12') + (255,))
        R(d, (5, 5, 10, 6), band); R(d, (5, 8, 10, 8), band)
        d.line((12, 3, 12, 11), fill=shade(hexc(cover), 0.7) + (255,))
    return f


def i_chip(body='#2E3238', core='#5CE0A0'):
    def f(d, im):
        for i in (3, 6, 9, 12):
            R(d, (i, 1, i, 14), '#C9A227'); R(d, (1, i, 14, i), '#C9A227')
        R(d, (3, 3, 12, 12), body, '#15171A'); R(d, (6, 6, 9, 9), core)
    return f


def i_compass(d, im):
    d.ellipse((1, 1, 14, 14), fill=hexc('#C8CCD2') + (255,), outline=hexc('#4A4E55') + (255,))
    d.ellipse((3, 3, 12, 12), fill=hexc('#22262B') + (255,))
    d.line((7, 8, 11, 4), fill=hexc('#F0453A') + (255,)); d.line((7, 8, 4, 11), fill=hexc('#E8E8E8') + (255,))


def i_antenna(d, im):
    R(d, (7, 5, 8, 14), '#9AA0A8'); R(d, (5, 14, 10, 15), '#5B6068'); R(d, (7, 3, 8, 4), '#F0453A')
    P(d, [(4, 3), (3, 4), (3, 5), (4, 6), (11, 3), (12, 4), (12, 5), (11, 6)], '#55FFFF')
    P(d, [(2, 1), (1, 2), (1, 3), (1, 6), (2, 8), (13, 1), (14, 2), (14, 3), (14, 6), (13, 8)], '#3BB8E8')


def i_magnet(d, im):
    R(d, (2, 2, 5, 11), '#D8362C'); R(d, (10, 2, 13, 11), '#D8362C'); R(d, (2, 10, 13, 13), '#D8362C')
    R(d, (6, 10, 9, 10), '#000000'); im.putpixel((6, 10), (0, 0, 0, 0)); im.putpixel((7, 10), (0, 0, 0, 0)); im.putpixel((8, 10), (0, 0, 0, 0)); im.putpixel((9, 10), (0, 0, 0, 0))
    R(d, (2, 2, 5, 4), '#E6E8EC'); R(d, (10, 2, 13, 4), '#E6E8EC')
    P(d, [(2, 13), (13, 13)], '#8E1F18'); d.line((3, 13, 12, 13), fill=hexc('#A8281F') + (255,))


def i_camera(d, im):
    R(d, (1, 4, 14, 12), '#3A3F47', '#16181B'); R(d, (4, 2, 8, 4), '#3A3F47', '#16181B')
    d.ellipse((5, 5, 11, 11), fill=hexc('#7FD3F5') + (255,), outline=hexc('#16181B') + (255,)); P(d, [(7, 7)], '#FFFFFF'); P(d, [(12, 6)], '#F0453A')


def i_lidar(d, im):
    R(d, (4, 9, 11, 14), '#2E3238', '#15171A'); R(d, (5, 6, 10, 9), '#4A4F57', '#15171A'); R(d, (6, 7, 9, 8), '#55FFFF')
    P(d, [(2, 3), (1, 1), (13, 3), (14, 1), (7, 2), (8, 0), (4, 4), (11, 4)], '#FF5555')


def i_gear(d, im):
    for (x, y) in ((7, 0), (7, 13), (0, 7), (13, 7)):
        R(d, (x, y, x + 1, y + 1) if x in (0, 13) else (x, y, x + 1, y + 2), '#8E9299')
    R(d, (0, 7, 2, 8), '#8E9299'); R(d, (13, 7, 15, 8), '#8E9299'); R(d, (7, 0, 8, 2), '#8E9299'); R(d, (7, 13, 8, 15), '#8E9299')
    P(d, [(2, 2), (3, 3), (12, 2), (11, 3), (2, 12), (3, 11), (12, 12), (11, 11), (3, 2), (2, 3), (12, 3), (11, 2), (3, 12), (2, 11), (11, 12), (12, 11)], '#8E9299')
    d.ellipse((3, 3, 12, 12), fill=hexc('#A9ADB4') + (255,), outline=hexc('#5B6068') + (255,)); d.ellipse((6, 6, 9, 9), fill=(0, 0, 0, 0), outline=hexc('#5B6068') + (255,))


def i_bolt(d, im):
    d.polygon([(9, 0), (3, 8), (7, 8), (5, 15), (12, 6), (8, 6), (10, 0)], fill=hexc('#FFD83A') + (255,), outline=hexc('#B8860B') + (255,))


def i_flask(col):
    def f(d, im):
        R(d, (6, 1, 9, 2), '#B9C2CC'); R(d, (7, 2, 8, 6), '#DDE6EE')
        d.polygon([(7, 6), (8, 6), (13, 13), (12, 14), (3, 14), (2, 13)], fill=hexc(col) + (255,), outline=hexc('#5B6770') + (255,))
        P(d, [(6, 10), (9, 12), (5, 12)], '#FFFFFF')
    return f


def i_wrench(d, im):
    for i in range(4, 12):
        R(d, (i, 15 - i, i + 1, 16 - i), '#A9ADB4')
    R(d, (10, 1, 14, 5), '#C8CCD2', '#5B6068'); R(d, (12, 1, 14, 2), '#000000')
    for p in ((12, 1), (13, 1), (14, 1), (12, 2), (13, 2), (14, 2)):
        im.putpixel(p, (0, 0, 0, 0))
    R(d, (1, 11, 4, 14), '#C8CCD2', '#5B6068')


def i_trophy(d, im):
    R(d, (4, 1, 11, 7), '#FFD83A', '#B8860B'); R(d, (5, 8, 10, 9), '#FFD83A', '#B8860B'); R(d, (7, 10, 8, 12), '#E0B020'); R(d, (4, 13, 11, 14), '#8A5F3C', '#523B1F')
    P(d, [(2, 2), (2, 3), (2, 4), (3, 5), (13, 2), (13, 3), (13, 4), (12, 5), (3, 2), (12, 2)], '#B8860B'); P(d, [(6, 3), (6, 4)], '#FFF6C2')


def i_gem(col='#4FE3DA', dark='#1E8F8A'):
    def f(d, im):
        d.polygon([(7, 1), (8, 1), (14, 6), (8, 14), (7, 14), (1, 6)], fill=hexc(col) + (255,), outline=hexc(dark) + (255,))
        d.line((1, 6, 14, 6), fill=hexc(dark) + (255,)); P(d, [(5, 4), (6, 3), (6, 4)], '#FFFFFF')
    return f


def i_ingot(col='#E6E8EC', dark='#8E9299'):
    def f(d, im):
        d.polygon([(4, 5), (13, 5), (11, 10), (2, 10)], fill=hexc(col) + (255,), outline=hexc(dark) + (255,))
        d.line((2, 11, 11, 11), fill=hexc(dark) + (255,)); d.line((5, 6, 10, 6), fill=(255, 255, 255, 255))
    return f


def i_disc(d, im):
    d.ellipse((1, 1, 14, 14), fill=hexc('#26282C') + (255,), outline=hexc('#000000') + (255,))
    d.ellipse((5, 5, 10, 10), fill=hexc('#55FF55') + (255,)); d.ellipse((7, 7, 8, 8), fill=(0, 0, 0, 0))
    P(d, [(3, 5), (4, 4), (5, 3)], '#6C7078')


def i_map(d, im):
    R(d, (1, 2, 14, 13), '#E6D7A8', '#8A7443'); P(d, [(4, 5), (5, 6), (6, 6), (7, 7), (8, 8), (9, 8)], '#5E9C3A'); R(d, (10, 4, 11, 5), '#3B76D6')
    P(d, [(10, 10), (11, 11), (12, 10), (11, 9)], '#F0453A'); d.line((3, 10, 6, 10), fill=hexc('#8A7443') + (255,))


def i_pick(d, im):
    for i in range(2, 12):
        R(d, (i, 15 - i, i, 15 - i), '#8A5F3C'); R(d, (i + 1, 15 - i, i + 1, 15 - i), '#6B4729')
    P(d, [(5, 1), (6, 1), (7, 1), (8, 2), (9, 2), (10, 3), (11, 3), (12, 4), (13, 5), (13, 6), (14, 7), (14, 8), (14, 9), (14, 10)], '#4FE3DA')
    P(d, [(6, 2), (7, 2), (8, 3), (9, 3), (10, 4), (11, 4), (12, 5), (12, 6), (13, 7), (13, 8), (13, 9)], '#1E8F8A')


def i_wheel(d, im):
    d.ellipse((1, 1, 14, 14), fill=hexc('#1F2125') + (255,)); d.ellipse((5, 5, 10, 10), fill=hexc('#A9ADB4') + (255,)); P(d, [(7, 7), (8, 8)], '#5B6068')
    P(d, [(3, 3), (12, 3), (3, 12), (12, 12), (7, 2), (8, 13), (2, 7), (13, 8)], '#3A3D42')


def i_board(d, im):
    R(d, (1, 3, 14, 12), '#1F7A45', '#0F4A28'); R(d, (3, 5, 6, 8), '#1A1C1F'); R(d, (9, 5, 12, 6), '#C9A227'); R(d, (9, 9, 12, 10), '#C9A227')
    P(d, [(7, 6), (8, 6), (8, 7), (8, 8), (8, 9), (4, 10), (5, 10), (6, 10)], '#7DFFB0')


def i_crate(d, im):
    R(d, (1, 3, 14, 13), '#3A8DDE', '#1D4E86'); d.line((1, 6, 14, 6), fill=hexc('#1D4E86') + (255,)); d.line((1, 10, 14, 10), fill=hexc('#1D4E86') + (255,))
    for x in (5, 10):
        d.line((x, 3, x, 13), fill=hexc('#1D4E86') + (255,))
    P(d, [(3, 4), (7, 8), (12, 12)], '#BFE1FF')


def i_penguin(d, im):  # Linux
    d.ellipse((3, 1, 12, 14), fill=hexc('#1F2125') + (255,)); d.ellipse((5, 6, 10, 14), fill=hexc('#F2F2F2') + (255,))
    P(d, [(6, 4), (9, 4)], '#FFFFFF'); R(d, (7, 5, 8, 6), '#F2A630'); R(d, (3, 14, 6, 15), '#F2A630'); R(d, (9, 14, 12, 15), '#F2A630')


def i_branch(d, im):  # Git
    d.line((4, 2, 4, 13), fill=hexc('#F05033') + (255,)); d.line((4, 9, 11, 5), fill=hexc('#F05033') + (255,))
    for (x, y) in ((4, 2), (4, 13), (11, 5)):
        R(d, (x - 1, y - 1, x + 1, y + 1), '#F05033', '#8E2A18')


def i_flame(d, im):  # PyTorch-ish generic flame
    d.polygon([(8, 0), (12, 6), (13, 10), (10, 15), (5, 15), (2, 10), (4, 6), (6, 8)], fill=hexc('#F0562B') + (255,), outline=hexc('#A6300F') + (255,))
    d.polygon([(8, 8), (10, 11), (9, 14), (6, 14), (5, 11)], fill=hexc('#FFC53A') + (255,))


def i_scope(d, im):
    R(d, (1, 2, 14, 13), '#3A3F47', '#16181B'); R(d, (2, 3, 10, 12), '#0F2A1C')
    P(d, [(2, 8), (3, 7), (4, 5), (5, 7), (6, 10), (7, 8), (8, 5), (9, 7), (10, 9)], '#55FF55'); P(d, [(12, 4), (12, 7)], '#F2C230'); P(d, [(12, 10)], '#F0453A')


def i_cube(d, im):  # CAD / 3D print
    d.polygon([(8, 1), (14, 4), (14, 11), (8, 14), (2, 11), (2, 4)], fill=hexc('#F28C28') + (255,), outline=hexc('#8A4A0C') + (255,))
    d.line((8, 7, 8, 14), fill=hexc('#8A4A0C') + (255,)); d.line((2, 4, 8, 7), fill=hexc('#8A4A0C') + (255,)); d.line((14, 4, 8, 7), fill=hexc('#8A4A0C') + (255,))
    d.polygon([(8, 2), (13, 4), (8, 6), (3, 4)], fill=hexc('#FFB45C') + (255,))


def i_heart(col='#E8232B', hi='#FF8A8A', dark='#7A0C10'):
    def f(d, im):
        rows = ['.XX...XX.', 'XHXX.XXXX', 'XHXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....']
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != '.':
                    im.putpixel((x + 3, y + 4), hexc(hi if ch == 'H' else col) + (255,))
    return f


def i_orb(d, im):
    d.ellipse((3, 3, 12, 12), fill=hexc('#9BF23A') + (255,), outline=hexc('#3E8F12') + (255,)); P(d, [(6, 6), (7, 6), (6, 7)], '#F4FFD0')


def i_lock(d, im):
    R(d, (3, 7, 12, 14), '#6C7078', '#2A2C30'); d.arc((4, 1, 11, 10), 180, 360, fill=hexc('#2A2C30') + (255,)); P(d, [(7, 10), (8, 10), (7, 11), (8, 11)], '#1A1C1F')


def i_rocket(d, im):
    d.polygon([(8, 0), (11, 5), (11, 11), (5, 11), (5, 5)], fill=hexc('#E6E8EC') + (255,), outline=hexc('#6C7078') + (255,))
    R(d, (7, 5, 9, 7), '#3B76D6'); d.polygon([(5, 9), (2, 13), (5, 12)], fill=hexc('#D8362C') + (255,)); d.polygon([(11, 9), (14, 13), (11, 12)], fill=hexc('#D8362C') + (255,))
    R(d, (7, 12, 9, 14), '#FFB53A'); P(d, [(8, 15)], '#F0562B')


def i_sat(d, im):
    R(d, (6, 5, 10, 10), '#C8CCD2', '#5B6068'); R(d, (0, 6, 4, 9), '#2F6FD0', '#16335F'); R(d, (12, 6, 15, 9), '#2F6FD0', '#16335F')
    d.line((8, 2, 8, 4), fill=hexc('#5B6068') + (255,)); P(d, [(8, 1)], '#F0453A'); P(d, [(7, 12), (8, 13), (9, 12)], '#55FFFF')


def i_grad(d, im):
    d.polygon([(8, 3), (15, 6), (8, 9), (1, 6)], fill=hexc('#26282C') + (255,)); R(d, (4, 8, 12, 11), '#26282C'); d.line((13, 7, 13, 12), fill=hexc('#FFD83A') + (255,)); P(d, [(13, 13), (12, 13), (14, 13)], '#FFD83A')


def i_people(d, im):
    for x, c in ((3, '#3B76D6'), (8, '#D8362C'), (12, '#5E9C3A')):
        R(d, (x - 1, 3, x + 1, 5), '#D9A066'); R(d, (x - 2, 6, x + 2, 12), c)


ICONS = {
    'book_blue': i_book('#2F5FBF'), 'book_green': i_book('#2E8B4A'), 'book_red': i_book('#B5362C'), 'book_purple': i_book('#7A3FC4'),
    'chip': i_chip(), 'chip_orin': i_chip('#1B3A1F', '#9BF23A'), 'compass': i_compass, 'antenna': i_antenna, 'magnet': i_magnet,
    'camera': i_camera, 'lidar': i_lidar, 'gear': i_gear, 'bolt': i_bolt, 'flask': i_flask('#B45CE6'), 'flask_red': i_flask('#E65C7A'),
    'wrench': i_wrench, 'trophy': i_trophy, 'gem': i_gem(), 'gem_purple': i_gem('#C77DFF', '#6A2CA8'), 'gem_green': i_gem('#55E07A', '#1E8F3E'),
    'ingot': i_ingot(), 'ingot_gold': i_ingot('#FFD83A', '#B8860B'), 'ingot_copper': i_ingot('#E08A5A', '#8E4A26'),
    'disc': i_disc, 'map': i_map, 'pick': i_pick, 'wheel': i_wheel, 'board': i_board, 'crate': i_crate, 'penguin': i_penguin,
    'branch': i_branch, 'flame': i_flame, 'scope': i_scope, 'cube': i_cube, 'heart': i_heart(), 'orb': i_orb, 'lock': i_lock,
    'rocket': i_rocket, 'sat': i_sat, 'grad': i_grad, 'people': i_people,
}


def avatar():
    """Original blocky pixel version of Nathan (black hair, dark tee, grey pants), front view, 16x32."""
    im = Image.new('RGBA', (16, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    skin, skin_d, hair, tee, tee_d, pants, pants_d, shoe = '#D9A877', '#C4925F', '#1B1612', '#2B2D33', '#202227', '#7C8088', '#6A6E76', '#EDEDED'
    R(d, (4, 0, 11, 7), skin); R(d, (4, 0, 11, 2), hair); P(d, [(4, 3), (11, 3), (4, 4), (5, 2 + 1)], hair)
    P(d, [(5, 4), (6, 4), (9, 4), (10, 4)], '#FFFFFF'); P(d, [(6, 4), (9, 4)], '#2B1C10'); P(d, [(7, 5), (8, 5)], skin_d); P(d, [(6, 6), (7, 6), (8, 6), (9, 6)], '#A8503E')
    R(d, (4, 8, 11, 19), tee); R(d, (0, 8, 3, 12), tee); R(d, (12, 8, 15, 12), tee); R(d, (0, 13, 3, 19), skin); R(d, (12, 13, 15, 19), skin)
    P(d, [(4, 19), (11, 19), (3, 12), (12, 12)], tee_d); R(d, (6, 11, 9, 12), '#D8362C'); P(d, [(7, 11), (8, 12)], '#FFFFFF')
    R(d, (4, 20, 7, 29), pants); R(d, (8, 20, 11, 29), pants); d.line((7, 21, 7, 29), fill=hexc(pants_d) + (255,)); d.line((8, 21, 8, 29), fill=hexc(pants_d) + (255,))
    R(d, (4, 30, 7, 31), shoe); R(d, (8, 30, 11, 31), shoe)
    return im


def up(im, k):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def photo(src, out, w, h, pos=(0.5, 0.5), px=3):
    im = Image.open(src).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((math.ceil(im.width * r), math.ceil(im.height * r)), Image.LANCZOS)
    x0 = int((im.width - w) * pos[0]); y0 = int((im.height - h) * pos[1])
    im = im.crop((x0, y0, x0 + w, y0 + h))
    small = im.resize((w // px, h // px), Image.BOX).quantize(96, dither=Image.NONE)
    # Same logic as the scene backgrounds: ship at half the <img>'s CSS size and
    # let image-rendering:pixelated (the .px class) do the 2x upscale, instead of
    # baking a full w x h bitmap the PDF viewer has to decode at full size.
    small.convert('RGB').resize((w // 2, h // 2), Image.NEAREST).save(OUT + out)


if __name__ == '__main__':
    make_textures(); sprites()
    W, Hh = 1600, 900
    for name, fn in (('title', title_scene), ('raar', raar_scene), ('rma', rma_scene), ('petal', petal_scene), ('urc', urc_scene)):
        im = render(fn(), C, C, 0, W * 2, Hh * 2, 3, bg=(18, 20, 28, 255))
        # Chrome's PDF export re-rasterizes every image to plain RGB no matter
        # what the source file's color mode/compression is, so what a PDF viewer
        # actually has to decode and repaint scales with *pixel count*, not file
        # size. Ship the background at half the page's CSS size (800x450) and let
        # the page's background-size:1600x900 + image-rendering:pixelated upscale
        # it 2x -- that's 4x fewer decoded pixels than a 1:1 image, and the
        # nearest-neighbor magnification reads as chunkier voxel blocks, not blur.
        im = im.convert('RGB').resize((W // 2, Hh // 2), Image.NEAREST)
        im.save(OUT + f'scene_{name}.png', optimize=True)
        print(name, im.size)
    for b in ('desert', 'vegas', 'ocean', 'shop'):
        # These only ever display at 132x132 CSS px; the old 3x upscale shipped
        # 528x528 (16x the pixels actually shown) for zero extra detail.
        render(mini(b), 2, 2, 0, 176, 176, 1).save(OUT + f'mini_{b}.png')
    for n, fn in ICONS.items():
        up(icon(fn), 8).save(OUT + f'i_{n}.png')
    up(avatar(), 16).save(OUT + 'avatar.png')
    for n in ('dirt', 'stone', 'planks', 'cobble'):
        up(TEX[n], 8).save(OUT + f't_{n}.png')
    S = '/home/claude/src/site/assets/img/'
    photo(S + 'projects/raar-plane.jpg', 'p_raar.png', 456, 222, (0.52, 0.2))
    photo(S + 'x59.jpg', 'p_x59.png', 222, 168, (0.5, 0.6))
    photo(S + 'nasa-armstrong.jpg', 'p_nasa.png', 222, 168, (0.5, 0.42))
    photo(S + 'projects/f1tenth.jpg', 'p_f1.png', 456, 258, (0.5, 0.45))
    photo(S + 'projects/petal-team.jpg', 'p_petal.png', 456, 258, (0.5, 0.75))
    photo(S + 'urc-desert.jpg', 'p_urc.png', 456, 258, (0.48, 0.6))
    photo(S + 'projects/rover.jpg', 'p_rover.png', 222, 168, (0.5, 0.62))
    photo(S + 'ksc-vab.jpg', 'p_ksc.png', 222, 168, (0.5, 0.6))
    photo(S + 'projects/kokua-team.jpg', 'p_kokua.png', 300, 168, (0.3, 0.6))
    photo(S + 'projects/anteres-render.jpg', 'p_anteres.png', 300, 168, (0.72, 0.5))
    print('done')
