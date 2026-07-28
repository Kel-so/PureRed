document.addEventListener('DOMContentLoaded', () => {
  let projects = [];

  // Language detection: index-en.html sets <html lang="en">, index.html stays pt-BR.
  // Both pages read the same projects.json; bilingual fields are objects { pt, en }.
  const LANG = document.documentElement.lang === 'en' ? 'en' : 'pt';

  // Resolve a bilingual field: { pt, en } -> string. Plain strings pass through
  // so older single-language data still works.
  function t(field) {
    if (field == null) return '';
    if (typeof field === 'object' && !Array.isArray(field)) {
      return field[LANG] ?? field.pt ?? field.en ?? '';
    }
    return field;
  }

  // Subcategory taxonomy: id -> label. Order here defines section order on the page.
  const SUBCATEGORIES_BY_LANG = {
    pt: [
      { id: 'gaming', label: 'Gaming & eSports' },
      { id: 'samedayedit', label: 'Same Day Edit' },
      { id: 'aftermovie', label: 'Aftermovies & Shows' },
      { id: 'esportes', label: 'Esportes' },
      { id: 'podcast', label: 'Cortes de Podcast' },
      { id: 'motion', label: 'Motion & Branding' },
      { id: 'design', label: 'Banners & Design' },
      { id: 'automotivo', label: 'Automotivo' },
      { id: 'moda', label: 'Moda & Marca' },
      { id: 'outros', label: 'Outros Projetos' }
    ],
    en: [
      { id: 'gaming', label: 'Gaming & eSports' },
      { id: 'samedayedit', label: 'Same Day Edit' },
      { id: 'aftermovie', label: 'Aftermovies & Shows' },
      { id: 'esportes', label: 'Sports' },
      { id: 'podcast', label: 'Podcast Cuts' },
      { id: 'motion', label: 'Motion & Branding' },
      { id: 'design', label: 'Banners & Design' },
      { id: 'automotivo', label: 'Automotive' },
      { id: 'moda', label: 'Fashion & Brand' },
      { id: 'outros', label: 'Other Projects' }
    ]
  };
  const SUBCATEGORIES = SUBCATEGORIES_BY_LANG[LANG];

  const STRINGS_BY_LANG = {
    pt: {
      allLabel: 'Todos',
      reelsLabel: 'Reels & Shorts',
      featuredBadge: 'Destaque',
      emptyTitle: 'Nenhum projeto encontrado',
      emptyBody: 'Vá para o <a href="admin.html">Painel Admin</a> para adicionar novos projetos.',
      dateFallback: 'Recente',
      clientFallback: 'Projeto Próprio',
      tagsFallback: 'Edição',
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      reelTags: ['Destaque', 'Edição', 'Portfólio']
    },
    en: {
      allLabel: 'All',
      reelsLabel: 'Reels & Shorts',
      featuredBadge: 'Featured',
      emptyTitle: 'No projects found',
      emptyBody: 'Go to the <a href="admin.html">Admin Panel</a> to add new projects.',
      dateFallback: 'Recent',
      clientFallback: 'Personal Project',
      tagsFallback: 'Editing',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      reelTags: ['Featured', 'Editing', 'Portfolio']
    }
  };
  const STRINGS = STRINGS_BY_LANG[LANG];

  // DOM elements
  const portfolioGrid = document.getElementById('portfolio-grid');
  const sectionNav = document.getElementById('section-nav');
  const videoLightbox = document.getElementById('video-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMediaContainer = document.getElementById('lightbox-media-container');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClient = document.getElementById('lightbox-client');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxTags = document.getElementById('lightbox-tags');
  const mainReelTrigger = document.getElementById('main-reel-trigger');

  // Preview videos only play while visible in the viewport (saves CPU/battery
  // with many autoplaying cards).
  const previewObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { rootMargin: '100px' })
    : null;

  // Masonry: distribui os cards em colunas balanceadas pela altura estimada
  // (conhecida pela proporção de cada card), preenchendo da esquerda para a
  // direita — sem os buracos que um grid comum deixa entre cards verticais
  // e horizontais.
  const masonryRegistry = [];

  function cardAspect(card) {
    if (card.classList.contains('card-vertical')) return 9 / 16;
    if (card.classList.contains('card-banner')) return 4 / 5;
    return 16 / 9;
  }

  function layoutMasonry(gridEl, cards, maxCols) {
    if (cards.length === 0) return;

    const gap = parseFloat(getComputedStyle(gridEl).gap) || 19;
    gridEl.style.maxWidth = '';
    const width = gridEl.clientWidth || gridEl.parentElement.clientWidth;
    if (!width) return;

    // Nunca mais colunas do que cards: seção pequena vira grade menor e
    // centralizada, sem sobrar espaço morto na direita
    let colCount = Math.max(2, Math.min(maxCols, Math.floor(width / 250)));
    colCount = Math.min(colCount, cards.length);

    // Grade uniforme (todos os cards com a mesma proporção): prefere um
    // número de colunas que divida os itens por igual — fileiras completas,
    // sem coluna manca (ex: 6 reels viram 3 colunas de 2)
    const aspects = cards.map(cardAspect);
    const uniform = aspects.every(a => a === aspects[0]);
    if (uniform && cards.length % colCount !== 0) {
      for (let c = colCount - 1; c >= 2; c--) {
        if (cards.length % c === 0) {
          colCount = c;
          break;
        }
      }
    }

    const colWidth = (width - gap * (colCount - 1)) / colCount;
    const captionHeight = 64;

    gridEl.innerHTML = '';
    const cols = [];
    for (let i = 0; i < colCount; i++) {
      const col = document.createElement('div');
      col.className = 'masonry-col';
      gridEl.appendChild(col);
      cols.push({ el: col, h: 0, invAspectSum: 0, n: 0, hasWide: false });
    }

    // Distribui os cards mais altos primeiro (LPT): colunas terminam com
    // alturas parecidas. Empates preservam a ordem curada (sort estável).
    // Banners (card-banner) são sempre processados por último, então
    // afundam para a parte de baixo da grade em vez de se espalharem.
    const measured = cards.map(card => {
      const aspect = cardAspect(card);
      return { card, aspect, estHeight: colWidth / aspect + captionHeight + gap };
    });
    measured.sort((a, b) => {
      const bannerDiff = (a.card.classList.contains('card-banner') ? 1 : 0) - (b.card.classList.contains('card-banner') ? 1 : 0);
      return bannerDiff !== 0 ? bannerDiff : b.estHeight - a.estHeight;
    });

    measured.forEach(({ card, aspect, estHeight }) => {
      const shortest = cols.reduce((a, b) => (b.h < a.h ? b : a));
      shortest.el.appendChild(card);
      shortest.h += estHeight;
      shortest.invAspectSum += 1 / aspect;
      shortest.n += 1;
      shortest.hasWide = shortest.hasWide || aspect >= 1;
    });

    // Ajuste de simetria vertical: resolve as larguras das colunas para que
    // todas terminem com a MESMA altura (ex: coluna com vídeos horizontais
    // fica mais larga para emparelhar com um vertical ao lado).
    // Altura da coluna: h_i = w_i * s_i + b_i, com todas h_i = T e Σw_i fixo:
    // T = (W + Σ b_i/s_i) / (Σ 1/s_i)
    if (colCount > 1) {
      const availWidth = width - gap * (colCount - 1);
      const sumInv = cols.reduce((acc, c) => acc + 1 / c.invAspectSum, 0);
      const sumFixed = cols.reduce((acc, c) => acc + (c.n * (captionHeight + gap)) / c.invAspectSum, 0);
      const target = (availWidth + sumFixed) / sumInv;

      // Limita a variação de largura entre colunas para nenhuma ficar
      // esmagada nem gigante em relação às vizinhas. Em telas estreitas o
      // limite é mais apertado: largura consistente vale mais que a altura.
      const narrow = width < 700;
      const minF = narrow ? 0.85 : 0.7;
      const maxF = narrow ? 1.18 : 1.6;
      const avg = availWidth / colCount;
      cols.forEach(c => {
        const ideal = (target - c.n * (captionHeight + gap)) / c.invAspectSum;
        c.idealWidth = Math.min(Math.max(ideal, avg * minF, 100), avg * maxF);
        c.el.style.flex = `${c.idealWidth} 1 0px`;
      });
    } else {
      cols[0].idealWidth = colWidth;
    }

    // Centralização adaptada: limita a largura total para os cards não
    // ficarem gigantes nem escorados na esquerda quando há poucos itens
    const capTotal = cols.reduce((sum, c) => sum + Math.min(c.hasWide ? 460 : 310, c.idealWidth * 1.6), 0) + gap * (colCount - 1);
    if (capTotal < width) {
      gridEl.style.maxWidth = Math.round(capTotal) + 'px';
    }
    gridEl.style.marginLeft = 'auto';
    gridEl.style.marginRight = 'auto';

    // Segunda passada: mede as alturas reais renderizadas (títulos de 1 ou
    // 2 linhas mudam a conta) e refina as larguras para fechar certinho
    if (colCount > 1) {
      const narrow = width < 700;
      const minF = narrow ? 0.85 : 0.7;
      const maxF = narrow ? 1.18 : 1.6;
      const realWidth = cols.reduce((sum, c) => sum + c.el.getBoundingClientRect().width, 0);
      const avg = realWidth / colCount;
      cols.forEach(c => {
        const r = c.el.getBoundingClientRect();
        c.fixedReal = r.height - r.width * c.invAspectSum; // captions + gaps reais
      });
      const sumInv = cols.reduce((acc, c) => acc + 1 / c.invAspectSum, 0);
      const sumFixed = cols.reduce((acc, c) => acc + c.fixedReal / c.invAspectSum, 0);
      const target = (realWidth + sumFixed) / sumInv;
      cols.forEach(c => {
        const ideal = (target - c.fixedReal) / c.invAspectSum;
        c.el.style.flex = `${Math.min(Math.max(ideal, avg * minF, 100), avg * maxF)} 1 0px`;
      });
    }
  }

  function mountMasonry(gridEl, cards, maxCols) {
    const existing = masonryRegistry.find(m => m.gridEl === gridEl);
    if (existing) {
      existing.cards = cards;
      existing.maxCols = maxCols;
    } else {
      masonryRegistry.push({ gridEl, cards, maxCols });
    }
    layoutMasonry(gridEl, cards, maxCols);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      masonryRegistry.forEach(m => layoutMasonry(m.gridEl, m.cards, m.maxCols));
    }, 200);
  });

  // 1. Load projects
  async function init() {
    try {
      const response = await fetch('projects.json?t=' + Date.now());
      projects = response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      projects = [];
    }
    projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    renderPortfolio();
  }

  // Formata views no estilo das redes: 1.2M / 45K (EN) — 1,2 mi / 45 mil (PT)
  function formatViews(n) {
    if (!n || n <= 0) return '';
    const locale = LANG === 'en' ? 'en-US' : 'pt-BR';
    const fmt = (v) => v.toLocaleString(locale, { maximumFractionDigits: 1 });
    if (n >= 1e6) return fmt(n / 1e6) + (LANG === 'en' ? 'M' : ' mi');
    if (n >= 1e3) return fmt(n / 1e3) + (LANG === 'en' ? 'K' : ' mil');
    return n.toLocaleString(locale);
  }

  // 2. Build a single project card
  function createProjectCard(project, options = {}) {
    const card = document.createElement('article');
    const isImage = project.type === 'image';
    const orientationClass = isImage
      ? 'card-banner'
      : (project.orientation === 'vertical' ? 'card-vertical' : 'card-horizontal');
    card.className = `project-card ${orientationClass}`;

    const iconPath = isImage
      ? '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>'
      : '<path d="M8 5v14l11-7z"/>';

    const previewHTML = (!isImage && project.previewUrl)
      ? `<video class="preview-video" src="${project.previewUrl}" loop muted playsinline preload="metadata"></video>`
      : '';

    const featuredBadgeHTML = options.featured
      ? `<div class="featured-badge">${STRINGS.featuredBadge}</div>`
      : '';

    const viewsLabel = formatViews(project.views);
    const viewsBadgeHTML = viewsLabel
      ? `<div class="views-badge">
           <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
           ${viewsLabel}
         </div>`
      : '';

    const title = t(project.title);

    card.innerHTML = `
      <div class="card-image">
        <img src="${project.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'}" alt="${title}" loading="lazy">
        ${previewHTML}
        ${featuredBadgeHTML}
        ${viewsBadgeHTML}
        <div class="video-icon-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">${iconPath}</svg>
        </div>
      </div>
      <div class="card-content">
        <h3>${title}</h3>
      </div>
    `;

    const previewVideo = card.querySelector('.preview-video');
    if (previewVideo && previewObserver) {
      previewObserver.observe(previewVideo);
    } else if (previewVideo) {
      previewVideo.autoplay = true;
    }

    card.querySelector('.card-image').addEventListener('click', () => openLightbox(project));

    return card;
  }

  // Vídeos verticais (Reels/Shorts/TikTok) contam como estilo "Reels & Shorts"
  // no filtro, independente da subcategoria a que pertencem.
  const isReel = (p) => (p.type || 'video') === 'video' && p.orientation === 'vertical';

  let activeFilter = 'all';

  function projectsForFilter(filterId) {
    if (filterId === 'all') return projects;
    if (filterId === 'reels') return projects.filter(isReel);
    return projects.filter(p => (p.subcategory || 'outros') === filterId);
  }

  // Na visão "Todos" o projects.json vem agrupado por categoria (vários
  // podcast cuts seguidos, vários valorant seguidos, etc.), o que forma
  // blocos visuais no grid. Intercalar por categoria (round-robin, mantendo
  // a ordem curada dentro de cada uma) deixa a mistura mais orgânica.
  // Banners (cards de imagem) ficam de fora da mistura e vão sempre por
  // último, mantendo a ordem curada entre eles.
  function interleaveByCategory(items) {
    const isBanner = (p) => p.type === 'image';
    const banners = items.filter(isBanner);
    const rest = items.filter(p => !isBanner(p));

    const groupKey = (p) => isReel(p) ? 'reels' : (p.subcategory || 'outros');
    const groups = new Map();
    rest.forEach(p => {
      const key = groupKey(p);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    });
    const queues = Array.from(groups.values());
    const result = [];
    let hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (const q of queues) {
        if (q.length) {
          result.push(q.shift());
          hasMore = true;
        }
      }
    }
    return result.concat(banners);
  }

  // 3-4. Grid único estilo Pinterest, com filtro por estilo/categoria
  function renderPortfolio() {
    if (!portfolioGrid) return;

    if (projects.length === 0) {
      if (sectionNav) sectionNav.innerHTML = '';
      portfolioGrid.innerHTML = `
        <div class="empty-state">
          <h3>${STRINGS.emptyTitle}</h3>
          <p>${STRINGS.emptyBody}</p>
        </div>
      `;
      return;
    }

    const filters = [{ id: 'all', label: STRINGS.allLabel }];
    if (projects.some(isReel)) filters.push({ id: 'reels', label: STRINGS.reelsLabel });
    SUBCATEGORIES.forEach(sub => {
      if (projects.some(p => (p.subcategory || 'outros') === sub.id)) {
        filters.push({ id: sub.id, label: sub.label });
      }
    });

    if (sectionNav) {
      sectionNav.innerHTML = '';
      filters.forEach(f => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter-btn' + (f.id === activeFilter ? ' active' : '');
        chip.textContent = f.label;
        chip.addEventListener('click', () => {
          if (activeFilter === f.id) return;
          activeFilter = f.id;
          renderPortfolio();
        });
        sectionNav.appendChild(chip);
      });
    }

    const filtered = projectsForFilter(activeFilter);
    const displayProjects = activeFilter === 'all' ? interleaveByCategory(filtered) : filtered;
    const cards = displayProjects.map(project => createProjectCard(project, { featured: !!project.featured }));
    mountMasonry(portfolioGrid, cards, 4);
  }

  // Cards de "Áreas de Foco" abrem o grid já filtrado no estilo certo
  document.querySelectorAll('.service-card[data-filter]').forEach(card => {
    card.addEventListener('click', () => {
      activeFilter = card.getAttribute('data-filter');
      renderPortfolio();
    });
  });

  // 5. Lightbox (native video, YouTube, Vimeo, Instagram, image)
  function openLightbox(project) {
    if (!videoLightbox) return;

    lightboxTitle.textContent = t(project.title);
    lightboxDesc.textContent = t(project.description);
    lightboxClient.textContent = project.client || STRINGS.clientFallback;

    let dateStr = project.date || STRINGS.dateFallback;
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      const monthIdx = parseInt(month, 10) - 1;
      dateStr = `${STRINGS.months[monthIdx] || month} ${year}`;
    }
    lightboxDate.textContent = dateStr;

    const tags = t(project.tags);
    lightboxTags.textContent = Array.isArray(tags) && tags.length ? tags.join(', ') : STRINGS.tagsFallback;

    lightboxMediaContainer.innerHTML = '';
    lightboxMediaContainer.classList.remove('is-vertical', 'is-image');

    if (project.type === 'image' && project.imageUrl) {
      lightboxMediaContainer.classList.add('is-image');
      const img = document.createElement('img');
      img.src = project.imageUrl;
      img.alt = t(project.title);
      lightboxMediaContainer.appendChild(img);
      videoLightbox.showModal();
      return;
    }

    const videoUrl = project.videoUrl;
    const isVertical = project.orientation === 'vertical';
    if (isVertical) lightboxMediaContainer.classList.add('is-vertical');

    if (isVideoFile(videoUrl)) {
      const videoEl = document.createElement('video');
      videoEl.src = videoUrl;
      videoEl.controls = true;
      videoEl.autoplay = true;
      lightboxMediaContainer.appendChild(videoEl);
    } else if (isYouTube(videoUrl)) {
      const ytId = extractYouTubeId(videoUrl);
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    } else if (isVimeo(videoUrl)) {
      const vimeoId = extractVimeoId(videoUrl);
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    } else if (isInstagram(videoUrl)) {
      const iframe = document.createElement('iframe');
      iframe.src = extractInstagramEmbedUrl(videoUrl);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      lightboxMediaContainer.appendChild(iframe);
    } else if (videoUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = videoUrl;
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    }

    videoLightbox.showModal();
  }

  function closeLightbox() {
    if (!videoLightbox) return;
    lightboxMediaContainer.innerHTML = ''; // stops any playing media
    videoLightbox.close();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (videoLightbox) {
    videoLightbox.addEventListener('click', (e) => {
      const rect = videoLightbox.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        closeLightbox();
      }
    });

    videoLightbox.addEventListener('close', () => {
      lightboxMediaContainer.innerHTML = '';
    });
  }

  // 6. Hero showreel trigger
  if (mainReelTrigger) {
    mainReelTrigger.addEventListener('click', () => {
      openLightbox({
        title: mainReelTrigger.getAttribute('data-title'),
        videoUrl: mainReelTrigger.getAttribute('data-video'),
        client: mainReelTrigger.getAttribute('data-client'),
        date: mainReelTrigger.getAttribute('data-date'),
        description: mainReelTrigger.getAttribute('data-description'),
        tags: STRINGS.reelTags
      });
    });
  }

  // 7. Contact choice modal (WhatsApp or E-mail)
  const contactModal = document.getElementById('contact-modal');
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactTriggers = ['contact-modal-trigger', 'hero-contact-trigger', 'about-contact-trigger']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (contactModal) {
    contactTriggers.forEach(btn => {
      btn.addEventListener('click', () => contactModal.showModal());
    });

    if (contactModalClose) {
      contactModalClose.addEventListener('click', () => contactModal.close());
    }

    contactModal.addEventListener('click', (e) => {
      const rect = contactModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        contactModal.close();
      }
    });

    contactModal.querySelectorAll('.contact-option').forEach(option => {
      option.addEventListener('click', () => {
        setTimeout(() => contactModal.close(), 150);
      });
    });
  }

  // 8. Mobile navigation
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('mobile-active'));
    });
  }

  /* --- Media URL helpers --- */

  function isVideoFile(url) {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) || url.includes('/videos/');
  }

  function isYouTube(url) {
    if (!url) return false;
    return /youtube\.com|youtu\.be/i.test(url);
  }

  function extractYouTubeId(url) {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  function isVimeo(url) {
    if (!url) return false;
    return /vimeo\.com/i.test(url);
  }

  function extractVimeoId(url) {
    const match = url.match(/(vimeo\.com\/|video\/)(\d+)/);
    return match ? match[2] : null;
  }

  function isInstagram(url) {
    if (!url) return false;
    return /instagram\.com/i.test(url);
  }

  function extractInstagramEmbedUrl(url) {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return `${cleanUrl}/embed/`;
  }

  init();
});
