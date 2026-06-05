document.addEventListener('DOMContentLoaded', () => {
  let projects = [];

  // DOM Elements
  const portfolioGrid = document.getElementById('portfolio-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
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
      // Always fetch the freshest projects.json, avoiding cache
      const response = await fetch('projects.json?t=' + new Date().getTime());
      if (response.ok) {
        projects = await response.json();
      } else {
        // Fallback static mock if projects.json isn't loaded/found
        projects = getFallbackMockData();
      }
      renderProjects(projects);
      setupFilters();
    } catch (error) {
      console.error('Error loading projects:', error);
      projects = getFallbackMockData();
      renderProjects(projects);
    }
  }

  // 2. Render Projects in the Grid
  function renderProjects(projectsToRender) {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    if (projectsToRender.length === 0) {
      portfolioGrid.innerHTML = `
        <div style="grid-column: span 2; border: 3px dashed var(--border-color-dark); padding: 4rem; text-align: center;">
          <h3 style="font-family: var(--font-header); text-transform: uppercase; margin-bottom: 1rem;">Nenhum projeto encontrado</h3>
          <p style="color: var(--text-muted);">Vá para o <a href="admin.html" style="color: var(--primary-red); font-weight: 700;">Painel de Controle</a> para adicionar novos vídeos.</p>
        </div>
      `;
      return;
    }

    projectsToRender.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('data-category', project.category);
      
      // Video/Play Badge overlay
      const playIcon = `
        <div class="video-icon-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>`;

      const tagsHTML = project.tags
        ? project.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')
        : '';

      const formattedCategory = project.category === 'editing' ? 'Edição' : 'Evento';

      const previewHTML = project.previewUrl 
        ? `<video class="preview-video" src="${project.previewUrl}" loop muted playsinline preload="none"></video>` 
        : '';

      card.innerHTML = `
        <div class="card-image" data-id="${project.id}">
          <img src="${project.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'}" alt="${project.title}" loading="lazy">
          ${previewHTML}
          ${playIcon}
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span>${formattedCategory}</span>
            <span class="client">${project.client || 'Independente'}</span>
          </div>
          <h3>${project.title}</h3>
          <p>${project.description || ''}</p>
          <div class="tag-list">
            ${tagsHTML}
          </div>
        </div>
      `;

      portfolioGrid.appendChild(card);

      // Event listener for clicking on the card thumbnail to play video
      const cardImg = card.querySelector('.card-image');
      
      // Hover effects for video preview
      if (project.previewUrl) {
        const vid = cardImg.querySelector('.preview-video');
        cardImg.addEventListener('mouseenter', () => {
          if (vid) {
            vid.play().catch(() => {}); // catch autoplay restrictions
            cardImg.classList.add('is-hovering-video');
          }
        });
        cardImg.addEventListener('mouseleave', () => {
          if (vid) {
            vid.pause();
            cardImg.classList.remove('is-hovering-video');
          }
        });
      }
      cardImg.addEventListener('click', () => {
        openLightbox(project);
      });
    });
  }

  // 3. Setup Category Filters
  function setupFilters() {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Toggle active button class
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');
        
        // Filter elements
        if (filterValue === 'all') {
          renderProjects(projects);
        } else {
          const filtered = projects.filter(p => p.category === filterValue);
          renderProjects(filtered);
        }
      });
    });
  }

  // 4. Universal Lightbox Logic (Native Video, Youtube, Vimeo)
  function openLightbox(project) {
    if (!videoLightbox) return;

    // Set text details
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.description || '';
    lightboxClient.textContent = project.client || 'Projeto Próprio';
    
    // Format Date
    let dateStr = project.date || 'Recente';
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthIdx = parseInt(month, 10) - 1;
      dateStr = `${months[monthIdx] || month} ${year}`;
    }
    lightboxDate.textContent = dateStr;
    lightboxTags.textContent = project.tags ? project.tags.join(', ') : 'Edição';

    // Set Media
    const videoUrl = project.videoUrl;
    lightboxMediaContainer.innerHTML = '';

    // Handle Vertical/Mobile aspect ratios
    if (project.tags && (project.tags.includes('Vertical') || project.tags.includes('Mobile'))) {
      lightboxMediaContainer.classList.add('is-vertical');
    } else {
      lightboxMediaContainer.classList.remove('is-vertical');
    }

    if (isVideoFile(videoUrl)) {
      // Direct video file (MP4, WebM, etc. - local or hosted e.g. in GitHub)
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
      // Minimal UI: autoplay, no related videos from others, modest branding, hide controls slightly
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
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
        tags: ['Showreel', 'Edição', 'Efeitos Visuais', 'Portfolio']
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
