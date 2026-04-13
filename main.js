  // ── PRELOADER ──
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelector('.preloader-progress').style.width = '100%';
      setTimeout(() => document.body.classList.add('loaded'), 400);
    }, 500);
  });

  // ── HAMBURGER MENU ──
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    if (mobileMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
    });
  }

  // ── MAGNETIC ELEMENTS ──
  const magnets = document.querySelectorAll('.magnetic');
  magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', function(e) {
      const position = magnet.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;
      
      magnet.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      magnet.style.transition = 'all 0s linear';
    });
    magnet.addEventListener('mouseleave', function(e) {
      magnet.style.transition = 'all 0.3s cubic-bezier(0.7, 0, 0.3, 1)';
      magnet.style.transform = `translate(0px, 0px)`;
    });
  });

  // ── CUSTOM CURSOR ──
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if(cursor) {
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if(ring) {
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .project-card, .skill-pill, .service-item, .hamburger').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if(ring && cursor) {
        ring.style.width = '60px';
        ring.style.height = '60px';
        ring.style.borderColor = 'rgba(42,110,245,0.8)';
        cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) scale(0)`;
      }
    });
    el.addEventListener('mouseleave', () => {
      if(ring && cursor) {
        ring.style.width = '38px';
        ring.style.height = '38px';
        ring.style.borderColor = 'rgba(42,110,245,0.5)';
        cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) scale(1)`;
      }
    });
  });

  // ── MOUSE GLOW ON CARDS ──
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  // ── FORM VALIDATION & SUBMISSION ──
  const formSubmit = document.querySelector('.form-submit');
  const formCard = document.querySelector('#contactForm');
  const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
  
  if(formCard && formSubmit) {
    // Add success overlay HTML to the card dynamically
    const overlayHtml = `
      <div class="form-success-overlay">
        <div class="form-success-icon">✓</div>
        <div class="form-success-title">Message Sent</div>
        <div class="form-success-text">Thanks for reaching out! I'll get back to you shortly.</div>
      </div>
    `;
    formCard.insertAdjacentHTML('beforeend', overlayHtml);
    const successOverlay = document.querySelector('.form-success-overlay');

    formCard.addEventListener('submit', async (e) => {
      e.preventDefault(); // Stop standard form submission
      
      formSubmit.classList.add('loading');
      const formData = new FormData(formCard);
      
      try {
        const response = await fetch(formCard.action, {
          method: formCard.method,
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          formSubmit.classList.remove('loading');
          successOverlay.classList.add('active');
          formCard.reset();
          // Hide overlay after 4 seconds
          setTimeout(() => successOverlay.classList.remove('active'), 4000);
        } else {
          formSubmit.classList.remove('loading');
          alert('Oops! There was a problem submitting your form. Please check your data.');
        }
      } catch (error) {
        formSubmit.classList.remove('loading');
        alert('Network error! Please try again later.');
      }
    });

    // Custom shake animation on built-in HTML5 validation fail
    formInputs.forEach(input => {
      input.addEventListener('invalid', () => {
        input.classList.remove('error');
        void input.offsetWidth; // trigger reflow to reset animation
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 400); 
      });
    });
  }

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => el.classList.add('hidden'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.remove('hidden');
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));