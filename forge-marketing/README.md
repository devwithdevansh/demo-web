# FORGE marketing materials

Flyer, brochure, WhatsApp Status cards and a square post for FORGE. The designs are plain HTML and CSS, so they can be edited in any text editor, and one command turns them into PNG and PDF files.

## Ready-to-share files

Everything in `export/` is ready to send or print.

| File | What it is |
| --- | --- |
| `export/forge-flyer-a4.pdf` and `.png` | One-page flyer, A4 |
| `export/forge-brochure.pdf` | Six-page brochure, A4 |
| `export/brochure/forge-brochure-page-1.png` … `-6.png` | The brochure as separate images |
| `export/stories/forge-story-01-online.png` … `-08-demo.png` | Eight WhatsApp Status cards, 1080 × 1920 |
| `export/forge-stories.pdf` | All eight cards in one PDF |
| `export/forge-stories-contact-sheet.png` | All eight cards on one image, for a quick look |
| `export/forge-post-1080.png` | Square post, 1080 × 1080 |

The cards keep their top and bottom strips empty on purpose. WhatsApp and Instagram cover those areas with the name bar and the reply box.

## Changing something

| To change | Edit |
| --- | --- |
| Prices, plan wording, optional modules, the demo link, the pricing note | `src/content.js` |
| A phone number or email next to every call to action | `contactLine` in `src/content.js` (empty for now) |
| Whether the QR code is shown | `showQr` in `src/content.js` |
| Headlines, Gujarati lines and layout | `src/flyer.html`, `src/brochure.html`, `src/stories.html`, `src/post.html` |
| Colours, fonts and shared pieces | `src/styles.css` |
| Photos | `assets/photos/` |

`content.js` feeds all four designs, so a price changed there changes everywhere. The QR code is made from `demoUrl` each time you export, so it always matches the link.

To preview a design, open its `.html` file in a browser.

## Exporting

```
npm install
npm run export
```

This needs Node.js and either Microsoft Edge or Google Chrome installed. If the script cannot find the browser, set `BROWSER_PATH` to its `.exe`.

The export replaces the `export/` folder and ends with a layout check. It lists any text that spills off a page, is cut off, or sits in the strip WhatsApp covers. "Layout check passed" means none of that happened.

## Refreshing the product screenshots

The phone screens in the designs are captured from the live demo, which shows a sample gym with sample data.

```
npm run screens
npm run export
```

The first command needs the demo to be online. It saves new screenshots to `assets/screens/`.
