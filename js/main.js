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
        if (value.length > 9) value = value.slice(0, 9);
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

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Anti-spam: check if form was filled too quickly (< 3 seconds = bot)
      const elapsed = Date.now() - parseInt(contactForm.dataset.startTime);
      if (elapsed < 3000) {
        console.warn('Form submitted too quickly');
        return;
      }

      // Validate phone (Spanish format)
      const phone = phoneInput ? phoneInput.value.replace(/\s/g, '') : '';
      if (phone.length < 9) {
        phoneInput.focus();
        phoneInput.style.borderColor = '#ef4444';
        const note = phoneInput.closest('.form-group')?.querySelector('.phone-note');
        if (note) note.style.color = '#ef4444';
        setTimeout(() => {
          phoneInput.style.borderColor = '';
          if (note) note.style.color = '';
        }, 3000);
        return;
      }

      // Show success message
      const formEl = contactForm.querySelector('.form-fields') || contactForm;
      const successEl = contactForm.querySelector('.form-success') || document.querySelector('.form-success');

      if (successEl) {
        formEl.style.display = 'none';
        successEl.style.display = 'block';
      }

      // Collect form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      console.log('Form submission:', data);

      // TODO: Replace with actual form submission endpoint
      // fetch('/api/contact', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} })
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
