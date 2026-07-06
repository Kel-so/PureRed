document.addEventListener('DOMContentLoaded', () => {
  let projects = [];

  // Language detection: index-en.html sets <html lang="en">, index.html stays pt-BR
  const LANG = document.documentElement.lang === 'en' ? 'en' : 'pt';
  const PROJECTS_FILE = LANG === 'en' ? 'projects.en.json' : 'projects.json';

  // Subcategory taxonomy: id -> display label. Order here defines section order on the page.
  const SUBCATEGORIES_BY_LANG = {
    pt: [
      { id: 'gaming', label: 'Gaming & eSports' },
      { id: 'samedayedit', label: 'Same Day Edit' },
      { id: 'aftermovie', label: 'Aftermovies & Shows' },
      { id: 'esportes', label: 'Esportes' },
      { id: 'podcast', label: 'Cortes de Podcast' },
      { id: 'motion', label: 'Motion & Branding' },
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
      { id: 'automotivo', label: 'Automotive' },
      { id: 'moda', label: 'Fashion & Brand' },
      { id: 'outros', label: 'Other Projects' }
    ]
  };
  const SUBCATEGORIES = SUBCATEGORIES_BY_LANG[LANG];

  // Static UI strings that the JS injects dynamically (everything else lives in the HTML)
  const STRINGS_BY_LANG = {
    pt: {
      featuredBadge: 'Destaque',
      emptyTitle: 'Nenhum projeto encontrado',
      emptyBody: 'Vá para o <a href="admin.html" style="color: var(--primary-red); font-weight: 700;">Painel de Controle</a> para adicionar novos vídeos.',
      dateFallback: 'Recente',
      clientFallback: 'Projeto Próprio',
      tagsFallback: 'Edição',
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      reelTags: ['Destaque', 'Edição', 'Efeitos Visuais', 'Portfólio']
    },
    en: {
      featuredBadge: 'Featured',
      emptyTitle: 'No projects found',
      emptyBody: 'Go to the <a href="admin.html" style="color: var(--primary-red); font-weight: 700;">Control Panel</a> to add new videos.',
      dateFallback: 'Recent',
      clientFallback: 'Personal Project',
      tagsFallback: 'Editing',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      reelTags: ['Featured', 'Editing', 'Visual Effects', 'Portfolio']
    }
  };
  const STRINGS = STRINGS_BY_LANG[LANG];

  // DOM Elements
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

  // 1. Initialize and Load Projects
  async function init() {
    try {
      // Always fetch the freshest projects data, avoiding cache
      const response = await fetch(PROJECTS_FILE + '?t=' + new Date().getTime());
      if (response.ok) {
        projects = await response.json();
      } else {
        // Fallback static mock if projects.json isn't loaded/found
        projects = getFallbackMockData();
      }
      // Respect the curated order set in the admin panel (drag-and-drop)
      projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      renderFeatured();
      renderPortfolioSections();
    } catch (error) {
      console.error('Error loading projects:', error);
      projects = getFallbackMockData();
      renderFeatured();
      renderPortfolioSections();
    }
  }

  // 2. Build a Single Project Card (shared by the Featured grid and category sections)
  function createProjectCard(project, options = {}) {
    const card = document.createElement('article');
    const orientationClass = project.orientation === 'vertical' ? 'card-vertical' : 'card-horizontal';
    card.className = `project-card ${orientationClass}`;
    card.setAttribute('data-category', project.category);

    const playIcon = `
      <div class="video-icon-badge">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>`;

    const previewHTML = project.previewUrl
      ? `<video class="preview-video" src="${project.previewUrl}" autoplay loop muted playsinline></video>`
      : '';

    const featuredBadgeHTML = options.featured
      ? `<div class="featured-badge">${STRINGS.featuredBadge}</div>`
      : '';

    card.innerHTML = `
      <div class="card-image" data-id="${project.id}">
        <img src="${project.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'}" alt="${project.title}" loading="lazy" ${project.previewUrl ? 'style="opacity: 0;"' : ''}>
        ${previewHTML}
        ${featuredBadgeHTML}
        ${playIcon}
      </div>
      <div class="card-content" style="padding: 1.2rem; align-items: center; justify-content: center; text-align: center;">
        <h3 style="margin: 0; font-size: 0.95rem;">${project.title}</h3>
      </div>
    `;

    const cardImg = card.querySelector('.card-image');
    cardImg.addEventListener('click', () => {
      openLightbox(project);
    });

    return card;
  }

  // 3. Render the Featured / Destaques Grid
  function renderFeatured() {
    if (!featuredGrid) return;
    const featuredSection = featuredGrid.closest('.featured-section');
    const featuredProjects = projects.filter(p => p.featured);

    if (featuredProjects.length === 0) {
      if (featuredSection) featuredSection.style.display = 'none';
      return;
    }

    if (featuredSection) featuredSection.style.display = '';
    featuredGrid.innerHTML = '';
    featuredProjects.forEach(project => {
      featuredGrid.appendChild(createProjectCard(project, { featured: true }));
    });
  }

  // 4. Render Portfolio Sections (grouped by subcategory, in curated order)
  function renderPortfolioSections() {
    if (!portfolioSections) return;
    portfolioSections.innerHTML = '';
    if (sectionNav) sectionNav.innerHTML = '';

    if (projects.length === 0) {
      portfolioSections.innerHTML = `
        <div style="border: 3px dashed var(--border-color-dark); padding: 4rem; text-align: center;">
          <h3 style="font-family: var(--font-header); text-transform: uppercase; margin-bottom: 1rem;">${STRINGS.emptyTitle}</h3>
          <p style="color: var(--text-muted);">${STRINGS.emptyBody}</p>
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
      items.forEach(project => grid.appendChild(createProjectCard(project)));
      block.appendChild(grid);

      portfolioSections.appendChild(block);
    });
  }

  // 4. Universal Lightbox Logic (Native Video, Youtube, Vimeo)
  function openLightbox(project) {
    if (!videoLightbox) return;

    // Set text details
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.description || '';
    lightboxClient.textContent = project.client || STRINGS.clientFallback;

    // Format Date
    let dateStr = project.date || STRINGS.dateFallback;
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      const monthIdx = parseInt(month, 10) - 1;
      dateStr = `${STRINGS.months[monthIdx] || month} ${year}`;
    }
    lightboxDate.textContent = dateStr;
    lightboxTags.textContent = project.tags ? project.tags.join(', ') : STRINGS.tagsFallback;

    // Set Media
    const videoUrl = project.videoUrl;
    lightboxMediaContainer.innerHTML = '';

    // Handle Vertical/Mobile aspect ratios based on JSON or fallback to tags
    const isVertical = project.orientation === 'vertical' || (project.tags && (project.tags.includes('Vertical') || project.tags.includes('Mobile')));
    
    if (isVertical) {
      lightboxMediaContainer.classList.add('is-vertical');
    } else {
      lightboxMediaContainer.classList.remove('is-vertical');
    }

    if (isVideoFile(videoUrl)) {
      // Direct video file
      const videoEl = document.createElement('video');
      videoEl.src = videoUrl;
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.className = 'video-element';
      lightboxMediaContainer.appendChild(videoEl);
    } else if (isYouTube(videoUrl)) {
      // YouTube Video
      const ytId = extractYouTubeId(videoUrl);
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    } else if (isInstagram(videoUrl)) {
      // Instagram Post/Reel
      const igEmbedUrl = extractInstagramEmbedUrl(videoUrl);
      const iframe = document.createElement('iframe');
      iframe.src = igEmbedUrl;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('allowtransparency', 'true');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      // To hide scrollbars and crop perfectly
      iframe.style.overflow = 'hidden';
      lightboxMediaContainer.appendChild(iframe);
    } else if (isVimeo(videoUrl)) {
      // Vimeo Video
      const vimeoId = extractVimeoId(videoUrl);
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    } else {
      // Generic Iframe Fallback
      const iframe = document.createElement('iframe');
      iframe.src = videoUrl;
      iframe.allowFullscreen = true;
      lightboxMediaContainer.appendChild(iframe);
    }

    // Open Modal
    videoLightbox.showModal();
  }

  // 5. Close Lightbox and Stop Playback
  function closeLightbox() {
    if (!videoLightbox) return;
    
    // Crucial: Stop playing video/audio
    lightboxMediaContainer.innerHTML = '';
    videoLightbox.close();
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Close when clicking outside of the modal window (on the backdrop)
  if (videoLightbox) {
    videoLightbox.addEventListener('click', (e) => {
      const dialogDimensions = videoLightbox.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        closeLightbox();
      }
    });

    // Handle ESC key stop video (native dialog close sends escape event)
    videoLightbox.addEventListener('close', () => {
      lightboxMediaContainer.innerHTML = '';
    });
  }

  // 6. Connect Featured Showreel Trigger
  if (mainReelTrigger) {
    mainReelTrigger.addEventListener('click', () => {
      const reelData = {
        title: mainReelTrigger.getAttribute('data-title'),
        videoUrl: mainReelTrigger.getAttribute('data-video'),
        client: mainReelTrigger.getAttribute('data-client'),
        date: mainReelTrigger.getAttribute('data-date'),
        description: mainReelTrigger.getAttribute('data-description'),
        tags: STRINGS.reelTags
      };
      openLightbox(reelData);
    });
  }

  // 8. Mobile Navigation Toggle Drawer
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-active');
      });
    });
  }

  /* --- Helper Functions for Media Detection --- */

  function isVideoFile(url) {
    if (!url) return false;
    // Match extensions like .mp4, .webm, .ogg, .mov, etc.
    return /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) || url.includes('gtv-videos-bucket') || url.includes('/videos/');
  }

  function isYouTube(url) {
    if (!url) return false;
    return /youtube\.com|youtu\.be/i.test(url);
  }

  function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  function isVimeo(url) {
    if (!url) return false;
    return /vimeo\.com/i.test(url);
  }

  function extractVimeoId(url) {
    const regExp = /(vimeo\.com\/|video\/)(\d+)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  }

  function isInstagram(url) {
    if (!url) return false;
    return /instagram\.com/i.test(url);
  }

  function extractInstagramEmbedUrl(url) {
    // Strip trailing slash if present, ignore query params
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return `${cleanUrl}/embed/`;
  }

  // Fallback mock array if loading fails
  function getFallbackMockData() {
    return [
      {
        "id": "mock-1",
        "title": "CULTURA URBANA - AFTERMOVIE",
        "category": "events",
        "description": "Aftermovie oficial do festival de Hip-Hop e Skate de São Paulo. Ritmo acelerado, transições fluidas e som dinâmico.",
        "client": "Cultura de Rua Co.",
        "date": "2026-04",
        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "thumbnailUrl": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        "tags": ["Aftermovie", "Edição Dinâmica", "Sound Design"]
      },
      {
        "id": "mock-2",
        "title": "CAMPANHA SPEEDWAY - CORRIDA",
        "category": "editing",
        "description": "Edição de vídeo promocional de alta energia para lançamento de calçados de corrida. Foco em cortes rápidos de impacto.",
        "client": "Pulse Athletics",
        "date": "2026-03",
        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "thumbnailUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "tags": ["Comercial", "Cortes Rápidos", "Color Grading"]
      }
    ];
  }

  // Initialize
  init();
});
