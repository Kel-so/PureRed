document.addEventListener('DOMContentLoaded', () => {
  const LANG = document.documentElement.lang === 'en' ? 'en' : 'pt';
  const WHATSAPP = '5514991223598';

  // Valores de edição — únicos números do quiz, vindos da tabela de valores.
  // Filmmaker e Branding fecham sem valor fixo (orçamento personalizado).
  const SERVICES = {
    edu:    { brl: [150, 300],   usd: [40, 80],   plus: false, days: [3, 5] },
    shorts: { brl: [80, 150],    usd: [20, 40],   plus: false, days: [2, 3] },
    promo:  { brl: [600, 1500],  usd: [150, 350], plus: true,  days: [5, 7] },
    music:  { brl: [1200, 3000], usd: [300, 700], plus: true,  days: [7, 10] }
  };
  // Entrega expressa: +30% no valor, prazo de produção cai pela metade
  const URGENCY_MULTIPLIER = 1.3;
  const URGENCY_TIME_FACTOR = 0.5;

  const T = {
    pt: {
      stepLabel: (i, n) => `Passo ${i} de ${n}`,
      startLabel: 'Comece aqui',
      back: '← Voltar',
      restart: 'Recomeçar diagnóstico',
      seePricing: 'Ver tabela completa de valores',
      whatsCta: 'Enviar resumo no WhatsApp',
      namePlaceholder: 'Seu nome (opcional)',
      nameTitle: 'Último passo: como posso te chamar?',
      nameHint: 'Só para personalizar a proposta. Pode pular se preferir.',
      nameBtn: 'Ver meu diagnóstico →',
      currency: 'brl',
      money: (n) => 'R$ ' + n.toLocaleString('pt-BR'),
      days: (a, b) => `${a}–${b} dias úteis`,

      track: {
        title: 'O que o seu projeto precisa hoje?',
        hint: 'Responda em menos de 1 minuto e receba um diagnóstico com estimativa real.',
        options: [
          { id: 'edit', icon: '🎬', label: 'Edição de Vídeo', sub: 'Você já tem o material gravado', price: 'estimativa na hora' },
          { id: 'film', icon: '📹', label: 'Captação & Filmmaker', sub: 'Eventos, clipes, comerciais — eu gravo e edito', price: 'sob medida' },
          { id: 'brand', icon: '🎨', label: 'Branding & Design', sub: 'Identidade visual, motion, banners', price: 'sob medida' }
        ]
      },

      service: {
        title: 'Que tipo de vídeo vamos editar?',
        hint: 'Valores base da tabela oficial — o diagnóstico final considera o seu volume.',
        options: [
          { id: 'edu', icon: '🎓', label: 'Educativo / Infoproduto', sub: 'Aulas, treinamentos, cursos (10–15 min)', price: 'R$ 150–300 /aula' },
          { id: 'shorts', icon: '⚡', label: 'Short / Reel / TikTok', sub: 'Vertical high-energy de até 1 min', price: 'R$ 80–150 /vídeo' },
          { id: 'promo', icon: '🔥', label: 'Promo / Teaser Comercial', sub: '30s a 1 min, focado em conversão', price: 'R$ 600–1.500+' },
          { id: 'music', icon: '🎵', label: 'Music Video / Clipe', sub: 'Rap, trap, drift — sync fino com o beat', price: 'R$ 1.200–3.000+' }
        ]
      },

      qty: {
        title: 'Quantos vídeos você precisa?',
        hint: 'Volume maior destrava condição especial.',
        options: [
          { id: 1, icon: '1️⃣', label: '1 vídeo', sub: 'Job único' },
          { id: 3, icon: '3️⃣', label: '3 vídeos', sub: 'Pacote pequeno' },
          { id: 5, icon: '5️⃣', label: '5 vídeos', sub: 'Pacote médio' },
          { id: 10, icon: '📦', label: '10 ou mais', sub: 'Volume / fluxo contínuo — condição especial' }
        ]
      },

      urgency: {
        title: 'Qual é a urgência da entrega?',
        hint: 'Entrega expressa fura a fila da minha agenda e corta o prazo pela metade.',
        options: [
          { id: 'normal', icon: '🗓️', label: 'Prazo padrão', sub: 'Entra na fila normal de produção' },
          { id: 'express', icon: '⚡', label: 'Entrega expressa', sub: 'Prioridade total — prazo cai pela metade', price: '+30%' }
        ]
      },

      recurrence: {
        title: 'Isso é pontual ou recorrente?',
        hint: 'Fluxo contínuo garante prioridade na minha agenda.',
        options: [
          { id: 'single', icon: '🎯', label: 'Job único', sub: 'Uma entrega fechada' },
          { id: 'monthly', icon: '🔁', label: 'Recorrente', sub: 'Demanda semanal ou mensal — condição especial' }
        ]
      },

      filmType: {
        title: 'O que vamos gravar?',
        hint: 'Direção + captação + edição, com meu equipamento.',
        options: [
          { id: 'event', icon: '🎪', label: 'Evento', sub: 'Festival, festa, campeonato — aftermovie ou Same Day Edit' },
          { id: 'clip', icon: '🎤', label: 'Clipe Musical', sub: 'Rap, trap — com direção artística e VFX' },
          { id: 'commercial', icon: '🏢', label: 'Comercial / Institucional', sub: 'Marca, produto ou serviço' },
          { id: 'social', icon: '📱', label: 'Conteúdo para Redes', sub: 'Pacote de captação para social media' }
        ]
      },

      filmDuration: {
        title: 'Quanto tempo de captação?',
        hint: 'Isso define equipe, baterias e logística.',
        options: [
          { id: 'half', icon: '🌗', label: 'Algumas horas', sub: 'Meio período (até 4h)' },
          { id: 'full', icon: '☀️', label: 'Diária cheia', sub: 'Até 8h de gravação' },
          { id: 'multi', icon: '📅', label: 'Múltiplos dias', sub: 'Cobertura completa ou tour' }
        ]
      },

      filmLocation: {
        title: 'Onde acontece a gravação?',
        hint: 'Deslocamento entra no orçamento personalizado.',
        options: [
          { id: 'local', icon: '📍', label: 'Londrina e região', sub: 'Sem custo de viagem' },
          { id: 'travel', icon: '✈️', label: 'Outra cidade / viagem', sub: 'Logística calculada na proposta' }
        ]
      },

      brandNeed: {
        title: 'O que a sua marca precisa?',
        hint: 'Tudo com a estética forte que você viu no portfólio.',
        options: [
          { id: 'identity', icon: '🧬', label: 'Identidade Visual', sub: 'Logo, paleta, tipografia, manual de marca' },
          { id: 'motion', icon: '🌀', label: 'Motion Graphics', sub: 'Intros, animações de logo, assets para vídeo' },
          { id: 'banners', icon: '🖼️', label: 'Banners & Social Design', sub: 'Matchday, atletas, campanhas para o feed' },
          { id: 'rebrand', icon: '♻️', label: 'Rebranding Completo', sub: 'Reposicionar uma marca que já existe' }
        ]
      },

      brandStage: {
        title: 'Em que momento a marca está?',
        hint: 'Isso muda o ponto de partida da direção de arte.',
        options: [
          { id: 'new', icon: '🌱', label: 'Marca nova', sub: 'Começando do zero' },
          { id: 'existing', icon: '🏗️', label: 'Marca existente', sub: 'Já existe, precisa evoluir' }
        ]
      },

      final: {
        editBadge: 'Diagnóstico concluído',
        editTitle: (name) => name ? `${name}, sua ilha de edição está pronta. 🚀` : 'Sua ilha de edição está pronta. 🚀',
        editText: 'Com base no formato e volume selecionados, esta é a estrutura calculada para o seu projeto:',
        filmBadge: 'Produção mapeada',
        filmTitle: (name) => name ? `${name}, tudo pronto para a produção cinemática! 🎬` : 'Tudo pronto para a produção cinemática! 🎬',
        filmText: 'Captação física depende de agenda, equipe e logística — por isso o valor é fechado sob medida. Me manda o resumo e eu respondo com a proposta completa em até 24h.',
        brandBadge: 'DNA visual mapeado',
        brandTitle: (name) => name ? `${name}, o DNA visual da sua marca foi mapeado. 🎨` : 'O DNA visual da sua marca foi mapeado. 🎨',
        brandText: 'Projetos de branding são fechados sob medida: direção de arte, estudo tipográfico, paleta estratégica e assets prontos para vídeo e redes. Me manda o resumo e eu respondo com a proposta conceitual em até 24h.',
        sumService: 'Serviço',
        sumQty: 'Quantidade',
        sumUrgency: 'Urgência',
        sumUrgencyExpress: '⚡ Entrega expressa — prazo pela metade',
        sumUrgencyNormal: 'Prazo padrão',
        sumRecurrence: 'Frequência',
        sumRecSingle: 'Job único',
        sumRecMonthly: 'Recorrente — condição especial no WhatsApp',
        sumDeadline: 'Prazo estimado',
        sumTotal: 'Investimento estimado',
        sumCustom: 'Orçamento personalizado — resposta em até 24h',
        volumeNote: 'Volume 10+ tem condição especial — o valor exato sai na conversa.',
        disclaimer: 'Estimativa baseada na tabela oficial de valores. O número final é confirmado depois de avaliarmos o material e o escopo — sem surpresa no meio do caminho.',
        disclaimerCustom: 'Sem valor genérico aqui: cada produção dessas tem escopo próprio. O resumo já me dá tudo que preciso para te responder rápido.',
        waIntro: 'Oi Kelson! Montei um orçamento nos Projetos Especiais:',
        waName: 'Meu nome',
        waClose: 'Podemos conversar?'
      },

      labels: {
        edit: 'Edição de Vídeo', film: 'Captação & Filmmaker', brand: 'Branding & Design',
        edu: 'Educativo / Infoproduto', shorts: 'Short / Reel / TikTok', promo: 'Promo / Teaser Comercial', music: 'Music Video / Clipe',
        event: 'Evento', clip: 'Clipe Musical', commercial: 'Comercial / Institucional', social: 'Conteúdo para Redes',
        half: 'Meio período (até 4h)', full: 'Diária cheia (8h)', multi: 'Múltiplos dias',
        local: 'Londrina e região', travel: 'Outra cidade / viagem',
        identity: 'Identidade Visual', motion: 'Motion Graphics', banners: 'Banners & Social Design', rebrand: 'Rebranding Completo',
        new: 'Marca nova', existing: 'Marca existente',
        videos: (n) => n >= 10 ? '10+ vídeos' : `${n} vídeo${n > 1 ? 's' : ''}`
      }
    },

    en: {
      stepLabel: (i, n) => `Step ${i} of ${n}`,
      startLabel: 'Start here',
      back: '← Back',
      restart: 'Restart diagnosis',
      seePricing: 'See the full price list',
      whatsCta: 'Send summary on WhatsApp',
      namePlaceholder: 'Your name (optional)',
      nameTitle: 'Last step: what should I call you?',
      nameHint: 'Just to personalize the proposal. Feel free to skip.',
      nameBtn: 'See my diagnosis →',
      currency: 'usd',
      money: (n) => '$' + n.toLocaleString('en-US'),
      days: (a, b) => `${a}–${b} business days`,

      track: {
        title: 'What does your project need today?',
        hint: 'Answer in under 1 minute and get a diagnosis with a real estimate.',
        options: [
          { id: 'edit', icon: '🎬', label: 'Video Editing', sub: 'You already have the footage', price: 'instant estimate' },
          { id: 'film', icon: '📹', label: 'Filming & Filmmaking', sub: 'Events, music videos, commercials — I shoot and edit', price: 'custom quote' },
          { id: 'brand', icon: '🎨', label: 'Branding & Design', sub: 'Visual identity, motion, banners', price: 'custom quote' }
        ]
      },

      service: {
        title: 'What kind of video are we editing?',
        hint: 'Base rates from the official price list — the final diagnosis factors in your volume.',
        options: [
          { id: 'edu', icon: '🎓', label: 'Educational / Info Product', sub: 'Classes, training, courses (10–15 min)', price: '$40–80 /class' },
          { id: 'shorts', icon: '⚡', label: 'Short / Reel / TikTok', sub: 'High-energy vertical up to 1 min', price: '$20–40 /video' },
          { id: 'promo', icon: '🔥', label: 'Promo / Commercial Teaser', sub: '30s to 1 min, built for conversion', price: '$150–350+' },
          { id: 'music', icon: '🎵', label: 'Music Video', sub: 'Rap, trap, drift — fine sync with the beat', price: '$300–700+' }
        ]
      },

      qty: {
        title: 'How many videos do you need?',
        hint: 'Higher volume unlocks special conditions.',
        options: [
          { id: 1, icon: '1️⃣', label: '1 video', sub: 'One-off job' },
          { id: 3, icon: '3️⃣', label: '3 videos', sub: 'Small batch' },
          { id: 5, icon: '5️⃣', label: '5 videos', sub: 'Medium batch' },
          { id: 10, icon: '📦', label: '10 or more', sub: 'Volume / ongoing flow — special conditions' }
        ]
      },

      urgency: {
        title: 'How urgent is the delivery?',
        hint: 'Express delivery skips my production queue and cuts the turnaround in half.',
        options: [
          { id: 'normal', icon: '🗓️', label: 'Standard timeline', sub: 'Joins the normal production queue' },
          { id: 'express', icon: '⚡', label: 'Express delivery', sub: 'Full priority — turnaround cut in half', price: '+30%' }
        ]
      },

      recurrence: {
        title: 'Is this one-off or recurring?',
        hint: 'Ongoing flow gets priority in my schedule.',
        options: [
          { id: 'single', icon: '🎯', label: 'One-off job', sub: 'A single closed delivery' },
          { id: 'monthly', icon: '🔁', label: 'Recurring', sub: 'Weekly or monthly demand — special conditions' }
        ]
      },

      filmType: {
        title: 'What are we shooting?',
        hint: 'Direction + filming + editing, with my gear.',
        options: [
          { id: 'event', icon: '🎪', label: 'Event', sub: 'Festival, party, championship — aftermovie or Same Day Edit' },
          { id: 'clip', icon: '🎤', label: 'Music Video', sub: 'Rap, trap — with art direction and VFX' },
          { id: 'commercial', icon: '🏢', label: 'Commercial / Corporate', sub: 'Brand, product or service' },
          { id: 'social', icon: '📱', label: 'Social Media Content', sub: 'Filming package for social media' }
        ]
      },

      filmDuration: {
        title: 'How long is the shoot?',
        hint: 'This defines crew, batteries and logistics.',
        options: [
          { id: 'half', icon: '🌗', label: 'A few hours', sub: 'Half day (up to 4h)' },
          { id: 'full', icon: '☀️', label: 'Full day', sub: 'Up to 8h of filming' },
          { id: 'multi', icon: '📅', label: 'Multiple days', sub: 'Full coverage or tour' }
        ]
      },

      filmLocation: {
        title: 'Where does the shoot happen?',
        hint: 'Travel is factored into the custom quote.',
        options: [
          { id: 'local', icon: '📍', label: 'Londrina area (Brazil)', sub: 'No travel costs' },
          { id: 'travel', icon: '✈️', label: 'Another city / travel', sub: 'Logistics calculated in the proposal' }
        ]
      },

      brandNeed: {
        title: 'What does your brand need?',
        hint: 'All with the bold aesthetic you saw in the portfolio.',
        options: [
          { id: 'identity', icon: '🧬', label: 'Visual Identity', sub: 'Logo, palette, typography, brand manual' },
          { id: 'motion', icon: '🌀', label: 'Motion Graphics', sub: 'Intros, logo animations, video assets' },
          { id: 'banners', icon: '🖼️', label: 'Banners & Social Design', sub: 'Matchday, athletes, feed campaigns' },
          { id: 'rebrand', icon: '♻️', label: 'Full Rebranding', sub: 'Reposition an existing brand' }
        ]
      },

      brandStage: {
        title: 'Where is the brand right now?',
        hint: 'This changes the starting point of the art direction.',
        options: [
          { id: 'new', icon: '🌱', label: 'New brand', sub: 'Starting from scratch' },
          { id: 'existing', icon: '🏗️', label: 'Existing brand', sub: 'Already exists, needs to evolve' }
        ]
      },

      final: {
        editBadge: 'Diagnosis complete',
        editTitle: (name) => name ? `${name}, your editing setup is ready. 🚀` : 'Your editing setup is ready. 🚀',
        editText: 'Based on the format and volume you selected, this is the structure calculated for your project:',
        filmBadge: 'Production mapped',
        filmTitle: (name) => name ? `${name}, everything is set for the cinematic production! 🎬` : 'Everything is set for the cinematic production! 🎬',
        filmText: 'Physical shoots depend on schedule, crew and logistics — so the price is quoted individually. Send me the summary and I\'ll reply with the full proposal within 24h.',
        brandBadge: 'Visual DNA mapped',
        brandTitle: (name) => name ? `${name}, your brand's visual DNA has been mapped. 🎨` : 'Your brand\'s visual DNA has been mapped. 🎨',
        brandText: 'Branding projects are quoted individually: art direction, typographic study, strategic palette and assets ready for video and social. Send me the summary and I\'ll reply with the concept proposal within 24h.',
        sumService: 'Service',
        sumQty: 'Quantity',
        sumUrgency: 'Urgency',
        sumUrgencyExpress: '⚡ Express delivery — turnaround cut in half',
        sumUrgencyNormal: 'Standard timeline',
        sumRecurrence: 'Frequency',
        sumRecSingle: 'One-off job',
        sumRecMonthly: 'Recurring — special conditions on WhatsApp',
        sumDeadline: 'Estimated turnaround',
        sumTotal: 'Estimated investment',
        sumCustom: 'Custom quote — reply within 24h',
        volumeNote: 'Volume 10+ gets special conditions — the exact number comes up in our chat.',
        disclaimer: 'Estimate based on the official price list. The final number is confirmed after we review the footage and scope — no surprises halfway through.',
        disclaimerCustom: 'No generic number here: each of these productions has its own scope. The summary gives me everything I need to reply fast.',
        waIntro: 'Hi Kelson! I just built a quote on Special Projects:',
        waName: 'My name is',
        waClose: 'Can we talk?'
      },

      labels: {
        edit: 'Video Editing', film: 'Filming & Filmmaking', brand: 'Branding & Design',
        edu: 'Educational / Info Product', shorts: 'Short / Reel / TikTok', promo: 'Promo / Commercial Teaser', music: 'Music Video',
        event: 'Event', clip: 'Music Video', commercial: 'Commercial / Corporate', social: 'Social Media Content',
        half: 'Half day (up to 4h)', full: 'Full day (8h)', multi: 'Multiple days',
        local: 'Londrina area', travel: 'Another city / travel',
        identity: 'Visual Identity', motion: 'Motion Graphics', banners: 'Banners & Social Design', rebrand: 'Full Rebranding',
        new: 'New brand', existing: 'Existing brand',
        videos: (n) => n >= 10 ? '10+ videos' : `${n} video${n > 1 ? 's' : ''}`
      }
    }
  }[LANG];

  /* ---------- Estado e fluxo ---------- */

  const state = {};
  let history = [];

  const FLOWS = {
    edit: ['service', 'qty', 'urgency', 'recurrence', 'name'],
    film: ['filmType', 'filmDuration', 'filmLocation', 'name'],
    brand: ['brandNeed', 'brandStage', 'name']
  };

  const card = document.getElementById('quiz-card');
  const progressFill = document.getElementById('quiz-progress-fill');

  function totalSteps() {
    return state.track ? FLOWS[state.track].length + 1 : 1;
  }

  function currentStepIndex() {
    return history.length + 1;
  }

  function updateProgress(final = false) {
    const pct = final ? 100 : ((currentStepIndex() - 1) / totalSteps()) * 100;
    progressFill.style.width = Math.max(pct, 4) + '%';
  }

  function optionButton(opt, onPick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    btn.innerHTML = `
      <span class="opt-icon">${opt.icon}</span>
      <span class="opt-text">
        <strong>${opt.label}</strong>
        ${opt.sub ? `<span>${opt.sub}</span>` : ''}
      </span>
      ${opt.price ? `<span class="opt-price">${opt.price}</span>` : ''}
    `;
    btn.addEventListener('click', () => onPick(opt.id));
    return btn;
  }

  function renderQuestion(stepId) {
    const q = T[stepId];
    card.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'quiz-step-label';
    label.textContent = T.stepLabel(currentStepIndex(), totalSteps());
    card.appendChild(label);

    const h2 = document.createElement('h2');
    h2.textContent = q.title;
    card.appendChild(h2);

    const hint = document.createElement('p');
    hint.className = 'quiz-hint';
    hint.textContent = q.hint;
    card.appendChild(hint);

    const opts = document.createElement('div');
    opts.className = 'quiz-options';
    q.options.forEach(opt => {
      opts.appendChild(optionButton(opt, (value) => {
        state[stepId] = value;
        history.push(stepId);
        next();
      }));
    });
    card.appendChild(opts);

    appendBackButton();
    updateProgress();
  }

  function renderNameStep() {
    card.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'quiz-step-label';
    label.textContent = T.stepLabel(currentStepIndex(), totalSteps());
    card.appendChild(label);

    const h2 = document.createElement('h2');
    h2.textContent = T.nameTitle;
    card.appendChild(h2);

    const hint = document.createElement('p');
    hint.className = 'quiz-hint';
    hint.textContent = T.nameHint;
    card.appendChild(hint);

    const group = document.createElement('div');
    group.className = 'quiz-input-group';
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 40;
    input.placeholder = T.namePlaceholder;
    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'btn-brutal';
    submit.textContent = T.nameBtn;

    const finish = () => {
      state.name = input.value.trim();
      history.push('name');
      renderFinal();
    };
    submit.addEventListener('click', finish);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(); });

    group.appendChild(input);
    group.appendChild(submit);
    card.appendChild(group);

    appendBackButton();
    updateProgress();
    input.focus();
  }

  function appendBackButton() {
    const nav = document.createElement('div');
    nav.className = 'quiz-nav';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'quiz-back';
    back.textContent = T.back;
    back.style.visibility = history.length ? 'visible' : 'hidden';
    back.addEventListener('click', goBack);
    nav.appendChild(back);
    card.appendChild(nav);
  }

  function goBack() {
    const last = history.pop();
    if (last) delete state[last];
    next();
  }

  function next() {
    if (!('track' in state)) {
      renderTrack();
      return;
    }
    const flow = FLOWS[state.track];
    const nextStep = flow.find(step => !(step in state));
    if (!nextStep) {
      renderFinal();
      return;
    }
    if (nextStep === 'name') renderNameStep();
    else renderQuestion(nextStep);
  }

  function renderTrack() {
    const q = T.track;
    card.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'quiz-step-label';
    label.textContent = T.startLabel;
    card.appendChild(label);

    const h2 = document.createElement('h2');
    h2.textContent = q.title;
    card.appendChild(h2);

    const hint = document.createElement('p');
    hint.className = 'quiz-hint';
    hint.textContent = q.hint;
    card.appendChild(hint);

    const opts = document.createElement('div');
    opts.className = 'quiz-options';
    q.options.forEach(opt => {
      opts.appendChild(optionButton(opt, (value) => {
        state.track = value;
        history.push('track');
        next();
      }));
    });
    card.appendChild(opts);

    updateProgress();
  }

  /* ---------- Tela final ---------- */

  function editEstimate() {
    const svc = SERVICES[state.service];
    const range = svc[T.currency];
    const qty = state.qty;
    const urgent = state.urgency === 'express';

    let min = range[0] * qty;
    let max = range[1] * qty;
    if (urgent) {
      min = Math.round(min * URGENCY_MULTIPLIER);
      max = Math.round(max * URGENCY_MULTIPLIER);
    }

    // Prazo cresce com o volume; entrega expressa corta pela metade
    const extraDays = qty >= 10 ? 4 : qty >= 5 ? 2 : 0;
    let dayMin = svc.days[0] + extraDays;
    let dayMax = svc.days[1] + extraDays;
    if (urgent) {
      dayMin = Math.max(1, Math.ceil(dayMin * URGENCY_TIME_FACTOR));
      dayMax = Math.max(1, Math.ceil(dayMax * URGENCY_TIME_FACTOR));
    }

    return {
      total: `${T.money(min)} – ${T.money(max)}${svc.plus ? '+' : ''}`,
      deadline: T.days(dayMin, dayMax)
    };
  }

  function summaryRow(label, value, isTotal = false) {
    return `
      <div class="quiz-summary-row${isTotal ? ' sum-total' : ''}">
        <span class="sum-label">${label}</span>
        <span class="sum-value">${value}</span>
      </div>
    `;
  }

  function buildWhatsAppLink(lines) {
    const msg = [T.final.waIntro, '', ...lines, ''];
    if (state.name) msg.push(`${T.final.waName}: ${state.name}.`);
    msg.push(T.final.waClose);
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg.join('\n'))}`;
  }

  function renderFinal() {
    const f = T.final;
    const L = T.labels;
    card.innerHTML = '';
    updateProgress(true);

    let badge, title, text, rows = '', waLines = [], disclaimer;

    if (state.track === 'edit') {
      const est = editEstimate();
      const urgent = state.urgency === 'express';
      badge = f.editBadge;
      title = f.editTitle(state.name);
      text = f.editText;
      disclaimer = f.disclaimer;

      rows += summaryRow(f.sumService, L[state.service]);
      rows += summaryRow(f.sumQty, L.videos(state.qty));
      rows += summaryRow(f.sumUrgency, urgent ? f.sumUrgencyExpress : f.sumUrgencyNormal);
      rows += summaryRow(f.sumRecurrence, state.recurrence === 'monthly' ? f.sumRecMonthly : f.sumRecSingle);
      rows += summaryRow(f.sumDeadline, est.deadline);
      rows += summaryRow(f.sumTotal, est.total, true);

      waLines = [
        `• ${f.sumService}: ${L[state.service]}`,
        `• ${f.sumQty}: ${L.videos(state.qty)}`,
        `• ${f.sumUrgency}: ${urgent ? f.sumUrgencyExpress : f.sumUrgencyNormal}`,
        `• ${f.sumRecurrence}: ${state.recurrence === 'monthly' ? f.sumRecMonthly.split(' — ')[0] : f.sumRecSingle}`,
        `• ${f.sumTotal}: ${est.total}`,
        `• ${f.sumDeadline}: ${est.deadline}`
      ];
    } else if (state.track === 'film') {
      badge = f.filmBadge;
      title = f.filmTitle(state.name);
      text = f.filmText;
      disclaimer = f.disclaimerCustom;

      rows = summaryRow(f.sumService, `${L.film} — ${L[state.filmType]}`);
      rows += summaryRow(LANG === 'en' ? 'Shoot length' : 'Duração da captação', L[state.filmDuration]);
      rows += summaryRow(LANG === 'en' ? 'Location' : 'Local', L[state.filmLocation]);
      rows += summaryRow(f.sumTotal, f.sumCustom, true);

      waLines = [
        `• ${LANG === 'en' ? 'Type' : 'Tipo'}: ${L.film} — ${L[state.filmType]}`,
        `• ${LANG === 'en' ? 'Shoot length' : 'Duração'}: ${L[state.filmDuration]}`,
        `• ${LANG === 'en' ? 'Location' : 'Local'}: ${L[state.filmLocation]}`
      ];
    } else {
      badge = f.brandBadge;
      title = f.brandTitle(state.name);
      text = f.brandText;
      disclaimer = f.disclaimerCustom;

      rows = summaryRow(f.sumService, L[state.brandNeed]);
      rows += summaryRow(LANG === 'en' ? 'Brand stage' : 'Momento da marca', L[state.brandStage]);
      rows += summaryRow(f.sumTotal, f.sumCustom, true);

      waLines = [
        `• ${LANG === 'en' ? 'Type' : 'Tipo'}: ${L.brand} — ${L[state.brandNeed]}`,
        `• ${LANG === 'en' ? 'Brand stage' : 'Momento da marca'}: ${L[state.brandStage]}`
      ];
    }

    const volumeNote = (state.track === 'edit' && state.qty >= 10)
      ? `<p class="quiz-disclaimer" style="color: var(--red); font-weight: 600;">${f.volumeNote}</p>`
      : '';

    card.innerHTML = `
      <div class="quiz-result-badge">✔ ${badge}</div>
      <h2>${title}</h2>
      <p class="quiz-hint">${text}</p>
      <div class="quiz-summary">${rows}</div>
      ${volumeNote}
      <p class="quiz-disclaimer">${disclaimer}</p>
      <div class="quiz-final-actions">
        <a class="btn-brutal btn-block" target="_blank" rel="noopener" href="${buildWhatsAppLink(waLines)}">${T.whatsCta}</a>
        <a class="btn-brutal btn-white btn-block" href="${LANG === 'en' ? 'pricing.html' : 'valores.html'}">${T.seePricing}</a>
      </div>
      <button type="button" class="quiz-restart" id="quiz-restart">${T.restart}</button>
    `;

    document.getElementById('quiz-restart').addEventListener('click', () => {
      Object.keys(state).forEach(k => delete state[k]);
      history = [];
      renderTrack();
    });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('mobile-active'));
  }

  renderTrack();
});
