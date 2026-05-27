document.addEventListener('DOMContentLoaded', () => {
  const PASSCODE = 'purered2026';
  let projects = [];

  // DOM Elements
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const passcodeInput = document.getElementById('passcode');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');

  // Stats Elements
  const statTotal = document.getElementById('stat-total');
  const statEditing = document.getElementById('stat-editing');
  const statEvents = document.getElementById('stat-events');

  // Table & Form Elements
  const tableBody = document.getElementById('projects-table-body');
  const projectForm = document.getElementById('project-form');
  const formTitle = document.getElementById('form-action-title');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const btnSaveProject = document.getElementById('btn-save-project');

  // Input Fields
  const inputId = document.getElementById('project-id');
  const inputTitle = document.getElementById('project-title');
  const inputCategory = document.getElementById('project-category');
  const inputVideoUrl = document.getElementById('project-video-url');
  const inputThumbnailUrl = document.getElementById('project-thumbnail-url');
  const inputClient = document.getElementById('project-client');
  const inputDate = document.getElementById('project-date');
  const inputTags = document.getElementById('project-tags');
  const inputDesc = document.getElementById('project-desc');

  // Sync Elements
  const btnExportDb = document.getElementById('btn-export-db');
  const btnImportDb = document.getElementById('btn-import-db');
  const importFileInput = document.getElementById('import-file-input');

  // 1. Authentication Check
  function checkAuth() {
    const isAuth = sessionStorage.getItem('purered_auth') === 'true';
    if (isAuth) {
      loginScreen.classList.add('hidden');
      dashboardScreen.classList.remove('hidden');
      loadDatabase();
    } else {
      loginScreen.classList.remove('hidden');
      dashboardScreen.classList.add('hidden');
    }
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = passcodeInput.value;
      
      if (enteredPass === PASSCODE) {
        sessionStorage.setItem('purered_auth', 'true');
        loginError.classList.remove('show');
        passcodeInput.value = '';
        checkAuth();
      } else {
        loginError.classList.add('show');
        passcodeInput.focus();
      }
    });
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('purered_auth');
      checkAuth();
    });
  }

  // 2. Load and Manage Local Database
  async function loadDatabase() {
    try {
      const localData = localStorage.getItem('purered_projects');
      if (localData) {
        projects = JSON.parse(localData);
      } else {
        const response = await fetch('projects.json');
        if (response.ok) {
          projects = await response.ok ? await response.json() : [];
          localStorage.setItem('purered_projects', JSON.stringify(projects));
        } else {
          projects = getFallbackMockData();
          localStorage.setItem('purered_projects', JSON.stringify(projects));
        }
      }
      updateStats();
      renderTable();
    } catch (error) {
      console.error('Error loading database:', error);
      projects = getFallbackMockData();
      renderTable();
      updateStats();
    }
  }

  // Update Counters
  function updateStats() {
    if (!statTotal) return;
    const total = projects.length;
    const editing = projects.filter(p => p.category === 'editing').length;
    const events = projects.filter(p => p.category === 'events').length;

    statTotal.textContent = total;
    statEditing.textContent = editing;
    statEvents.textContent = events;
  }

  // Render Database Rows
  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (projects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            Nenhum projeto cadastrado no momento. Use o formulário para adicionar!
          </td>
        </tr>
      `;
      return;
    }

    projects.forEach(project => {
      const tr = document.createElement('tr');
      
      const badgeClass = project.category === 'editing' ? 'cat-edit' : 'cat-event';
      const badgeText = project.category === 'editing' ? 'Edição' : 'Evento';

      tr.innerHTML = `
        <td style="font-weight: 700;">${project.title}</td>
        <td><span class="badge-cat ${badgeClass}">${badgeText}</span></td>
        <td>${project.client || 'Independente'}</td>
        <td style="text-align: center;">
          <button class="btn-action btn-edit" data-id="${project.id}" title="Editar Projeto">
            <svg viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="btn-action btn-delete" data-id="${project.id}" title="Excluir Projeto">
            <svg viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach row action listeners
    const editButtons = tableBody.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        startEdit(id);
      });
    });

    const deleteButtons = tableBody.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteProject(id);
      });
    });
  }

  // 3. CRUD Forms Logic
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = inputId.value;
      const title = inputTitle.value.trim();
      const category = inputCategory.value;
      const videoUrl = inputVideoUrl.value.trim();
      const thumbnailUrl = inputThumbnailUrl.value.trim();
      const client = inputClient.value.trim();
      const date = inputDate.value;
      const tags = inputTags.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const description = inputDesc.value.trim();

      if (id) {
        // Edit Mode
        const idx = projects.findIndex(p => p.id === id);
        if (idx !== -1) {
          projects[idx] = { id, title, category, videoUrl, thumbnailUrl, client, date, tags, description };
          alert('Projeto atualizado com sucesso! (Salvo localmente)');
        }
      } else {
        // Create Mode
        const newProject = {
          id: Date.now().toString(),
          title,
          category,
          videoUrl,
          thumbnailUrl,
          client,
          date,
          tags,
          description
        };
        projects.push(newProject);
        alert('Projeto cadastrado com sucesso! (Salvo localmente)');
      }

      // Save to localStorage, update view and reset form
      localStorage.setItem('purered_projects', JSON.stringify(projects));
      resetForm();
      updateStats();
      renderTable();
    });
  }

  // Cancel edit handler
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', resetForm);
  }

  function startEdit(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    // Fill form fields
    inputId.value = project.id;
    inputTitle.value = project.title;
    inputCategory.value = project.category;
    inputVideoUrl.value = project.videoUrl;
    inputThumbnailUrl.value = project.thumbnailUrl || '';
    inputClient.value = project.client || 'Independente';
    inputDate.value = project.date || '';
    inputTags.value = project.tags ? project.tags.join(', ') : '';
    inputDesc.value = project.description || '';

    // Adjust titles and buttons
    formTitle.textContent = `Editar: ${project.title}`;
    btnSaveProject.textContent = 'Salvar Alterações';
    btnCancelEdit.style.display = 'inline-block';
    
    // Focus first input field
    inputTitle.focus();
  }

  function resetForm() {
    projectForm.reset();
    inputId.value = '';
    formTitle.textContent = 'Adicionar Novo Projeto';
    btnSaveProject.textContent = 'Salvar Projeto';
    btnCancelEdit.style.display = 'none';
  }

  function deleteProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const confirmDelete = confirm(`Tem certeza que deseja excluir o projeto "${project.title}"?\nEssa alteração só será permanente na web após exportar e enviar o novo arquivo projects.json para o GitHub.`);
    
    if (confirmDelete) {
      projects = projects.filter(p => p.id !== id);
      localStorage.setItem('purered_projects', JSON.stringify(projects));
      
      // If we were editing the deleted project, reset form
      if (inputId.value === id) {
        resetForm();
      }

      updateStats();
      renderTable();
    }
  }

  // 4. JSON Sync Modules
  
  // Export: Download database file
  if (btnExportDb) {
    btnExportDb.addEventListener('click', () => {
      const dataStr = JSON.stringify(projects, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'projects.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Banco de dados exportado com sucesso! Arquivo "projects.json" baixado.\n\nSubstitua o arquivo na pasta do seu projeto e envie as alterações usando Git (git push) para ver as atualizações online.');
    });
  }

  // Import: Load file upload back into browser
  if (btnImportDb) {
    btnImportDb.addEventListener('click', () => {
      importFileInput.click();
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const importedData = JSON.parse(evt.target.result);
          
          // Basic Sanity Validation
          if (Array.isArray(importedData)) {
            const isValid = importedData.every(item => item.id && item.title && item.category && item.videoUrl);
            if (isValid) {
              projects = importedData;
              localStorage.setItem('purered_projects', JSON.stringify(projects));
              updateStats();
              renderTable();
              alert('Banco de dados importado e atualizado com sucesso! (Carregado localmente)');
            } else {
              alert('Formato inválido: Certifique-se de que todos os itens no JSON possuem ID, Título, Categoria e URL do Vídeo.');
            }
          } else {
            alert('Formato inválido: O arquivo deve conter uma lista (Array) de projetos.');
          }
        } catch (err) {
          alert('Erro ao processar o arquivo JSON. Certifique-se de que o arquivo está correto.');
          console.error(err);
        }
      };
      reader.readAsText(file);
      // Reset input value to allow uploading the same file again
      importFileInput.value = '';
    });
  }

  // Fallback mock array
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
      }
    ];
  }

  // Initialize Auth Check
  checkAuth();
});
