/* ============================================
   FARO - Reformas Torredembarra
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile Menu Toggle ----
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isOpen = navMenu.classList.contains('active');
      menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Header Scroll Effect ----
  const header = document.querySelector('.header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.header')?.offsetHeight || 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ---- Scroll Animations (IntersectionObserver) ----
  const animateElements = document.querySelectorAll('.animate');
  if (animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animateElements.forEach(el => observer.observe(el));
  }

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = target * eased;

      el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ---- FAQ Accordion ----
  const faqItems = document.querySelectorAll('.faq-item, .faq-item-local');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherAnswer = other.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current
        item.classList.toggle('active');
        if (!isActive) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = null;
        }
      });
    }
  });

  // ---- Form Handling ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Phone input formatting
    const phoneInput = contactForm.querySelector('input[type="tel"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        // Remove Spain's country code only when followed by a complete national number.
        // Never truncate extra digits: leave invalid numbers intact for validation.
        value = value.replace(/^(?:0034|34)(\d{9})$/, '$1');
        // Format: XXX XXX XXX
        if (value.length > 6) {
          value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
        } else if (value.length > 3) {
          value = value.slice(0, 3) + ' ' + value.slice(3);
        }
        e.target.value = value;
      });
    }

    // Anti-spam: honeypot timing
    const formStartTime = Date.now();
    contactForm.dataset.startTime = formStartTime;

    // Form submission: email through Formspree + mirrored lead in CoreLeads.
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const elapsed = Date.now() - parseInt(contactForm.dataset.startTime);
      if (elapsed < 3000) return;

      const phone = phoneInput ? phoneInput.value.replace(/\s/g, '') : '';
      if (!/^\d{9}$/.test(phone)) {
        phoneInput.focus();
        phoneInput.style.borderColor = '#ef4444';
        const note = phoneInput.closest('.form-group')?.querySelector('.phone-note');
        if (note) note.style.color = '#ef4444';
        setTimeout(() => { phoneInput.style.borderColor = ''; if (note) note.style.color = ''; }, 3000);
        return;
      }

      const button = contactForm.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      let errorEl = contactForm.querySelector('.form-error');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.style.cssText = 'display:none;color:#b91c1c;font-weight:700;margin-top:12px;text-align:center';
        (contactForm.querySelector('.form-fields') || contactForm).appendChild(errorEl);
      }
      errorEl.style.display = 'none';

      const emailData = new FormData(contactForm);
      emailData.set('_subject', `Nuevo presupuesto desde ${location.hostname}`);
      emailData.set('website', location.origin);
      emailData.set('brand', 'FARO Reformas Torredembarra');
      emailData.set('sector', 'Reformas');

      const crmData = new FormData();
      crmData.set('name', emailData.get('nombre') || '');
      crmData.set('phone', String(emailData.get('teléfono') || '').replace(/[^\d+]/g, ''));
      crmData.set('email', emailData.get('email') || '');
      crmData.set('city', emailData.get('localidad') || '');
      crmData.set('service', emailData.get('servicio') || '');
      crmData.set('message', emailData.get('mensaje') || '');
      crmData.set('sector', 'Reformas');
      crmData.set('website', location.origin);
      crmData.set('page_url', location.href);
      crmData.set('brand', 'FARO Reformas Torredembarra');
      crmData.set('consent', 'accepted');
      crmData.set('submission_id', crypto.randomUUID());

      fetch('https://coreleads.es/api/in/f823c51598b8a55e67aba41fe8ab8b1cb366e2403595ca17aa8f4313672b8ccc/lead/web', { method: 'POST', body: crmData, mode: 'no-cors', keepalive: true }).catch(() => null);

      try {
        const response = await fetch('https://formspree.io/f/xyklqlvv', {
          method: 'POST',
          body: emailData,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Email provider rejected submission');
        const formEl = contactForm.querySelector('.form-fields') || contactForm;
        const successEl = contactForm.querySelector('.form-success') || document.querySelector('.form-success');
        if (successEl) { formEl.style.display = 'none'; successEl.style.display = 'block'; }
      } catch {
        errorEl.textContent = 'No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al 623 760 710.';
        errorEl.style.display = 'block';
        if (button) button.disabled = false;
      }
    });
  }

  // ---- Phone Number Click Tracking ----
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'phone_call', {
          event_category: 'contact',
          event_label: link.getAttribute('href')
        });
      }
      console.log('Phone call click:', link.getAttribute('href'));
    });
  });

  // ---- WhatsApp Click Tracking ----
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', {
          event_category: 'contact',
          event_label: 'whatsapp'
        });
      }
    });
  });

  // ---- Lazy Loading Images ----
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ---- Close mobile menu on outside click ----
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }
  });

});
