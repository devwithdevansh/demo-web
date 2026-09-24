import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ROUTES, SITE_URL } from './src/seo/routes.js'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// The catalog is DWD Studio's own page, so it's the one place that gets
// structured data -- about the real agency, never the demo studios.
const agencySchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'DWD Studio',
  url: `${SITE_URL}/`,
  email: 'devwithdevansh@gmail.com',
  description: 'Custom website design for car detailing, ceramic coating and PPF studios.',
}

const headFor = (route) => {
  const url = `${SITE_URL}${route.path}`
  const tags = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="DWD Studio" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ]
  if (route.id === 'catalog') {
    tags.push(`<script type="application/ld+json">${JSON.stringify(agencySchema)}</script>`)
  }
  return tags.join('\n    ')
}

// Readable text inside #root for crawlers and link previews that don't run
// JavaScript. React's createRoot replaces it on load, so real visitors only
// see it for the instant before the app mounts -- hence the quiet styling.
const bodyFor = (route) => {
  const links = (route.links ?? [])
    .map(([href, label]) => `<li><a href="${href}" style="color:inherit">${esc(label)}</a></li>`)
    .join('')
  return `<div id="root"><main style="max-width:60ch;margin:15vh auto;padding:0 20px;font-family:sans-serif;color:#a8a9a4;line-height:1.6">` +
    `<h1 style="font-size:22px;color:#edede8">${esc(route.heading)}</h1><p>${esc(route.body)}</p>` +
    (links ? `<ul>${links}</ul>` : '') +
    `</main></div>`
}

// Writes dist/index.html, dist/kohinoor/index.html, ... each with its own
// head and fallback text, plus sitemap.xml and robots.txt. Without this,
// every URL served the same empty shell titled "Kohinoor".
function prerenderSeo() {
  let outDir
  return {
    name: 'prerender-seo',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    closeBundle() {
      const shell = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const route of ROUTES) {
        const html = shell
          .replace(/<title>[^<]*<\/title>/, headFor(route))
          .replace('<div id="root"></div>', bodyFor(route))
        const dir = route.path === '/' ? outDir : join(outDir, route.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }
      const urls = ROUTES.map((r) => `  <url><loc>${SITE_URL}${r.path}</loc></url>`).join('\n')
      writeFileSync(join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
      writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderSeo()],
})
