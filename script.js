/* ============================================================
   BingoGriefchik — front-end logic
   - content store (editable from admin panel, saved to localStorage)
   - rendering of sections (hero, servers, news, shop, forum/faq)
   - sticky navbar: scroll state, active link, mobile burger, to-top
   - theme + language toggles
   - /admin panel: login + full content editor + device preview
   ============================================================ */

(function () {
  "use strict";

  const STORE_KEY = "bingo_content_v2";
  const THEME_KEY = "bingo_theme";
  const LANG_KEY = "bingo_lang";
  const AUTH_KEY = "bingo_admin_auth";

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "12wqas12wqas";

  /* ---------- default content ---------- */
  const DEFAULT = {
    server: {
      name: "BingoGriefchik",
      ip: "mc.BingoGriefchik.ru",
      desc: "Анархический сервер с приватами в виде блоков, донатом и наборами. Выбери свой путь.",
      online: "128",
      version: "1.20.x",
      mode: "Анархия",
    },
    servers: [
      { name: "Anarchy", desc: "Полная анархия: гриф, PvP и приваты в виде блоков.", players: "84", version: "1.20.x", status: "online", badge: "Популярный", c1: "#c0392b", c2: "#7d241a" },
      { name: "SkyBlock", desc: "Развивай свой остров в небе с нуля до империи.", players: "32", version: "1.20.x", status: "online", badge: "Новый", c1: "#d98a1f", c2: "#9c5d10" },
      { name: "Survival", desc: "Классическое выживание с экономикой и территориями.", players: "12", version: "1.19.x", status: "offline", badge: "Хардкор", c1: "#2f80ed", c2: "#1b4f9c" },
    ],
    news: [
      { date: "12 июня 2026", title: "Открытие нового сезона", text: "Карта обновлена, добавлены свежие биомы и приваты в виде блоков. Заходи и занимай лучшие места первым!", icon: "🌸" },
      { date: "5 июня 2026", title: "Новые донат-наборы", text: "Добавили наборы «Воин», «Шахтёр» и «Король». Каждый набор даёт уникальные предметы и бонусы.", icon: "🎁" },
      { date: "1 июня 2026", title: "Розыгрыш привилегий", text: "Разыгрываем 5 привилегий VIP среди активных игроков форума. Участвуй в теме розыгрыша!", icon: "🏆" },
    ],
    shopTabs: ["Привилегии", "Кейсы", "Префиксы", "Донат-наборы", "Валюта"],
    shop: [
      { cat: "Привилегии", icon: "⭐", name: "VIP", price: "99 ₽", desc: "/fly, цветной ник, доступ к /hat и приоритет входа." },
      { cat: "Привилегии", icon: "💎", name: "PREMIUM", price: "249 ₽", desc: "Всё из VIP + /feed, /heal и расширенный приват." },
      { cat: "Привилегии", icon: "👑", name: "DELUXE", price: "499 ₽", desc: "Максимум возможностей: /god, /near и личный варп." },
      { cat: "Кейсы", icon: "📦", name: "Обычный кейс", price: "49 ₽", desc: "Случайные ресурсы, броня и зачарованные предметы." },
      { cat: "Кейсы", icon: "🎰", name: "Легендарный кейс", price: "149 ₽", desc: "Шанс выбить элитры, незеритовый сет и валюту." },
      { cat: "Префиксы", icon: "🏷️", name: "Префикс [GRIEF]", price: "39 ₽", desc: "Уникальный цветной префикс в чате и таб-листе." },
      { cat: "Префиксы", icon: "🔥", name: "Префикс [LEGEND]", price: "79 ₽", desc: "Анимированный градиентный префикс для самых крутых." },
      { cat: "Донат-наборы", icon: "⚔️", name: "Набор «Воин»", price: "199 ₽", desc: "Полный незеритовый сет с зачарованиями и зельями." },
      { cat: "Донат-наборы", icon: "⛏️", name: "Набор «Шахтёр»", price: "159 ₽", desc: "Инструменты на эффективность X и стопки ресурсов." },
      { cat: "Валюта", icon: "🪙", name: "1000 монет", price: "59 ₽", desc: "Игровая валюта для торговли с другими игроками." },
      { cat: "Валюта", icon: "💰", name: "5000 монет", price: "249 ₽", desc: "Большой запас монет со скидкой 15%." },
    ],
    rules: [
      "Запрещены читы, эксплойты и сторонние клиенты.",
      "Уважай других игроков — без оскорблений и спама в чате.",
      "Реклама других серверов карается баном.",
      "Анархия разрешена: гриф, обман и PvP — часть игры.",
      "Администрация не возвращает утерянные вещи.",
    ],
    faq: [
      { q: "Как зайти на сервер?", a: "Добавь IP mc.BingoGriefchik.ru в список серверов в Minecraft версии 1.20.x и нажми «Подключиться»." },
      { q: "Что такое приват в виде блоков?", a: "Ты ставишь специальный блок-приват, и территория вокруг него защищается от других игроков." },
      { q: "Как купить донат?", a: "Перейди в раздел «Магазин», выбери товар и следуй инструкциям оплаты." },
      { q: "Можно ли грифить?", a: "Да! Это анархический сервер — гриф и PvP разрешены везде, кроме приватных зон." },
    ],
  };

  /* ---------- translations (UI strings) ---------- */
  const I18N = {
    ru: {
      "nav.home": "Главная", "nav.servers": "Серверы", "nav.news": "Новости", "nav.shop": "Магазин", "nav.forum": "Форум", "nav.download": "Скачать",
      "hero.onlineLbl": "Онлайн:", "hero.players": "игроков", "hero.welcome": "Добро пожаловать на",
      "hero.play": "Начать играть", "hero.version": "версия", "hero.mode": "режим", "hero.serversLbl": "сервера", "hero.scroll": "Прокрути вниз",
      "servers.title": "Наши серверы", "servers.sub": "В основе каждого сервера — собственные разработки и оригинальный контент. Мы вручную отбираем дополнения, чтобы подарить уникальный игровой опыт.",
      "news.title": "Новости и обновления", "news.sub": "Здесь мы рассказываем обо всём, что происходит на сервере — от обзоров обновлений до анонсов ивентов и акций. Заглядывай, чтобы быть в курсе.",
      "shop.title": "Магазин", "shop.sub": "Поддержи проект и получи преимущества: привилегии, кейсы, префиксы и донат-наборы.",
      "forum.title": "Форум и правила", "forum.sub": "Главное, что нужно знать перед началом игры на проекте.",
      "forum.rules": "📋 Правила сервера", "faq.title": "❓ Частые вопросы",
      "footer.desc": "Minecraft-сеть с модовыми сборками, приватами и живым сообществом.",
      "footer.main": "Основное", "footer.activity": "Активность", "footer.other": "Другое",
      "footer.play": "Начать игру", "footer.bonus": "Бонусы", "footer.tops": "Топы игроков",
      "footer.team": "Команда проекта", "footer.contacts": "Контакты", "footer.terms": "Пользовательское соглашение",
      "footer.privacy": "Политика конфиденциальности", "footer.rights": "Все права защищены.",
      "footer.disclaimer": "Не является официальным продуктом Mojang или Microsoft.",
    },
    en: {
      "nav.home": "Home", "nav.servers": "Servers", "nav.news": "News", "nav.shop": "Shop", "nav.forum": "Forum", "nav.download": "Download",
      "hero.onlineLbl": "Online:", "hero.players": "players", "hero.welcome": "Welcome to",
      "hero.play": "Start playing", "hero.version": "version", "hero.mode": "mode", "hero.serversLbl": "servers", "hero.scroll": "Scroll down",
      "servers.title": "Our servers", "servers.sub": "Each server is built on our own developments and original content. We hand-pick every addon to give you a unique experience.",
      "news.title": "News & updates", "news.sub": "Here we tell you about everything happening on the project — from update reviews to event and sale announcements. Drop by to stay in the loop.",
      "shop.title": "Shop", "shop.sub": "Support the project and get perks: ranks, cases, prefixes and donate kits.",
      "forum.title": "Forum & rules", "forum.sub": "The essentials you need to know before you start playing.",
      "forum.rules": "📋 Server rules", "faq.title": "❓ FAQ",
      "footer.desc": "A Minecraft network with modded packs, claims and a living community.",
      "footer.main": "Main", "footer.activity": "Activity", "footer.other": "Other",
      "footer.play": "Start playing", "footer.bonus": "Bonuses", "footer.tops": "Player tops",
      "footer.team": "Project team", "footer.contacts": "Contacts", "footer.terms": "Terms of service",
      "footer.privacy": "Privacy policy", "footer.rights": "All rights reserved.",
      "footer.disclaimer": "Not an official Mojang or Microsoft product.",
    },
  };

  /* ---------- state ---------- */
  let data = loadData();
  let lang = localStorage.getItem(LANG_KEY) || "ru";
  let serverFilter = "Все";

  function loadData() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(structuredClone(DEFAULT), JSON.parse(raw));
    } catch (e) { console.log("[v0] load error", e.message); }
    return structuredClone(DEFAULT);
  }
  function saveData() {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.hidden = false; t.textContent = msg; t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  /* ============================================================
     RENDER SITE
     ============================================================ */
  function renderAll() {
    renderServerInfo();
    renderServers();
    renderNews();
    renderShop();
    renderForum();
    applyI18n();
  }

  function renderServerInfo() {
    const s = data.server;
    $("#serverName").textContent = s.name;
    $("#serverIp").textContent = s.ip;
    $("#serverDesc").textContent = s.desc;
    $("#statOnline").textContent = s.online;
    $("#statVersion").textContent = s.version;
    $("#statMode").textContent = s.mode;
    const statServers = $("#statServers"); if (statServers) statServers.textContent = data.servers.length;
    const footerName = $("#footerName"); if (footerName) footerName.textContent = s.name;
    document.title = s.name + " — Minecraft сервер";
  }

  function renderServers() {
    const filtersWrap = $("#serverFilters");
    const grid = $("#serverGrid");
    if (!filtersWrap || !grid) return;
    const versions = Array.from(new Set(data.servers.map((s) => s.version)));
    const filters = ["Все", ...versions];
    if (!filters.includes(serverFilter)) serverFilter = "Все";

    filtersWrap.innerHTML = filters.map((f) =>
      `<button class="filter-chip ${f === serverFilter ? "active" : ""}" data-f="${esc(f)}">${esc(f)}</button>`).join("");

    const list = data.servers.filter((s) => serverFilter === "Все" || s.version === serverFilter);
    grid.innerHTML = list.length ? list.map((s) => `
      <article class="server-card" style="--c1:${esc(s.c1 || "#c0392b")};--c2:${esc(s.c2 || "#7d241a")}">
        <div class="sc-top">
          <span class="sc-name">${esc(s.name)}</span>
          ${s.badge ? `<span class="sc-status">${esc(s.badge)}</span>` : ""}
        </div>
        <p class="sc-desc">${esc(s.desc)}</p>
        <div class="sc-foot">
          <span class="sc-players">👥 ${esc(s.players)}</span>
          <span class="sc-status ${s.status === "online" ? "online" : ""}">${s.status === "online" ? "Онлайн" : "Оффлайн"}</span>
          <span class="sc-version">${esc(s.version)}</span>
        </div>
      </article>`).join("") : `<p class="muted">Серверов в этой версии пока нет.</p>`;

    filtersWrap.onclick = (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      serverFilter = chip.dataset.f;
      renderServers();
    };
  }

  function renderNews() {
    const wrap = $("#newsList");
    wrap.innerHTML = data.news.map((n) => `
      <article class="news-item">
        <div class="news-thumb">${n.img ? `<img src="${esc(n.img)}" alt="${esc(n.title)}" />` : `<span>${esc(n.icon || "📰")}</span>`}</div>
        <div class="news-body">
          <span class="news-date">${esc(n.date)}</span>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.text)}</p>
        </div>
      </article>`).join("");
  }

  function renderShop() {
    const tabsWrap = $("#shopTabs");
    const grid = $("#shopGrid");
    const tabs = data.shopTabs;
    let active = tabs[0];

    function draw() {
      tabsWrap.innerHTML = tabs.map((t) => `<button class="shop-tab ${t === active ? "active" : ""}" data-tab="${esc(t)}">${esc(t)}</button>`).join("");
      const items = data.shop.filter((i) => i.cat === active);
      grid.innerHTML = items.length ? items.map((i) => `
        <div class="shop-card">
          <div class="shop-ico">${i.img ? `<img src="${esc(i.img)}" alt="${esc(i.name)}" />` : esc(i.icon || "🛒")}</div>
          <h3>${esc(i.name)}</h3>
          <div class="price">${esc(i.price)}</div>
          <p class="desc">${esc(i.desc)}</p>
          <button class="btn btn-primary buy-btn">Купить</button>
        </div>`).join("") : `<p class="muted">В этой категории пока нет товаров.</p>`;
      $$(".buy-btn", grid).forEach((b) => b.addEventListener("click", () => toast("Покупка скоро будет доступна 🛒")));
    }
    tabsWrap.onclick = (e) => {
      const t = e.target.closest(".shop-tab");
      if (!t) return;
      active = t.dataset.tab; draw();
    };
    draw();
  }

  function renderForum() {
    $("#rulesList").innerHTML = data.rules.map((r) => `<li><span>${esc(r)}</span></li>`).join("");
    $("#faqList").innerHTML = data.faq.map((f) => `
      <details class="faq-q">
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join("");
    $("#year").textContent = new Date().getFullYear();
  }

  /* ============================================================
     I18N
     ============================================================ */
  function applyI18n() {
    const dict = I18N[lang] || I18N.ru;
    $$("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (dict[k]) el.textContent = dict[k];
    });
    renderServerInfo();
    $("#langToggle").textContent = lang.toUpperCase();
    document.documentElement.lang = lang;
  }

  /* ============================================================
     THEME + LANG TOGGLES
     ============================================================ */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
    $("#themeToggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      updateThemeIcon(next);
    });
  }
  function updateThemeIcon(theme) {
    $("#themeToggle").textContent = theme === "dark" ? "🌙" : "☀️";
  }
  function initLang() {
    $("#langToggle").addEventListener("click", () => {
      lang = lang === "ru" ? "en" : "ru";
      localStorage.setItem(LANG_KEY, lang);
      applyI18n();
    });
  }

  /* ============================================================
     NAVBAR: scroll state, burger, active link, to-top
     ============================================================ */
  function initNav() {
    const navbar = $("#navbar");
    const navLinks = $("#navLinks");
    const burger = $("#burger");
    const toTop = $("#toTop");
    const links = $$(".nav-link", navLinks);
    const sections = ["home", "servers", "news", "shop", "forum"].map((id) => $("#" + id)).filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      navbar.classList.toggle("scrolled", y > 30);
      toTop.classList.toggle("show", y > 500);
      // active link via section in view
      let current = "home";
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= 120) current = sec.id;
      });
      links.forEach((l) => l.classList.toggle("active", l.dataset.nav === current));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    burger.addEventListener("click", () => navLinks.classList.toggle("open"));
    links.forEach((l) => l.addEventListener("click", () => navLinks.classList.remove("open")));

    // smooth-scroll for any in-page anchor
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1) {
          const target = $(id);
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
        }
      });
    });

    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    $("#playBtn").addEventListener("click", () => {
      copyIp();
      $("#servers").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ============================================================
     COPY IP
     ============================================================ */
  async function copyIp() {
    try {
      await navigator.clipboard.writeText(data.server.ip);
      toast("IP скопирован: " + data.server.ip);
    } catch {
      toast("IP: " + data.server.ip);
    }
  }
  function initCopy() {
    $("#copyIp").addEventListener("click", copyIp);
    $("#copyIpNav").addEventListener("click", copyIp);
  }

  /* ============================================================
     ADMIN PANEL
     ============================================================ */
  function isAdminRoute() {
    return location.pathname.replace(/\/+$/, "").toLowerCase().endsWith("/admin")
      || location.hash.toLowerCase() === "#admin";
  }

  function initAdmin() {
    const root = $("#adminRoot");
    const loginView = $("#adminLogin");
    const dashView = $("#adminDash");

    function open() {
      root.hidden = false;
      if (sessionStorage.getItem(AUTH_KEY) === "1") showDash();
      else showLogin();
    }
    function close() {
      root.hidden = true;
      if (isAdminRoute()) history.pushState({}, "", "./");
    }
    function showLogin() { loginView.hidden = false; dashView.hidden = true; }
    function showDash() { loginView.hidden = true; dashView.hidden = false; buildDash(); }

    $("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const u = $("#loginUser").value.trim();
      const p = $("#loginPass").value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem(AUTH_KEY, "1");
        $("#loginError").hidden = true;
        showDash();
      } else {
        $("#loginError").hidden = false;
      }
    });
    $("#loginClose").addEventListener("click", close);
    $("#dashLogout").addEventListener("click", () => { sessionStorage.removeItem(AUTH_KEY); showLogin(); });
    $("#dashSite").addEventListener("click", (e) => { e.preventDefault(); close(); });

    window.__bingoAdmin = { open, close, isOpen: () => !root.hidden };

    if (isAdminRoute()) open();
    window.addEventListener("popstate", () => { if (isAdminRoute()) open(); else close(); });
    window.addEventListener("hashchange", () => { if (isAdminRoute()) open(); });
  }

  /* ---------- dashboard tabs + editors ---------- */
  function buildDash() {
    const content = $("#dashContent");

    $$(".dash-tab").forEach((tab) => {
      tab.onclick = () => {
        $$(".dash-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        renderPanel(tab.dataset.tab);
      };
    });
    const activeTab = $(".dash-tab.active")?.dataset.tab || "preview";
    renderPanel(activeTab);

    function renderPanel(name) {
      if (name === "preview") return panelPreview(content);
      if (name === "general") return panelGeneral(content);
      if (name === "servers") return panelServers(content);
      if (name === "news") return panelNews(content);
      if (name === "shop") return panelShop(content);
      if (name === "forum") return panelForum(content);
    }
  }

  function panelPreview(c) {
    c.innerHTML = `
      <div class="dash-panel active">
        <h3>Превью сайта на разных устройствах</h3>
        <div class="preview-bar">
          <button data-d="desktop" class="active">🖥️ Десктоп</button>
          <button data-d="tablet">📱 Планшет</button>
          <button data-d="mobile">📲 Телефон</button>
          <button id="prevRefresh">↻ Обновить</button>
        </div>
        <div class="preview-frame-wrap">
          <iframe class="preview-frame" id="prevFrame" src="./" title="Превью сайта"></iframe>
        </div>
      </div>`;
    const frame = $("#prevFrame", c);
    $$(".preview-bar button[data-d]", c).forEach((b) => {
      b.onclick = () => {
        $$(".preview-bar button[data-d]", c).forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        frame.className = "preview-frame " + (b.dataset.d === "desktop" ? "" : b.dataset.d);
      };
    });
    $("#prevRefresh", c).onclick = () => { frame.src = frame.src; };
  }

  function panelGeneral(c) {
    const s = data.server;
    c.innerHTML = `
      <div class="dash-panel active">
        <h3>Информация о сервере</h3>
        ${field("Название сервера", "name", s.name)}
        ${field("IP-адрес", "ip", s.ip)}
        ${field("Описание (подзаголовок героя)", "desc", s.desc, true)}
        ${field("Онлайн", "online", s.online)}
        ${field("Версия", "version", s.version)}
        ${field("Режим", "mode", s.mode)}
        <button class="add-btn" id="saveGeneral">Сохранить</button>
      </div>`;
    $("#saveGeneral", c).onclick = () => {
      ["name", "ip", "desc", "online", "version", "mode"].forEach((k) => {
        data.server[k] = $(`[data-f="${k}"]`, c).value;
      });
      saveData(); renderAll(); toast("Сохранено ✓");
    };
  }

  function panelServers(c) {
    c.innerHTML = `<div class="dash-panel active"><h3>Серверы</h3><div id="srvEdit"></div>
      <button class="add-btn" id="addSrv">+ Добавить сервер</button></div>`;
    const wrap = $("#srvEdit", c);
    function draw() {
      wrap.innerHTML = data.servers.map((s, i) => `
        <div class="admin-card">
          <div class="admin-row-head"><b>${esc(s.name)}</b><button class="del-btn" data-del="${i}">Удалить</button></div>
          <div class="admin-card-row">
            ${miniField("Название", `v-name-${i}`, s.name)}
            ${miniField("Игроков", `v-players-${i}`, s.players)}
            ${miniField("Версия", `v-version-${i}`, s.version)}
            ${miniField("Бейдж", `v-badge-${i}`, s.badge || "")}
          </div>
          ${miniField("Описание", `v-desc-${i}`, s.desc, true)}
          <div class="admin-card-row">
            ${miniField("Статус (online/offline)", `v-status-${i}`, s.status || "online")}
            ${miniField("Цвет 1 (#hex)", `v-c1-${i}`, s.c1 || "#c0392b")}
            ${miniField("Цвет 2 (#hex)", `v-c2-${i}`, s.c2 || "#7d241a")}
          </div>
        </div>`).join("");
      $$("[data-del]", wrap).forEach((b) => b.onclick = () => { data.servers.splice(+b.dataset.del, 1); saveData(); renderServers(); renderServerInfo(); draw(); toast("Удалено"); });
      $$("input,textarea", wrap).forEach((inp) => inp.oninput = () => {
        const [, key, idx] = inp.dataset.bind.split("|");
        data.servers[+idx][key] = inp.value;
      });
    }
    $("#addSrv", c).onclick = () => { data.servers.push({ name: "Новый сервер", desc: "Описание сервера", players: "0", version: "1.20.x", status: "online", badge: "", c1: "#5b8c2a", c2: "#34521a" }); saveData(); renderServers(); renderServerInfo(); draw(); };
    wrap.addEventListener("focusout", () => { saveData(); renderServers(); renderServerInfo(); });
    draw();
  }

  function panelNews(c) {
    c.innerHTML = `<div class="dash-panel active"><h3>Новости</h3><div id="newsEdit"></div>
      <button class="add-btn" id="addNews">+ Добавить новость</button></div>`;
    const wrap = $("#newsEdit", c);
    function draw() {
      wrap.innerHTML = data.news.map((n, i) => `
        <div class="admin-card">
          <div class="admin-row-head"><b>Новость #${i + 1}</b><button class="del-btn" data-del="${i}">Удалить</button></div>
          <div class="admin-card-row">
            ${miniField("Дата", `n-date-${i}`, n.date)}
            ${miniField("Иконка (emoji)", `n-icon-${i}`, n.icon || "")}
          </div>
          ${miniField("Заголовок", `n-title-${i}`, n.title)}
          ${miniField("Текст", `n-text-${i}`, n.text, true)}
          ${miniField("Картинка (URL, необяз.)", `n-img-${i}`, n.img || "")}
        </div>`).join("");
      $$("[data-del]", wrap).forEach((b) => b.onclick = () => { data.news.splice(+b.dataset.del, 1); commit(); });
      $$("input,textarea", wrap).forEach((inp) => inp.oninput = () => {
        const [, key, idx] = inp.dataset.bind.split("|");
        data.news[+idx][key] = inp.value;
      });
    }
    function commit() { saveData(); renderNews(); draw(); toast("Сохранено ✓"); }
    $("#addNews", c).onclick = () => { data.news.unshift({ date: "сегодня", title: "Новая новость", text: "Текст новости", icon: "📰" }); commit(); };
    draw();
    wrap.addEventListener("focusout", () => { saveData(); renderNews(); });
  }

  function panelShop(c) {
    c.innerHTML = `<div class="dash-panel active"><h3>Магазин</h3>
      ${miniField("Категории (через запятую)", "shop-cats", data.shopTabs.join(", "))}
      <button class="add-btn" id="saveCats" style="margin-bottom:1.4rem">Сохранить категории</button>
      <div id="shopEdit"></div>
      <button class="add-btn" id="addItem">+ Добавить товар</button></div>`;
    const wrap = $("#shopEdit", c);
    function draw() {
      wrap.innerHTML = data.shop.map((it, i) => `
        <div class="admin-card">
          <div class="admin-row-head"><b>${esc(it.name)}</b><button class="del-btn" data-del="${i}">Удалить</button></div>
          <div class="admin-card-row">
            ${miniField("Категория", `s-cat-${i}`, it.cat)}
            ${miniField("Иконка (emoji)", `s-icon-${i}`, it.icon || "")}
            ${miniField("Название", `s-name-${i}`, it.name)}
            ${miniField("Цена", `s-price-${i}`, it.price)}
          </div>
          ${miniField("Описание", `s-desc-${i}`, it.desc, true)}
          ${miniField("Картинка (URL, необяз.)", `s-img-${i}`, it.img || "")}
        </div>`).join("");
      $$("[data-del]", wrap).forEach((b) => b.onclick = () => { data.shop.splice(+b.dataset.del, 1); saveData(); renderShop(); draw(); toast("Удалено"); });
      $$("input,textarea", wrap).forEach((inp) => inp.oninput = () => {
        const [, key, idx] = inp.dataset.bind.split("|");
        data.shop[+idx][key] = inp.value;
      });
    }
    $("#saveCats", c).onclick = () => {
      data.shopTabs = $('[data-f="shop-cats"]', c).value.split(",").map((s) => s.trim()).filter(Boolean);
      saveData(); renderShop(); toast("Категории сохранены ✓");
    };
    $("#addItem", c).onclick = () => { data.shop.push({ cat: data.shopTabs[0] || "Прочее", icon: "🛒", name: "Новый товар", price: "0 ₽", desc: "Описание" }); saveData(); renderShop(); draw(); };
    wrap.addEventListener("focusout", () => { saveData(); renderShop(); });
    draw();
  }

  function panelForum(c) {
    c.innerHTML = `<div class="dash-panel active">
      <h3>Правила</h3><div id="rulesEdit"></div>
      <button class="add-btn" id="addRule" style="margin-bottom:1.6rem">+ Добавить правило</button>
      <h3>Частые вопросы</h3><div id="faqEdit"></div>
      <button class="add-btn" id="addFaq">+ Добавить вопрос</button></div>`;

    const rWrap = $("#rulesEdit", c);
    function drawRules() {
      rWrap.innerHTML = data.rules.map((r, i) => `
        <div class="admin-card">
          <div class="admin-row-head"><b>Правило #${i + 1}</b><button class="del-btn" data-del="${i}">Удалить</button></div>
          ${miniField("", `rule-${i}`, r)}
        </div>`).join("");
      $$("[data-del]", rWrap).forEach((b) => b.onclick = () => { data.rules.splice(+b.dataset.del, 1); saveData(); renderForum(); drawRules(); });
      $$("input,textarea", rWrap).forEach((inp) => inp.oninput = () => { data.rules[+inp.dataset.bind.split("|")[2]] = inp.value; });
    }
    $("#addRule", c).onclick = () => { data.rules.push("Новое правило"); saveData(); renderForum(); drawRules(); };

    const fWrap = $("#faqEdit", c);
    function drawFaq() {
      fWrap.innerHTML = data.faq.map((f, i) => `
        <div class="admin-card">
          <div class="admin-row-head"><b>Вопрос #${i + 1}</b><button class="del-btn" data-del="${i}">Удалить</button></div>
          ${miniField("Вопрос", `q-${i}`, f.q)}
          ${miniField("Ответ", `a-${i}`, f.a, true)}
        </div>`).join("");
      $$("[data-del]", fWrap).forEach((b) => b.onclick = () => { data.faq.splice(+b.dataset.del, 1); saveData(); renderForum(); drawFaq(); });
      $$("input,textarea", fWrap).forEach((inp) => inp.oninput = () => {
        const [, key, idx] = inp.dataset.bind.split("|");
        data.faq[+idx][key === "q" ? "q" : "a"] = inp.value;
      });
    }
    $("#addFaq", c).onclick = () => { data.faq.push({ q: "Новый вопрос?", a: "Ответ" }); saveData(); renderForum(); drawFaq(); };

    c.addEventListener("focusout", () => { saveData(); renderForum(); });
    drawRules(); drawFaq();
  }

  /* ---------- field builders ---------- */
  function field(label, key, val, area) {
    const tag = area
      ? `<textarea data-f="${key}">${esc(val)}</textarea>`
      : `<input type="text" data-f="${key}" value="${esc(val)}" />`;
    return `<div class="field"><label>${esc(label)}</label>${tag}</div>`;
  }
  // mini field encodes binding: section|key|index parsed from id pattern
  function miniField(label, id, val, area) {
    const parts = id.split("-");
    const idx = parts[parts.length - 1];
    let bind = "";
    if (parts[0] === "n") bind = `news|${parts[1]}|${idx}`;
    else if (parts[0] === "s") bind = `shop|${parts[1]}|${idx}`;
    else if (parts[0] === "v") bind = `servers|${parts[1]}|${idx}`;
    else if (parts[0] === "rule") bind = `rules|val|${idx}`;
    else if (parts[0] === "q") bind = `faq|q|${idx}`;
    else if (parts[0] === "a") bind = `faq|a|${idx}`;
    const tag = area
      ? `<textarea data-bind="${bind}">${esc(val)}</textarea>`
      : `<input type="text" data-bind="${bind}" value="${esc(val)}" />`;
    return `<div class="field">${label ? `<label>${esc(label)}</label>` : ""}${tag}</div>`;
  }

  /* ============================================================
     BOOT
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLang();
    renderAll();
    initNav();
    initCopy();
    initAdmin();
  });
})();
