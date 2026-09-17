/* ============================================================
   ALDO RIZKIAWAN — Resume Website JS
   - Intersection Observer scroll reveal
   - Active nav link highlighting
   ============================================================ */

// ── Scroll Reveal ──────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // animate once
            }
        });
    },
    { threshold: 0.12 }
);

reveals.forEach((el) => observer.observe(el));

// ── Active Nav Link on Scroll ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    link.style.color = link.getAttribute('href') === `#${id}`
                        ? 'var(--accent-1)'
                        : '';
                });
            }
        });
    },
    { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => navObserver.observe(section));

// ── Navbar background on scroll ───────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.style.background = 'rgba(8,9,26,0.92)';
        navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
    } else {
        navbar.style.background = 'rgba(8,9,26,0.7)';
        navbar.style.boxShadow = 'none';
    }
}, { passive: true });
