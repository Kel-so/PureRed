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
  const featuredGrid = document.getElementById('featured-grid');
  const portfolioSections = document.getElementById('portfolio-sections');
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
    const gap = parseFloat(getComputedStyle(gridEl).gap) || 19;
    const width = gridEl.clientWidth;
    if (!width) return;

    const colCount = Math.max(2, Math.min(maxCols, Math.floor(width / 250)));
    const colWidth = (width - gap * (colCount - 1)) / colCount;
    const captionHeight = 64;

    gridEl.innerHTML = '';
    const cols = [];
    for (let i = 0; i < colCount; i++) {
      const col = document.createElement('div');
      col.className = 'masonry-col';
      gridEl.appendChild(col);
      cols.push({ el: col, h: 0 });
    }

    // Distribui os cards mais altos primeiro (LPT): colunas terminam com
    // alturas parecidas. Empates preservam a ordem curada (sort estável).
    const measured = cards.map(card => ({
      card,
      estHeight: colWidth / cardAspect(card) + captionHeight + gap
    }));
    measured.sort((a, b) => b.estHeight - a.estHeight);

    measured.forEach(({ card, estHeight }) => {
      const shortest = cols.reduce((a, b) => (b.h < a.h ? b : a));
      shortest.el.appendChild(card);
      shortest.h += estHeight;
    });
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
    renderFeatured();
    renderPortfolioSections();
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

    const title = t(project.title);

    card.innerHTML = `
      <div class="card-image">
        <img src="${project.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'}" alt="${title}" loading="lazy">
        ${previewHTML}
        ${featuredBadgeHTML}
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

  // 3. Featured grid
  function renderFeatured() {
    if (!featuredGrid) return;
    const featuredSection = featuredGrid.closest('.featured-section');
    const featuredProjects = projects.filter(p => p.featured);

    if (featuredProjects.length === 0) {
      if (featuredSection) featuredSection.style.display = 'none';
      return;
    }

    if (featuredSection) featuredSection.style.display = '';
    const cards = featuredProjects.map(project => createProjectCard(project, { featured: true }));
    mountMasonry(featuredGrid, cards, 3);
  }

  // 4. Portfolio sections grouped by subcategory
  function renderPortfolioSections() {
    if (!portfolioSections) return;
    portfolioSections.innerHTML = '';
    if (sectionNav) sectionNav.innerHTML = '';

    if (projects.length === 0) {
      portfolioSections.innerHTML = `
        <div class="empty-state">
          <h3>${STRINGS.emptyTitle}</h3>
          <p>${STRINGS.emptyBody}</p>
        </div>
      `;
      return;
    }

    SUBCATEGORIES.forEach(sub => {
      const items = projects.filter(p => (p.subcategory || 'outros') === sub.id);
      if (items.length === 0) return;

      if (sectionNav) {
        const chip = document.createElement('a');
        chip.className = 'filter-btn';
        chip.href = `#sub-${sub.id}`;
        chip.textContent = sub.label;
        sectionNav.appendChild(chip);
      }

      const block = document.createElement('div');
      block.className = 'portfolio-subsection';
      block.id = `sub-${sub.id}`;
      block.innerHTML = `<h3 class="subsection-title">${sub.label}</h3>`;

      const grid = document.createElement('div');
      grid.className = 'portfolio-grid';
      block.appendChild(grid);
      portfolioSections.appendChild(block);

      // O grid precisa estar no DOM para ter largura antes do masonry
      const cards = items.map(project => createProjectCard(project));
      mountMasonry(grid, cards, 4);
    });
  }

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
