# DevWithDevansh – Salon sales kit (market-entry edition)

Everything in `out/` is generated from **`data/pricing.json`** (all numbers) and **`build/content.py`** (shared copy, Gujarati lines, packages, competitor table).
Change a price or a line there, run `python build/build_all.py`, and every PDF, PowerPoint, Word and Excel file updates.

## Start here
| File | What it is |
|---|---|
| `out/DWD_Salon_Complete_Kit_INTERNAL.pdf` | One PDF: cover, linked contents, a divider before each section saying which formats/files it is, every document, the internal playbook and scripts, and a closing slide section: what changed and how we attract clients. Editable files are attached inside. **Not for clients.** |
| `out/DWD_Salon_Client_Pack.pdf` | Same idea, client-facing sections only. Safe to send. |
| `out/DWD_Salon_MASTER_Editable.docx` | **Word master**: brochure copy, one-pager, comparison, proposal, price tables, the whole playbook, scripts (English + Gujarati), photo licence log, sources. Edit directly. |
| `out/DWD_Salon_MASTER_Editable.pptx` | **PowerPoint master**: start-here slide, the 18-slide client deck, and the internal appendix (review, what changed, market, pricing, attracting clients, three small plans, 90 days). Edit directly. |
| `DWD_Salon_Complete_Kit.zip` | Numbered folders with everything above plus the rebuild source. |

## All documents
Brochure (10 pages) · One-pager · Sales deck (18 slides, PPTX + PDF) · Comparison sheet · Proposal template (editable HTML) · Price calculator (HTML + Excel with a formula-driven revenue model) · Growth & pricing playbook (PDF) · Outreach scripts (PDF + Markdown) · Lead tracker (Excel).

## What changed in this edition
- **Photos:** 17 licensed Pexels photos, one photo per placement, licence log in `data/photo_log.json`. Product pages use UI mock-ups instead of mood photos.
- **Packages and prices:** Starter (Get Found) · Growth (Get Booked) · Pro (Run the Salon) · Custom, each with a status (Ready now / Founding-partner build / Roadmap).
- **Google Maps and local SEO:** in every package; ₹4,999 Maps-only setup; ₹3,999/month care; no ranking promise (Google: "There's no way to request or pay for a better local ranking").
- **Expense management:** Pro and an add-on, with a screen mock-up.
- **Gujarati:** headlines on every document, a Gujarati brochure page and deck slide, Gujarati outreach scripts.
- **Strategy:** audit, market and pricing research, three offer structures, three pricing strategies, revenue illustration (10/25/50/100 customers), segments, channels, 30-day calendar, funnel metrics, sales tools, 30/60/90 plan.

## Before sending anything to a client
1. Confirm the prices in `data/pricing.json` (proposals from research, not facts about your costs).
2. Add your WhatsApp number where `[Insert WhatsApp number]` appears (website and email are filled from the education handoff).
3. Have a native speaker proofread the Gujarati.
4. Decide founding-partner terms, GST and your monthly capacity.
5. Competitor figures come from third-party blogs (Oct 2026); MioSalon and DINGG do not publish prices. Re-check before quoting.
6. Stock photos are placeholders: replace with partner-salon photos (with releases) as soon as you have them. The Nuance demo photo used inside one UI mock-up appears AI-generated.

Rebuild everything: `python build/build_all.py` (needs Microsoft Edge and PowerPoint).
