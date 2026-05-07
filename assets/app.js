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

  /* ---------- Interactive bill demo ---------- */
  const demoRows = document.getElementById('demoRows');
  const demoCount = document.getElementById('demoCount');
  const demoTotal = document.getElementById('demoTotal');
  const demoReset = document.getElementById('demoReset');
  const demoButtons = document.querySelectorAll('.demo__product');

  /** @type {Map<string, {name:string, price:number, qty:number}>} */
  const cart = new Map();

  const renderBill = () => {
    if (!demoRows) return;
    if (cart.size === 0) {
      demoRows.innerHTML = '<div class="demo__bill__empty">Click a product to add it →</div>';
      if (demoCount) demoCount.textContent = '0';
      if (demoTotal) demoTotal.textContent = '0';
      return;
    }
    let total = 0;
    let count = 0;
    const html = [];
    cart.forEach((item) => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;
      count += item.qty;
      html.push(
        '<div class="demo__bill__row">' +
          '<span class="demo__bill__row__name">' + escapeHtml(item.name) + '</span>' +
          '<span class="demo__bill__row__qty">×' + item.qty + '</span>' +
          '<span class="demo__bill__row__amt">₹' + lineTotal + '</span>' +
        '</div>'
      );
    });
    demoRows.innerHTML = html.join('');
    if (demoCount) demoCount.textContent = String(count);
    if (demoTotal) demoTotal.textContent = total.toLocaleString('en-IN');
  };

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

  demoButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || '';
      const price = parseInt(btn.dataset.price || '0', 10);
      if (!name || !price) return;
      const key = name;
      const existing = cart.get(key);
      if (existing) existing.qty += 1;
      else cart.set(key, { name, price, qty: 1 });
      renderBill();
      // tiny tactile feedback
      btn.animate(
        [
          { transform: 'translateY(-3px) scale(1)' },
          { transform: 'translateY(-3px) scale(0.96)' },
          { transform: 'translateY(-3px) scale(1)' },
        ],
        { duration: 220, easing: 'ease-out' }
      );
    });
  });

  if (demoReset) {
    demoReset.addEventListener('click', () => {
      cart.clear();
      renderBill();
    });
  }

  /* ---------- Waitlist form (client-side) ---------- */
  const form = document.getElementById('waitlistForm');
  const note = document.getElementById('waitlistNote');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        note.textContent = 'Please enter a valid email.';
        note.style.color = '#ff6b8b';
        return;
      }
      note.textContent = "You're on the list. We'll be in touch within a day.";
      note.style.color = '#7cf5c8';
      form.reset();
      // Persist locally so the user sees confirmation on revisit
      try {
        localStorage.setItem('gahki:waitlist', email);
      } catch (_) { /* ignore */ }
    });
  }

  /* ---------- Footer year ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- Subtle parallax for hero phone ---------- */
  const phone = document.querySelector('.phone');
  const heroVisual = document.querySelector('.hero__visual');
  if (phone && heroVisual && window.matchMedia('(min-width: 980px)').matches) {
    let raf = 0;
    const onMove = (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        phone.style.transform =
          'rotateY(' + (dx * 8) + 'deg) rotateX(' + (-dy * 6) + 'deg)';
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      phone.style.transform = '';
    };
    heroVisual.addEventListener('mousemove', onMove);
    heroVisual.addEventListener('mouseleave', onLeave);
  }
})();
