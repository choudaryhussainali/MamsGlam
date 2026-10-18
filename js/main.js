/* ==========================================================================
   MAMS GLAM — storefront behaviour
   --------------------------------------------------------------------------
   01. Helpers
   02. Splash
   03. Header state
   04. Focus-safe overlays (menu, search)
   05. Cart store (localStorage) + drawer
   06. Quick add, toasts, placeholders
   07. Shop grid, tiles, bestsellers (rendered from products.js)
   08. Product page rendering + Product schema
   09. Cart page rendering + demo checkout
   10. Newsletter validation
   11. Scroll reveals
   ========================================================================== */

(function () {
  'use strict';

  /* 01. Helpers
     ========================================================================== */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || '';

  function money(n) { return window.MAMS ? window.MAMS.money(n) : '$' + n; }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2400);
  }

  function trapFocus(panel, e) {
    var focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* 02. Splash — two-colour lockup, first visit per session only
     ========================================================================== */
  var splash = $('.splash');
  if (splash) {
    var seen = /[?&](nosplash|qa)\b/.test(location.search);
    try { seen = seen || sessionStorage.getItem('mams-splash') === '1'; } catch (e) { /* storage unavailable */ }
    if (seen || reduceMotion) {
      splash.remove();
    } else {
      document.body.classList.add('no-scroll');
      var endSplash = function () {
        splash.classList.add('is-done');
        splash.addEventListener('transitionend', function () { splash.remove(); }, { once: true });
        document.body.classList.remove('no-scroll');
        try { sessionStorage.setItem('mams-splash', '1'); } catch (e) { /* ignore */ }
      };
      setTimeout(endSplash, reduceMotion ? 0 : 1750);
    }
  }

  /* 03. Header state
     ========================================================================== */
  var header = $('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 04. Overlays: mobile menu + search
     ========================================================================== */
  var openOverlay = null;
  var lastFocus = null;

  function openPanel(panel, focusSel) {
    lastFocus = document.activeElement;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    openOverlay = panel;
    var f = focusSel ? $(focusSel, panel) : $('button, a, input', panel);
    if (f) f.focus();
    document.addEventListener('keydown', onPanelKey);
  }
  function closePanel() {
    if (!openOverlay) return;
    var panel = openOverlay;
    openOverlay = null;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onPanelKey);
    if (lastFocus) lastFocus.focus();
  }
  function onPanelKey(e) {
    if (e.key === 'Escape') { closePanel(); closeDrawer(); }
    if (e.key === 'Tab' && openOverlay) trapFocus(openOverlay, e);
  }

  var menuBtn = $('#menu-btn');
  var mobileMenu = $('#mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.setAttribute('aria-expanded', 'true');
      openPanel(mobileMenu);
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target.closest('a')) closePanel();
    });
  }

  var searchBtn = $('#search-btn');
  var searchPanel = $('#search-panel');
  var searchInput = $('#search-input');
  var searchResults = $('#search-results');
  if (searchBtn && searchPanel) {
    searchBtn.addEventListener('click', function () {
      openPanel(searchPanel, '#search-input');
      renderSearch('');
    });
    searchPanel.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closePanel();
    });
    if (searchInput) {
      searchInput.addEventListener('input', function () { renderSearch(searchInput.value); });
    }
  }

  function renderSearch(q) {
    if (!searchResults) return;
    var query = q.trim().toLowerCase();
    var hits = window.MAMS.products.filter(function (p) {
      if (!query) return true;
      var hay = (p.name + ' ' + p.tagline + ' ' + p.type + ' ' +
        p.colours.map(function (c) { return c.name; }).join(' ')).toLowerCase();
      return hay.indexOf(query) !== -1;
    });
    if (!query) {
      searchResults.innerHTML = '<p class="search-empty">Search shells, trays, colours… try “blush” or “valet”.</p>';
      return;
    }
    if (!hits.length) {
      searchResults.innerHTML = '<p class="search-empty">Nothing poured under “' + q.replace(/[<>&]/g, '') + '” yet. Try another word.</p>';
      return;
    }
    searchResults.innerHTML = hits.map(function (p) {
      var img = p.images[0].src.replace('.jpg', '-640.jpg');
      return '<a class="search-hit" href="product.html?id=' + p.id + '">' +
        '<img src="' + img + '" alt="" width="56" height="70" loading="lazy">' +
        '<span><strong>' + p.name + '</strong><span>' + p.tagline + '</span></span>' +
        '<span class="p-card__price">' + money(p.price) + '</span></a>';
    }).join('');
  }

  /* 05. Cart store + drawer
     ========================================================================== */
  var CART_KEY = 'mams-cart-v1';
  var cart = loadCart();

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (l) { return l && l.id && l.qty > 0; }) : [];
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
    updateCartUI();
  }
  function cartCount() {
    return cart.reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function cartSubtotal() {
    return cart.reduce(function (sum, l) {
      var p = window.MAMS.find(l.id);
      return p ? sum + p.price * l.qty : sum;
    }, 0);
  }
  function addToCart(id, colour, qty) {
    var p = window.MAMS.find(id);
    if (!p) return;
    colour = colour || p.colours[0].name;
    qty = qty || 1;
    var line = cart.find(function (l) { return l.id === id && l.colour === colour; });
    if (line) line.qty += qty;
    else cart.push({ id: id, colour: colour, qty: qty });
    saveCart();
    toast('Added to bag — ' + p.name + ' in ' + colour);
    if (page !== 'cart') openDrawer();
  }
  function setQty(index, qty) {
    if (!cart[index]) return;
    if (qty <= 0) cart.splice(index, 1);
    else cart[index].qty = qty;
    saveCart();
  }

  var drawer = $('#cart-drawer');
  var drawerOverlay = $('#drawer-overlay');

  function openDrawer() {
    if (!drawer) return;
    renderDrawer();
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (drawerOverlay) drawerOverlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    var f = $('button, a', drawer);
    if (f) f.focus();
    document.addEventListener('keydown', onDrawerKey);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (drawerOverlay) drawerOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onDrawerKey);
    if (lastFocus) lastFocus.focus();
  }
  function onDrawerKey(e) {
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab') trapFocus(drawer, e);
  }

  function renderDrawer() {
    var body = $('#drawer-body');
    var foot = $('#drawer-foot');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
        '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#shell" /></svg>' +
        '<p>Your bag is empty — for now.</p>' +
        '<a class="btn btn--ghost" href="shop.html">Browse the shop</a></div>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = cart.map(function (l, i) {
      var p = window.MAMS.find(l.id);
      if (!p) return '';
      var img = p.images[0].src.replace('.jpg', '-640.jpg');
      return '<div class="cart-line">' +
        '<img class="cart-line__img" src="' + img + '" alt="" width="84" height="105" loading="lazy">' +
        '<div class="cart-line__info">' +
        '<a class="cart-line__name" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
        '<span class="cart-line__variant">' + l.colour + '</span>' +
        '<span class="qty">' +
        '<button type="button" data-step="-1" data-index="' + i + '" aria-label="Decrease quantity of ' + p.name + '">−</button>' +
        '<span data-qty-value>' + l.qty + '</span>' +
        '<button type="button" data-step="1" data-index="' + i + '" aria-label="Increase quantity of ' + p.name + '">+</button>' +
        '</span></div>' +
        '<div class="cart-line__side">' +
        '<span class="cart-line__price">' + money(p.price * l.qty) + '</span>' +
        '<button type="button" class="line-remove" data-remove="' + i + '">Remove</button>' +
        '</div></div>';
    }).join('');
    foot.innerHTML =
      '<div class="drawer__subtotal"><span>Subtotal</span><strong>' + money(cartSubtotal()) + '</strong></div>' +
      '<a class="btn btn--primary btn--block" href="cart.html">Go to bag</a>' +
      '<p class="drawer__note">Handmade to order · Shipping calculated at checkout</p>';
  }

  function updateCartUI() {
    $$('.cart-count').forEach(function (el) {
      var n = cartCount();
      el.textContent = n;
      el.hidden = n === 0;
    });
    if (page === 'cart') renderCartPage();
  }

  var bagBtn = $('#bag-btn');
  if (bagBtn) bagBtn.addEventListener('click', openDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { closeDrawer(); return; }
      var step = e.target.closest('[data-step]');
      if (step) {
        var i = Number(step.getAttribute('data-index'));
        setQty(i, cart[i].qty + Number(step.getAttribute('data-step')));
        return;
      }
      var rm = e.target.closest('[data-remove]');
      if (rm) { setQty(Number(rm.getAttribute('data-remove')), 0); }
    });
  }
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  /* 06. Delegated actions: add-to-bag, placeholders
     ========================================================================== */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      addToCart(add.getAttribute('data-add'), add.getAttribute('data-colour'), 1);
      add.classList.add('is-added');
      var label = add.textContent;
      add.textContent = 'Added ✓';
      setTimeout(function () { add.classList.remove('is-added'); add.textContent = label; }, 1600);
      return;
    }
    var soon = e.target.closest('[data-soon]');
    if (soon) {
      e.preventDefault();
      toast(soon.getAttribute('data-soon') || 'Coming soon.');
    }
  });

  /* 07. Render tiles + bestsellers grid from products.js
     ========================================================================== */
  function imgTag(src, alt, eager, cls) {
    var base = src.replace('.jpg', '');
    return '<img src="' + base + '-640.jpg" srcset="' + base + '-640.jpg 640w, ' + src + ' 1200w" ' +
      'sizes="' + (cls || '(min-width: 900px) 320px, 45vw') + '" alt="' + alt + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
  }

  var tilesGrid = $('#tiles-grid');
  if (tilesGrid) {
    var promoTile =
      '<a class="tile tile--promo" href="about.html">' +
      '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#shell" /></svg>' +
      '<h3>Every order, wrapped by hand</h3>' +
      '<span class="link-slide">Read our story</span></a>';
    tilesGrid.innerHTML = window.MAMS.products.map(function (p, i) {
      var cls = i === 0 ? 'tile tile--feature' : 'tile';
      return '<a class="' + cls + '" href="product.html?id=' + p.id + '">' +
        imgTag(p.images[0].src, p.images[0].alt, i === 0, '(min-width: 900px) 30vw, 45vw') +
        '<span class="tile__label"><h3>' + p.name + '</h3>' +
        '<span class="tile__price">From ' + money(p.price) + '</span></span></a>';
    }).join('') + promoTile;
  }

  var bestGrid = $('#bestsellers-grid');
  if (bestGrid) {
    var picks = ['shell-dish', 'ribbed-valet-tray', 'oval-vanity-tray', 'pebble-nesting-bowls'];
    bestGrid.innerHTML = picks.map(function (id, i) {
      var p = window.MAMS.find(id);
      if (!p) return '';
      var hover = p.images[1] || p.images[0];
      return '<article class="p-card reveal" style="--d:' + (i * 70) + 'ms">' +
        (p.badge ? '<span class="badge ' + (p.badge === 'Bestseller' ? 'badge--best' : 'badge--new') + ' p-card__badge">' + p.badge + '</span>' : '') +
        '<a class="p-card__media" href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' +
        '<img class="is-main" src="' + p.images[0].src.replace('.jpg', '-640.jpg') + '" ' +
        'srcset="' + p.images[0].src.replace('.jpg', '-640.jpg') + ' 640w, ' + p.images[0].src + ' 1200w" ' +
        'sizes="(min-width: 900px) 22vw, 45vw" alt="' + p.images[0].alt + '" loading="lazy" width="800" height="1000">' +
        '<img class="is-hover" src="' + hover.src.replace('.jpg', '-640.jpg') + '" alt="" loading="lazy" width="800" height="1000">' +
        '<button type="button" class="quick-add" data-add="' + p.id + '">Add to bag — ' + money(p.price) + '</button>' +
        '</a>' +
        '<div class="p-card__info">' +
        '<a class="p-card__name" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
        '<div class="p-card__meta">' +
        '<span class="p-card__price">From ' + money(p.price) + '</span>' +
        '<span class="swatches" aria-hidden="true">' +
        p.colours.slice(0, 6).map(function (c) {
          return '<span class="swatch swatch--dot-sm" style="background:' + c.hex + '"></span>';
        }).join('') +
        '</span></div></div></article>';
    }).join('');
  }

  /* 08. Product page
     ========================================================================== */
  function renderProductPage() {
    var mount = $('#pdp');
    if (!mount) return;
    var id = new URLSearchParams(location.search).get('id');
    var p = window.MAMS.find(id);
    if (!p) {
      mount.innerHTML =
        '<div class="notfound" style="min-height:40vh"><h2>That piece has sailed.</h2>' +
        '<p class="lede">We could not find a product at this address.</p>' +
        '<a class="btn btn--primary" href="shop.html">Back to the shop</a></div>';
      return;
    }
    document.title = p.name + ' — Mams Glam';
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.tagline + ' Hand-cast by Mams Glam. ' + money(p.price) + ' placeholder price.');

    var state = { colour: p.colours[0].name, qty: 1, img: p.images[0] };

    mount.innerHTML =
      '<div class="gallery">' +
      '<div class="gallery__main"><img id="gallery-main" src="' + p.images[0].src + '" ' +
      'srcset="' + p.images[0].src.replace('.jpg', '-640.jpg') + ' 640w, ' + p.images[0].src + ' 1200w" ' +
      'sizes="(min-width: 960px) 55vw, 92vw" alt="' + p.images[0].alt + '" fetchpriority="high"></div>' +
      '<div class="gallery__thumbs" role="tablist" aria-label="Product photos">' +
      p.images.map(function (im, i) {
        return '<button type="button" class="gallery__thumb" data-thumb="' + i + '" aria-current="' + (i === 0) + '" ' +
          'aria-label="Photo ' + (i + 1) + ' of ' + p.images.length + '">' +
          '<img src="' + im.src.replace('.jpg', '-640.jpg') + '" alt="" loading="lazy" width="160" height="200"></button>';
      }).join('') +
      '</div></div>' +
      '<div class="pdp__info">' +
      '<p class="eyebrow">' + p.type + '</p>' +
      '<h1 class="pdp__title">' + p.name + '</h1>' +
      '<p class="lede">' + p.tagline + '</p>' +
      '<p class="pdp__price"><span id="pdp-price">' + money(p.price) + '</span> <span class="pdp__hint">Placeholder price</span></p>' +
      '<div class="pdp__variant">' +
      '<p class="pdp__variant-label">Colour — <strong id="colour-name">' + p.colours[0].name + '</strong></p>' +
      '<div class="swatches" role="group" aria-label="Choose a colour">' +
      p.colours.map(function (c, i) {
        return '<button type="button" class="swatch" style="background:' + c.hex + '" data-colour="' + i + '" ' +
          'aria-pressed="' + (i === 0) + '" aria-label="' + c.name + '"></button>';
      }).join('') +
      '</div></div>' +
      '<div class="pdp__buy">' +
      '<span class="qty" aria-label="Quantity">' +
      '<button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
      '<span data-qty-value id="pdp-qty">1</span>' +
      '<button type="button" data-qty="1" aria-label="Increase quantity">+</button>' +
      '</span>' +
      '<button type="button" class="btn btn--primary btn--block" id="pdp-add">Add to bag</button>' +
      '</div>' +
      '<ul class="pdp__assurance">' +
      '<li><svg aria-hidden="true"><use href="#i-check" /></svg>Handmade to order, just for you</li>' +
      '<li><svg aria-hidden="true"><use href="#i-check" /></svg>Ships in 3–5 days, worldwide</li>' +
      '<li><svg aria-hidden="true"><use href="#i-check" /></svg>Gift wrapped with care, free of charge</li>' +
      '</ul>' +
      '<div class="accordion">' +
      '<details open><summary>The story</summary><div class="accordion__body"><p>' + p.story + '</p></div></details>' +
      '<details><summary>Materials &amp; care</summary><div class="accordion__body"><p>' + p.materials + '</p><ul><li>' + p.size + '</li><li>' + p.care + '</li></ul></div></details>' +
      '<details><summary>Shipping &amp; returns</summary><div class="accordion__body"><p>Every piece is cast after you order, so please allow 3–5 days before posting. Tracked worldwide shipping is calculated at checkout. If a piece arrives less than perfect, tell us within 30 days and we will make it right.</p></div></details>' +
      '</div></div>';

    var mainImg = $('#gallery-main');
    function setMainImage(im) {
      state.img = im;
      mainImg.src = im.src;
      mainImg.srcset = im.src.replace('.jpg', '-640.jpg') + ' 640w, ' + im.src + ' 1200w';
      mainImg.alt = im.alt;
      $$('.gallery__thumb').forEach(function (t, i) {
        t.setAttribute('aria-current', String(p.images[i] === im));
      });
    }
    mount.addEventListener('click', function (e) {
      var thumb = e.target.closest('[data-thumb]');
      if (thumb) { setMainImage(p.images[Number(thumb.getAttribute('data-thumb'))]); return; }
      var sw = e.target.closest('[data-colour]');
      if (sw) {
        var c = p.colours[Number(sw.getAttribute('data-colour'))];
        state.colour = c.name;
        $('#colour-name').textContent = c.name;
        $$('[data-colour]', mount).forEach(function (b) { b.setAttribute('aria-pressed', String(b === sw)); });
        if (c.image) {
          var match = p.images.find(function (im) { return im.src === c.image; });
          if (match) setMainImage(match);
        }
        return;
      }
      var step = e.target.closest('[data-qty]');
      if (step) {
        state.qty = Math.max(1, state.qty + Number(step.getAttribute('data-qty')));
        $('#pdp-qty').textContent = state.qty;
      }
    });
    $('#pdp-add').addEventListener('click', function () {
      addToCart(p.id, state.colour, state.qty);
    });

    /* "You may also love" — same type first, then the rest */
    var love = $('#love-row');
    if (love) {
      var others = window.MAMS.products.filter(function (o) { return o.id !== p.id; });
      others.sort(function (a, b) { return (b.type === p.type) - (a.type === p.type); });
      love.innerHTML = others.slice(0, 4).map(function (o) {
        return '<article class="p-card">' +
          '<a class="p-card__media" href="product.html?id=' + o.id + '">' +
          '<img src="' + o.images[0].src.replace('.jpg', '-640.jpg') + '" alt="' + o.images[0].alt + '" loading="lazy" width="800" height="1000"></a>' +
          '<div class="p-card__info"><a class="p-card__name" href="product.html?id=' + o.id + '">' + o.name + '</a>' +
          '<span class="p-card__price">From ' + money(o.price) + '</span></div></article>';
      }).join('');
    }

    /* Product schema (JSON-LD) */
    var schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.tagline + ' ' + p.story,
      brand: { '@type': 'Brand', name: 'Mams Glam' },
      material: p.materials,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowOfPrice: p.price,
        highPrice: p.price,
        offerCount: p.colours.length,
        availability: 'https://schema.org/InStock'
      }
    });
    document.head.appendChild(schema);
  }

  /* 09. Cart page + demo checkout
     ========================================================================== */
  function renderCartPage() {
    var lines = $('#cart-lines');
    if (!lines) return;
    var summary = $('#summary-rows');
    var checkoutBtn = $('#checkout-btn');
    var emptyBox = $('#cart-empty');
    var wrap = $('#cart-table');
    if (!cart.length) {
      if (wrap) wrap.hidden = true;
      if (summary) summary.closest('.summary').hidden = true;
      if (checkoutBtn) checkoutBtn.hidden = true;
      if (emptyBox) emptyBox.hidden = false;
      return;
    }
    if (wrap) wrap.hidden = false;
    if (emptyBox) emptyBox.hidden = true;
    if (summary) summary.closest('.summary').hidden = false;
    if (checkoutBtn) checkoutBtn.hidden = false;

    lines.innerHTML = cart.map(function (l, i) {
      var p = window.MAMS.find(l.id);
      if (!p) return '';
      var img = p.images[0].src.replace('.jpg', '-640.jpg');
      return '<div class="cart-line">' +
        '<img class="cart-line__img" src="' + img + '" alt="' + p.images[0].alt + '" width="96" height="120" loading="lazy">' +
        '<div class="cart-line__info">' +
        '<a class="cart-line__name" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
        '<span class="cart-line__variant">' + l.colour + '</span>' +
        '<span class="qty">' +
        '<button type="button" data-step="-1" data-index="' + i + '" aria-label="Decrease quantity of ' + p.name + '">−</button>' +
        '<span data-qty-value>' + l.qty + '</span>' +
        '<button type="button" data-step="1" data-index="' + i + '" aria-label="Increase quantity of ' + p.name + '">+</button>' +
        '</span></div>' +
        '<div class="cart-line__side">' +
        '<span class="cart-line__price">' + money(p.price * l.qty) + '</span>' +
        '<button type="button" class="line-remove" data-remove="' + i + '">Remove</button>' +
        '</div></div>';
    }).join('');

    var sub = cartSubtotal();
    summary.innerHTML =
      '<div class="summary__row"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
      '<div class="summary__row"><span>Shipping</span><span>Calculated at checkout</span></div>' +
      '<div class="summary__row summary__row--total"><span>Total</span><span>' + money(sub) + '</span></div>';
  }

  var checkoutBtn = $('#checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      var conf = $('#confirmation');
      cart = [];
      saveCart();
      if (conf) {
        conf.hidden = false;
        conf.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        var h = $('h2', conf);
        if (h) h.focus();
      }
      var table = $('#cart-table');
      if (table) table.hidden = true;
      var sum = $('.summary');
      if (sum) sum.hidden = true;
      var emptyBox = $('#cart-empty');
      if (emptyBox) emptyBox.hidden = true;
    });
  }

  /* Cart page delegated steps (same handlers as drawer, page-level) */
  var cartPage = $('#cart-lines');
  if (cartPage) {
    cartPage.addEventListener('click', function (e) {
      var step = e.target.closest('[data-step]');
      if (step) {
        var i = Number(step.getAttribute('data-index'));
        setQty(i, cart[i].qty + Number(step.getAttribute('data-step')));
        return;
      }
      var rm = e.target.closest('[data-remove]');
      if (rm) setQty(Number(rm.getAttribute('data-remove')), 0);
    });
  }

  /* 10. Newsletter validation
     ========================================================================== */
  var newsForm = $('#newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#newsletter-email');
      var msg = $('#newsletter-msg');
      var val = (input.value || '').trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      if (!ok) {
        input.classList.add('is-invalid');
        msg.classList.add('is-error');
        msg.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      input.classList.remove('is-invalid');
      msg.classList.remove('is-error');
      msg.textContent = '';
      newsForm.hidden = true;
      var done = $('#newsletter-success');
      if (done) {
        done.hidden = false;
        var focus = $('b', done);
        if (focus) focus.textContent = val;
      }
    });
  }

  /* Contact form validation (contact page)
     ------------------------------------------------------------------------ */
  var contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('#contact-form [required]').forEach(function (field) {
        var msgEl = field.closest('.field').querySelector('.field__msg');
        var valid = field.type === 'email'
          ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())
          : field.value.trim().length > 1;
        field.classList.toggle('is-invalid', !valid);
        if (msgEl) msgEl.textContent = valid ? '' : 'Please ' + (field.type === 'email' ? 'enter a valid email address.' : 'fill in this field.');
        if (!valid) ok = false;
      });
      if (ok) {
        contactForm.hidden = true;
        var done = $('#contact-success');
        if (done) {
          done.hidden = false;
          done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      }
    });
  }

  /* 11. Scroll reveals
     ========================================================================== */
  var revealEls = $$('.reveal');
  var qaMode = /[?&](qa|nosplash)\b/.test(location.search);
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion && !qaMode) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 07b. Shop page — type chips, colour chips, sort
     ========================================================================== */
  var shopGrid = $('#shop-grid');
  if (shopGrid) {
    var FAMILY = {
      Blush: 'Blush', Rose: 'Blush',
      Mint: 'Green', Olive: 'Green',
      Cobalt: 'Blue', Sky: 'Blue', 'Dusty Blue': 'Blue', Periwinkle: 'Blue', Navy: 'Blue',
      Terracotta: 'Warm', Orange: 'Warm', Peach: 'Warm', Tangerine: 'Warm', Caramel: 'Warm',
      Stone: 'Neutral', Sand: 'Neutral', Ivory: 'Neutral', Nude: 'Neutral', 'Floral White': 'Neutral',
      Charcoal: 'Charcoal',
      Plum: 'Plum', Mauve: 'Plum'
    };
    var shopState = { type: 'All', colour: 'All', sort: 'featured' };
    var shopCount = $('#shop-count');

    function applyShop() {
      var list = window.MAMS.products.filter(function (p) {
        if (shopState.type !== 'All' && p.type !== shopState.type) return false;
        if (shopState.colour !== 'All' && !p.colours.some(function (c) {
          return (FAMILY[c.name] || 'Neutral') === shopState.colour;
        })) return false;
        return true;
      });
      if (shopState.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (shopState.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (shopState.sort === 'newest') list.sort(function (a, b) { return (b.badge === 'New') - (a.badge === 'New'); });

      shopGrid.innerHTML = list.length ? list.map(function (p) {
        var hover = p.images[1] || p.images[0];
        return '<article class="p-card">' +
          (p.badge ? '<span class="badge ' + (p.badge === 'Bestseller' ? 'badge--best' : 'badge--new') + ' p-card__badge">' + p.badge + '</span>' : '') +
          '<a class="p-card__media" href="product.html?id=' + p.id + '">' +
          '<img class="is-main" src="' + p.images[0].src.replace('.jpg', '-640.jpg') + '" ' +
          'srcset="' + p.images[0].src.replace('.jpg', '-640.jpg') + ' 640w, ' + p.images[0].src + ' 1200w" ' +
          'sizes="(min-width: 900px) 25vw, 45vw" alt="' + p.images[0].alt + '" loading="lazy" width="800" height="1000">' +
          '<img class="is-hover" src="' + hover.src.replace('.jpg', '-640.jpg') + '" alt="" loading="lazy" width="800" height="1000">' +
          '<button type="button" class="quick-add" data-add="' + p.id + '">Add to bag — ' + money(p.price) + '</button>' +
          '</a>' +
          '<div class="p-card__info">' +
          '<a class="p-card__name" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
          '<div class="p-card__meta">' +
          '<span class="p-card__price">From ' + money(p.price) + '</span>' +
          '<span class="swatches" aria-hidden="true">' +
          p.colours.slice(0, 6).map(function (c) {
            return '<span class="swatch swatch--dot-sm" style="background:' + c.hex + '"></span>';
          }).join('') +
          '</span></div></div></article>';
      }).join('') : '<p class="no-results">Nothing poured in that colour yet — try another filter.</p>';

      if (shopCount) {
        shopCount.textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
      }
    }

    var filters = $('#shop-filters');
    if (filters) {
      filters.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        var kind = chip.getAttribute('data-kind');
        shopState[kind] = chip.getAttribute('data-val');
        $$('.chip[data-kind="' + kind + '"]', filters).forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        applyShop();
      });
    }
    var sortSel = $('#shop-sort');
    if (sortSel) {
      sortSel.addEventListener('change', function () {
        shopState.sort = sortSel.value;
        applyShop();
      });
    }
    applyShop();
  }

  /* Boot
     ========================================================================== */
  if (page === 'product') renderProductPage();
  updateCartUI();
})();
