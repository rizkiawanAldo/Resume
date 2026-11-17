/* ============================================================
   ALDO RIZKIAWAN — OBSIDIAN DECK ENGINE
   Reads the rendered DOM (built from content/master.yaml by render.js)
   and wires up navigation, theme, CLI and lightbox.
   No content lives in this file — edit content/master.yaml instead.
   ============================================================ */

window.initDeck = function initDeck() {
    'use strict';

    const data = window.SITE_DATA || {};

    // ── Theme Toggle ──────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });
    }

    function updateThemeIcons(theme) {
        if (!iconSun || !iconMoon) return;
        if (theme === 'dark') {
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        } else {
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
        }
    }

    // ── Slide engine ──────────────────────────────────────────
    const slides = Array.from(document.querySelectorAll('.slide'));
    const navItems = document.querySelectorAll('.nav-item');
    const dots = document.querySelectorAll('.dot');
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    const totalSlides = slides.length;
    let currentSlide = 0;

    // Hash routes are derived from the slide ids in the YAML, so adding or
    // reordering slides needs no JS changes.
    const hashToSlide = {};
    const slideToHash = [];
    slides.forEach((slide, i) => {
        hashToSlide[`#${slide.id}`] = i;
        slideToHash[i] = `#${slide.id}`;
    });

    function slideIndexById(id) {
        return slides.findIndex((slide) => slide.id === id);
    }

    if (totalSlidesEl) {
        totalSlidesEl.textContent = String(totalSlides).padStart(2, '0');
    }

    function goToSlide(index, updateHash = true) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentSlide = index;

        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.add('active');
                slide.scrollTop = 0;
                // Programmatically focus the slide so arrow keys scroll it immediately
                slide.setAttribute('tabindex', '-1');
                setTimeout(() => slide.focus({ preventScroll: true }), 50);
            } else {
                slide.classList.remove('active');
                slide.removeAttribute('tabindex');
            }
        });

        navItems.forEach((item, i) => item.classList.toggle('active', i === currentSlide));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));

        if (currentSlideEl) {
            currentSlideEl.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
        if (nextBtn) nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.4' : '1';

        if (updateHash && slideToHash[currentSlide]) {
            history.replaceState(null, null, slideToHash[currentSlide]);
        }
    }

    // Hash routing
    const initialHash = window.location.hash;
    if (initialHash && hashToSlide[initialHash] !== undefined) {
        goToSlide(hashToSlide[initialHash], false);
    } else {
        goToSlide(0, false);
    }

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash && hashToSlide[hash] !== undefined) {
            goToSlide(hashToSlide[hash], false);
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.querySelectorAll('[data-slide]').forEach((el) => {
        el.addEventListener('click', () => {
            const slideIndex = parseInt(el.getAttribute('data-slide'), 10);
            if (!isNaN(slideIndex)) goToSlide(slideIndex);
        });
    });

    document.querySelectorAll('.next-slide-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.getAttribute('data-target'), 10);
            if (!isNaN(target)) goToSlide(target);
            else goToSlide(currentSlide + 1);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        const modal = document.getElementById('lightbox-modal');
        if (modal && modal.classList.contains('open')) return;

        if (e.key === 'ArrowRight') {
            goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
        }
    });

    // ── Developer CLI Terminal (content read from the YAML) ────
    const cliModal = document.getElementById('cli-modal');
    const terminalTrigger = document.getElementById('terminal-trigger');
    const heroCliBtn = document.getElementById('hero-cli-btn');
    const cliClose = document.getElementById('cli-close');
    const cliOverlay = document.getElementById('cli-overlay');
    const cliInput = document.getElementById('cli-input');
    const cliScreen = document.getElementById('cli-screen');
    const cliChips = document.querySelectorAll('.cli-chip');

    function openCli() {
        if (!cliModal) return;
        cliModal.classList.add('open');
        setTimeout(() => {
            if (cliInput) cliInput.focus();
        }, 100);
    }

    function closeCli() {
        if (cliModal) cliModal.classList.remove('open');
    }

    if (terminalTrigger) terminalTrigger.addEventListener('click', openCli);
    if (heroCliBtn) heroCliBtn.addEventListener('click', openCli);
    if (cliClose) cliClose.addEventListener('click', closeCli);
    if (cliOverlay) cliOverlay.addEventListener('click', closeCli);

    document.addEventListener('click', (e) => {
        const cliBtn = e.target.closest('#terminal-trigger, #hero-cli-btn, .btn-terminal, .terminal-trigger-btn');
        if (cliBtn) {
            e.preventDefault();
            openCli();
        }
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && cliModal) {
            e.preventDefault();
            if (cliModal.classList.contains('open')) closeCli();
            else openCli();
        }
    });

    function appendCliLine(text, type = 'normal') {
        if (!cliScreen) return;
        const line = document.createElement('div');
        line.className = `cli-line ${type}`;
        line.innerHTML = text;
        cliScreen.appendChild(line);
        cliScreen.scrollTop = cliScreen.scrollHeight;
    }

    const escapeCli = (value) => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const experienceList = Array.isArray(data.experience) ? data.experience : [];
    const projectList = Array.isArray(data.projects) ? data.projects : [];
    const skills = data.skills || {};
    const skillsDisplay = Array.isArray(data.skills_display) ? data.skills_display : [];

    function findExperience(command) {
        return experienceList.find((job) => {
            const alias = (job.cli_alias || '').toLowerCase();
            const company = (job.company || '').toLowerCase();
            return alias === command || company === command || company.startsWith(command);
        });
    }

    function experienceReport(job) {
        const lines = [
            `[${escapeCli((job.company || '').toUpperCase())} HIGHLIGHTS]`,
            `- Role: ${escapeCli(job.role)} | ${escapeCli(job.start_date)} - ${escapeCli(job.end_date)}`
        ];
        (job.bullets || []).forEach((bullet) => {
            const label = bullet.title ? `${escapeCli(bullet.title)} — ` : '';
            lines.push(`- ${label}${escapeCli(bullet.text)}`);
        });
        return lines.join('\n');
    }

    function stackReport() {
        if (!skillsDisplay.length) {
            return Object.keys(skills)
                .map((key) => `${escapeCli(key)}: ${(skills[key] || []).map(escapeCli).join(', ')}`)
                .join('\n');
        }
        return skillsDisplay.map((group) => {
            const items = skills[group.key] || [];
            return `${escapeCli(group.label)}: ${items.map(escapeCli).join(', ')}`;
        }).filter(Boolean).join('\n');
    }

    function helpReport() {
        const lines = ['Available commands:'];
        experienceList.forEach((job) => {
            const alias = job.cli_alias || (job.company || '').toLowerCase();
            lines.push(`  <span class="cmd-res">${escapeCli(alias)}</span>  - ${escapeCli(job.company)} engineering highlights`);
        });
        lines.push('  <span class="cmd-res">stack</span>      - View tech stack pills');
        lines.push('  <span class="cmd-res">projects</span>   - View featured projects');
        lines.push('  <span class="cmd-res">photos</span>     - Jump to Photography slide');
        lines.push('  <span class="cmd-res">contact</span>    - Jump to Contact slide');
        lines.push('  <span class="cmd-res">clear</span>      - Clear terminal output');
        return lines.join('\n');
    }

    function processCommand(cmdStr) {
        const cmd = cmdStr.trim().toLowerCase();
        if (!cmd) return;

        appendCliLine(`<span class="cli-prompt">aldo@system:~$</span> <span class="cmd-text">${escapeCli(cmdStr)}</span>`);

        if (cmd === 'help') {
            appendCliLine(helpReport(), 'muted');
            return;
        }

        if (cmd === 'clear') {
            if (cliScreen) cliScreen.innerHTML = '';
            return;
        }

        if (cmd === 'stack') {
            appendCliLine(`[TECH STACK]\n${stackReport()}`, 'cmd-res');
            return;
        }

        if (cmd === 'projects') {
            const lines = ['[FEATURED PROJECTS]'];
            projectList.forEach((project, i) => {
                lines.push(`${i + 1}. ${escapeCli(project.name)} — ${escapeCli(project.description)}`);
            });
            appendCliLine(lines.join('\n'), 'cmd-res');
            return;
        }

        if (['photos', 'photography', 'xenosu', 'xenosumedia'].includes(cmd)) {
            appendCliLine('Navigating to Photography slide...', 'cmd-res');
            closeCli();
            goToSlide(slideIndexById('photography'));
            return;
        }

        if (['contact', 'email'].includes(cmd)) {
            appendCliLine('Navigating to Contact slide...', 'cmd-res');
            closeCli();
            goToSlide(slideIndexById('contact'));
            return;
        }

        const job = findExperience(cmd);
        if (job) {
            appendCliLine(experienceReport(job), 'cmd-res');
            return;
        }

        appendCliLine(`command not found: ${escapeCli(cmdStr)}. Type <span class="cmd-text">help</span> for commands.`, 'muted');
    }

    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = cliInput.value;
                cliInput.value = '';
                processCommand(val);
            }
        });
    }

    cliChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-cmd');
            if (cmd) processCommand(cmd);
        });
    });

    // ── Photography Lightbox Modal ─────────────────────────────
    // Photo list is built from the DOM, which render.js fills from the YAML.
    function buildPhotoList() {
        const camera = (data.photography || {}).camera || 'Photography';
        return Array.from(document.querySelectorAll('.photo-thumb[data-photo]')).map((thumb) => {
            const img = thumb.querySelector('img');
            const title = thumb.querySelector('.photo-thumb-title');
            return {
                src: img ? img.src : '',
                title: title ? title.textContent : '',
                exif: `📷 ${camera} · Xenosumedia`
            };
        });
    }

    let currentPhotoIndex = 0;
    const modal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxExif = document.getElementById('lightbox-exif');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    function updateLightboxContent(photos) {
        const list = photos || buildPhotoList();
        const photo = list[currentPhotoIndex];
        if (!photo || !lightboxImg) return;
        lightboxImg.src = photo.src;
        if (lightboxTitle) lightboxTitle.textContent = photo.title;
        if (lightboxExif) lightboxExif.textContent = photo.exif;
        if (lightboxCounter) lightboxCounter.textContent = `Photo ${currentPhotoIndex + 1} of ${list.length}`;
    }

    function openLightbox(index) {
        currentPhotoIndex = Math.max(0, Math.min(index, buildPhotoList().length - 1));
        updateLightboxContent();
        if (modal) modal.classList.add('open');
    }

    function closeLightbox() {
        if (modal) modal.classList.remove('open');
    }

    document.addEventListener('click', (e) => {
        const thumb = e.target.closest('.photo-thumb[data-photo]');
        if (thumb) {
            const idx = parseInt(thumb.getAttribute('data-photo'), 10);
            if (!isNaN(idx)) openLightbox(idx);
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

    function stepLightbox(delta) {
        const photos = buildPhotoList();
        if (!photos.length) return;
        currentPhotoIndex = (currentPhotoIndex + delta + photos.length) % photos.length;
        updateLightboxContent(photos);
    }

    if (lightboxPrev) lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => stepLightbox(1));

    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });

    // ── Contact form (client-side only) ────────────────────────
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (formStatus) {
                formStatus.textContent = '✓ Thank you! Message dispatched successfully.';
                contactForm.reset();
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }
        });
    }
};
