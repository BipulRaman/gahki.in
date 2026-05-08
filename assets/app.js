/* =========================================================
   Gahki marketing site — interactivity
   - Reveal-on-scroll
   - Animated counters
   - Slug typer
   - Interactive bill demo
   - Waitlist form (client-side)
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Reveal-on-scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const formatNum = (n) => Math.round(n).toLocaleString('en-IN');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (target === 0) {
      el.textContent = '0';
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNum(target * eased);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Slug typer ---------- */
  const slugEl = document.getElementById('slugTyper');
  if (slugEl) {
    const slugs = ['krishna-mart', 'sunrise-stores', 'anna-bakery', 'janta-medical', 'city-stationery'];
    let slugIdx = 0;
    let charIdx = slugs[0].length;
    let phase = 'pause-show'; // pause-show, deleting, typing
    let lastTick = 0;
    let nextDelay = 1800;

    const step = (now) => {
      if (now - lastTick < nextDelay) {
        requestAnimationFrame(step);
        return;
      }
      lastTick = now;
      const current = slugs[slugIdx];
      if (phase === 'pause-show') {
        phase = 'deleting';
        nextDelay = 50;
      } else if (phase === 'deleting') {
        charIdx = Math.max(0, charIdx - 1);
        slugEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          slugIdx = (slugIdx + 1) % slugs.length;
          phase = 'typing';
          nextDelay = 200;
        } else {
          nextDelay = 35;
        }
      } else if (phase === 'typing') {
        const next = slugs[slugIdx];
        charIdx = Math.min(next.length, charIdx + 1);
        slugEl.textContent = next.slice(0, charIdx);
        if (charIdx === next.length) {
          phase = 'pause-show';
          nextDelay = 2200;
        } else {
          nextDelay = 70;
        }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Interactive bill demo (realistic NewBill replica) ---------- */
  const demo2Rows = document.getElementById('demo2Rows');
  const demo2Count = document.getElementById('demo2Count');
  const demo2Subtotal = document.getElementById('demo2Subtotal');
  const demo2Tax = document.getElementById('demo2Tax');
  const demo2Savings = document.getElementById('demo2Savings');
  const demo2Total = document.getElementById('demo2Total');
  const demo2Btn = document.getElementById('demo2Btn');
  const demo2Reset = document.getElementById('demo2Reset');
  const demo2Buttons = document.querySelectorAll('.demo2__product');

  /** Cart: name -> { name, price, mrp, emoji, qty, tax } */
  const cart2 = new Map();

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

  const fmtINR = (n) => Math.round(n).toLocaleString('en-IN');
  const fmtINR2 = (n) => (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderDemo2 = () => {
    if (!demo2Rows) return;
    if (cart2.size === 0) {
      demo2Rows.innerHTML = '<div class="demo2__bill__empty">Tap a product to start a bill</div>';
      if (demo2Count) demo2Count.textContent = '0';
      if (demo2Subtotal) demo2Subtotal.textContent = '0';
      if (demo2Tax) demo2Tax.textContent = '0';
      if (demo2Savings) demo2Savings.textContent = '0';
      if (demo2Total) demo2Total.textContent = '0';
      if (demo2Btn) demo2Btn.disabled = true;
      return;
    }

    let total = 0;
    let count = 0;
    let savings = 0;
    let taxIncluded = 0; // tax inside SP
    const html = [];
    cart2.forEach((item, key) => {
      const lineTotal = item.price * item.qty;
      const lineSavings = (item.mrp - item.price) * item.qty;
      // Tax-inclusive: tax = sp * (taxPct / (100 + taxPct))
      const lineTax = lineTotal * (item.tax / (100 + item.tax));
      total += lineTotal;
      count += item.qty;
      savings += lineSavings;
      taxIncluded += lineTax;

      html.push(
        '<div class="demo2__bill__item">' +
          '<div class="demo2__bill__item__name">' + escapeHtml(item.name) + '</div>' +
          '<div class="demo2__bill__item__amt">₹' + fmtINR(lineTotal) + '</div>' +
          '<div class="demo2__bill__item__meta">' + item.qty + ' × ₹' + item.price +
            (item.tax ? ' · Tax ' + item.tax + '%' : '') +
            (item.mrp > item.price ? ' · MRP ₹' + item.mrp : '') +
          '</div>' +
          '<div class="demo2__bill__item__qty">' +
            '<button data-act="dec" data-key="' + escapeHtml(key) + '" aria-label="Decrease">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button data-act="inc" data-key="' + escapeHtml(key) + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>'
      );
    });

    demo2Rows.innerHTML = html.join('');
    if (demo2Count) demo2Count.textContent = String(count);
    if (demo2Subtotal) demo2Subtotal.textContent = fmtINR(total);
    if (demo2Tax) demo2Tax.textContent = fmtINR2(taxIncluded);
    if (demo2Savings) demo2Savings.textContent = fmtINR(savings);
    if (demo2Total) demo2Total.textContent = fmtINR(total);
    if (demo2Btn) demo2Btn.disabled = false;
  };

  demo2Buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || '';
      const price = parseInt(btn.dataset.price || '0', 10);
      const mrp = parseInt(btn.dataset.mrp || btn.dataset.price || '0', 10);
      const tax = parseInt(btn.dataset.tax || '0', 10);
      if (!name || !price) return;
      const existing = cart2.get(name);
      if (existing) existing.qty += 1;
      else cart2.set(name, { name, price, mrp, tax, qty: 1 });
      renderDemo2();
      btn.animate(
        [{ transform: 'translateY(-2px) scale(1)' }, { transform: 'translateY(-2px) scale(0.97)' }, { transform: 'translateY(-2px) scale(1)' }],
        { duration: 200, easing: 'ease-out' }
      );
    });
  });

  // Delegated qty buttons
  if (demo2Rows) {
    demo2Rows.addEventListener('click', (e) => {
      const target = e.target.closest('button[data-act]');
      if (!target) return;
      const key = target.dataset.key;
      const act = target.dataset.act;
      const item = cart2.get(key);
      if (!item) return;
      if (act === 'inc') item.qty += 1;
      if (act === 'dec') {
        item.qty -= 1;
        if (item.qty <= 0) cart2.delete(key);
      }
      renderDemo2();
    });
  }

  if (demo2Reset) {
    demo2Reset.addEventListener('click', () => {
      cart2.clear();
      renderDemo2();
    });
  }
  if (demo2Btn) {
    demo2Btn.addEventListener('click', () => {
      if (demo2Btn.disabled) return;
      const original = demo2Btn.innerHTML;
      demo2Btn.style.background = 'var(--app-success)';
      demo2Btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19l11-11-1.4-1.4z"/></svg> PDF downloaded';
      setTimeout(() => {
        demo2Btn.style.background = '';
        demo2Btn.innerHTML = original;
      }, 1800);
    });
  }

  /* ---------- Screens gallery (tabbed showcase) ---------- */
  const screensRoot = document.querySelector('[data-screens]');
  if (screensRoot) {
    const tabs = screensRoot.querySelectorAll('.screens__item');
    const allPanels = screensRoot.querySelectorAll('.screens__panel, .screens__panel--phone');
    const activate = (key) => {
      tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.screen === key));
      allPanels.forEach((p) => p.classList.toggle('is-active', p.dataset.screenPanel === key));
    };
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab.dataset.screen));
    });

    // Auto-rotate slowly to invite interaction; pause on first user click
    let userClicked = false;
    tabs.forEach((tab) => tab.addEventListener('click', () => { userClicked = true; }));
    const order = ['bills', 'stats', 'expiry', 'orders', 'store', 'tracking'];
    let idx = 0;
    setInterval(() => {
      if (userClicked) return;
      idx = (idx + 1) % order.length;
      activate(order[idx]);
    }, 4500);
  }

  /* ---------- Footer year ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- Subtle parallax for hero composition ---------- */
  const heroLaptop = document.querySelector('.hero-stage__laptop');
  const heroPhone = document.querySelector('.hero-stage__phone');
  const heroVisual = document.querySelector('.hero__visual');
  if (heroLaptop && heroVisual && window.matchMedia('(min-width: 980px)').matches) {
    let raf = 0;
    const onMove = (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        heroLaptop.style.transform =
          'perspective(1200px) rotateY(' + (dx * 5) + 'deg) rotateX(' + (-dy * 4) + 'deg)';
        if (heroPhone) {
          heroPhone.style.transform =
            'scale(0.78) translate3d(' + (dx * 12) + 'px,' + (dy * 12) + 'px, 0)';
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      heroLaptop.style.transform = '';
      if (heroPhone) heroPhone.style.transform = '';
    };
    heroVisual.addEventListener('mousemove', onMove);
    heroVisual.addEventListener('mouseleave', onLeave);
  }
})();
