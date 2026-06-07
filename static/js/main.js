/* ── Sticky header ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile nav ── */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  nav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Auto-tag cards: data-categoria + data-producto ── */
const productoMap = {
  'Cilindros de Metal — Tapa Grande Abierta':    'cilindros-metal-tapa-grande',
  'Cilindros de Metal — Tapa Pequeña Cerrada':   'cilindros-metal-tapa-pequena',
  'Cilindros de Metal — Abierto para Residuos':  'cilindros-metal-residuos',
  'Cilindros de Plástico — Tapa y Seguro Grande': 'cilindros-plastico-seguro-grande',
  'Cilindros de Plástico — Tapa Pequeña':   'cilindros-plastico-tapa-pequena',
  'Cilindros de Plástico — Abierto con Seguro':  'cilindros-plastico-abierto',
  'Bidones Aceituneros por Capacidad':                 'bidones-aceituneros',
  'Tanque IBC — Modelo SX (275 galones)':        'tanque-ibc-sx',
  'Tanque IBC — Modelo MX (275 galones)':        'tanque-ibc-mx',
  'Tanque IBC — Modelo LX (275 galones)':        'tanque-ibc-lx',
  'Tapón Superior de Tanque IBC 1000 L':          'tapon-superior-1000',
  'Tapón de Válvula IBC — Rosca Gruesa':   'tapon-valvula-gruesa',
  'Tapón de Válvula IBC — Rosca Fina':     'tapon-valvula-fina',
  'Tapón de Válvula IBC — Rosca Fina Chata': 'tapon-valvula-fina-chata',
  'Cilindros de Cartón por Capacidad':             'cilindros-carton',
  'Galoneras':                                         'galoneras',
  'Latones':                                           'latones',
};

document.querySelectorAll('.product-card').forEach(card => {
  const badge = card.querySelector('.product-card__badge');
  const h3    = card.querySelector('h3');
  const btn   = card.querySelector('.cotizar-btn');
  if (badge && h3) {
    const title = h3.textContent.trim();
    card.dataset.categoria = (title === 'Latones') ? 'Metal-laton' : badge.textContent.trim();
  }
  if (h3 && btn) btn.dataset.producto = productoMap[h3.textContent.trim()] || '';
});

/* ── Pre-seleccionar producto al hacer clic en Cotizar ── */
document.querySelectorAll('.cotizar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const producto = btn.dataset.producto;
    if (!producto) return;
    const select = document.getElementById('producto');
    if (select) {
      select.value = producto;
      select.dispatchEvent(new Event('change'));
    }
  });
});

/* ── Hook guide button: focus email + scroll to form ── */
const hookGuideBtn = document.getElementById('hookGuideBtn');
if (hookGuideBtn) {
  hookGuideBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('email');
    const formSection = document.getElementById('comprar');
    if (!emailInput || !formSection) return;
    const offset = header.offsetHeight + 16;
    window.scrollTo({ top: formSection.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    setTimeout(() => emailInput.focus(), 600);
  });
}

/* ── Filtro de categorías en catálogo ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const cat = card.dataset.categoria || '';
      card.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
    });
    const gridChildren = [...document.querySelector('.products__grid').children];
    gridChildren.forEach((el, i) => {
      if (!el.classList.contains('products__cat-heading')) return;
      let hasVisible = false;
      for (let j = i + 1; j < gridChildren.length; j++) {
        if (gridChildren[j].classList.contains('products__cat-heading')) break;
        if (gridChildren[j].style.display !== 'none') { hasVisible = true; break; }
      }
      el.style.display = hasVisible ? '' : 'none';
    });
  });
});

/* ── Active nav on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'nav__link--active',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

/* ── Netlify Forms — envío AJAX para mostrar mensaje inline ── */
const form    = document.getElementById('quoteForm');
const success = document.getElementById('formSuccess');

if (form) {
  /* Validación inline onblur */
  const validators = {
    nombre:   v => v.trim().length >= 2                            || 'Ingresa tu nombre completo',
    empresa:  v => v.trim().length >= 2                            || 'Ingresa el nombre de tu empresa',
    telefono: v => /^[0-9\s\+\-]{7,15}$/.test(v.trim())          || 'Ingresa un teléfono válido (ej. 994 229 729)',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())   || 'Ingresa un correo electrónico válido',
    producto: v => v !== ''                                        || 'Selecciona el producto de interés',
  };

  Object.keys(validators).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const validate = () => {
      const result = validators[fieldId](input.value);
      let errorEl = input.parentElement.querySelector('.field-error');
      if (result !== true) {
        input.style.borderColor = '#c1121f';
        if (!errorEl) {
          errorEl = document.createElement('span');
          errorEl.className = 'field-error';
          input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = result;
      } else {
        input.style.borderColor = '#2a9d4e';
        if (errorEl) errorEl.remove();
      }
    };
    input.addEventListener('blur', validate);
    input.addEventListener('input', () => {
      if (input.style.borderColor === 'rgb(193, 18, 31)') validate();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const required = [...form.querySelectorAll('[required]')];
    required.forEach(f => f.style.borderColor = '');
    const invalid = required.filter(f => !f.value.trim());
    if (invalid.length) {
      invalid.forEach(f => f.style.borderColor = '#c1121f');
      invalid[0].focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
      style="animation:spin .8s linear infinite;fill:currentColor">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
    </svg> Enviando…`;

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
    } catch (_) { /* continúa aunque falle el fetch — Netlify igual lo procesa */ }

    form.hidden = true;
    success.hidden = false;
  });
}

/* ── Smooth scroll con offset del header ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});
