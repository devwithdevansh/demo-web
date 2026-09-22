# Beadline — media list

The site works immediately: images hotlink from Unsplash, and each video slot shows its poster image until you add the clip.

**To go fully local:** download each file, save it with the exact filename into the folder shown, then set `USE_LOCAL = true` in `src/content.js`.

Unsplash and Pexels media is free for commercial use, no attribution required.

## Videos → `public/media/video/`

1920×1080 (or 1280×720 for lighter pages), H.264 MP4, **no audio**, under ~8 MB, 8–15 s loop.

| Filename | Where it shows | What to pick | Search |
|---|---|---|---|
| `water-beading.mp4` | "Water runs off" band (full screen) | Slow-motion water beading or sheeting off a glossy dark panel, macro, dark background | [Pexels: water beading car](https://www.pexels.com/search/videos/water%20beading%20car/) · [Pexels: car rain drops](https://www.pexels.com/search/videos/car%20rain%20drops/) · [Pixabay: water drops car](https://pixabay.com/videos/search/water%20drops%20car/) |
| `polishing.mp4` | Process card 03, "Correct" | Rotary / DA polisher on paint, close-up, shop lighting | [Pexels: car polishing](https://www.pexels.com/search/videos/car%20polishing/) · [Pixabay: car polish](https://pixabay.com/videos/search/car%20polish/) |

Optional extra you can swap into the hero later (the hero currently uses a photo so the dust-wipe effect works): [Pexels: car wash foam](https://www.pexels.com/search/videos/car%20wash%20foam/).

Compress with HandBrake: preset "Fast 1080p30", RF 26, audio removed.

## Images → `public/media/images/`

These are the exact photos the site uses now.

| Filename | Where it shows | Photo page (download here) |
|---|---|---|
| `hero-car.jpg` | Hero (dusty and clean layers) | [White BMW M3 — Severin Demchuk](https://unsplash.com/photos/white-bmw-m-3-coupe-RYkZRwbmc1U) |
| `beading-poster.jpg` | Beading band poster | [Water splash on black coupe — Brad Starkey](https://unsplash.com/photos/man-in-black-t-shirt-and-black-pants-doing-water-splash-on-black-coupe-during-daytime-eP8h7YVhFHk) |
| `foam-sports-car.jpg` | Process 02, gallery | [Foam on black sports car — Andre Tan](https://unsplash.com/photos/sports-car-washing-in-garage-pRppMPh4Zho) |
| `foam-grey-car.jpg` | Service: foam wash | [Grey car in soap suds — mintosko](https://unsplash.com/photos/grey-car-in-soap-suds-V4b2j7f1dfc) |
| `polisher.jpg` | Service: correction, Process 03, gallery | [Polisher — Neelabh Raj](https://unsplash.com/photos/red-and-black-power-tool-cw1914zDHUs) |
| `waxing.jpg` | Service: ceramic, Process 04 | [Waxing in a garage — Zac Nielson](https://unsplash.com/photos/a-man-waxing-a-car-in-a-garage-CsZjHjFN3N8) |
| `interior.jpg` | Service: interior, gallery | [Car interior — Ján Vlačuha](https://unsplash.com/photos/black-and-gray-car-interior-U4IaoKF5aj4) |
| `steering.jpg` | Gallery | [Steering wheel — Neelabh Raj](https://unsplash.com/photos/person-holding-car-steering-wheel-rS9PBJBY5pc) |
| `tire-brush.jpg` | Gallery | [Tyre brush — Zac Nielson](https://unsplash.com/photos/person-cleaning-car-tire-with-brush-8k_T1EwTySs) |
| `wheel-wash.jpg` | Gallery | [Wheel being washed — Adrian Dascal](https://unsplash.com/photos/wheel-being-washed-Ce_gQ7Z0eAc) |
| `wet-tire.jpg` | Spare | [Wet tyre — Zac Nielson](https://unsplash.com/photos/a-close-up-of-a-car-tire-on-a-wet-surface-m5g2IFRouCs) |
| `microfibre.jpg` | Service: PPF, gallery | [Yellow microfibre — Muhammad Saad](https://unsplash.com/photos/a-person-cleaning-a-car-with-a-yellow-cloth-_vmBjTG5L1g) |
| `sponge-wash.jpg` | Process 05 | [Sponge wash — Nik](https://unsplash.com/photos/a-man-washing-a-car-with-a-sponge-phP5Qa0CauQ) |
| `black-car.jpg` | Process 01 | [Black car — Clément M.](https://unsplash.com/photos/grayscale-photo-of-black-car-Ng3xrviPrhk) |

More to browse: [Unsplash: car detailing](https://unsplash.com/s/photos/car-detailing) · [Unsplash: auto detailing](https://unsplash.com/s/photos/auto-detailing) · [Unsplash: car interior detailing](https://unsplash.com/s/photos/car-interior-detailing)

**For a real client:** replace the gallery with their own before/after shots (4:5 portrait, 1400px wide). Real work beats stock every time.

## Sizes

Full-bleed (hero, beading poster): 2400px wide, under 400 KB. Cards and gallery: 1400px wide, under 250 KB. Convert to WebP with [Squoosh](https://squoosh.app) for extra savings.
