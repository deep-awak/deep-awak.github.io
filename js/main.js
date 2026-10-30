(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const pad = (n) => String(n).padStart(2, '0');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Projets proposés pour un sprint personnel de 7 jours.
    // Ils restent "à construire" tant que les dépôts, tests et démonstrations ne sont pas publiés.
    const PROJECTS = [
        {
            title: 'Linux Pulse', status: 'À construire · Jour 1',
            grad: 'linear-gradient(135deg,#111827 0%,#374151 55%,#FF5722 100%)',
            image: './assets/media/images/projet_1.png',
            synopsis: 'Un script Bash qui collecte les informations essentielles d’une machine Linux : charge CPU, mémoire, espace disque, uptime et état de quelques services. Il génère un rapport lisible dans le terminal et dans un fichier.',
            goal: 'Livrable de la semaine : script documenté, exemples de sortie, gestion des erreurs et instructions pour le lancer.',
            stack: ['Linux', 'Bash', 'ShellCheck', 'Git'],
            demo: null, code: 'https://github.com/Deep-awak'
        },
        {
            title: 'Containerized API', status: 'À construire · Jours 2–3',
            grad: 'linear-gradient(135deg,#0F766E 0%,#164E63 55%,#111827 100%)',
            image: './assets/media/images/projet_5.png',
            synopsis: 'Une petite API FastAPI avec un endpoint /health, des tests automatisés et une configuration Docker. L’objectif est de comprendre le cycle complet : construire une image, lancer un conteneur, lire les logs et vérifier la disponibilité du service.',
            goal: 'Livrable de la semaine : API fonctionnelle, Dockerfile, tests pytest et guide de démarrage local.',
            stack: ['Python', 'FastAPI', 'Docker', 'pytest'],
            demo: null, code: 'https://github.com/Deep-awak'
        },
        {
            title: 'CI Pipeline', status: 'À construire · Jour 4',
            grad: 'linear-gradient(135deg,#1D4ED8 0%,#312E81 55%,#111827 100%)',
            image: './assets/media/images/projet_10.png',
            synopsis: 'Une pipeline GitHub Actions déclenchée à chaque push et pull request. Elle installe les dépendances, exécute les tests et vérifie automatiquement que le projet peut être construit.',
            goal: 'Livrable de la semaine : workflow YAML, exécution réussie visible dans GitHub Actions et scénario de test volontairement en échec.',
            stack: ['GitHub Actions', 'YAML', 'Python', 'pytest'],
            demo: null, code: 'https://github.com/Deep-awak'
        },
        {
            title: 'Config Guard', status: 'À construire · Jours 5–7',
            grad: 'linear-gradient(135deg,#7C2D12 0%,#EA580C 48%,#111827 100%)',
            image: './assets/media/images/projet_9.png',
            synopsis: 'Un premier analyseur Python qui inspecte un Dockerfile et un package.json pour repérer quelques configurations risquées clairement définies. Il affiche les constats, leur niveau de gravité et des pistes de correction.',
            goal: 'Livrable de la semaine : MVP avec règles explicites, jeux de fichiers de test, rapport terminal et README. Ce projet pourra ensuite évoluer vers un outil DevSecOps plus complet.',
            stack: ['Python', 'JSON', 'Dockerfile', 'pytest'],
            demo: null, code: 'https://github.com/Deep-awak'
        }
    ];

    const thumbs = $('#thumbs');
    if (!thumbs) return;

    const SPANS = ['md:col-span-2', 'md:col-span-2', 'md:col-span-1', 'md:col-span-1'];
    thumbs.innerHTML = PROJECTS.map((p, i) => `
        <button type="button" data-index="${i}" aria-label="Afficher ${p.title}"
          class="thumb group relative h-36 overflow-hidden rounded-2xl text-left md:h-44 ${SPANS[i]}">
          <span class="zoom absolute inset-0" style="background:${p.grad}">${p.image ? `<img src="${p.image}" alt="" loading="lazy" class="h-full w-full object-cover">` : ''}</span>
          <span class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></span>
          <span class="absolute left-3 top-3 rounded-full bg-white/15 px-2 py-1 text-[10px] font-black text-white backdrop-blur">${pad(i + 1)}</span>
          <span class="absolute inset-x-3 bottom-3 text-sm font-bold leading-tight text-white">${p.title}</span>
        </button>`).join('');

    let current = 0;

    function renderFeatured(index) {
        current = (index + PROJECTS.length) % PROJECTS.length;
        const p = PROJECTS[current];

        $('#featBg').style.background = p.image
            ? `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 60%), url('${p.image}') center / cover no-repeat`
            : p.grad;
        $('#featStatus').textContent = p.status;
        $('#featTitle').textContent = p.title;
        $('#featTitleOverlay').textContent = p.title;
        $('#counter').textContent = pad(current + 1);
        $('#counterTotal').textContent = pad(PROJECTS.length);
        $('#rank').textContent = 'SPRINT 01';
        $('#featStars').textContent = 'PROJET PERSONNEL';
        $('#featStars').setAttribute('aria-label', 'Projet personnel à réaliser');
        $('#featSynopsis').textContent = p.synopsis;
        $('#featGoal').textContent = p.goal;
        $('#featStack').innerHTML = p.stack
            .map((t) => `<li class="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold">${t}</li>`)
            .join('');

        const demo = $('#featDemo');
        demo.href = p.demo || '#projets';
        demo.textContent = p.demo ? 'VOIR LA DÉMO' : 'DÉMO À VENIR';
        demo.setAttribute('aria-disabled', p.demo ? 'false' : 'true');
        demo.classList.toggle('opacity-60', !p.demo);
        demo.classList.toggle('pointer-events-none', !p.demo);

        $('#featPlay').href = p.demo || '#projets';
        $('#featPlay').setAttribute('aria-label', p.demo ? 'Voir la démonstration' : 'Démonstration à venir');
        $('#featPlay').classList.toggle('opacity-50', !p.demo);
        $('#featCode').href = p.code;

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

    thumbs.addEventListener('click', (e) => {
        const btn = e.target.closest('.thumb');
        if (btn) renderFeatured(Number(btn.dataset.index));
    });
    $('#prevBtn')?.addEventListener('click', () => renderFeatured(current - 1));
    $('#nextBtn')?.addEventListener('click', () => renderFeatured(current + 1));

    $('#favBtn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        btn.textContent = on ? '♥' : '♡';
        btn.classList.toggle('text-brand', on);
        btn.classList.toggle('border-brand', on);
    });

    renderFeatured(0);

    // Apparition progressive au scroll.
    const revealItems = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach((el) => io.observe(el));
    } else {
        revealItems.forEach((el) => el.classList.add('is-visible'));
    }

    // Ombre du header au scroll.
    const header = $('#header');
    const onScroll = () => header?.classList.toggle('shadow-md', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu mobile.
    const menuToggle = $('#menuToggle');
    const mobileMenu = $('#mobileMenu');
    menuToggle?.addEventListener('click', () => {
        const open = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', !open);
        menuToggle.setAttribute('aria-expanded', String(open));
    });
    $$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuToggle?.setAttribute('aria-expanded', 'false');
    }));

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
})();