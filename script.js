/* ============================================================
   ALDO RIZKIAWAN — OBSIDIAN DECK & DEVELOPER CLI ENGINE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Theme Toggle ──────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');

    // Retrieve saved theme or default to light
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

    // ── Intersection Observer for animations ─────────────────────────────────
    const slides = Array.from(document.querySelectorAll('.slide'));
    const navItems = document.querySelectorAll('.nav-item');
    const dots = document.querySelectorAll('.dot');
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    const totalSlides = slides.length;
    let currentSlide = 0;

    const hashToSlide = {
        '#intro': 0,
        '#about': 1,
        '#experience': 2,
        '#summary': 3,
        '#projects': 4,
        '#photography': 5,
        '#contact': 6
    };

    const slideToHash = ['#intro', '#about', '#experience', '#summary', '#projects', '#photography', '#contact'];

    if (totalSlidesEl) {
        totalSlidesEl.textContent = String(totalSlides).padStart(2, '0');
    }

    // ── Slide Engine ──────────────────────────────────────────
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

        navItems.forEach((item, i) => {
            item.classList.toggle('active', i === currentSlide);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });

        if (currentSlideEl) {
            currentSlideEl.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
        if (nextBtn) nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.4' : '1';

        if (updateHash && slideToHash[currentSlide]) {
            history.replaceState(null, null, slideToHash[currentSlide]);
        }
    }

    // Hash Routing
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (document.getElementById('lightbox-modal').classList.contains('open')) return;

        if (e.key === 'ArrowRight') {
            goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
        }
    });

    // ── Persona Switcher Filter ────────────────────────────────
    const personaBtns = document.querySelectorAll('.persona-btn');
    const personaItems = document.querySelectorAll('.persona-item');

    personaBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const persona = btn.getAttribute('data-persona');
            personaBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            personaItems.forEach((item) => {
                if (persona === 'all') {
                    item.style.opacity = '1';
                    item.style.filter = 'none';
                } else if (item.classList.contains(persona)) {
                    item.style.opacity = '1';
                    item.style.filter = 'none';
                } else {
                    item.style.opacity = '0.3';
                    item.style.filter = 'grayscale(80%)';
                }
            });
        });
    });

    // ── Developer CLI Terminal Modal ───────────────────────────
    const cliModal = document.getElementById('cli-modal');
    const terminalTrigger = document.getElementById('terminal-trigger');
    const heroCliBtn = document.getElementById('hero-cli-btn');
    const cliClose = document.getElementById('cli-close');
    const cliOverlay = document.getElementById('cli-overlay');
    const cliInput = document.getElementById('cli-input');
    const cliScreen = document.getElementById('cli-screen');
    const cliChips = document.querySelectorAll('.cli-chip');

    function openCli() {
        if (cliModal) {
            cliModal.classList.add('open');
            setTimeout(() => {
                if (cliInput) cliInput.focus();
            }, 100);
        }
    }

    function closeCli() {
        if (cliModal) cliModal.classList.remove('open');
    }

    if (terminalTrigger) terminalTrigger.addEventListener('click', openCli);
    if (heroCliBtn) heroCliBtn.addEventListener('click', openCli);
    if (cliClose) cliClose.addEventListener('click', closeCli);
    if (cliOverlay) cliOverlay.addEventListener('click', closeCli);

    // Global event delegation for any CLI trigger buttons
    document.addEventListener('click', (e) => {
        const cliBtn = e.target.closest('#terminal-trigger, #hero-cli-btn, .btn-terminal, .terminal-trigger-btn');
        if (cliBtn) {
            e.preventDefault();
            openCli();
        }
    });

    // Ctrl + K keyboard shortcut for terminal launch
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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

    function processCommand(cmdStr) {
        const cmd = cmdStr.trim().toLowerCase();
        if (!cmd) return;

        appendCliLine(`<span class="cli-prompt">aldo@system:~$</span> <span class="cmd-text">${cmdStr}</span>`);

        switch (cmd) {
            case 'help':
                appendCliLine(`Available commands:
  <span class="cmd-res">grab</span>       - View Grab engineering highlights & Ride Cover Plus
  <span class="cmd-res">tokopedia</span>  - View Tokopedia Account Security & Golang fraud engine
  <span class="cmd-res">eximbank</span>   - View EximBank document workflow app
  <span class="cmd-res">stack</span>      - View tech stack pills
  <span class="cmd-res">projects</span>   - View Xenosu Media & Image Reducer
  <span class="cmd-res">photos</span>     - Jump to Photography slide (#5)
  <span class="cmd-res">contact</span>    - Jump to Contact slide (#6)
  <span class="cmd-res">clear</span>      - Clear terminal output`, 'muted');
                break;

            case 'grab':
                appendCliLine(`[GRAB HIGHLIGHTS]
- Role: Software Engineer (Fullstack & Backend) | Apr 2024 - Present
- Launch: Ride Cover Plus in Philippines (~31k txns in 2 weeks)
- Founding Engineer: Grab Technical Documentation Site (Hugo, MCP AI search)
- Automation: Content-to-dev sync platform & Service Entity Catalog`, 'cmd-res');
                break;

            case 'tokopedia':
                appendCliLine(`[TOKOPEDIA HIGHLIGHTS]
- Role: Software Engineer (Backend - Account Security) | Sep 2021 - Apr 2024
- Engine: Real-time fraud detection pipeline in Golang, Redis, Postgres, Neo4j
- Savings: ~120 Million IDR saved monthly for Tokopedia users
- Admin Console: ReactJS risk dashboard reducing manual work by 90%`, 'cmd-res');
                break;

            case 'eximbank':
                appendCliLine(`[EXIMBANK HIGHLIGHTS]
- Role: Software Engineer (Fullstack) | Jun 2019 - Sep 2021
- Built enterprise paperless approval workflow & PLN export insurance portal`, 'cmd-res');
                break;

            case 'stack':
                appendCliLine(`[TECH STACK]
Languages: Golang, C#, Python, Java Spring, SQL
Infra & DB: Redis, PostgreSQL, Neo4j, Kubernetes, AWS, Docker, Hugo, MCP`, 'cmd-res');
                break;

            case 'projects':
                appendCliLine(`[FEATURED PROJECTS]
1. Xenosu Media — Photography Portfolio Website
2. Image Reducer — Privacy-first browser image compressor (<1 MB)
3. Brightness Bridge — Windows monitor brightness utility`, 'cmd-res');
                break;

            case 'photos':
            case 'photography':
            case 'xenosu':
                appendCliLine(`Navigating to Photography slide...`, 'cmd-res');
                closeCli();
                goToSlide(5);
                break;

            case 'contact':
            case 'email':
                appendCliLine(`Navigating to Contact slide...`, 'cmd-res');
                closeCli();
                goToSlide(6);
                break;

            case 'clear':
                if (cliScreen) cliScreen.innerHTML = '';
                break;

            default:
                appendCliLine(`command not found: ${cmdStr}. Type <span class="cmd-text">help</span> for commands.`, 'muted');
                break;
        }
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
    // Build photo list entirely from the DOM — guaranteed to stay in sync
    function buildPhotoList() {
        return Array.from(document.querySelectorAll('.photo-thumb[data-photo]')).map(thumb => {
            const img = thumb.querySelector('img');
            const title = thumb.querySelector('.photo-thumb-title');
            return {
                src: img ? img.src : '',
                title: title ? title.textContent : '',
                exif: '📷 Sony A7C · Xenosu Media'
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

    function openLightbox(index) {
        const photos = buildPhotoList();
        currentPhotoIndex = Math.max(0, Math.min(index, photos.length - 1));
        updateLightboxContent(photos);
        modal.classList.add('open');
    }

    function closeLightbox() {
        modal.classList.remove('open');
    }

    function updateLightboxContent(photos) {
        if (!photos) photos = buildPhotoList();
        const photo = photos[currentPhotoIndex];
        if (photo && lightboxImg) {
            lightboxImg.src = photo.src;
            lightboxTitle.textContent = photo.title;
            if (lightboxExif) lightboxExif.textContent = photo.exif;
            if (lightboxCounter) lightboxCounter.textContent = `Photo ${currentPhotoIndex + 1} of ${photos.length}`;
        }
    }

    // Click on any part of a thumbnail → open its image
    document.addEventListener('click', (e) => {
        const thumb = e.target.closest('.photo-thumb[data-photo]');
        if (thumb) {
            const idx = parseInt(thumb.getAttribute('data-photo'), 10);
            if (!isNaN(idx)) openLightbox(idx);
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            const photos = buildPhotoList();
            currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
            updateLightboxContent(photos);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            const photos = buildPhotoList();
            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
            updateLightboxContent(photos);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
                updateLightboxContent();
            }
            if (e.key === 'ArrowRight') {
                currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
                updateLightboxContent();
            }
        }
    });

    // Contact Form Interception
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
});
