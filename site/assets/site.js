(() => {
  "use strict";

  const UI = {
    en: {
      "nav.work": "Work", "nav.process": "Process", "nav.rates": "Rates", "nav.contact": "Contact",
      "cta.call": "Book a 15-min call", "cta.callShort": "Book a call", "cta.work": "See the work ↓", "cta.email": "Email me",
      "hero.kicker": "Video editor", "hero.remote": "Remote",
      "hero.lede": "I edit podcasts, YouTube videos and brand content. You send the footage, I send back clips and episodes ready to post.",
      "fact.reply": "reply to every brief", "fact.tz": "from US Eastern working hours", "fact.lang": "fluent in both",
      "process.title": "How it works",
      "step1.t": "Brief", "step1.d": "You send the goal, the deadline and a reference you like. I reply within 24h with the questions that matter.",
      "step2.t": "Scope", "step2.d": "Deliverables, schedule and price in writing before anything starts.",
      "step3.t": "Edit", "step3.d": "You review cuts on a timestamped link. Revision rounds are defined up front.",
      "step4.t": "Delivery", "step4.d": "Every format you need: 16:9, 9:16, 1:1, captions burned in or as SRT.",
      "rates.title": "Ways to work together", "rates.lede": "Monthly packages, priced per scope. No per-video bidding.",
      "rates.onCall": "Priced on the call", "rates.from": "From",
      "contact.kicker": "Contact", "contact.note": "Send the goal, the deadline and one video you like. Reply within 24h.",
      "tile.play": "▶ Play with sound", "tile.full": "Full video on YouTube ↗", "tile.videos": "videos", "tile.video": "video",
      "ba.before": "Raw", "ba.after": "Edit", "ba.sound": "Play with sound", "ba.hint": "Drag to compare",
      "proof.title": "Clients & feedback",
      "foot.tz": "Brazil · UTC−3",
      "mail.subject": "Video editing — 15-min call",
      "mail.body": "Hi Kelson,\n\nWhat I need edited:\nHow often / how many:\nDeadline:\nA video I like:\n",
      "lang.other": "PT", "lang.label": "Mudar para português"
    },
    pt: {
      "nav.work": "Trabalhos", "nav.process": "Processo", "nav.rates": "Formatos", "nav.contact": "Contato",
      "cta.call": "Agendar conversa de 15 min", "cta.callShort": "Agendar", "cta.work": "Ver trabalhos ↓", "cta.email": "Mandar e-mail",
      "hero.kicker": "Editor de vídeo", "hero.remote": "Remoto",
      "hero.lede": "Edito podcasts, vídeos de YouTube e conteúdo de marca. Você manda o material bruto, eu devolvo cortes e episódios prontos pra postar.",
      "fact.reply": "resposta a todo briefing", "fact.tz": "do horário comercial da costa leste dos EUA", "fact.lang": "fluente nos dois",
      "process.title": "Como funciona",
      "step1.t": "Briefing", "step1.d": "Você manda o objetivo, o prazo e uma referência. Respondo em até 24h com as perguntas que importam.",
      "step2.t": "Escopo", "step2.d": "Entregas, cronograma e valor por escrito antes de começar.",
      "step3.t": "Edição", "step3.d": "Você revisa os cortes num link com comentários por timecode. Rodadas de revisão definidas no escopo.",
      "step4.t": "Entrega", "step4.d": "Todos os formatos que precisar: 16:9, 9:16, 1:1, legenda embutida ou em SRT.",
      "rates.title": "Formatos de trabalho", "rates.lede": "Pacotes mensais com valor por escopo. Sem cobrança por vídeo avulso.",
      "rates.onCall": "Valor combinado na conversa", "rates.from": "A partir de",
      "contact.kicker": "Contato", "contact.note": "Mande o objetivo, o prazo e um vídeo que você curte. Respondo em até 24h.",
      "tile.play": "▶ Assistir com som", "tile.full": "Vídeo completo no YouTube ↗", "tile.videos": "vídeos", "tile.video": "vídeo",
      "ba.before": "Bruto", "ba.after": "Editado", "ba.sound": "Assistir com som", "ba.hint": "Arraste para comparar",
      "proof.title": "Clientes & depoimentos",
      "foot.tz": "Brasil · UTC−3",
      "mail.subject": "Edição de vídeo — conversa de 15 min",
      "mail.body": "Oi Kelson,\n\nO que preciso editar:\nFrequência / quantidade:\nPrazo:\nUm vídeo de referência:\n",
      "lang.other": "EN", "lang.label": "Switch to English"
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  };

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const autoplayLoops = !reduceMotion && !saveData;

  let lang = pickLang();
  let site = null;
  let work = null;
  let playlist = [];

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "pt" || q === "en") return q;
    try { const s = localStorage.getItem("lang"); if (s === "pt" || s === "en") return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("pt") ? "pt" : "en";
  }
  const t = (key) => UI[lang][key] ?? UI.en[key] ?? key;
  const L = (obj) => (obj && typeof obj === "object" ? obj[lang] ?? obj.en : obj) ?? "";
  const media = (path) => (!path ? null : /^https?:\/\//.test(path) ? path : site.mediaBase + path);

  // ---------- loops: lazy load, play only while visible ----------
  const loopObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            if (autoplayLoops) v.play().catch(() => {});
          } else if (!v.paused) v.pause();
        }
      }, { rootMargin: "200px 0px", threshold: 0.25 })
    : null;

  function loopVideo(src, poster) {
    const v = el("video", { muted: true, loop: true, playsinline: true, preload: "none", poster, "aria-hidden": "true", disablepictureinpicture: true });
    v.muted = true;
    if (!src) return v;
    if (loopObserver) { v.dataset.src = src; loopObserver.observe(v); }
    else { v.src = src; if (autoplayLoops) v.autoplay = true; }
    return v;
  }

  // ---------- timecode HUD, driven by the actual playhead ----------
  const tcNodes = new Map();
  const tc = (s) => {
    const f = Math.floor((s % 1) * 24), x = Math.floor(s);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(Math.floor(x / 3600))}:${p(Math.floor(x / 60) % 60)}:${p(x % 60)}:${p(f)}`;
  };
  (function tick() {
    for (const [v, node] of tcNodes) if (!v.paused) node.textContent = tc(v.currentTime);
    requestAnimationFrame(tick);
  })();

  // ---------- tiles ----------
  function playable(item) { return !!(item.media?.full || item.youtube); }

  function tile(item, { reel = false } = {}) {
    const ar = item.format === "9:16" ? "ar-916" : item.format === "1:1" ? "ar-11" : "ar-169";
    const v = loopVideo(media(item.media?.loop), media(item.media?.poster));
    const tcNode = el("span", { text: "00:00:00:00" });
    tcNodes.set(v, tcNode);
    const canPlay = playable(item);
    const box = el(canPlay ? "button" : "div", {
      class: `tile-media ${ar}`,
      type: canPlay ? "button" : null,
      "data-static": canPlay ? null : true,
      "aria-label": canPlay ? `${t("tile.play")} — ${L(item.title)}` : null
    },
      v,
      el("div", { class: "hud hud-top" }, el("span", { text: item.format || "" }), tcNode),
      canPlay ? el("span", { class: "play-chip", text: t("tile.play") }) : null
    );
    if (canPlay) {
      const idx = playlist.push(item) - 1;
      box.addEventListener("click", () => openPlayer(idx));
    }
    if (reel) return box;

    const metric = (item.metrics || [])[0];
    const sub = [item.client, L(item.role), item.year, item.duration].filter(Boolean).join(" · ");
    return el("article", { class: "tile" },
      box,
      el("div", { class: "tile-meta" },
        el("h3", { class: "tile-title", text: L(item.title) }),
        metric ? el("span", { class: "tile-metric" }, metric.value, el("small", { text: L(metric.label) })) : el("span"),
        el("p", { class: "tile-sub", text: sub }),
        item.media?.full && item.youtube
          ? el("a", { class: "tile-link mono", href: item.youtube, target: "_blank", rel: "noopener", text: t("tile.full") })
          : null
      )
    );
  }

  function renderReel() {
    const r = work.reel;
    const host = $("#reel");
    host.replaceChildren();
    if (!r || !r.media?.loop) { host.hidden = true; return; }
    host.hidden = false;
    host.append(
      el("div", { class: "frame" }, tile(r, { reel: true })),
      el("figcaption", { class: "reel-cap mono" },
        el("span", { text: L(r.title) }),
        el("span", { text: playable(r) ? t("tile.play") : r.format }))
    );
  }

  function beforeAfter(item) {
    const vert = item.format === "9:16";
    const pick = (m) => media(m?.full || m?.loop);
    const before = el("video", { muted: true, loop: true, playsinline: true, preload: "metadata", src: pick(item.before), poster: media(item.before?.poster) });
    const after = el("video", { class: "ba-after", muted: true, loop: true, playsinline: true, preload: "metadata", src: pick(item.media), poster: media(item.media?.poster) });
    before.muted = after.muted = true;
    const stage = el("div", { class: `ba-stage${vert ? " v" : ""}` },
      before, after,
      el("div", { class: "ba-line" }),
      el("span", { class: "ba-label l", text: t("ba.before") }),
      el("span", { class: "ba-label r", text: t("ba.after") })
    );
    const range = el("input", { class: "ba-range", type: "range", min: "0", max: "100", value: "50", step: "0.1", "aria-label": t("ba.hint") });
    range.addEventListener("input", () => stage.style.setProperty("--cut", range.value + "%"));
    stage.append(range);

    // keep both playheads locked to the edit
    const sync = () => { if (Math.abs(before.currentTime - after.currentTime) > 0.08) before.currentTime = after.currentTime; };
    after.addEventListener("play", () => { sync(); before.play().catch(() => {}); });
    after.addEventListener("pause", () => before.pause());
    after.addEventListener("seeked", sync);
    after.addEventListener("timeupdate", sync);

    const io = "IntersectionObserver" in window && new IntersectionObserver(([e]) => {
      if (e.isIntersecting && autoplayLoops) after.play().catch(() => {});
      else if (!e.isIntersecting) after.pause();
    }, { threshold: 0.3 });
    io && io.observe(stage);

    const soundBtn = el("button", { class: "mono", type: "button", text: t("ba.sound") });
    soundBtn.addEventListener("click", () => {
      const on = after.muted;
      after.muted = !on;
      soundBtn.textContent = on ? "■ " + t("ba.sound") : t("ba.sound");
      after.currentTime = 0; before.currentTime = 0;
      after.play().catch(() => {});
    });
    const meta = [item.client, L(item.role), item.year].filter(Boolean).join(" · ");
    return el("div", { class: "ba" }, stage,
      el("div", { class: "ba-bar mono" }, el("span", { text: `${L(item.title)}${meta ? " — " + meta : ""}` }), soundBtn));
  }

  function renderWork() {
    const host = $("#work");
    host.replaceChildren();
    let n = 0;
    for (const sec of work.sections) {
      const items = work.items.filter((i) => i.section === sec.id);
      if (!items.length) continue;
      n++;
      const isBA = sec.id === "before-after";
      const vertical = !isBA && items.every((i) => i.format === "9:16");
      const count = items.length;
      const side = vertical && count <= 2;
      const head = el("header", { class: "sec-head" },
        el("span", { class: "idx mono", text: String(n).padStart(2, "0") }),
        el("h2", { class: "h2", text: L(sec.title) }),
        el("p", { class: "lede", text: L(sec.lede) }),
        el("div", { class: "count mono" },
          el("span", { text: `${String(count).padStart(2, "0")} ${count === 1 ? t("tile.video") : t("tile.videos")}` }),
          el("span", { text: sec.format }))
      );
      const body = isBA
        ? beforeAfter(items[0])
        : el("div", { class: `tiles ${vertical ? "v" : "h"} n${count}` }, items.map((i) => tile(i)));
      host.append(el("section", { class: `sec grid${side ? " side" : ""}`, id: `work-${sec.id}`, "aria-label": L(sec.title) }, head, body));
    }
  }

  function renderProof() {
    const host = $("#proof");
    const clients = site.clients || [];
    const quotes = site.testimonials || [];
    host.replaceChildren();
    if (!clients.length && !quotes.length) { host.hidden = true; return; }
    host.hidden = false;
    host.append(el("header", { class: "block-head" },
      el("span", { class: "idx mono" }),
      el("h2", { class: "h2", text: t("proof.title") })));
    if (clients.length) host.append(el("div", { class: "clients" }, clients.map((c) => el("span", { text: c }))));
    for (const q of quotes) {
      host.append(el("blockquote", { class: "quote" },
        el("p", { text: `“${L(q.quote)}”` }),
        el("cite", { class: "mono", text: [q.name, q.role].filter(Boolean).join(" — ") })));
    }
  }

  function renderRates() {
    const host = $("#rates-list");
    host.replaceChildren(...(site.rates || []).map((r) =>
      el("div", { class: "rate" },
        el("h3", { text: L(r.title) }),
        el("ul", {}, (L(r.scope) || []).map((s) => el("li", { text: s }))),
        el("span", { class: "price", text: r.price ? `${t("rates.from")} ${r.price}` : t("rates.onCall") })
      )));
    $("#rates").hidden = !(site.rates || []).length;
  }

  function wireContact() {
    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(t("mail.subject"))}&body=${encodeURIComponent(t("mail.body"))}`;
    for (const a of document.querySelectorAll("[data-cta]")) {
      if (site.booking) { a.href = site.booking; a.target = "_blank"; a.rel = "noopener"; }
      else if (a.closest(".contact")) a.href = mailto;
      else a.href = "#contact";
    }
    const mail = $("#contact-mail");
    mail.href = mailto;
    mail.textContent = site.email;
    const wa = $("#contact-wa");
    // WhatsApp is how Brazilian clients reach out; US/EU clients get email + calendar only.
    if (site.whatsapp && lang === "pt") {
      wa.hidden = false;
      wa.href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Oi Kelson! Vi seu portfólio e quero conversar sobre um projeto.")}`;
    } else wa.hidden = true;
    $("#foot-links").replaceChildren(...(site.links || []).map((l) => el("a", { href: l.url, target: "_blank", rel: "noopener", text: l.label })));
  }

  function applyStatic() {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    for (const n of document.querySelectorAll("[data-i18n]")) n.textContent = t(n.dataset.i18n);
    const btn = $("[data-lang-toggle]");
    btn.textContent = t("lang.other");
    btn.setAttribute("aria-label", t("lang.label"));
    const tz = site?.timezone || "UTC−3";
    for (const n of document.querySelectorAll("[data-tz]")) n.textContent = tz;
    $("[data-tz-foot]").textContent = t("foot.tz");
    $("[data-year]").textContent = new Date().getFullYear();
  }

  function render() {
    playlist = [];
    tcNodes.clear();
    loopObserver && loopObserver.disconnect();
    applyStatic();
    renderReel();
    renderWork();
    renderProof();
    renderRates();
    wireContact();
    let n = document.querySelectorAll("#work .sec").length;
    for (const id of ["proof", "process", "rates"]) {
      const sec = document.getElementById(id);
      const idx = sec && !sec.hidden && sec.querySelector(".block-head .idx");
      if (idx) idx.textContent = String(++n).padStart(2, "0");
    }
  }

  // ---------- player ----------
  const dlg = $("#player");
  let current = -1;

  function ytId(url) {
    const m = String(url).match(/(?:youtu\.be\/|shorts\/|[?&]v=|embed\/)([\w-]{11})/);
    return m && m[1];
  }

  function openPlayer(i) {
    if (!playlist.length) return;
    current = (i + playlist.length) % playlist.length;
    const item = playlist[current];
    const vert = item.format === "9:16";
    const stage = $("#player-stage");
    stage.className = `player-stage ${vert ? "v" : "h"}`;
    dlg.classList.toggle("is-v", vert);
    $("#player-title").textContent = [L(item.title), item.client].filter(Boolean).join(" — ");
    let node;
    if (item.media?.full) {
      node = el("video", { src: media(item.media.full), poster: media(item.media.poster), controls: true, autoplay: true, playsinline: true, preload: "auto" });
    } else {
      const id = ytId(item.youtube);
      node = el("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        title: L(item.title),
        allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
        allowfullscreen: true
      });
    }
    stage.replaceChildren(node);
    for (const v of document.querySelectorAll(".tile-media video")) v.pause();
    if (!dlg.open) dlg.showModal();
  }

  function closePlayer() {
    $("#player-stage").replaceChildren();
    if (dlg.open) dlg.close();
  }

  dlg.addEventListener("close", () => {
    $("#player-stage").replaceChildren();
    // resume visible loops
    if (autoplayLoops) for (const v of document.querySelectorAll(".tile-media video")) {
      const r = v.getBoundingClientRect();
      if (v.src && r.bottom > 0 && r.top < innerHeight) v.play().catch(() => {});
    }
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closePlayer();
    const a = e.target.closest("[data-player]");
    if (!a) return;
    if (a.dataset.player === "close") closePlayer();
    if (a.dataset.player === "next") openPlayer(current + 1);
    if (a.dataset.player === "prev") openPlayer(current - 1);
  });
  document.addEventListener("keydown", (e) => {
    if (!dlg.open) return;
    if (e.key === "ArrowRight") openPlayer(current + 1);
    if (e.key === "ArrowLeft") openPlayer(current - 1);
  });

  $("[data-lang-toggle]").addEventListener("click", () => {
    lang = lang === "en" ? "pt" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    const u = new URL(location.href);
    u.searchParams.set("lang", lang);
    history.replaceState(null, "", u);
    render();
  });

  Promise.all([
    fetch("data/site.json").then((r) => r.json()),
    fetch("data/work.json").then((r) => r.json())
  ]).then(([s, w]) => {
    site = s;
    site.mediaBase = site.mediaBase ? site.mediaBase.replace(/\/?$/, "/") : "";
    work = w;
    render();
  }).catch((err) => {
    console.error(err);
    applyStatic();
  });
})();
