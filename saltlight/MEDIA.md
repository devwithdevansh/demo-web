# Saltlight — media list

The site works right now: images hotlink from Unsplash, and every video slot falls back to its poster image until you add the file.

**To go fully local:** download each file below, save it with the exact filename into the folder shown, then set `USE_LOCAL = true` in `src/content.js`.

All Unsplash and Pexels media is free for commercial use, no attribution required (crediting photographers is still good practice).

## Videos → `public/media/video/`

Pick one clip from each search. Export at 1920×1080 (or 1280×720 for mobile weight), H.264 MP4, no audio, under ~8 MB, 8–15 s seamless loop.

| Filename | Where it shows | What to look for | Search |
|---|---|---|---|
| `hero-saltflat.mp4` | Hero, full screen | Wide, slow drone or dolly over white salt flat, pale blue sky, soft light | [Pexels: salt desert](https://www.pexels.com/search/videos/salt%20desert/) · [Pixabay: salt flat](https://pixabay.com/videos/search/salt%20flat/) · [Adobe Stock: Rann of Kutch](https://stock.adobe.com/search?k=%22rann+of+kutch%22) (paid, real Kutch footage) |
| `dusk-timelapse.mp4` | Day section, 18:10 panel | Sunset timelapse over a flat horizon, orange to deep red sky | [Pexels: desert sunset](https://www.pexels.com/search/videos/desert%20sunset/) · [Pixabay: desert sunset](https://pixabay.com/videos/search/desert%20sunset/) |
| `night-stars.mp4` | Day section, 22:00 panel (blended over the CSS moon + stars) | Star timelapse on black sky, no bright foreground, very dark | [Pexels: desert night](https://www.pexels.com/search/videos/desert%20night/) |
| `craft-hands.mp4` | "Made ten minutes down the road" band | Close-up of hands doing embroidery / mirror work, warm light | [Pexels: embroidery](https://www.pexels.com/search/videos/embroidery/) · [Pexels: hand embroidery](https://www.pexels.com/search/videos/hand%20embroidery/) |

Tip: compress with HandBrake (Preset "Fast 1080p30", RF 26, remove audio).

## Images → `public/media/images/`

These are the exact photos the site uses now (real Rann of Kutch shots).

| Filename | Where it shows | Photo page (download here) |
|---|---|---|
| `hero-poster.jpg` | Hero (until video loads) | [White salt under blue sky — Krunal Lakhatariya](https://unsplash.com/photos/white-sand-under-blue-sky-during-daytime-t9FrUnGogPY) |
| `day-sunrise.jpg` | 06:40 panel | [People walking on the Rann — Tapish](https://unsplash.com/photos/a-group-of-people-walking-on-a-sandy-beach--sptCqPIeuU) |
| `day-noon.jpg` | 12:30 panel | [Camel on the white salt — Krunal Lakhatariya](https://unsplash.com/photos/brown-camel-on-white-sand-during-daytime-_x0u6sxc704) |
| `day-dusk.jpg` | 18:10 panel poster | [Sun setting over the horizon — Sim Gill](https://unsplash.com/photos/the-sun-is-setting-over-the-horizon-of-the-ocean-Tw_m_ngR63A) |
| `room-bhunga.jpg` | Stay: Mud bhunga | [Tent City walkway — Rann Utsav](https://unsplash.com/photos/a-pool-with-a-walkway-and-a-beach-with-buildings-in-the-background-Iy4XTLlru8A) |
| `room-mirror.jpg` | Stay: Mirror bhunga | [Kutch hanging textiles — Hari Nandakumar](https://unsplash.com/photos/selective-focus-photography-multicolored-hanging-decor-smrYe3nHLoA) |
| `room-sky.jpg` | Stay: Sky tent | [People on the white field — geekgunda](https://unsplash.com/photos/a-group-of-people-standing-on-top-of-a-snow-covered-field-duyprRD_m08) |
| `craft-lantern.jpg` | Craft: Hodka + craft band poster | [Red and yellow lanterns — shreyash](https://unsplash.com/photos/red-and-yellow-paper-lantern-mN_xK3FdXvA) |
| `craft-cart.jpg` | Craft: Bhirandiyara | [Camel cart — Faisal Khatri](https://unsplash.com/photos/camel-pulling-a-cart-with-people-in-it-r1uu-H6ko-o) |
| `craft-camels.jpg` | Craft: Dhordo | [Camels in the sand — Samir Arora](https://unsplash.com/photos/a-couple-of-camels-that-are-standing-in-the-sand-1ecfrGBrMyA) |
| `footer-walk.jpg` | Footer | [Walking on the White Rann — Rann Utsav](https://unsplash.com/photos/a-group-of-people-walking-on-a-sandy-beach-PFU85YECAdI) |

### Swap-ins for real rooms (recommended before a client launch)

Stock can't show the actual property. For a real client, replace the three `room-*.jpg` with their own photos (portrait 4:5, ~1400px wide). Until then, these searches give closer matches:

- [Unsplash: mud hut interior](https://unsplash.com/s/photos/mud-hut-interior)
- [Unsplash: kutch](https://unsplash.com/s/photos/kutch) · [Unsplash: rann of kutch](https://unsplash.com/s/photos/rann-of-kutch)
- [Pixabay: rann of kutch](https://pixabay.com/images/search/rann%20of%20kutch/)
- [Pexels: salt flats](https://www.pexels.com/search/salt%20flats/)

## Sizes

- Full-bleed (hero, footer, bands): 2400px wide, JPG quality ~75, under 400 KB. Convert to WebP with [Squoosh](https://squoosh.app) for extra savings.
- Panels / cards: 1400px wide, under 250 KB.
