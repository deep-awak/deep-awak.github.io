(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const pad = (n) => String(n).padStart(2, '0');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const DEFAULT_GRAD = 'linear-gradient(135deg,#FF5722 0%,#FF8A65 45%,#263238 100%)';
    const SPANS = ['md:col-span-2', 'md:col-span-2', 'md:col-span-1', 'md:col-span-1'];
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    let PROJECTS = [];
    let current = 0;

    // Charge les projets publiés depuis data/projects.json (géré par l'admin).
    async function loadProjects() {
        const res = await fetch('./data/projects.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`projects.json : HTTP ${res.status}`);
        const data = await res.json();
        return (data.projects || [])
            .filter((p) => p.visible !== false)
            .map((p) => ({
                title: p.title || 'Sans titre',
                status: p.status || '',
                image: p.cover || '',
                synopsis: p.description || '',
                goal: p.goal || '',
                stack: Array.isArray(p.stack) ? p.stack : [],
                demo: p.demo || '',
                code: p.repo || ''
            }));
    }

    function renderThumbs() {
        $('#thumbs').innerHTML = PROJECTS.map((p, i) => `
        <button type="button" data-index="${i}" aria-label="Afficher ${esc(p.title)}"
          class="thumb group relative h-36 overflow-hidden rounded-2xl text-left md:h-44 ${SPANS[i % SPANS.length]}">
          <span class="zoom absolute inset-0" style="background:${DEFAULT_GRAD}">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" class="h-full w-full object-cover">` : ''}</span>
          <span class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></span>
          <span class="absolute left-3 top-3 rounded-full bg-white/15 px-2 py-1 text-[10px] font-black text-white backdrop-blur">${pad(i + 1)}</span>
          <span class="absolute inset-x-3 bottom-3 text-sm font-bold leading-tight text-white">${esc(p.title)}</span>
        </button>`).join('');
    }

    function renderFeatured(index) {
        current = (index + PROJECTS.length) % PROJECTS.length;
        const p = PROJECTS[current];

        $('#featBg').style.background = p.image
            ? `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 60%), url('${p.image}') center / cover no-repeat`
            : DEFAULT_GRAD;

        const status = $('#featStatus');
        status.textContent = p.status;
        status.style.display = p.status ? '' : 'none';

        $('#featTitle').textContent = p.title;
        $('#featTitleOverlay').textContent = p.title;
        $('#counter').textContent = pad(current + 1);
        $('#counterTotal').textContent = pad(PROJECTS.length);
        $('#rank').textContent = `#${current + 1}`;
        $('#featSynopsis').textContent = p.synopsis;
        $('#featGoal').textContent = p.goal;
        $('#featStack').innerHTML = p.stack
            .map((t) => `<li class="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold">${esc(t)}</li>`)
            .join('');

        // Bouton « démo » : visible seulement si une démo existe
        const demo = $('#featDemo');
        if (p.demo) {
            demo.href = p.demo;
            demo.target = '_blank';
            demo.rel = 'noopener';
            demo.innerHTML = '<span aria-hidden="true">►</span> VOIR LA DÉMO';
            demo.style.display = '';
        } else {
            demo.style.display = 'none';
        }

        // Bouton principal : ouvre le dépôt GitHub du projet
        const play = $('#featPlay');
        play.href = p.code || '#projets';
        play.target = '_blank';
        play.rel = 'noopener';
        play.setAttribute('aria-label', `Voir ${p.title} sur GitHub`);
        play.title = 'Voir le projet sur GitHub';

        const code = $('#featCode');
        code.href = p.code || '#projets';
        code.style.display = p.code ? '' : 'none';

        const fav = $('#favBtn');
        if (fav) {
            fav.setAttribute('aria-pressed', 'false');
            fav.textContent = '♡';
        }

        $$('.thumb').forEach((el, i) => {
            const active = i === current;
            el.classList.toggle('is-active', active);
            el.setAttribute('aria-current', active ? 'true' : 'false');
        });
    }

    function setupCarousel() {
        $('#thumbs').addEventListener('click', (e) => {
            const btn = e.target.closest('.thumb');
            if (btn) renderFeatured(Number(btn.dataset.index));
        });
        $('#prevBtn')?.addEventListener('click', () => renderFeatured(current - 1));
        $('#nextBtn')?.addEventListener('click', () => renderFeatured(current + 1));
    }

    function setupFavorite() {
        $('#favBtn')?.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const on = btn.getAttribute('aria-pressed') !== 'true';
            btn.setAttribute('aria-pressed', String(on));
            btn.textContent = on ? '♥' : '♡';
            btn.classList.toggle('text-brand', on);
            btn.classList.toggle('border-brand', on);
        });
    }

    async function initProjects() {
        try {
            PROJECTS = await loadProjects();
        } catch (err) {
            console.error(err);
            PROJECTS = [];
        }

        if (PROJECTS.length === 0) {
            $('#featSynopsis').textContent = 'Les projets seront bientôt publiés.';
            $('#featGoal').textContent = '';
            $('#thumbs').innerHTML = '';
            $('#counter').textContent = '00';
            $('#counterTotal').textContent = '00';
            return;
        }

        renderThumbs();
        renderFeatured(0);
    }

    // Apparition progressive au scroll
    function setupReveal() {
        const items = $$('.reveal');
        if (!('IntersectionObserver' in window) || reduceMotion) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach((el) => io.observe(el));
    }

    // Ombre du header au scroll
    function setupHeader() {
        const header = $('#header');
        const onScroll = () => header?.classList.toggle('shadow-md', window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Menu mobile
    function setupMenu() {
        const toggle = $('#menuToggle');
        const menu = $('#mobileMenu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', () => {
            const open = menu.classList.contains('hidden');
            menu.classList.toggle('hidden', !open);
            toggle.setAttribute('aria-expanded', String(open));
        });
        $$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => {
            menu.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
        }));
    }

    setupCarousel();
    setupFavorite();
    setupReveal();
    setupHeader();
    setupMenu();
    initProjects();

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
})();
