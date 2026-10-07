/* ============================================
   MASSAGEPRAKTIJK STANDDAARBUITEN
   JavaScript — Interactivity & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Constants ----
  const SCROLL_THRESHOLD = 50;
  const REVEAL_THRESHOLD = 0.15;

  // ---- DOM Elements ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');
  const hero = document.querySelector('.hero');
  const reviewsSlider = document.getElementById('reviewsSlider');
  const reviewPrev = document.getElementById('reviewPrev');
  const reviewNext = document.getElementById('reviewNext');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const allNavLinks = document.querySelectorAll('.nav__link');
  const treatmentModal = document.getElementById('treatmentModal');
  const treatmentModalBackdrop = document.getElementById('treatmentModalBackdrop');
  const treatmentModalClose = document.getElementById('treatmentModalClose');

  // ============================================
  // NAVBAR — Scroll Effect
  // ============================================
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;

    if (scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('nav--scrolled');
    } else {
      navbar.classList.remove('nav--scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ============================================
  // NAVBAR — Active Link Highlight
  // ============================================
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveLink() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        allNavLinks.forEach(link => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveLink, { passive: true });

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  function openMobileNav() {
    navLinks.classList.add('nav__links--open');
    navToggle.classList.add('nav__toggle--active');
    navBackdrop.classList.add('nav__backdrop--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    navLinks.classList.remove('nav__links--open');
    navToggle.classList.remove('nav__toggle--active');
    navBackdrop.classList.remove('nav__backdrop--visible');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('nav__links--open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navBackdrop.addEventListener('click', closeMobileNav);

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // ============================================
  // SMOOTH SCROLL for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const offset = navbar.offsetHeight;
        const targetPosition = targetElement.offsetTop - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // HERO — Loaded animation
  // ============================================
  setTimeout(() => {
    hero.classList.add('loaded');
  }, 100);

  // ============================================
  // SCROLL REVEAL — Intersection Observer
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: REVEAL_THRESHOLD,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // REVIEWS SLIDER
  // ============================================
  if (reviewsSlider && reviewPrev && reviewNext) {
    const scrollAmount = 380;

    reviewNext.addEventListener('click', () => {
      reviewsSlider.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    reviewPrev.addEventListener('click', () => {
      reviewsSlider.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    // Touch/swipe support is handled natively by scroll-snap
  }

  // ============================================
  // CONTACT FORM — Handling
  // ============================================
  // Berichten worden via FormSubmit (formsubmit.co) naar dit adres gemaild.
  const CONTACT_EMAIL = 'info@demassagepraktijk.nl';

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitBtnHtml = submitBtn.innerHTML;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Spam bot filled the hidden honeypot field
      if (data._honey) return;

      const treatmentSelect = document.getElementById('contact-treatment');
      const treatmentLabel = treatmentSelect.value
        ? treatmentSelect.options[treatmentSelect.selectedIndex].text
        : '-';

      submitBtn.disabled = true;
      submitBtn.textContent = 'Bezig met versturen...';

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `Nieuw bericht via de website van ${data.name}`,
            _replyto: data.email,
            _template: 'table',
            Naam: data.name,
            Telefoon: data.phone || '-',
            'E-mail': data.email,
            Behandeling: treatmentLabel,
            Bericht: data.message || '-'
          })
        });
        const result = await response.json();
        if (!response.ok || String(result.success) !== 'true') {
          throw new Error(result.message || 'Versturen mislukt');
        }

        // Show success state
        contactForm.style.display = 'none';
        formSuccess.classList.add('active');

        // Reset after 5 seconds
        setTimeout(() => {
          contactForm.reset();
          contactForm.style.display = '';
          formSuccess.classList.remove('active');
        }, 5000);
      } catch (err) {
        console.error('Form submission failed:', err);
        alert(`Het versturen is helaas niet gelukt. Probeer het later opnieuw, of mail direct naar ${CONTACT_EMAIL} of bel 06-54736350.`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtnHtml;
      }
    });
  }

  // ============================================
  // BOOKING LINK — Salonsoft online agenda
  // ============================================
  // Plak hier de boekingslink uit Salonsoft. Zolang deze leeg is,
  // blijven de "Afspraak Maken"-knoppen naar het contactformulier gaan.
  const BOOKING_URL = 'https://demassagepraktijkstanddaarbuiten.boekingapp.nl';

  if (BOOKING_URL) {
    document.querySelectorAll('[data-booking]').forEach((link) => {
      link.href = BOOKING_URL;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  // ============================================
  // GALLERY LIGHTBOX
  // ============================================
  const galleryItems = document.querySelectorAll('.gallery__item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Close lightbox with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMobileNav();
      closeTreatmentModal();
    }
  });

  // ============================================
  // TREATMENT DETAIL MODAL
  // ============================================
  const treatmentDetails = {
    'sportmassage': {
      title: '(Sport)massage',
      price: 'Vanaf € 55',
      duration: '45 – 75 min',
      image: 'pb082732-high.webp',
      desc: 'Een krachtige massage gericht op het verlichten van spierspanning, het verbeteren van de doorbloeding en het versnellen van herstel. Ideaal bij sportblessures of chronische spanning.',
      benefits: [
        'Vermindert spierspanning en stijfheid',
        'Verbetert de doorbloeding',
        'Versnelt herstel na inspanning',
        'Verkleint de kans op blessures'
      ],
      for: [
        'Sporters, voor of na inspanning',
        'Mensen met chronische spanning in nek, rug of schouders',
        'Iedereen die regelmatig fysiek actief is'
      ]
    },
    'magnesium': {
      title: 'Magnesium Experience',
      price: '€ 105',
      duration: 'Complete sessie',
      image: 'pb082876-high.webp',
      desc: 'Een unieke totaalervaring: magnesium voetbad, gevolgd door een ontspannende massage met magnesiumolie. Vult uw mineraalbalans aan en brengt diepe ontspanning.',
      benefits: [
        'Vult een magnesiumtekort aan',
        'Ontspant spieren diepgaand',
        'Kalmeert het zenuwstelsel',
        'Bevordert een betere nachtrust'
      ],
      for: [
        'Mensen met stress of een onrustig hoofd',
        'Wie last heeft van slaapproblemen of spierkrampen',
        'Iedereen die een complete verwenervaring zoekt'
      ]
    },
    'hotstone': {
      title: 'Hotstone Massage',
      price: '€ 60',
      duration: 'Sessie',
      image: 'pb082775-high.webp',
      desc: 'Warme basaltstenen worden strategisch op het lichaam geplaatst en gebruikt bij het masseren. De diepe warmte ontspant de spieren en bevordert de bloedcirculatie.',
      benefits: [
        'Diepe spierontspanning door warmte',
        'Verbetert de bloedcirculatie',
        'Vermindert stress en spanning',
        'Warmte dringt dieper door dan met de handen alleen'
      ],
      for: [
        'Mensen met hardnekkig gespannen spieren',
        'Wie snel het koud heeft',
        'Wie houdt van diepe, warme ontspanning'
      ]
    },
    'hoofd-gezicht': {
      title: 'Hoofd- & Gezichtsmassage',
      price: 'Vanaf € 38',
      duration: 'Los of combi',
      image: 'pb082681-high-ja1ib4.webp',
      desc: 'Een heerlijk ontspannende massage van hoofd, gezicht en nek. Verlicht hoofdpijn, vermindert stress en geeft een diep gevoel van rust en verlichting.',
      benefits: [
        'Verlicht hoofdpijn en spanningsklachten',
        'Ontspant kaak-, nek- en schouderspanning',
        'Verbetert de doorbloeding van de gezichtshuid',
        'Geeft een diep gevoel van rust'
      ],
      for: [
        'Mensen met hoofdpijn of migraineklachten',
        'Veel beeldschermwerk of een drukke geest',
        'Los te boeken of te combineren met een lichaamsmassage'
      ]
    },
    'cupping': {
      title: 'Cupping',
      price: 'Op aanvraag',
      duration: 'Aanvullend',
      image: 'sport-massages-16-high.webp',
      desc: 'Met behulp van vacuüm cups wordt de doorbloeding gestimuleerd en spanning losgemaakt. Effectief bij spierpijn, stijfheid en het bevorderen van herstel.',
      benefits: [
        'Stimuleert de doorbloeding',
        'Maakt vastzittend bindweefsel los',
        'Versnelt herstel van de spieren',
        'Vermindert spierpijn en stijfheid'
      ],
      for: [
        'Hardnekkige spierknopen',
        'Sporters die extra herstel zoeken',
        'Als aanvulling op een massage'
      ]
    },
    'pakking': {
      title: 'Pakking (Infrarood)',
      price: 'Vanaf € 55',
      duration: 'Sessie',
      image: 'pb082821-high.webp',
      desc: 'Een weldadige infrarooddeken-behandeling die het lichaam van binnenuit verwarmt. Ontgiftend, ontspannend en ideaal in combinatie met een massage.',
      benefits: [
        'Verwarmt het lichaam van binnenuit',
        'Werkt ontgiftend',
        'Ontspant spieren, ideaal ter voorbereiding op een massage',
        'Bevordert de doorbloeding'
      ],
      for: [
        'Wie snel het koud heeft',
        'Mensen met spierstijfheid',
        'Uitstekend te combineren met een massage'
      ]
    }
  };

  const treatmentModalImg = document.getElementById('treatmentModalImg');
  const treatmentModalTitle = document.getElementById('treatmentModalTitle');
  const treatmentModalPrice = document.getElementById('treatmentModalPrice');
  const treatmentModalDuration = document.getElementById('treatmentModalDuration');
  const treatmentModalDesc = document.getElementById('treatmentModalDesc');
  const treatmentModalBenefits = document.getElementById('treatmentModalBenefits');
  const treatmentModalFor = document.getElementById('treatmentModalFor');

  function fillList(listEl, items) {
    listEl.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      listEl.appendChild(li);
    });
  }

  function openTreatmentModal(key) {
    const data = treatmentDetails[key];
    if (!data || !treatmentModal) return;

    treatmentModalImg.src = data.image;
    treatmentModalImg.alt = data.title;
    treatmentModalTitle.textContent = data.title;
    treatmentModalPrice.textContent = data.price;
    treatmentModalDuration.textContent = data.duration;
    treatmentModalDesc.textContent = data.desc;
    fillList(treatmentModalBenefits, data.benefits);
    fillList(treatmentModalFor, data.for);

    treatmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeTreatmentModal() {
    if (!treatmentModal) return;
    treatmentModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.treatment-card').forEach(card => {
    card.addEventListener('click', () => {
      openTreatmentModal(card.dataset.treatment);
    });
  });

  if (treatmentModalClose) {
    treatmentModalClose.addEventListener('click', closeTreatmentModal);
  }

  if (treatmentModalBackdrop) {
    treatmentModalBackdrop.addEventListener('click', closeTreatmentModal);
  }

  // Close the "Afspraak Maken" CTA inside the modal along with the modal itself
  const treatmentModalCta = document.getElementById('treatmentModalCta');
  if (treatmentModalCta) {
    treatmentModalCta.addEventListener('click', closeTreatmentModal);
  }

  // ============================================
  // PARALLAX — Subtle hero background movement
  // ============================================
  const heroImage = document.querySelector('.hero__bg img');

  function handleParallax() {
    if (window.innerWidth > 768 && heroImage) {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;

      if (scrollY < heroHeight) {
        const parallaxOffset = scrollY * 0.3;
        heroImage.style.transform = `scale(1.05) translateY(${parallaxOffset}px)`;
      }
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // ============================================
  // COUNTER ANIMATION — Animate stats on reveal
  // ============================================
  const statNumbers = document.querySelectorAll('.about__stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.about__stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function animateStats() {
    statNumbers.forEach(stat => {
      const text = stat.textContent;
      const numMatch = text.match(/\d+/);

      if (numMatch) {
        const target = parseInt(numMatch[0]);
        const suffix = text.replace(/\d+/, '');
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = Math.round(current) + suffix;
        }, 40);
      }
    });
  }

  // ============================================
  // PRICING ROWS — Hover ripple effect
  // ============================================
  document.querySelectorAll('.pricing__row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.transition = 'background-color 0.3s ease, padding-left 0.3s ease';
      row.style.paddingLeft = '2.2rem';
    });

    row.addEventListener('mouseleave', () => {
      row.style.paddingLeft = '';
    });
  });

  // ============================================
  // PERFORMANCE — Debounce scroll handlers
  // ============================================
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleNavScroll();
        highlightActiveLink();
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Replace individual scroll listeners with unified handler
  window.removeEventListener('scroll', handleNavScroll);
  window.removeEventListener('scroll', highlightActiveLink);
  window.removeEventListener('scroll', handleParallax);
  window.addEventListener('scroll', onScroll, { passive: true });

});
