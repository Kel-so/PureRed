// Páginas de nicho (filmmaker.html, games.html, ...): mini-portfólios com
// estilo próprio que o admin envia para clientes. Cada página só define
// <body data-niche="...">; textos vêm do niches.json e os projetos do
// projects.json (campo `niches`, com fallback por subcategoria).
(() => {
  const WHATSAPP = '5514991223598';
  const params = new URLSearchParams(location.search);
  const LANG = params.get('lang') === 'en' ? 'en' : 'pt';
  const NICHE = document.body.dataset.niche;
  const app = document.getElementById('app');

  const STRINGS = {
    pt: {
      works: 'Trabalhos selecionados', worksShort: 'Trabalhos', shortForm: 'Short form',
      services: 'Serviços', gallery: 'Galeria', all: 'Todas',
      watch: 'Assistir completo', watchFilm: 'Assistir filme completo',
      seeWorks: 'Ver trabalhos', fullPortfolio: 'Ver portfólio completo',
      close: 'Fechar', before: 'Antes', after: 'Depois', projects: 'projetos',
      error: 'Não foi possível carregar esta página. Tente recarregar.',
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    },
    en: {
      works: 'Selected work', worksShort: 'Work', shortForm: 'Short form',
      services: 'Services', gallery: 'Gallery', all: 'All',
      watch: 'Watch full video', watchFilm: 'Watch the full film',
      seeWorks: 'See work', fullPortfolio: 'See full portfolio',
      close: 'Close', before: 'Before', after: 'After', projects: 'projects',
      error: 'This page could not be loaded. Try refreshing.',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  }[LANG];

  const SUBCATS = {
    gaming: 'Gaming', samedayedit: 'Same Day Edit', aftermovie: 'Aftermovie',
    esportes: LANG === 'en' ? 'Sports' : 'Esportes', podcast: 'Podcast',
    motion: 'Motion', design: 'Design', automotivo: LANG === 'en' ? 'Automotive' : 'Automotivo',
    moda: LANG === 'en' ? 'Fashion' : 'Moda', fotografia: LANG === 'en' ? 'Photography' : 'Fotografia',
    outros: LANG === 'en' ? 'Other' : 'Outros'
  };

  /* ---------- Helpers ---------- */

  function t(field) {
    if (field == null) return '';
    if (typeof field === 'object' && !Array.isArray(field)) return field[LANG] ?? field.pt ?? '';
    return field;
  }

  function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const langHref = () => location.pathname.split('/').pop() + (LANG === 'en' ? '' : '?lang=en');
  const langLabel = LANG === 'en' ? 'PT' : 'EN';
  const portfolioHref = LANG === 'en' ? 'index-en.html' : 'index.html';

  const isVertical = (p) => p.type !== 'image' && p.orientation === 'vertical';
  const isHorizontal = (p) => p.type !== 'image' && p.orientation !== 'vertical';
  const thumb = (p) => p.thumbnailUrl || p.imageUrl || '';

  function aspectOf(p) {
    if (p.type === 'image') return p.aspect || 0.8;
    return p.orientation === 'vertical' ? 9 / 16 : 16 / 9;
  }

  function year(p) {
    return (p.date || '').split('-')[0] || '';
  }

  function metaLine(p) {
    return [SUBCATS[p.subcategory] || '', year(p)].filter(Boolean).join(' · ');
  }

  // Miniatura com preview em loop por cima (o vídeo só carrega quando
  // chega perto da tela e só aparece depois de começar a tocar)
  function media(p, { play = 'hover', extraClass = '', ratio = true } = {}) {
    const style = ratio ? ` style="aspect-ratio:${aspectOf(p)}"` : '';
    const img = `<img src="${esc(thumb(p))}" alt="${esc(t(p.title))}" loading="lazy" decoding="async">`;
    const video = p.previewUrl && p.type !== 'image'
      ? `<video muted loop playsinline preload="none" data-src="${esc(p.previewUrl)}" data-play="${play}"></video>`
      : '';
    return `<div class="n-media ${extraClass}"${style}>${img}${video}</div>`;
  }

  /* ---------- Carregamento ---------- */

  async function init() {
    try {
      const [nichesRes, projectsRes] = await Promise.all([
        fetch('niches.json?t=' + Date.now()),
        fetch('projects.json?t=' + Date.now())
      ]);
      if (!nichesRes.ok || !projectsRes.ok) throw new Error('fetch');
      const niches = await nichesRes.json();
      const all = await projectsRes.json();
      const cfg = niches[NICHE];
      if (!cfg) throw new Error('niche');

      const projects = all
        .filter(p => {
          const list = Array.isArray(p.niches) ? p.niches : (cfg.autoSubcategories || []).includes(p.subcategory) ? [NICHE] : [];
          return list.includes(NICHE);
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      document.documentElement.lang = LANG === 'en' ? 'en' : 'pt-BR';
      document.title = `Kelson Budin — ${t(cfg.label)}`;

      const render = RENDERERS[cfg.style];
      app.innerHTML = render(cfg, projects);
      app.classList.remove('n-loading');
      setupVideos(app);
      setupJustified(app);
      setupOpeners(app, all);
      if (cfg.style === 'broadcast') setupBroadcast(app);
      if (cfg.style === 'galeria') setupGaleria(app);
    } catch (err) {
      console.error(err);
      app.classList.remove('n-loading');
      app.innerHTML = `<p class="n-error">${STRINGS.error}</p>`;
    }
  }

  function pickHero(cfg, projects) {
    const ids = cfg.hero || [];
    const hero = ids.map(id => projects.find(p => p.id === id)).filter(Boolean);
    return hero.length ? hero : projects.slice(0, 1);
  }

  const footer = (cls) => `
    <footer class="${cls}">
      <span>© ${new Date().getFullYear()} PureRed · Kelson Budin · Londrina-PR</span>
      <a href="${portfolioHref}">${STRINGS.fullPortfolio} →</a>
    </footer>`;

  /* ---------- Estilo 1: Rolo (Filmmaker, Short Form) ---------- */

  function renderRolo(cfg, projects) {
    const hero = pickHero(cfg, projects);
    const heroIds = new Set(hero.map(p => p.id));
    const rest = projects.filter(p => !heroIds.has(p.id));
    const horizontals = rest.filter(isHorizontal);
    const verticals = rest.filter(isVertical);
    const wa = waLink(t(cfg.whatsapp));

    const heroHTML = hero.length && isVertical(hero[0])
      ? `<div class="r-trip">${hero.map(p => `
          <button type="button" class="r-trip-item" data-open="${esc(p.id)}" aria-label="${esc(t(p.title))}">
            ${media(p, { play: 'view' })}
          </button>`).join('')}</div>`
      : hero.map(p => `
          <button type="button" class="r-frame" data-open="${esc(p.id)}">
            ${media(p, { play: 'view', ratio: false })}
            <span class="r-watch">▶ ${STRINGS.watchFilm}</span>
          </button>`).join('');

    const item = (p, cls = '') => `
      <button type="button" class="r-item ${cls}" data-open="${esc(p.id)}">
        ${media(p)}
        <span class="r-cap"><span>${esc(t(p.title))}</span><span class="m">${esc(metaLine(p))}</span></span>
      </button>`;

    const worksSection = horizontals.length ? `
      <section class="r-sec" id="trabalhos">
        <div class="r-head"><h2>${STRINGS.works}</h2><span class="mono">16:9</span></div>
        <div class="r-works">${horizontals.map((p, i) => item(p, horizontals.length % 2 && i === 0 ? 'is-feature' : '')).join('')}</div>
      </section>` : '';

    const vertSection = verticals.length ? `
      <section class="r-sec" id="${cfg.primary === 'vertical' ? 'trabalhos' : 'short-form'}">
        <div class="r-head"><h2>${cfg.primary === 'vertical' ? STRINGS.works : STRINGS.shortForm}</h2><span class="mono">9:16</span></div>
        <div class="r-verts">${verticals.map(p => item(p)).join('')}</div>
      </section>` : '';

    const sections = cfg.primary === 'vertical' ? vertSection + worksSection : worksSection + vertSection;

    return `
      <div class="n-wrap">
        <header class="r-nav">
          <a class="r-brand" href="${portfolioHref}">Kelson Budin</a>
          <span class="r-niche">${esc(t(cfg.label))}</span>
          <nav class="r-navr"><a href="${langHref()}" hreflang="${langLabel.toLowerCase()}">${langLabel}</a><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></nav>
        </header>
        <section class="r-hero">
          ${heroHTML}
          <div class="r-intro">
            <h1>${esc(t(cfg.title))} <span>${esc(t(cfg.titleMuted))}</span></h1>
            <div>
              <p>${esc(t(cfg.lede))}</p>
              <div class="r-actions">
                <a class="r-link" href="#trabalhos">${STRINGS.seeWorks} ↓</a>
                <a class="r-link" href="${wa}" target="_blank" rel="noopener">WhatsApp →</a>
              </div>
            </div>
          </div>
        </section>
        ${sections}
        ${servicesBlock(cfg, 'r')}
        <section class="r-cta">
          <p>${esc(t(cfg.cta))}</p>
          <a class="r-btn" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.ctaButton))} →</a>
        </section>
        ${footer('r-foot')}
      </div>`;
  }

  function servicesBlock(cfg, prefix) {
    if (!cfg.services || !cfg.services.length) return '';
    return `
      <section class="${prefix}-sec" id="servicos">
        <div class="${prefix}-head"><h2>${STRINGS.services}</h2></div>
        <div class="${prefix}-svc">${cfg.services.map((s, i) => `
          <div style="--i:${i}"><b>${esc(t(s.name))}</b><p>${esc(t(s.desc))}</p></div>`).join('')}
        </div>
      </section>`;
  }

  /* ---------- Estilo 2: Broadcast (Games, Esportes) ---------- */

  function renderBroadcast(cfg, projects) {
    const [hero] = pickHero(cfg, projects);
    const rest = projects.filter(p => !hero || p.id !== hero.id);
    const wa = waLink(t(cfg.whatsapp));

    const stage = hero ? `
      <section class="b-stage">
        <div class="b-glow" aria-hidden="true"><img src="${esc(thumb(hero))}" alt=""></div>
        <button type="button" class="b-player" data-open="${esc(hero.id)}">
          ${media(hero, { play: 'view', ratio: false, extraClass: 'b-hero-media' })}
          <span class="b-ui">
            <span class="b-scrub"><i></i></span>
            <span class="b-row"><strong>${esc(t(hero.title))}</strong><span>▶ ${STRINGS.watch}</span></span>
          </span>
        </button>
      </section>` : '';

    const colors = ['var(--cyan)', 'var(--violet)', 'var(--rose)', 'var(--gold)'];

    return `
      <div class="b-bg" aria-hidden="true"></div>
      <div class="n-wrap">
        <header class="b-nav">
          <a class="b-brand" href="${portfolioHref}">Pure<span>Red</span></a>
          <nav class="b-links">
            <a href="#trabalhos">${STRINGS.worksShort}</a>
            <a href="#servicos">${STRINGS.services}</a>
            <a href="${langHref()}">${langLabel}</a>
          </nav>
          <a class="b-pill" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
        </header>
        ${stage}
        <section class="b-lead">
          <h1>${esc(t(cfg.title))} <span>${esc(t(cfg.titleAccent))}</span></h1>
          <div>
            <p>${esc(t(cfg.lede))}</p>
            <div class="b-btns">
              <a class="b1" href="#trabalhos">${STRINGS.seeWorks}</a>
              <a class="b2" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
            </div>
          </div>
        </section>
        <section class="b-sec" id="servicos">
          <span class="b-label">${STRINGS.services}</span>
          <div class="b-svc">${(cfg.services || []).map((s, i) => `
            <div style="--c:${colors[i % colors.length]}"><b>${esc(t(s.name))}</b><p>${esc(t(s.desc))}</p></div>`).join('')}
          </div>
        </section>
        ${rest.length ? `
        <section class="b-sec" id="trabalhos">
          <span class="b-label">${STRINGS.worksShort}</span>
          <div class="j-grid b-grid" data-h="300" data-h-mobile="190">${rest.map((p, i) => `
            <button type="button" class="j-item b-item" data-open="${esc(p.id)}" data-aspect="${aspectOf(p)}" style="--c:${colors[i % colors.length]}">
              ${media(p)}
              <span class="j-cap"><span>${esc(t(p.title))}</span><span class="m">${esc(metaLine(p))}</span></span>
            </button>`).join('')}
          </div>
        </section>` : ''}
        <section class="b-cta">
          <p>${esc(t(cfg.cta))}</p>
          <a class="b1" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.ctaButton))}</a>
        </section>
        ${footer('b-foot')}
      </div>`;
  }

  function setupBroadcast(root) {
    const heroVideo = root.querySelector('.b-hero-media video');
    const bar = root.querySelector('.b-scrub i');
    if (heroVideo && bar) {
      heroVideo.addEventListener('timeupdate', () => {
        if (heroVideo.duration) bar.style.width = (heroVideo.currentTime / heroVideo.duration * 100) + '%';
      });
    }
    // Brilho "modo ambiente": no desktop o vídeo toca também atrás do player,
    // borrado. No celular fica a thumbnail borrada (economiza bateria).
    const glow = root.querySelector('.b-glow');
    const desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (glow && heroVideo && desktop && !reduce) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.src = heroVideo.dataset.src;
      glow.appendChild(v);
      heroVideo.addEventListener('playing', () => {
        v.currentTime = heroVideo.currentTime;
        v.play().catch(() => {});
      });
      heroVideo.addEventListener('pause', () => v.pause());
    }
  }

  /* ---------- Estilo 3: Estúdio (Motion) ---------- */

  function renderStudio(cfg, projects) {
    const [hero] = pickHero(cfg, projects);
    const rest = projects.filter(p => !hero || p.id !== hero.id);
    const wa = waLink(t(cfg.whatsapp));
    const word = t(cfg.kinetic) || 'MOTION';
    const letters = [...word].map((ch, i) => `<span style="--d:${i * 0.08}s">${esc(ch)}</span>`).join('');

    const ba = hero ? `
      <section class="s-ba">
        <figure>
          <div class="n-media s-still"><img src="${esc(thumb(hero))}" alt="" loading="lazy"><span class="s-tag">${STRINGS.before}</span></div>
          <figcaption><b>${esc(t(cfg.before))}</b>PNG</figcaption>
        </figure>
        <figure>
          <button type="button" class="s-play" data-open="${esc(hero.id)}">
            ${media(hero, { play: 'view', ratio: false })}
            <span class="s-tag on">${STRINGS.after}</span>
          </button>
          <figcaption><b>${esc(t(cfg.after))}</b>${esc(t(cfg.afterNote))}</figcaption>
        </figure>
      </section>` : '';

    return `
      <div class="n-wrap">
        <header class="s-nav">
          <a class="s-brand" href="${portfolioHref}">PURERED/${esc(t(cfg.label)).toUpperCase()}</a>
          <span class="s-comp">comp_01 · 1920×1080 · 60fps</span>
          <nav><a href="${langHref()}">${langLabel}</a><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></nav>
        </header>
        <h1 class="s-kin" aria-label="${esc(word)}">${letters}</h1>
        <section class="s-pitch">
          <p>${esc(t(cfg.lede))}</p>
          <a class="s-btn" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.heroButton))} →</a>
        </section>
        ${ba}
        ${rest.length ? `
        <section class="s-sec" id="trabalhos">
          <div class="s-head"><h2>${STRINGS.worksShort}</h2><span class="mono">${String(rest.length).padStart(2, '0')} ${STRINGS.projects}</span></div>
          <div class="j-grid s-grid" data-h="320" data-h-mobile="200">${rest.map(p => `
            <button type="button" class="j-item s-item" data-open="${esc(p.id)}" data-aspect="${aspectOf(p)}">
              ${media(p)}
              <span class="j-cap"><span>${esc(t(p.title))}</span><span class="m">${esc(metaLine(p))}</span></span>
            </button>`).join('')}
          </div>
        </section>` : ''}
        ${servicesBlock(cfg, 's')}
        <section class="s-cta">
          <p>${esc(t(cfg.cta))}</p>
          <a class="s-btn hot" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.ctaButton))} →</a>
        </section>
        ${footer('s-foot')}
      </div>`;
  }

  /* ---------- Estilo 4: Galeria (Fotografia) ---------- */

  function renderGaleria(cfg, projects) {
    const photos = projects.filter(p => p.type === 'image');
    const [hero, ...rest] = photos;
    const wa = waLink(t(cfg.whatsapp));
    const firstTag = (p) => (t(p.tags) || [])[0] || '';
    const tags = [...new Set(rest.map(firstTag).filter(Boolean))];

    const heroFig = hero ? `
      <figure class="g-feature">
        <button type="button" data-open="${esc(hero.id)}">${media(hero, { ratio: false })}</button>
        <figcaption><em>${esc(t(hero.title))}</em><span>${esc([hero.client, year(hero)].filter(Boolean).join(' · '))}</span></figcaption>
      </figure>`
      : `<div class="g-empty">${esc(t(cfg.empty))}</div>`;

    return `
      <div class="n-wrap">
        <header class="g-nav">
          <a class="g-brand" href="${portfolioHref}">Kelson Budin</a>
          <span class="g-niche">${esc(t(cfg.label))}</span>
          <nav><a href="${langHref()}">${langLabel}</a><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></nav>
        </header>
        <section class="g-hero">
          <div>
            <h1>${esc(t(cfg.title))} <i>${esc(t(cfg.titleItalic))}</i></h1>
            <p>${esc(t(cfg.lede))}</p>
            <a class="g-link" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.ctaButton))} →</a>
          </div>
          ${heroFig}
        </section>
        ${rest.length ? `
        <section class="g-sec" id="galeria">
          <div class="g-head">
            <h2>${STRINGS.gallery}</h2>
            ${tags.length > 1 ? `<div class="g-chips">
              <button type="button" class="on" data-tag="">${STRINGS.all}</button>
              ${tags.map(tag => `<button type="button" data-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}
            </div>` : ''}
          </div>
          <div class="j-grid g-grid" data-h="340" data-h-mobile="200">${rest.map(p => `
            <button type="button" class="j-item g-item" data-open="${esc(p.id)}" data-aspect="${aspectOf(p)}" data-tag="${esc(firstTag(p))}" data-measure>
              ${media(p)}
              <span class="j-cap"><span>${esc(t(p.title))}</span></span>
            </button>`).join('')}
          </div>
        </section>` : ''}
        <section class="g-cta">
          <p>${esc(t(cfg.cta))}</p>
          <a class="g-link" href="${wa}" target="_blank" rel="noopener">${esc(t(cfg.ctaButton))} →</a>
        </section>
        ${footer('g-foot')}
      </div>`;
  }

  function setupGaleria(root) {
    const chips = root.querySelectorAll('.g-chips button');
    const grid = root.querySelector('.g-grid');
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.toggle('on', c === chip));
      const tag = chip.dataset.tag;
      grid._items.forEach(el => { el.hidden = !!tag && el.dataset.tag !== tag; });
      justify(grid);
    }));
  }

  const RENDERERS = { rolo: renderRolo, broadcast: renderBroadcast, studio: renderStudio, galeria: renderGaleria };

  /* ---------- Vídeos em loop ---------- */

  function setupVideos(root) {
    const videos = root.querySelectorAll('video[data-src]');
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ensureSrc = (v) => { if (!v.getAttribute('src')) v.src = v.dataset.src; };
    const play = (v) => {
      ensureSrc(v);
      v.play().then(() => v.classList.add('is-playing')).catch(() => {});
    };
    const autoplays = (v) => !reduce && (v.dataset.play === 'view' || !canHover);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ target: v, isIntersecting }) => {
          if (isIntersecting) {
            if (autoplays(v)) play(v);
          } else {
            v.pause();
          }
        });
      }, { rootMargin: '120px' });
      videos.forEach(v => io.observe(v));
    } else {
      videos.forEach(v => { if (autoplays(v)) play(v); });
    }

    if (canHover) {
      videos.forEach(v => {
        if (v.dataset.play !== 'hover') return;
        const host = v.closest('[data-open]') || v.parentElement;
        host.addEventListener('mouseenter', () => play(v));
        host.addEventListener('mouseleave', () => v.pause());
      });
    }
  }

  /* ---------- Grade justificada (linhas com a mesma altura, sem buracos) ---------- */

  const justifiedGrids = [];

  function setupJustified(root) {
    root.querySelectorAll('.j-grid').forEach(grid => {
      grid._items = [...grid.children];
      justifiedGrids.push(grid);
      // Fotos: a proporção real só é conhecida depois que a imagem carrega
      grid._items.filter(el => el.hasAttribute('data-measure')).forEach(el => {
        const img = el.querySelector('img');
        const apply = () => {
          if (!img.naturalWidth) return;
          const a = img.naturalWidth / img.naturalHeight;
          el.dataset.aspect = a;
          el.querySelector('.n-media').style.aspectRatio = a;
          scheduleJustify();
        };
        if (img.complete) apply(); else img.addEventListener('load', apply, { once: true });
        img.loading = 'eager';
      });
      justify(grid);
    });
  }

  let justifyTimer = null;
  function scheduleJustify() {
    clearTimeout(justifyTimer);
    justifyTimer = setTimeout(() => justifiedGrids.forEach(justify), 120);
  }
  window.addEventListener('resize', scheduleJustify);

  function justify(grid) {
    const width = grid.clientWidth;
    if (!width) return;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
    const target = width < 600 ? Number(grid.dataset.hMobile || 200) : Number(grid.dataset.h || 300);
    const items = grid._items.filter(el => !el.hidden);

    const rows = [];
    let row = [];
    let sum = 0;
    items.forEach(el => {
      row.push(el);
      sum += Number(el.dataset.aspect);
      if (sum * target + gap * (row.length - 1) >= width) {
        rows.push({ row, sum, full: true });
        row = [];
        sum = 0;
      }
    });
    if (row.length) {
      // Última linha: se quase enche a largura, estica; senão fica na altura
      // padrão e centralizada
      const natural = sum * target + gap * (row.length - 1);
      rows.push({ row, sum, full: natural >= width * 0.8 });
    }

    grid.textContent = '';
    grid._items.filter(el => el.hidden).forEach(el => grid.appendChild(el));
    rows.forEach(({ row: els, full }) => {
      const div = document.createElement('div');
      div.className = 'j-row' + (full ? '' : ' is-partial');
      els.forEach(el => {
        const a = Number(el.dataset.aspect);
        el.style.flex = full ? `${a} ${a} 0px` : '0 0 auto';
        el.style.width = full ? '' : `${a * target}px`;
        div.appendChild(el);
      });
      grid.appendChild(div);
    });
  }

  /* ---------- Lightbox ---------- */

  const dialog = document.getElementById('nlb');
  const dlgMedia = document.getElementById('nlb-media');
  const dlgTitle = document.getElementById('nlb-title');
  const dlgMeta = document.getElementById('nlb-meta');

  function setupOpeners(root, all) {
    root.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-open]');
      if (!opener) return;
      const project = all.find(p => p.id === opener.dataset.open);
      if (project) openLightbox(project);
    });
  }

  function formatDate(d) {
    if (!d || !d.includes('-')) return d || '';
    const [y, m] = d.split('-');
    return `${STRINGS.months[parseInt(m, 10) - 1] || m} ${y}`;
  }

  function openLightbox(p) {
    if (!dialog) return;
    dlgTitle.textContent = t(p.title);
    dlgMeta.textContent = [p.client, formatDate(p.date), t(p.description)].filter(Boolean).join(' · ');
    dlgMedia.innerHTML = '';
    dlgMedia.className = 'nlb-media' + (isVertical(p) ? ' is-vertical' : '') + (p.type === 'image' ? ' is-image' : '');

    const url = p.type === 'image' ? p.imageUrl : p.videoUrl;
    let el;
    if (p.type === 'image') {
      el = document.createElement('img');
      el.src = url;
      el.alt = t(p.title);
    } else if (/\.(mp4|webm|mov|m4v)($|\?)/i.test(url || '')) {
      el = document.createElement('video');
      el.src = url;
      el.controls = true;
      el.autoplay = true;
      el.playsInline = true;
    } else {
      el = document.createElement('iframe');
      el.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      el.allowFullscreen = true;
      el.src = embedUrl(url);
    }
    dlgMedia.appendChild(el);
    document.body.classList.add('nlb-open');
    dialog.showModal();
  }

  function embedUrl(url) {
    if (!url) return '';
    const yt = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    if (/youtube\.com|youtu\.be/i.test(url) && yt && yt[2].length === 11) {
      return `https://www.youtube.com/embed/${yt[2]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }
    const vimeo = url.match(/(vimeo\.com\/|video\/)(\d+)/);
    if (/vimeo\.com/i.test(url) && vimeo) return `https://player.vimeo.com/video/${vimeo[2]}?autoplay=1`;
    if (/instagram\.com/i.test(url)) return url.split('?')[0].replace(/\/$/, '') + '/embed/';
    return url;
  }

  function closeLightbox() {
    dialog.close();
  }

  if (dialog) {
    document.getElementById('nlb-close').setAttribute('aria-label', STRINGS.close);
    document.getElementById('nlb-close').addEventListener('click', closeLightbox);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.classList.contains('nlb-inner') || e.target === dlgMedia) closeLightbox();
    });
    dialog.addEventListener('close', () => {
      dlgMedia.innerHTML = '';
      document.body.classList.remove('nlb-open');
    });
  }

  init();
})();
