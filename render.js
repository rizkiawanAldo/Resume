/* ============================================================
   MASTER TEMPLATE RENDERER
   Reads content/master.yaml and builds every slide.
   Do not put content here — edit content/master.yaml instead.
   ============================================================ */

(function () {
    'use strict';

    const CONTENT_URL = 'content/master.yaml';

    // ── Tiny helpers ────────────────────────────────────────────
    const escapeHtml = (value) =>
        String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

    // Minimal inline markdown: **bold**, *italic*, `code`, [text](url)
    function md(value) {
        return escapeHtml(value)
            .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener" class="inline-link-gold">$1</a>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    const arr = (value) => (Array.isArray(value) ? value : []);
    const attr = (value) => escapeHtml(value == null ? '' : value);

    function slideIndexOf(data, id, fallback) {
        const idx = arr(data.slides).findIndex((s) => s && s.id === id);
        return idx >= 0 ? idx : fallback;
    }

    // ── Slide builders ──────────────────────────────────────────
    const builders = {
        intro(data) {
            const hero = data.hero || {};
            const basics = data.basics || {};
            const cta = hero.primary_cta || {};
            const secondary = hero.secondary_cta || {};
            const target = slideIndexOf(data, cta.slide || 'experience', 1);

            const tags = arr(hero.tags)
                .map((tag, i) => `<span class="hero-tag${i === 0 ? ' code-font' : ''}">${md(tag)}</span>`)
                .join('');

            return `
        ${basics.profile_image ? `<img src="${attr(basics.profile_image)}" alt="${attr(basics.name)}" class="hero-profile-img" />` : ''}

        <div class="hero-top-bar">
          <div class="badge-pill ${attr(hero.badge_accent || 'amber')}">
            <span class="pulse-dot-${attr(hero.badge_accent || 'amber')}"></span> ${md(hero.badge)}
          </div>
        </div>

        <h1 class="hero-headline">
          ${md(hero.headline)}${hero.headline_accent ? ` <span class="accent-text-gold">${md(hero.headline_accent)}</span>` : ''}
        </h1>

        <p class="hero-subtext">${md(hero.subtext)}</p>

        <div class="hero-tags">${tags}</div>

        <div class="hero-actions">
          ${cta.label ? `<button type="button" class="btn btn-primary next-slide-btn" data-target="${target}">
            ${md(cta.label)} <span class="btn-arrow">→</span>
          </button>` : ''}
          ${secondary.url ? `<a href="${attr(secondary.url)}" target="_blank" rel="noopener" class="btn btn-outline">
            ${md(secondary.label || secondary.url)}
          </a>` : ''}
        </div>`;
        },

        about(data) {
            const about = data.about || {};
            const paragraphs = arr(about.paragraphs).map((p) => `<p>${md(p)}</p>`).join('');
            const metrics = arr(about.metrics).map((m) => `
        <div class="metric-card ${attr(m.accent || 'gold')}">
          <div class="metric-value">${md(m.value)}</div>
          <div class="metric-label">${md(m.label)}</div>
          <div class="metric-desc">${md(m.desc)}</div>
        </div>`).join('');

            return `
        <div class="section-kicker">${md(about.kicker)}</div>
        <h2 class="slide-title">${md(about.title)}</h2>

        <div class="signal-banner">
          <div class="signal-wave-svg">
            <svg viewBox="0 0 800 60" preserveAspectRatio="none">
              <path d="M 0 30 Q 50 5, 100 30 T 200 30 T 300 55 T 400 10 T 500 45 T 600 20 T 700 35 T 800 30"
                fill="none" stroke="url(#wave-gradient)" stroke-width="2.5" />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="50%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="signal-caption">${md(about.signal_caption)}</span>
        </div>

        <div class="about-grid">
          <div class="about-text">${paragraphs}</div>
          <div class="about-metrics">${metrics}</div>
        </div>`;
        },

        experience(data) {
            const cards = arr(data.experience).map((job) => {
                const logo = job.logo_text
                    ? `<span class="company-logo" style="background:${attr(job.logo_color || '#6366f1')}">${md(job.logo_text)}</span>`
                    : '';
                const current = job.current ? ' <span class="tech-pill-sm">Current</span>' : '';
                const sub = job.sub_name ? ` <span class="sub-name">(${md(job.sub_name)})</span>` : '';
                const bullets = arr(job.bullets).map((b) => {
                    const title = b.title ? `<strong>${md(b.title)}:</strong> ` : '';
                    return `<li>${title}${md(b.text)}</li>`;
                }).join('');
                const badgeAccent = job.badge_accent ? ` ${attr(job.badge_accent)}` : '';
                const period = [job.start_date, job.end_date].filter(Boolean).join(' — ');
                const meta = [period, job.location].filter(Boolean).join(' · ');

                return `
          <div class="timeline-card persona-item eng${job.current ? ' active-job' : ''}">
            <div class="job-header">
              <div class="company-name-row">
                ${logo}
                <div>
                  <h3 class="company">${md(job.company)}${current}${sub}</h3>
                  <div class="role">${md(job.role)}</div>
                </div>
              </div>
              <div class="job-badge${badgeAccent}">${md(meta)}</div>
            </div>
            <ul class="job-list">${bullets}</ul>
          </div>`;
            }).join('');

            return `
        <div class="section-kicker">03. Impact &amp; Engineering</div>
        <h2 class="slide-title">Where I've Shipped Systems</h2>
        <div class="timeline-deck">${cards}</div>`;
        },

        summary(data) {
            const summary = data.summary || {};
            const skills = data.skills || {};

            const capabilities = arr(summary.capabilities).map((c) => `
        <div class="summary-box">
          <div class="box-icon ${attr(c.accent || 'amber')}">${md(c.icon)}</div>
          <h3>${md(c.title)}</h3>
          <p>${md(c.text)}</p>
        </div>`).join('');

            const groups = arr(data.skills_display).map((group) => {
                const items = arr(skills[group.key]);
                const pills = items.map((item) =>
                    `<span class="pill${group.accent ? ' ' + attr(group.accent) : ''}">${md(item)}</span>`).join('');
                if (!items.length) return '';
                return `
          <div class="stack-group">
            <span class="stack-cat">${md(group.label)}</span>
            <div class="pill-list">${pills}</div>
          </div>`;
            }).join('');

            return `
        <div class="section-kicker">${md(summary.kicker)}</div>
        <h2 class="slide-title">${md(summary.title)}</h2>

        <div class="summary-cards-grid">${capabilities}</div>

        <div class="stack-section">
          <h3 class="stack-heading code-font">${md(summary.stack_heading)}</h3>
          <div class="stack-grid">${groups}</div>
        </div>`;
        },

        projects(data) {
            const cards = arr(data.projects).map((project) => {
                const links = arr(project.links).map((link) =>
                    `<a href="${attr(link.url)}" target="_blank" rel="noopener"
             class="project-btn ${attr(link.style || 'secondary')}">${md(link.label)}</a>`).join('');

                return `
          <div class="project-deck-card persona-item ${attr(project.persona || 'eng')}">
            <div class="project-card-header">
              <span class="project-tag ${attr(project.accent || 'amber')}">${md(project.tag)}</span>
              <div class="project-links">${links}</div>
            </div>
            <h3 class="project-title">${md(project.name)}</h3>
            <p class="project-description">${md(project.role ? `${project.role} — ` : '')}${md(project.description)}</p>
          </div>`;
            }).join('');

            return `
        <div class="section-kicker">05. Independent Work</div>
        <h2 class="slide-title">Featured Projects &amp; Utilities</h2>
        <div class="projects-deck">${cards}</div>`;
        },

        photography(data) {
            const photo = data.photography || {};
            const camera = photo.camera || '';

            const thumbs = arr(photo.photos).map((p, i) => `
        <div class="photo-thumb EXIF-card" data-photo="${i}">
          <img src="${attr(p.src)}" alt="${attr(p.title || p.src)}" loading="lazy" />
          <div class="photo-thumb-overlay">
            <span class="exif-badge">${md(camera)}</span>
            <span class="photo-thumb-title">${md(p.title)}</span>
            <span class="photo-thumb-icon">🔍 View &amp; Preview</span>
          </div>
        </div>`).join('');

            const cta = photo.cta || {};

            return `
        <div class="section-kicker">${md(photo.kicker)}</div>
        <h2 class="slide-title">${md(photo.title)}</h2>
        <p class="section-subdesc">${md(photo.description)}</p>

        <div class="photo-gallery-grid">${thumbs}</div>

        ${cta.url ? `<div class="photo-cta-bar">
          <a href="${attr(cta.url)}" target="_blank" rel="noopener" class="btn btn-primary gold">
            ${md(cta.label || cta.url)}
          </a>
        </div>` : ''}`;
        },

        contact(data) {
            const contact = data.contact || {};
            const meta = data.meta || {};

            const cards = arr(contact.links).map((link) => {
                const inner = `
          <span class="icon">${md(link.icon)}</span>
          <div>
            <div class="label">${md(link.label)}</div>
            <div class="val${link.code ? ' code-font' : ''}">${md(link.value)}</div>
          </div>`;
                if (!link.href) return `<div class="contact-card">${inner}</div>`;
                const target = link.external ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${attr(link.href)}"${target} class="contact-card">${inner}</a>`;
            }).join('');

            return `
        <div class="section-kicker">${md(contact.kicker)}</div>
        <h2 class="slide-title">${md(contact.title)}</h2>

        <div class="contact-grid">
          <div class="contact-details-col">
            <p class="contact-intro">${md(contact.intro)}</p>
            <div class="contact-links-list">${cards}</div>
          </div>

          <div class="contact-form-col">
            <form class="deck-contact-form" id="contact-form">
              <div class="form-row">
                <label for="c-name">Name</label>
                <input type="text" id="c-name" name="name" placeholder="Your Name" required />
              </div>
              <div class="form-row">
                <label for="c-email">Email</label>
                <input type="email" id="c-email" name="email" placeholder="you@example.com" required />
              </div>
              <div class="form-row">
                <label for="c-msg">Message</label>
                <textarea id="c-msg" name="message" rows="4" placeholder="Hi ${attr((data.basics || {}).name || 'there')}, let me know about..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary form-btn">Send Message →</button>
              <p class="form-status" id="form-status-msg"></p>
            </form>
          </div>
        </div>

        <footer class="slide-footer">
          <p>${md(meta.footer)}</p>
        </footer>`;
        }
    };

    // ── Page shell rendering ────────────────────────────────────
    function renderHead(data) {
        const meta = data.meta || {};
        if (meta.title) document.title = meta.title;

        const setMeta = (selector, content) => {
            const el = document.querySelector(selector);
            if (el && content) el.setAttribute('content', content);
        };
        setMeta('meta[name="description"]', meta.description);
        setMeta('meta[property="og:title"]', meta.og_title || meta.title);
        setMeta('meta[property="og:description"]', meta.og_description);

        if (meta.favicon_emoji) {
            const icon = document.querySelector('link[rel="icon"]');
            if (icon) {
                icon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${meta.favicon_emoji}</text></svg>`;
            }
        }
    }

    function renderChrome(data) {
        const basics = data.basics || {};
        const slides = arr(data.slides);

        const brandName = document.getElementById('brand-name');
        const brandTag = document.getElementById('brand-tag');
        const brandAvatar = document.getElementById('brand-avatar');
        if (brandName) brandName.textContent = basics.name || '';
        if (brandTag) brandTag.textContent = basics.brand_tag || '';
        if (brandAvatar) brandAvatar.textContent = basics.initials || '';

        const nav = document.getElementById('deck-nav');
        if (nav) {
            nav.innerHTML = slides.map((slide, i) =>
                `<a href="#${attr(slide.id)}" class="nav-item${i === 0 ? ' active' : ''}" data-slide="${i}">${md(slide.label)}</a>`
            ).join('');
        }

        const dots = document.getElementById('dock-dots');
        if (dots) {
            dots.innerHTML = slides.map((slide, i) =>
                `<button class="dot${i === 0 ? ' active' : ''}" data-slide="${i}" title="${attr(slide.label)}"></button>`
            ).join('');
        }

        const total = document.getElementById('total-slides');
        if (total) total.textContent = String(slides.length).padStart(2, '0');

        const lightboxExif = document.querySelector('.lightbox-exif-specs');
        if (lightboxExif) lightboxExif.setAttribute('data-camera', (data.photography || {}).camera || '');
    }

    // ── Public render ───────────────────────────────────────────
    function render(data) {
        window.SITE_DATA = data;

        renderHead(data);
        renderChrome(data);

        const track = document.getElementById('slides-track');
        if (!track) return;

        const slides = arr(data.slides);
        track.innerHTML = slides.map((slide, index) => {
            const build = builders[slide.id];
            const inner = build ? build(data) : `<h2 class="slide-title">${md(slide.label)}</h2>`;
            return `<section class="slide${index === 0 ? ' active' : ''}" id="${attr(slide.id)}" data-index="${index}">
        <div class="slide-content">${inner}</div>
      </section>`;
        }).join('');
    }

    // ── Boot: load YAML → render → start deck engine ───────────
    async function boot() {
        try {
            if (!window.jsyaml) throw new Error('YAML parser (js-yaml) did not load. Check your network connection.');

            const response = await fetch(CONTENT_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Could not load ${CONTENT_URL} (HTTP ${response.status}).`);

            const data = window.jsyaml.load(await response.text());
            if (!data || typeof data !== 'object') throw new Error(`${CONTENT_URL} is empty or malformed.`);

            render(data);
            if (typeof window.initDeck === 'function') window.initDeck();
        } catch (error) {
            const box = document.getElementById('load-error');
            if (box) {
                box.hidden = false;
                box.innerHTML = `<strong>Content template could not be loaded.</strong>
          <span>${escapeHtml(error.message)}</span>
          <span>Serve the site over HTTP (e.g. <code>python -m http.server</code>) — opening index.html directly as a file blocks YAML loading.</span>`;
            }
            console.error(error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
