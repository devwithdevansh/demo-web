# Lacquer — media list

The site works immediately: images hotlink from Unsplash, and the video slot
shows its poster image until you add the clip.

**To go fully local:** download each file, save it with the exact filename
into the folder shown, then set `USE_LOCAL = true` in `src/content.js`.

Unsplash and Pexels media is free for commercial use, no attribution required.

## The hero's optional PNG cutout

The hero looks for `public/media/images/hero-car-cutout.png` first — a real
transparent-background car render, product-shot style, like a manufacturer's
press image or a studio's own render. If it's not there (the default), the
hero falls back to `hero-car.jpg` below, masked into an ellipse so it still
reads as a floating product shot rather than a plain background photo.

A cutout with a **dark or black background already baked in** works best —
it'll blend straight into the page instead of showing a hard rectangle. Good
sources: a manufacturer press kit, [PNGEgg: car](https://www.pngegg.com/en/search?q=car)
or [Freepik: car render](https://www.freepik.com/search?query=car%20render%20transparent)
(check each asset's individual licence before using it commercially), or a
render your own studio commissions.

## Videos → `public/media/video/`

1920×1080 (or 1280×720 for lighter pages), H.264 MP4, **no audio**, under ~8 MB, 8–15 s loop.

| Filename | Where it shows | What to pick | Search |
|---|---|---|---|
| `water-sheeting.mp4` | "Water runs off" full-screen band | Slow-motion water sheeting/beading off a glossy dark panel, macro, moody light | [Pexels: water beading car](https://www.pexels.com/search/videos/water%20beading%20car/) · [Pexels: car rain drops](https://www.pexels.com/search/videos/car%20rain%20drops/) · [Pixabay: water drops car](https://pixabay.com/videos/search/water%20drops%20car/) |
| `paint-correction.mp4` | Process step 03, "Correct" | Rotary / DA polisher on dark paint, close-up, shop lighting | [Pexels: car polishing](https://www.pexels.com/search/videos/car%20polishing/) · [Pixabay: car polish](https://pixabay.com/videos/search/car%20polish/) |

Compress with HandBrake: preset "Fast 1080p30", RF 26, audio removed.

## Images → `public/media/images/`

These are the exact photos the site uses now (all Unsplash, all free to use).

| Filename | Where it shows | Photo page (download here) |
|---|---|---|
| `hero-car.jpg` | Hero fallback (dusty + clean layers), process step 01 | [Black car — Clément M.](https://unsplash.com/photos/grayscale-photo-of-black-car-Ng3xrviPrhk) |
| `before-after.jpg` | Before/after drag slider | [Car close-up — Unsplash](https://unsplash.com/photos/photo-1611820972863-59eaff523aba) |
| `beading-poster.jpg` | Water-sheeting video band poster, Graphene coating tile | [Water splash on black coupe — Brad Starkey](https://unsplash.com/photos/man-in-black-t-shirt-and-black-pants-doing-water-splash-on-black-coupe-during-daytime-eP8h7YVhFHk) |
| `foam-wash.jpg` | Service: signature wash | [Grey car in soap suds — mintosko](https://unsplash.com/photos/grey-car-in-soap-suds-V4b2j7f1dfc) |
| `foam-sports-car.jpg` | Process step 02, gallery | [Foam on black sports car — Andre Tan](https://unsplash.com/photos/sports-car-washing-in-garage-pRppMPh4Zho) |
| `interior.jpg` | Service: interior deep clean | [Car interior — Ján Vlačuha](https://unsplash.com/photos/black-and-gray-car-interior-U4IaoKF5aj4) |
| `paint-correction.jpg` | Service: paint correction, process step 03, gallery | [Polisher — Neelabh Raj](https://unsplash.com/photos/red-and-black-power-tool-cw1914zDHUs) |
| `ceramic-coating.jpg` | Service: 9H ceramic, process step 04 | [Waxing in a garage — Zac Nielson](https://unsplash.com/photos/a-man-waxing-a-car-in-a-garage-CsZjHjFN3N8) |
| `ppf-wrap.jpg` | Service: paint protection film, gallery | [Yellow microfibre — Muhammad Saad](https://unsplash.com/photos/a-person-cleaning-a-car-with-a-yellow-cloth-_vmBjTG5L1g) |
| `steering.jpg` | Gallery (graphene coat card) | [Steering wheel — Neelabh Raj](https://unsplash.com/photos/person-holding-car-steering-wheel-rS9PBJBY5pc) |
| `tire-brush.jpg` | Gallery | [Tyre brush — Zac Nielson](https://unsplash.com/photos/person-cleaning-car-tire-with-brush-8k_T1EwTySs) |
| `wheel-wash.jpg` | Gallery | [Wheel being washed — Adrian Dascal](https://unsplash.com/photos/wheel-being-washed-Ce_gQ7Z0eAc) |
| `wet-tire.jpg` | Spare | [Wet tyre — Zac Nielson](https://unsplash.com/photos/a-close-up-of-a-car-tire-on-a-wet-surface-m5g2IFRouCs) |
| `handover.jpg` | Process step 05, "Quality check & handover" | [Sponge wash — Nik](https://unsplash.com/photos/a-man-washing-a-car-with-a-sponge-phP5Qa0CauQ) |

More to browse: [Unsplash: car detailing](https://unsplash.com/s/photos/car-detailing) · [Unsplash: ceramic coating](https://unsplash.com/s/photos/ceramic-coating) · [Unsplash: car interior detailing](https://unsplash.com/s/photos/car-interior-detailing)

**For a real client:** replace the gallery and hero with their own before/after
shots (4:5 portrait, 1400px wide, for gallery; 2400px wide landscape for
hero). Real work beats stock every time, especially for the before/after
slider — a real correction pair is what sells the service.

## Sizes

Full-bleed (hero, beading poster, before/after): 2400px wide, under 400 KB.
Cards and gallery: 1400px wide, under 250 KB. Convert to WebP with
[Squoosh](https://squoosh.app) for extra savings.
