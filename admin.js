document.addEventListener('DOMContentLoaded', () => {
  // Senha simples para edição local do portfólio (sem dados sensíveis).
  const PASSCODE = 'mGxppt54';
  const DRAFT_KEY = 'purered_admin_draft';
  const AUTH_KEY = 'purered_auth';

  const SUBCATEGORIES = [
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
  ];

  let projects = [];      // estado atual (rascunho)
  let published = null;   // conteúdo do projects.json publicado
  let draggedId = null;

  /* ---------- Elementos ---------- */
  const $ = (id) => document.getElementById(id);

  const loginScreen = $('login-screen');
  const dashboard = $('dashboard-screen');
  const loginForm = $('login-form');
  const passcodeInput = $('passcode');
  const loginError = $('login-error');

  const syncBar = $('sync-bar');
  const syncText = $('sync-text');
  const btnExport = $('btn-export');
  const btnImport = $('btn-import');
  const btnDiscard = $('btn-discard');
  const importInput = $('import-file-input');

  const projectsList = $('projects-list');
  const searchInput = $('search-input');
  const statsEl = $('stats');

  const dialog = $('project-dialog');
  const form = $('project-form');
  const formTitle = $('form-title');

  /* ---------- Autenticação ---------- */

  function checkAuth() {
    const ok = sessionStorage.getItem(AUTH_KEY) === 'true';
    loginScreen.classList.toggle('hidden', ok);
    dashboard.classList.toggle('hidden', !ok);
    if (ok) loadData();
    else passcodeInput.focus();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passcodeInput.value === PASSCODE) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      loginError.classList.remove('show');
      passcodeInput.value = '';
      checkAuth();
    } else {
      loginError.classList.add('show');
      passcodeInput.select();
    }
  });

  $('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
  });

  /* ---------- Carregamento e sincronização ---------- */

  async function loadData() {
    try {
      const res = await fetch('projects.json?t=' + Date.now());
      published = res.ok ? await res.json() : [];
    } catch {
      published = [];
    }

    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Se o arquivo publicado já é igual ao rascunho, o rascunho não é mais necessário
        if (JSON.stringify(parsed) === JSON.stringify(published)) {
          localStorage.removeItem(DRAFT_KEY);
          projects = published.slice();
        } else {
          projects = parsed;
        }
      } catch {
        projects = published.slice();
      }
    } else {
      projects = published.slice();
    }

    normalizeOrder();
    render();
  }

  function isDirty() {
    return JSON.stringify(projects) !== JSON.stringify(published);
  }

  function saveDraft() {
    if (isDirty()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(projects));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
    render();
  }

  function updateSyncBar() {
    const dirty = isDirty();
    syncBar.classList.toggle('is-dirty', dirty);
    syncBar.classList.toggle('is-synced', !dirty);
    btnDiscard.classList.toggle('hidden', !dirty);
    syncText.textContent = dirty
      ? 'Alterações não publicadas — baixe o projects.json e substitua no projeto'
      : 'Tudo sincronizado com o site publicado';
  }

  btnExport.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'projects.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  btnImport.addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!Array.isArray(data)) throw new Error('formato');
        projects = data;
        normalizeOrder();
        saveDraft();
      } catch {
        alert('Arquivo inválido. Selecione um projects.json exportado por este painel.');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  });

  btnDiscard.addEventListener('click', () => {
    if (confirm('Descartar todas as alterações locais e voltar ao que está publicado no site?')) {
      localStorage.removeItem(DRAFT_KEY);
      projects = published.slice();
      normalizeOrder();
      render();
    }
  });

  /* ---------- Helpers ---------- */

  function normalizeOrder() {
    projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    projects.forEach((p, i) => { p.order = i; });
  }

  // Campos bilíngues podem ser string (legado) ou { pt, en }
  function langField(field, lang) {
    if (field == null) return '';
    if (typeof field === 'object' && !Array.isArray(field)) return field[lang] ?? '';
    return lang === 'pt' ? field : '';
  }

  function catLabel(id) {
    const sub = SUBCATEGORIES.find(s => s.id === id);
    return sub ? sub.label : 'Outros Projetos';
  }

  function thumbFor(p) {
    return p.thumbnailUrl || p.imageUrl || '';
  }

  function slugify(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'projeto';
  }

  function uniqueId(base) {
    let id = base;
    let n = 2;
    while (projects.some(p => p.id === id)) id = `${base}-${n++}`;
    return id;
  }

  /* ---------- Render ---------- */

  function render() {
    renderList();
    renderStats();
    updateSyncBar();
  }

  function renderStats() {
    const total = projects.length;
    const videos = projects.filter(p => (p.type || 'video') === 'video').length;
    const images = total - videos;
    const featured = projects.filter(p => p.featured).length;
    statsEl.innerHTML = `
      <span class="stat-chip"><strong>${total}</strong> projetos</span>
      <span class="stat-chip"><strong>${videos}</strong> vídeos</span>
      <span class="stat-chip"><strong>${images}</strong> banners</span>
      <span class="stat-chip"><strong>${featured}</strong> em destaque</span>
    `;
  }

  function renderList() {
    const query = (searchInput.value || '').trim().toLowerCase();
    projectsList.innerHTML = '';

    const visible = projects.filter(p => {
      if (!query) return true;
      const haystack = [
        langField(p.title, 'pt'), langField(p.title, 'en'),
        p.client || '', catLabel(p.subcategory)
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    if (visible.length === 0) {
      projectsList.innerHTML = `<div class="list-empty">${
        projects.length === 0
          ? 'Nenhum projeto ainda. Clique em <strong>+ Novo Projeto</strong> para começar.'
          : 'Nenhum projeto encontrado para essa busca.'
      }</div>`;
      return;
    }

    visible.forEach(p => {
      const row = document.createElement('div');
      row.className = 'project-row';
      row.dataset.id = p.id;
      row.draggable = !query; // reordenar só sem filtro ativo

      const type = p.type || 'video';
      const typeBadge = type === 'image'
        ? '<span class="row-badge badge-image">Banner</span>'
        : '<span class="row-badge badge-video">Vídeo</span>';

      row.innerHTML = `
        <span class="row-handle" title="Arraste para reordenar">⠿</span>
        <img class="row-thumb" src="${thumbFor(p)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="row-info">
          <div class="row-title">${langField(p.title, 'pt') || '(sem título)'}</div>
          <div class="row-meta">
            ${typeBadge}
            <span class="row-badge badge-cat">${catLabel(p.subcategory)}</span>
            <span>${p.client || ''}</span>
          </div>
        </div>
        <div class="row-actions">
          <button type="button" class="icon-btn btn-star ${p.featured ? 'star-on' : ''}" title="Destaque on/off">★</button>
          <button type="button" class="icon-btn btn-edit" title="Editar">✎</button>
          <button type="button" class="icon-btn btn-delete" title="Excluir">🗑</button>
        </div>
      `;
      projectsList.appendChild(row);
    });
  }

  searchInput.addEventListener('input', renderList);

  /* ---------- Ações da lista (delegação de eventos) ---------- */

  projectsList.addEventListener('click', (e) => {
    const row = e.target.closest('.project-row');
    if (!row) return;
    const project = projects.find(p => p.id === row.dataset.id);
    if (!project) return;

    if (e.target.closest('.btn-star')) {
      project.featured = !project.featured;
      saveDraft();
    } else if (e.target.closest('.btn-edit')) {
      openForm(project);
    } else if (e.target.closest('.btn-delete')) {
      const title = langField(project.title, 'pt');
      if (confirm(`Excluir "${title}"?\n\nLembre-se de baixar o projects.json depois para publicar.`)) {
        projects = projects.filter(p => p.id !== project.id);
        normalizeOrder();
        saveDraft();
      }
    }
  });

  /* ---------- Drag & drop ---------- */

  projectsList.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.project-row');
    if (!row) return;
    draggedId = row.dataset.id;
    row.classList.add('dragging');
  });

  projectsList.addEventListener('dragend', (e) => {
    const row = e.target.closest('.project-row');
    if (row) row.classList.remove('dragging');
    draggedId = null;
    projectsList.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
  });

  projectsList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const row = e.target.closest('.project-row');
    if (row && row.dataset.id !== draggedId) row.classList.add('drag-over');
  });

  projectsList.addEventListener('dragleave', (e) => {
    const row = e.target.closest('.project-row');
    if (row) row.classList.remove('drag-over');
  });

  projectsList.addEventListener('drop', (e) => {
    e.preventDefault();
    const row = e.target.closest('.project-row');
    if (!row || !draggedId || row.dataset.id === draggedId) return;

    const from = projects.findIndex(p => p.id === draggedId);
    const to = projects.findIndex(p => p.id === row.dataset.id);
    if (from === -1 || to === -1) return;

    const [moved] = projects.splice(from, 1);
    projects.splice(to, 0, moved);
    normalizeOrder();
    saveDraft();
  });

  /* ---------- Formulário ---------- */

  // Popular select de categorias
  const subcatSelect = $('f-subcategory');
  SUBCATEGORIES.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.label;
    subcatSelect.appendChild(opt);
  });

  function currentType() {
    return form.querySelector('input[name="f-type"]:checked').value;
  }

  function applyTypeVisibility() {
    const type = currentType();
    form.querySelectorAll('[data-only]').forEach(el => {
      el.classList.toggle('visible', el.dataset.only === type);
    });
  }

  form.querySelectorAll('input[name="f-type"]').forEach(radio => {
    radio.addEventListener('change', applyTypeVisibility);
  });

  // Preview da capa
  const thumbPreview = $('thumb-preview');
  const thumbPreviewImg = $('thumb-preview-img');

  function updateThumbPreview() {
    const url = $('f-thumbnail-url').value.trim() ||
      (currentType() === 'image' ? $('f-image-url').value.trim() : '');
    if (url) {
      thumbPreviewImg.src = url;
      thumbPreview.classList.remove('hidden');
    } else {
      thumbPreview.classList.add('hidden');
    }
  }

  ['f-thumbnail-url', 'f-image-url'].forEach(id => {
    $(id).addEventListener('input', updateThumbPreview);
  });
  thumbPreviewImg.addEventListener('error', () => thumbPreview.classList.add('hidden'));

  function openForm(project = null) {
    form.reset();
    $('f-id').value = project ? project.id : '';
    formTitle.textContent = project ? 'Editar Projeto' : 'Novo Projeto';

    if (project) {
      const type = project.type || 'video';
      form.querySelector(`input[name="f-type"][value="${type}"]`).checked = true;
      $('f-title-pt').value = langField(project.title, 'pt');
      $('f-title-en').value = langField(project.title, 'en');
      $('f-subcategory').value = project.subcategory || 'outros';
      $('f-orientation').value = project.orientation || 'horizontal';
      $('f-client').value = project.client || '';
      $('f-date').value = project.date || '';
      $('f-video-url').value = project.videoUrl || '';
      $('f-preview-url').value = project.previewUrl || '';
      $('f-image-url').value = project.imageUrl || '';
      $('f-thumbnail-url').value = project.thumbnailUrl || '';
      $('f-tags-pt').value = (langField(project.tags, 'pt') || []).join(', ');
      $('f-tags-en').value = (langField(project.tags, 'en') || []).join(', ');
      $('f-desc-pt').value = langField(project.description, 'pt');
      $('f-desc-en').value = langField(project.description, 'en');
      $('f-featured').checked = !!project.featured;
    }

    applyTypeVisibility();
    updateThumbPreview();
    dialog.showModal();
    $('f-title-pt').focus();
  }

  $('btn-new').addEventListener('click', () => openForm());
  $('btn-close-form').addEventListener('click', () => dialog.close());
  $('btn-cancel-form').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      dialog.close();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const type = currentType();
    const titlePt = $('f-title-pt').value.trim();
    if (!titlePt) {
      alert('O título em português é obrigatório.');
      return;
    }

    const videoUrl = $('f-video-url').value.trim();
    const imageUrl = $('f-image-url').value.trim();
    if (type === 'video' && !videoUrl) {
      alert('Informe o link do vídeo.');
      return;
    }
    if (type === 'image' && !imageUrl) {
      alert('Informe a URL da imagem do banner.');
      return;
    }

    const parseTags = (v) => v.split(',').map(t => t.trim()).filter(Boolean);
    const tagsPt = parseTags($('f-tags-pt').value);
    const tagsEn = parseTags($('f-tags-en').value);

    const id = $('f-id').value;
    const existing = id ? projects.find(p => p.id === id) : null;

    const data = {
      id: existing ? existing.id : uniqueId(slugify(titlePt)),
      type,
      subcategory: $('f-subcategory').value,
      orientation: type === 'image' ? 'vertical' : $('f-orientation').value,
      featured: $('f-featured').checked,
      order: existing ? existing.order : projects.length,
      client: $('f-client').value.trim(),
      date: $('f-date').value,
      title: {
        pt: titlePt,
        en: $('f-title-en').value.trim() || titlePt
      },
      description: {
        pt: $('f-desc-pt').value.trim(),
        en: $('f-desc-en').value.trim() || $('f-desc-pt').value.trim()
      },
      tags: {
        pt: tagsPt,
        en: tagsEn.length ? tagsEn : tagsPt
      }
    };

    if (type === 'video') {
      data.videoUrl = videoUrl;
      if ($('f-preview-url').value.trim()) data.previewUrl = $('f-preview-url').value.trim();
      if ($('f-thumbnail-url').value.trim()) data.thumbnailUrl = $('f-thumbnail-url').value.trim();
    } else {
      data.imageUrl = imageUrl;
      data.thumbnailUrl = $('f-thumbnail-url').value.trim() || imageUrl;
    }

    if (existing) {
      projects[projects.indexOf(existing)] = data;
    } else {
      projects.push(data);
    }

    normalizeOrder();
    saveDraft();
    dialog.close();
  });

  /* ---------- Init ---------- */
  checkAuth();
});
