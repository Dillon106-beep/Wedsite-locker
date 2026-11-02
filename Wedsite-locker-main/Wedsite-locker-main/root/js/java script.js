document.addEventListener("DOMContentLoaded", function () {

  /* 1. HAMBURGER MENU */
  (function initMenu() {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.getElementById("mobileNav");
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 800) {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  })();

  /* 2. LIGHTBOX (only runs if the lightbox HTML exists on page) */
  (function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");

    if (!lightbox) return;

    const menuImages = Array.from(document.querySelectorAll(".menu-card img"));
    if (menuImages.length === 0) return;

    let currentIndex = 0;

    function getCaption(img) {
      const card = img.closest(".menu-card");
      const nameEl = card?.querySelector(".menu-card-info span");
      const priceEl = card?.querySelector(".menu-card-info span.price");
      if (nameEl && priceEl) return `${nameEl.textContent} — ${priceEl.textContent}`;
      return nameEl ? nameEl.textContent : img.alt || "";
    }

    function openLightbox(index) {
      currentIndex = index;
      const img = menuImages[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "Menu item";
      lightboxCaption.textContent = getCaption(img);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lightboxImg.src = "";
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + menuImages.length) % menuImages.length;
      openLightbox(currentIndex);
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % menuImages.length;
      openLightbox(currentIndex);
    }

    menuImages.forEach(function (img, i) {
      img.style.cursor = "zoom-in";
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "View " + (img.alt || "image"));

      img.addEventListener("click", function () { openLightbox(i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });
  })();

  /* SHOPPING CART (only runs if cart HTML exists on page */
  (function initCart() {
    const STORAGE_KEY = "dillons_cart_v1";

    const cartToggle = document.getElementById("cartToggle");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartClose = document.getElementById("cartClose");
    const cartBackdrop = document.getElementById("cartBackdrop");
    const cartItemsEl = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const cartCountEl = document.getElementById("cartCount");
    const cartClearBtn = document.getElementById("cartClear");

    if (!cartToggle || !cartDrawer) return;

    let cart = [];

    function loadCart() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        cart = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(cart)) cart = [];
      } catch (e) { cart = []; }
    }

    function saveCart() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    function formatRand(n) { return "R" + Number(n).toFixed(2); }

    function parsePrice(text) {
      if (!text) return 0;
      const match = String(text).replace(",", ".").match(/\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    }

    function getTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
    function getCount() { return cart.reduce((s, i) => s + i.qty, 0); }

    function renderCart() {
      cartItemsEl.innerHTML = "";

      if (cart.length === 0) {
        cartItemsEl.innerHTML =
          '<p class="cart-empty">Your cart is empty. Add something delicious!</p>';
      } else {
        cart.forEach(function (item) {
          const row = document.createElement("div");
          row.className = "cart-item";
          row.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
              <span class="cart-item-name">${item.name}</span>
              <span class="cart-item-price">${formatRand(item.price)}</span>
              <div class="cart-qty">
                <button type="button" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button type="button" class="cart-remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">&times;</button>
          `;
          cartItemsEl.appendChild(row);
        });
      }

      cartTotalEl.textContent = formatRand(getTotal());
      const count = getCount();
      cartCountEl.textContent = count;
      cartCountEl.classList.toggle("hidden", count === 0);
      saveCart();
    }

    function addToCart(item) {
      const existing = cart.find(c => c.id === item.id);
      if (existing) existing.qty += 1;
      else cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
      renderCart();
      showToast(`${item.name} added to cart`);
    }

    function changeQty(id, delta) {
      const item = cart.find(c => c.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
      renderCart();
    }

    function removeItem(id) {
      cart = cart.filter(c => c.id !== id);
      renderCart();
    }

    function clearCart() {
      if (cart.length === 0) return;
      if (!confirm("Clear all items from your cart?")) return;
      cart = [];
      renderCart();
    }

    function openDrawer() {
      cartDrawer.classList.add("open");
      cartDrawer.setAttribute("aria-hidden", "false");
      cartToggle.setAttribute("aria-expanded", "true");
      cartBackdrop.hidden = false;
      requestAnimationFrame(() => cartBackdrop.classList.add("show"));
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      cartDrawer.classList.remove("open");
      cartDrawer.setAttribute("aria-hidden", "true");
      cartToggle.setAttribute("aria-expanded", "false");
      cartBackdrop.classList.remove("show");
      setTimeout(() => { cartBackdrop.hidden = true; }, 250);
      document.body.style.overflow = "";
    }

    let toastEl = null, toastTimer = null;
    function showToast(msg) {
      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.className = "cart-toast";
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
    }

    function wireAddButtons() {
      document.querySelectorAll(".menu-card").forEach(function (card, index) {
        const btn = card.querySelector("button");
        if (!btn || btn.dataset.wired === "1") return;
        btn.dataset.wired = "1";

        const imgEl = card.querySelector("img");
        const nameEl = card.querySelector(".menu-card-info span:first-child");
        const priceEl = card.querySelector(".menu-card-info span.price");

        const name = nameEl ? nameEl.textContent.trim() : "Item";
        const price = priceEl ? parsePrice(priceEl.textContent) : 0;
        const img = imgEl ? imgEl.getAttribute("src") : "";
        const id = card.dataset.id ||
          "item-" + index + "-" +
          name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        btn.addEventListener("click", function () {
          addToCart({ id, name, price, img });
          const original = btn.textContent;
          btn.textContent = "Added ✓";
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
          }, 900);
        });
      });
    }

    cartItemsEl.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === "inc") changeQty(id, 1);
      else if (action === "dec") changeQty(id, -1);
      else if (action === "remove") removeItem(id);
    });

    cartToggle.addEventListener("click", function () {
      if (cartDrawer.classList.contains("open")) closeDrawer();
      else openDrawer();
    });
    cartClose.addEventListener("click", closeDrawer);
    cartBackdrop.addEventListener("click", closeDrawer);
    cartClearBtn.addEventListener("click", clearCart);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && cartDrawer.classList.contains("open")) closeDrawer();
    });

    function prefillEnquiry() {
      if (!/enquiry\.html$/i.test(window.location.pathname)) return;
      const details = document.getElementById("orderDetails");
      if (!details || cart.length === 0) return;
      if (details.value && details.value.trim() !== "") return;

      const lines = cart.map(i => `${i.qty}x ${i.name} (${formatRand(i.price)} each)`);
      details.value = lines.join("\n") + "\n\nEstimated total: " + formatRand(getTotal());
    }

    loadCart();
    renderCart();
    wireAddButtons();
    prefillEnquiry();

    window.DillonsCart = {
      add: addToCart,
      remove: removeItem,
      clear: clearCart,
      get items() { return cart.slice(); },
      open: openDrawer,
      close: closeDrawer,
    };
  })();

});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);