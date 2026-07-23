# AdVantage Media — Website

Static multi-page site. No build step: every page is self-contained HTML with
an inline design system. Deploys to Vercel or GitHub Pages as-is.

---

## Structure

```
.
├── index.html                  Home
├── services.html               Services hub
├── story.html                  Our Story
├── resources.html              Resources hub (links to playbooks)
├── contact.html                Contact + enquiry form
├── 404.html                    Not-found page (picked up automatically)
│
├── services/                   Individual service pages
│   ├── linkedin-ads-management.html
│   ├── social-media-management.html
│   ├── content-marketing.html
│   └── performance-review.html
│
├── playbooks/                  Long-form articles (ungated)
│   ├── linkedin-lead-gen-forms.html
│   ├── linkedin-campaign-optimisation.html
│   └── linkedin-follower-growth.html
│
├── og-image.png                1200x630 social share card
├── robots.txt
├── sitemap.xml
├── vercel.json                 Clean-URL rewrites + noindex headers
└── .nojekyll                   Stops GitHub Pages running Jekyll
```

> The folder structure matters. `services.html` links to `services/*.html`;
> if the subfolders are missing, those links 404.

---

## Deploying

**Vercel** — connect the repo, or drag the folder to vercel.com/new.
`vercel.json` maps clean URLs (`/services/content-marketing` →
`services/content-marketing.html`).

**GitHub Pages** — enable Pages on the branch. Links are relative and include
`.html`, so they work from a repo subpath (`user.github.io/repo-name/`) as well
as from a domain root.

---

## Before going live

- [ ] **Domain.** Canonical URLs, `sitemap.xml` and `robots.txt` all say
      `https://advantage-media.in`. If that is wrong, find-and-replace it
      everywhere before deploying — a wrong canonical is worse than none.
- [ ] **Review the service page copy.** `services/*.html` describes method and
      process. It contains no client names, prices, guarantees or performance
      figures, but it should still read the way you want it to read.
- [ ] **Search Console.** Submit `sitemap.xml` and request indexing on the
      seven pages under `services/` and `playbooks/`. They will not be
      discovered quickly otherwise.
- [ ] **Social profile URLs.** The `sameAs` array in the homepage JSON-LD is
      empty. Add your LinkedIn / Instagram / Facebook URLs, or remove the key.
- [ ] **Footer social links** still point at `#`.

---

## Known gaps

- **Fourth playbook.** "Scaling LinkedIn Campaigns Without Wasting Budget"
  exists only as a ~230-word teaser on `resources.html` with its email gate
  intact. The full content lives in a webinar PDF that is not in this repo.
- **Dead files from the old single-page app.** `app.js`, `styles.css`,
  `style.css`, `home.html`, `_header.html`, `_footer.html` are not referenced
  by any page. The three `.html` fragments have no `<head>` and render
  unstyled if reached directly; `vercel.json` sends `X-Robots-Tag: noindex`
  for them, but deleting them is better. `home.html` also carries a second
  analytics tag (`G-NNK8S5N276`) that conflicts with GTM.

  ```bash
  git rm app.js styles.css style.css home.html _header.html _footer.html
  ```

---

## Analytics

Google Tag Manager (`GTM-PNLTBBF5`) is on every page — script first in
`<head>`, `noscript` iframe immediately after `<body>`.

## Forms

Formspree. Contact: `xqeyajqo`. Playbook/webinar gate: `maqlprqn`.
Confirm both are active in your Formspree account.
