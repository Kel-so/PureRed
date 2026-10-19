(() => {
  "use strict";

  const UI = {
    en: {
      "nav.work": "Work", "nav.process": "Process", "nav.rates": "Rates", "nav.contact": "Contact",
      "cta.call": "Book a 15-min call", "cta.callShort": "Book a call", "cta.work": "See the work ↓", "cta.email": "Email me",
      "hero.kicker": "Video editor", "hero.remote": "Remote", "hero.title": "Podcast clips, event films & brand edits", "scene": "Scene", "case.eyebrow": "Case in focus", "case.watch": "▶ Watch with sound", "work.other": "Other work",
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
      "work.title": "Work", "work.all": "All", "work.lede": "Podcast clips, brand films, events and gaming. Tap any video to watch it with sound.", "tile.play": "▶ Play with sound", "tile.full": "Full video on YouTube ↗", "tile.videos": "videos", "tile.video": "video",
      "ba.before": "Raw", "ba.after": "Edit", "ba.sound": "Play with sound", "ba.hint": "Drag to compare",
      "proof.title": "Clients & feedback", "clients.label": "Worked with",
      "foot.tz": "Brazil · UTC−3",
      "mail.subject": "Video editing — 15-min call",
      "mail.body": "Hi Kelson,\n\nWhat I need edited:\nHow often / how many:\nDeadline:\nA video I like:\n",
      "lang.other": "PT", "lang.label": "Mudar para português"
    },
    pt: {
      "nav.work": "Trabalhos", "nav.process": "Processo", "nav.rates": "Formatos", "nav.contact": "Contato",
      "cta.call": "Agendar conversa de 15 min", "cta.callShort": "Agendar", "cta.work": "Ver trabalhos ↓", "cta.email": "Mandar e-mail",
      "hero.kicker": "Editor de vídeo", "hero.remote": "Remoto", "hero.title": "Cortes de podcast, filmes de evento e vídeos de marca", "scene": "Cena", "case.eyebrow": "Case em destaque", "case.watch": "▶ Assistir com som", "work.other": "Outros trabalhos",
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
      "work.title": "Trabalhos", "work.all": "Tudo", "work.lede": "Cortes de podcast, filmes de marca, eventos e games. Toque em qualquer vídeo para assistir com som.", "tile.play": "▶ Assistir com som", "tile.full": "Vídeo completo no YouTube ↗", "tile.videos": "vídeos", "tile.video": "vídeo",
      "ba.before": "Bruto", "ba.after": "Editado", "ba.sound": "Assistir com som", "ba.hint": "Arraste para comparar",
      "proof.title": "Clientes & depoimentos", "clients.label": "Trabalhei com",
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

  // posters below the fold wait until they are near the viewport, so the hero gets the bandwidth first
  const posterObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.poster = e.target.dataset.poster; posterObserver.unobserve(e.target); }
      }, { rootMargin: "700px 0px" })
    : null;

  function loopVideo(src, poster, { eager = false } = {}) {
    const lazy = !eager && posterObserver && poster;
    const v = el("video", { muted: true, loop: true, playsinline: true, preload: "none", poster: lazy ? null : poster, "aria-hidden": "true", disablepictureinpicture: true });
    v.muted = true;
    if (lazy) { v.dataset.poster = poster; posterObserver.observe(v); }
    if (!src) return v;
    if (loopObserver) { v.dataset.src = src; loopObserver.observe(v); }
    else { v.src = src; if (autoplayLoops) v.autoplay = true; }
    return v;
  }

  const LOOPS = ".tile-media video, .monitor video, .case-media video";
  function playable(item) { return !!(item.media?.full || item.youtube); }
  const byId = (id) => [work.reel, ...work.items].find((i) => i && i.id === id);

  // open any item in the player, even if it isn't in the current mosaic filter
  function openItem(item) {
    let i = playlist.indexOf(item);
    if (i < 0) { playlist.unshift(item); i = 0; }
    openPlayer(i);
  }

  // ---------- hero: a wall of looping monitors around the title panel ----------
  function renderWall() {
    const wall = $("#wall");
    for (const m of wall.querySelectorAll(".monitor")) m.remove();
    heroReady = Promise.all((work.wall || []).map((slot) => {
      const src = media(byId(slot.id)?.media?.poster);
      return src ? new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.fetchPriority = "high"; im.src = src; }) : null;
    }));
    (work.wall || []).forEach((slot, n) => {
      const item = byId(slot.id);
      if (!item) return;
      const canPlay = playable(item);
      const m = el(canPlay ? "button" : "div", {
        class: `monitor monitor--${slot.area}`,
        type: canPlay ? "button" : null,
        style: `--i:${n}`,
        "aria-label": canPlay ? `${t("tile.play")} — ${L(item.title)}` : L(item.title)
      },
        loopVideo(media(item.media?.loop), media(item.media?.poster), { eager: true }),
        el("span", { class: "monitor-label mono", text: L(slot.label) }));
      if (canPlay) m.addEventListener("click", () => openItem(item));
      wall.append(m);
    });
  }

  // ---------- featured case, big and centred above the mosaic ----------
  function caseBlock(item) {
    const canPlay = playable(item);
    const box = el(canPlay ? "button" : "div", { class: "case-media", type: canPlay ? "button" : null, "aria-label": `${t("case.watch")} — ${L(item.title)}` },
      loopVideo(media(item.media?.loop), media(item.media?.poster)),
      canPlay ? el("span", { class: "case-play mono", text: t("case.watch") }) : null);
    if (canPlay) box.addEventListener("click", () => openItem(item));
    return el("div", { class: "case" },
      el("p", { class: "mono case-eyebrow", text: t("case.eyebrow") }),
      el("h3", { class: "case-title", text: L(item.title) }),
      el("p", { class: "mono case-sub", text: [item.client, L(item.role), item.duration].filter(Boolean).join(" · ") }),
      box);
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

  // ---------- work: one organic mosaic + category filter ----------
  const ratio = (item) => (item.format === "9:16" ? 9 / 16 : item.format === "1:1" ? 1 : 16 / 9);
  let filter = "all";
  let mosaic = null;
  let featuredItem = null;

  function mosaicTile(item) {
    const v = loopVideo(media(item.media?.loop), media(item.media?.poster));
    const canPlay = playable(item);
    const metric = (item.metrics || [])[0];
    const box = el(canPlay ? "button" : "div", {
      class: "tile-media",
      type: canPlay ? "button" : null,
      "data-static": canPlay ? null : true,
      "aria-label": canPlay ? `${t("tile.play")} — ${L(item.title)}` : L(item.title)
    },
      v,
      el("div", { class: "hud hud-top" },
        el("span", { text: item.format || "" }),
        el("span", { text: metric ? `${metric.value} ${L(metric.label)}` : item.duration || "" })),
      el("span", { class: "cap" },
        el("b", { text: (canPlay ? "▶ " : "") + L(item.title) }),
        el("small", { text: [item.client, L(item.role)].filter(Boolean).join(" · ") }))
    );
    if (canPlay) box.addEventListener("click", () => openPlayer(playlist.indexOf(item)));
    const node = el("article", { class: "mtile", "data-sec": item.section }, box);
    node._item = item;
    return node;
  }

  // round-robin across categories so verticals and horizontals interleave in "All"
  function mixed(items) {
    const groups = work.sections.map((s) => items.filter((i) => i.section === s.id)).filter((g) => g.length);
    const out = [];
    for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (g[i]) out.push(g[i]);
    return out;
  }

  function renderWork() {
    const host = $("#work");
    host.replaceChildren();
    featuredItem = work.featured ? byId(work.featured) : null;
    const gridItems = work.items.filter((i) => i.section !== "before-after" && i !== featuredItem);
    const cats = work.sections.filter((s) => s.id !== "before-after" && gridItems.some((i) => i.section === s.id));
    const lede = el("p", { class: "lede" });
    const setLede = () => {
      const sec = cats.find((c) => c.id === filter);
      lede.textContent = sec ? L(sec.lede) : t("work.lede");
    };
    const chips = el("div", { class: "chips", role: "tablist" },
      [{ id: "all", title: { en: t("work.all") }, n: gridItems.length }, ...cats.map((c) => ({ ...c, n: gridItems.filter((i) => i.section === c.id).length }))]
        .map((c) => {
          const b = el("button", { class: "chip mono", type: "button", role: "tab", "aria-selected": String(filter === c.id) },
            L(c.title), el("small", { text: String(c.n).padStart(2, "0") }));
          b.addEventListener("click", () => {
            filter = c.id;
            for (const x of chips.children) x.setAttribute("aria-selected", String(x === b));
            setLede();
            layoutMosaic();
          });
          return b;
        }));
    setLede();
    mosaic = el("div", { class: "mosaic" }, mixed(gridItems).map(mosaicTile));
    host.append(el("section", { class: "sec grid", id: "work-all", "aria-label": t("work.title") },
      el("header", { class: "sec-head" },
        el("span", { class: "idx mono", "data-scene": t("nav.work") }),
        el("h2", { class: "h2", text: t("work.title") }),
        lede),
      featuredItem ? caseBlock(featuredItem) : null,
      el("div", { class: "other" }, el("span", { class: "mono other-label", text: t("work.other") }), chips),
      mosaic));

    const ba = work.items.find((i) => i.section === "before-after");
    const baSec = work.sections.find((s) => s.id === "before-after");
    if (ba && baSec) {
      host.append(el("section", { class: "sec grid", id: "work-before-after", "aria-label": L(baSec.title) },
        el("header", { class: "sec-head" },
          el("span", { class: "idx mono", "data-scene": L(baSec.title) }),
          el("h2", { class: "h2", text: L(baSec.title) }),
          el("p", { class: "lede", text: L(baSec.lede) })),
        beforeAfter(ba)));
    }
  }

  // column masonry: verticals take 1 column, horizontals 2; each tile drops into the
  // lowest spot that fits, so the grid packs tight without fixed rows
  function place(order, cols, colW, gap, wide) {
    const heights = new Array(cols).fill(0);
    return order.map((item) => {
      const span = ratio(item) > 1 || wide.has(item) ? Math.min(2, cols) : 1;
      let c0 = 0, top = Infinity;
      for (let c = 0; c <= cols - span; c++) {
        const t = Math.max(...heights.slice(c, c + span));
        if (t < top - 0.5) { c0 = c; top = t; }
      }
      const w = colW * span + gap * (span - 1);
      const h = wide.has(item) ? colW * 16 / 9 : w / ratio(item);
      for (let c = c0; c < c0 + span; c++) heights[c] = top + h + gap;
      return { item, c: c0, span, top, w, h };
    });
  }

  // make every column end on the same line: find the run of tiles at the bottom of each
  // column and stretch it (video crops a little via object-fit) to a shared baseline.
  // Returns the worst stretch factor (as |log|), or null when columns can't be separated.
  function balance(tiles, cols, gap) {
    const covers = (t, c) => c >= t.c && c < t.c + t.span;
    const above = (t, c) => {
      let best = null;
      for (const o of tiles) if (o !== t && covers(o, c) && o.top < t.top && (!best || o.top > best.top)) best = o;
      return best;
    };
    const tail = [];
    for (let c = 0; c < cols; c++) {
      for (const t of tiles) if (covers(t, c) && (!tail[c] || t.top > tail[c].top)) tail[c] = t;
      if (!tail[c]) return null;
    }
    const chains = [];
    for (const t of new Set(tail)) {
      for (let c = t.c; c < t.c + t.span; c++) if (tail[c] !== t) return null;
      const chain = [t];
      for (;;) {
        const head = chain[0];
        const p = above(head, head.c);
        if (!p || p.c !== head.c || p.span !== head.span) break;
        let same = true;
        for (let c = head.c + 1; c < head.c + head.span; c++) if (above(head, c) !== p) same = false;
        if (!same) break;
        chain.unshift(p);
      }
      const a = chain[0].top + gap * (chain.length - 1);
      const b = chain.reduce((x, o) => x + o.h, 0);
      chains.push({ chain, a, b });
    }
    const err = (T) => Math.max(...chains.map(({ a, b }) => Math.abs(Math.log((T - a) / b))));
    const ends = chains.map(({ a, b }) => a + b);
    let lo = Math.min(...ends), hi = Math.max(...ends), T = hi, e = err(hi);
    for (let i = 0; i <= 60; i++) {
      const x = lo + ((hi - lo) * i) / 60, ex = err(x);
      if (ex < e) { e = ex; T = x; }
    }
    return { e, T, chains };
  }

  function applyBalance(res, gap) {
    for (const { chain, a, b } of res.chains) {
      const k = (res.T - a) / b;
      let y = chain[0].top;
      for (const o of chain) { o.top = y; o.h *= k; y += o.h + gap; }
    }
  }

  // phones: keep verticals in pairs so no half-row is left empty
  function pairUp(order, wide) {
    const out = [], held = [];
    let open = null;
    for (const it of order) {
      if (ratio(it) > 1) { (open ? held : out).push(it); continue; }
      out.push(it);
      open = open ? null : it;
      if (!open && held.length) out.push(...held.splice(0));
    }
    if (open) wide.add(open);
    return out.concat(held);
  }

  function* permutations(arr) {
    if (arr.length <= 1) { yield arr; return; }
    for (let i = 0; i < arr.length; i++)
      for (const rest of permutations(arr.slice(0, i).concat(arr.slice(i + 1)))) yield [arr[i], ...rest];
  }

  function layoutMosaic() {
    if (!mosaic || !mosaic.isConnected) return;
    const W = mosaic.clientWidth;
    if (!W) return;
    const cols = W >= 1100 ? 6 : W >= 700 ? 4 : 2;
    const gap = W >= 700 ? 8 : 6;
    const colW = (W - gap * (cols - 1)) / cols;
    const nodes = new Map();
    let order = [];
    for (const node of mosaic.children) {
      const show = filter === "all" || node._item.section === filter;
      node.hidden = !show;
      if (show) { order.push(node._item); nodes.set(node._item, node); }
    }
    const wide = new Set();
    if (cols === 2) order = pairUp(order, wide);

    // try a few orders for the last tiles and keep the one that needs the least stretching
    let best = null;
    const K = Math.min(5, order.length);
    const head = order.slice(0, order.length - K);
    for (const tailOrder of permutations(order.slice(order.length - K))) {
      const tiles = place(head.concat(tailOrder), cols, colW, gap, wide);
      const res = balance(tiles, cols, gap);
      if (res && (!best || res.e < best.res.e - 1e-6)) best = { tiles, res };
      if (best && best.res.e < 1e-3) break;
    }
    const tiles = best ? best.tiles : place(order, cols, colW, gap, wide);
    if (best) applyBalance(best.res, gap);

    let bottom = 0;
    for (const t of tiles) {
      const node = nodes.get(t.item);
      node.style.width = `${t.w}px`;
      node.style.height = `${t.h}px`;
      node.style.transform = `translate(${t.c * (colW + gap)}px, ${t.top}px)`;
      bottom = Math.max(bottom, t.top + t.h);
    }
    mosaic.style.height = `${bottom}px`;
    playlist = (featuredItem && playable(featuredItem) ? [featuredItem] : []).concat(tiles.map((t) => t.item));
  }

  const relayout = () => layoutMosaic();
  if ("ResizeObserver" in window) {
    let last = 0;
    new ResizeObserver(() => { const w = $("#work").clientWidth; if (w !== last) { last = w; relayout(); } }).observe($("#work"));
  } else addEventListener("resize", relayout);

  // ---------- client logos: one band under the hero, two copies of the row for a seamless loop ----------
  function renderClients() {
    const band = $("#clients"), track = $("#clients-track");
    const logos = (site.clients || []).filter((c) => c && c.logo);
    track.replaceChildren();
    band.hidden = !logos.length;
    if (!logos.length) return;
    const row = (copy) => el("div", { class: "marquee-row", "aria-hidden": copy ? "true" : null }, logos.map((c) => {
      // optical sizing: wide wordmarks get a little shorter, compact marks a little taller
      const ratio = (c.w || 3) / (c.h || 1);
      const h = Math.round(46 * Math.pow(ratio, -0.32) * 1.42);
      return el("img", { src: c.logo, alt: copy ? "" : c.name, width: Math.round(h * ratio), height: h, decoding: "async", loading: "eager", style: `--lh:${h}px` });
    }));
    track.append(row(false), row(true));
  }

  function renderProof() {
    const host = $("#proof");
    const quotes = site.testimonials || [];
    host.replaceChildren();
    if (!quotes.length) { host.hidden = true; return; }
    host.hidden = false;
    host.append(el("header", { class: "block-head" },
      el("span", { class: "idx mono" }),
      el("h2", { class: "h2", text: t("proof.title") })));
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
    loopObserver && loopObserver.disconnect();
    applyStatic();
    renderWall();
    renderClients();
    renderWork();
    relayout();
    renderProof();
    renderRates();
    wireContact();
    // "Scene 01 — Work", "Scene 02 — How it works"… across every section head
    const heads = [...document.querySelectorAll("#work .idx, #proof .idx, #process .idx, #rates .idx, #contact .idx")]
      .filter((x) => !x.closest("[hidden]"));
    heads.forEach((x, i) => {
      const label = x.dataset.scene || x.closest("section").querySelector(".h2, .kicker")?.textContent || "";
      x.textContent = `${t("scene")} ${String(i + 1).padStart(2, "0")} — ${label}`;
    });
    reveal();
  }

  // ---------- fade sections in as they enter the viewport ----------
  const revealObserver = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); revealObserver.unobserve(e.target); }
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;
  function reveal() {
    const targets = document.querySelectorAll(".sec-head, .block-head, .case, .other, .mosaic, .steps, .rates, .contact > *, .proof > *");
    for (const n of targets) {
      if (!revealObserver) { n.classList.add("is-in"); continue; }
      n.setAttribute("data-reveal", "");
      revealObserver.observe(n);
    }
  }

  // ---------- top bar hides while scrolling down, comes back on the way up ----------
  {
    const bar = $(".bar");
    let lastY = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 6) return;
      bar.classList.toggle("is-hidden", y > lastY && y > 140);
      lastY = y;
    }, { passive: true });
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
    for (const v of document.querySelectorAll(LOOPS)) v.pause();
    if (!dlg.open) dlg.showModal();
  }

  function closePlayer() {
    $("#player-stage").replaceChildren();
    if (dlg.open) dlg.close();
  }

  dlg.addEventListener("close", () => {
    $("#player-stage").replaceChildren();
    // resume visible loops
    if (autoplayLoops) for (const v of document.querySelectorAll(LOOPS)) {
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

  // ---------- loader ----------
  const intro = $("#intro");
  let dataReady;
  let heroReady = Promise.resolve();
  // loader on every visit: stays at least 2s (shorter read as a glitch), then slides up once the wall is ready (max 5s)
  const introDone = new Promise((resolve) => {
    if (!intro) return resolve();
    let gone = false;
    const finish = () => {
      if (gone) return; gone = true;
      intro.classList.add("is-out");
      setTimeout(() => intro.remove(), 800);
      resolve();
    };
    const at = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms - performance.now())));
    intro.addEventListener("click", finish, { once: true });
    // dataReady is assigned further down in this same script, so read it on the next tick
    const ready = Promise.resolve().then(() => dataReady).catch(() => {}).then(() => heroReady);
    Promise.race([Promise.all([at(2000), ready]), at(5000)]).then(finish);
  });

  dataReady = Promise.all([
    fetch("data/site.json").then((r) => r.json()),
    fetch("data/work.json").then((r) => r.json())
  ]).then(([s, w]) => {
    site = s;
    site.mediaBase = site.mediaBase ? site.mediaBase.replace(/\/?$/, "/") : "";
    work = w;
    render();
  });
  dataReady.catch((err) => {
    console.error(err);
    applyStatic();
  });
})();
