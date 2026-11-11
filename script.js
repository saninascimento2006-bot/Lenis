/**
 * IKHÔR — Mitologia Grega Fantástica
 * Core Application Script
 * Smooth Scroll powered by Lenis + GSAP ScrollTrigger + Web Audio Atmosphere
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 01. LENIS SMOOTH SCROLL & GSAP INTEGRATION
  // ---------------------------------------------------------------------------
  let lenis = null;
  let isLenisPaused = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initLenis() {
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
      try {
        lenis = new Lenis({
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential out
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.05,
          touchMultiplier: 1.6,
          infinite: false,
        });

        // Integrate with GSAP ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
          lenis.on('scroll', ScrollTrigger.update);

          gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });

          gsap.ticker.lagSmoothing(0);
        } else {
          // Standard RAF loop fallback
          function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        }

        console.log('⚡ Lenis Smooth Scroll initialized successfully.');
      } catch (err) {
        console.warn('Lenis initialization failed, using native scrolling:', err);
      }
    } else {
      console.log('⚡ Reduced motion preferred or Lenis not loaded, native scrolling active.');
      const motionBtn = document.getElementById('motion-toggle-btn');
      if (motionBtn) {
        motionBtn.style.display = 'none';
      }
    }
  }

  initLenis();

  // Lenis Pause/Resume Toggle
  const motionToggleBtn = document.getElementById('motion-toggle-btn');
  if (motionToggleBtn && lenis) {
    motionToggleBtn.addEventListener('click', () => {
      isLenisPaused = !isLenisPaused;
      if (isLenisPaused) {
        lenis.stop();
        motionToggleBtn.classList.remove('active');
        motionToggleBtn.querySelector('.motion-label').textContent = 'Lenis: Pausado';
      } else {
        lenis.start();
        motionToggleBtn.classList.add('active');
        motionToggleBtn.querySelector('.motion-label').textContent = 'Lenis: Ativo';
      }
    });
  }

  // Smooth scroll handler for all data-scroll-to elements
  function scrollToTarget(targetSelector) {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    if (lenis && !isLenisPaused) {
      lenis.scrollTo(targetEl, {
        offset: -40,
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-scroll-to');
      scrollToTarget(target);

      // Close mobile drawer if open
      const drawer = document.getElementById('mobile-drawer');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        document.getElementById('mobile-menu-btn')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 02. SCROLL PROGRESS & CHAPTER TRACKING
  // ---------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');
  const trackerFill = document.getElementById('tracker-fill');
  const trackerDots = document.querySelectorAll('.tracker-dot');
  const navLinks = document.querySelectorAll('.nav-link');
  const chapters = document.querySelectorAll('.story-section');

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    if (trackerFill) {
      trackerFill.style.height = `${progressPercent}%`;
    }

    // Determine current active chapter
    let currentChapterId = '';
    const scrollMiddle = scrollTop + window.innerHeight * 0.45;

    chapters.forEach((chap) => {
      const top = chap.offsetTop;
      const height = chap.offsetHeight;
      if (scrollMiddle >= top && scrollMiddle < top + height) {
        currentChapterId = '#' + chap.id;
      }
    });

    if (currentChapterId) {
      // Update side tracker
      trackerDots.forEach((dot) => {
        if (dot.getAttribute('data-target') === currentChapterId) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Update desktop header nav
      navLinks.forEach((link) => {
        if (link.getAttribute('data-scroll-to') === currentChapterId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // Click on side tracker dots
  trackerDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = dot.getAttribute('data-target');
      scrollToTarget(target);
    });
  });

  // ---------------------------------------------------------------------------
  // 03. MOBILE MENU DRAWER
  // ---------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    drawerCloseBtn?.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------------------------------------------------------------------------
  // 04. MOUSE TORCH / SPOTLIGHT EFFECT
  // ---------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  if (cursorGlow && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function renderCursorGlow() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(renderCursorGlow);
    }
    requestAnimationFrame(renderCursorGlow);
  }

  // ---------------------------------------------------------------------------
  // 05. AMBIENT CANVAS (Burning Embers / Cinzas Incandescentes)
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Mobile check for performance scaling
    const isMobile = window.innerWidth < 768;
    const EMBER_COUNT = isMobile ? 55 : 105;
    const embers = [];

    // Track scroll velocity for realistic updraft turbulence
    let scrollDraft = 0;
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const delta = Math.abs(currentScroll - lastScrollTop);
      lastScrollTop = currentScroll;
      scrollDraft = Math.min(delta * 0.12, 4.5);
    }, { passive: true });

    class BurningEmber {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * (width + 80) - 40;
        this.y = initial ? Math.random() * height : height + Math.random() * 40;

        // Archetypes: spark (18%), flake (26%), ember (56%)
        const randType = Math.random();
        if (randType < 0.18) {
          this.type = 'spark';
          this.size = Math.random() * 1.5 + 0.8;
          this.baseSpeedY = -(Math.random() * 1.9 + 1.2);
          this.aspect = 1;
        } else if (randType < 0.44) {
          this.type = 'flake';
          this.size = Math.random() * 3.6 + 2.2;
          this.baseSpeedY = -(Math.random() * 0.9 + 0.5);
          this.aspect = Math.random() * 0.7 + 1.5; // Elongated ash flake
        } else {
          this.type = 'ember';
          this.size = Math.random() * 2.8 + 1.4;
          this.baseSpeedY = -(Math.random() * 1.2 + 0.7);
          this.aspect = 1;
        }

        this.baseSpeedX = (Math.random() - 0.5) * 0.7;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.04 + 0.015;
        this.wobbleAmp = Math.random() * 1.3 + 0.4;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;

        this.maxLife = Math.random() * 320 + 200;
        this.life = initial ? Math.random() * this.maxLife : 0;
        this.flickerFreq = Math.random() * 0.18 + 0.08;
      }

      update() {
        this.life++;
        if (this.life >= this.maxLife || this.y < -30) {
          this.reset();
          return;
        }

        // Relative progress of ember from bottom to top & age
        const ageProgress = this.life / this.maxLife;
        const screenProgress = Math.max(0, Math.min(1, this.y / height));

        // Heat cooling: 1.0 (hot, bottom) to 0.0 (extinguished ash, top)
        this.heat = Math.max(0, Math.min(1, screenProgress * 0.7 + (1 - ageProgress) * 0.3));

        // Horizontal heat wobble
        this.wobblePhase += this.wobbleSpeed;
        const wobble = Math.sin(this.wobblePhase) * this.wobbleAmp;

        // Mouse swirl interaction
        let mouseForceX = 0;
        let mouseForceY = 0;
        if (cursorGlow) {
          const dx = this.x - currentX;
          const dy = this.y - currentY;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0) {
            const force = (130 - dist) / 130;
            mouseForceX = (dx / dist) * force * 1.2;
            mouseForceY = (dy / dist) * force * 0.8;
          }
        }

        // Apply velocities with scroll draft boost
        const currentSpeedY = this.baseSpeedY - (scrollDraft * 0.6);
        this.y += currentSpeedY + mouseForceY;
        this.x += this.baseSpeedX + wobble + mouseForceX;
        this.rotation += this.rotSpeed;

        // Wrap around horizontally
        if (this.x < -50) this.x = width + 40;
        if (this.x > width + 50) this.x = -40;
      }

      draw(time) {
        const flicker = 0.75 + 0.25 * Math.sin(time * this.flickerFreq + this.wobblePhase);
        let alpha = Math.sin((this.life / this.maxLife) * Math.PI) * flicker;
        alpha = Math.max(0, Math.min(1, alpha));

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.type === 'flake') {
          ctx.rotate(this.rotation);
        }

        // Determine ember color according to heat
        let coreColor, haloColor, glowBlur;
        if (this.heat > 0.65) {
          // Intense hot flame / bright golden-orange
          coreColor = `rgba(255, 245, 180, ${alpha * 0.95})`;
          haloColor = `rgba(255, 110, 15, ${alpha * 0.85})`;
          glowBlur = 12 * (this.size / 2);
        } else if (this.heat > 0.3) {
          // Fiery crimson orange
          coreColor = `rgba(255, 130, 20, ${alpha * 0.85})`;
          haloColor = `rgba(214, 40, 20, ${alpha * 0.65})`;
          glowBlur = 8 * (this.size / 2);
        } else {
          // Cooling ember / charcoal cinder
          coreColor = `rgba(180, 40, 25, ${alpha * 0.6})`;
          haloColor = `rgba(90, 15, 20, ${alpha * 0.35})`;
          glowBlur = 4;
        }

        // Draw glowing halo
        ctx.shadowColor = haloColor;
        ctx.shadowBlur = glowBlur;

        ctx.beginPath();
        if (this.type === 'flake') {
          ctx.ellipse(0, 0, this.size * this.aspect, this.size, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        }
        ctx.fillStyle = haloColor;
        ctx.fill();

        // Draw hot inner incandescent core
        ctx.shadowBlur = 0;
        ctx.beginPath();
        if (this.type === 'flake') {
          ctx.ellipse(0, 0, (this.size * this.aspect) * 0.45, this.size * 0.45, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        }
        ctx.fillStyle = coreColor;
        ctx.fill();

        ctx.restore();
      }
    }

    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push(new BurningEmber());
    }

    let emberFrame = 0;
    function animateEmbers() {
      ctx.clearRect(0, 0, width, height);

      // Dampen scroll draft smoothly
      if (scrollDraft > 0.02) {
        scrollDraft *= 0.92;
      } else {
        scrollDraft = 0;
      }

      emberFrame++;
      const time = emberFrame * 0.05;

      for (let i = 0; i < embers.length; i++) {
        embers[i].update();
        embers[i].draw(time);
      }

      requestAnimationFrame(animateEmbers);
    }
    requestAnimationFrame(animateEmbers);
  }

  // ---------------------------------------------------------------------------
  // 06. CHAPTER 2: INTERACTIVE PANTHEON EXPLORER
  // ---------------------------------------------------------------------------
  const pantheonData = {
    zeus: {
      name: 'Zeus',
      greek: 'ΖΕΥΣ',
      domain: 'O Rei dos Céus • Soberano Impiedoso',
      desc: 'Governante do topo nevado do Monte Olimpo. Seus raios não distinguem templos de vilarejos. Jamais desceu para estender a mão a um filho condenado à fogueira pelos homens mortais.',
      indifference: '95%',
      hostility: '88%',
      quote: '“O raio cai sobre carvalhos e bastardos com o mesmo peso silencioso.”',
    },
    poseidon: {
      name: 'Poseidon',
      greek: 'ΠΟΣΕΙΔΩΝ',
      domain: 'O Abalador da Terra • Senhor dos Abismos',
      desc: 'Senhor dos mares tempestuosos e das falhas tectônicas. Seus descendentes ouvem o gemido das rochas e das marés, mas quando imploram por abrigo nas tempestades, recebem apenas naufrágios.',
      indifference: '90%',
      hostility: '82%',
      quote: '“O oceano engole os filhos dos reis e os mendigos sem alterar sua cor.”',
    },
    hades: {
      name: 'Hades',
      greek: 'ᾍΔΗΣ',
      domain: 'O Invisível • Juiz das Profundezas',
      desc: 'O mais rigoroso dos três irmãos. Não busca os mortais, mas nunca perdoa um sopro de vida emprestado. Seus poucos descendentes caminham entre as sombras sentindo o peso gélido das almas perdidas.',
      indifference: '85%',
      hostility: '75%',
      quote: '“Mais cedo ou mais tarde, todo sangue divino retorna ao pó de onde brotou.”',
    },
    atena: {
      name: 'Atena',
      greek: 'ΑΘΗΝΑ',
      domain: 'A Estrategista Sagrada • Mente Implacável',
      desc: 'Deusa da sabedoria bélica e da razão fria. Não possui espaço para sentimentos maternos: considera a afeição uma vulnerabilidade tática mortal. Seus herdeiros recebem mentes afiadas e solitárias.',
      indifference: '92%',
      hostility: '60%',
      quote: '“A vitória exige sacrifício. Se o preço for o próprio sangue, que seja pago.”',
    },
    apolo: {
      name: 'Apolo',
      greek: 'ΑΠΟΛΛΩΝ',
      domain: 'O Arqueiro Dourado • Luz e Pestilência',
      desc: 'Portador da luz fulgurante e das flechas que espalham a praga. Tão brilhante quanto cruel, seus dons nos semideuses frequentemente os incineram de dentro para fora antes que alcancem a idade madura.',
      indifference: '88%',
      hostility: '70%',
      quote: '“A luz que revela a verdade também queima os olhos de quem a contempla.”',
    },
    artemis: {
      name: 'Ártemis',
      greek: 'ΑΡΤΕΜΙΣ',
      domain: 'A Senhora das Feras • Caçadora Noturna',
      desc: 'Guardiã das florestas intocadas e da lua silenciosa. Rejeita as cidades dos homens e não demonstra piedade por quem traz a corrupção humana para seus bosques ancestrais.',
      indifference: '86%',
      hostility: '78%',
      quote: '“Nas matas ancestrais, o caçador que hesita torna-se presa antes do luar.”',
    },
    ares: {
      name: 'Ares',
      greek: 'ΑΡΗΣ',
      domain: 'O Flagelo da Guerra • Carnificina Cega',
      desc: 'Deus da fúria desmedida nos campos ensanguentados. Vê seus descendentes apenas como bucha de canhão para manter as fogueiras da discórdia acesas entre as cidades gregas.',
      indifference: '70%',
      hostility: '96%',
      quote: '“O sangue dos semideuses derramado na poeira alimenta o espírito do combate.”',
    },
    demeter: {
      name: 'Deméter',
      greek: 'ΔΗΜΗΤΗΡ',
      domain: 'A Portadora das Estações • A Fúria do Inverno',
      desc: 'Mãe enlutada da terra. Quando sua dor explode, colheitas inteiras murcham e a fome devora reinos. Seus filhos sentem a agonia da vegetação moribunda no próprio peito.',
      indifference: '82%',
      hostility: '74%',
      quote: '“A terra dá e a terra tira. Nenhum semideus colherá aquilo que não semeou na dor.”',
    },
  };

  const deityGreek = document.getElementById('deity-greek');
  const deityDomain = document.getElementById('deity-domain');
  const deityName = document.getElementById('deity-name');
  const deityDesc = document.getElementById('deity-desc');
  const metricFill1 = document.getElementById('metric-fill-1');
  const metricFill2 = document.getElementById('metric-fill-2');
  const deityQuote = document.getElementById('deity-quote');

  function updateDeityShowcase(key) {
    const data = pantheonData[key];
    if (!data) return;

    if (deityGreek) deityGreek.textContent = data.greek;
    if (deityDomain) deityDomain.textContent = data.domain;
    if (deityName) deityName.textContent = data.name;
    if (deityDesc) deityDesc.textContent = data.desc;
    if (metricFill1) metricFill1.style.width = data.indifference;
    if (metricFill2) metricFill2.style.width = data.hostility;
    if (deityQuote) deityQuote.textContent = data.quote;

    // Update filter tabs
    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-deity') === key);
    });

    // Update mini cards
    document.querySelectorAll('.mini-deity-card').forEach((card) => {
      card.classList.toggle('active', card.getAttribute('data-deity') === key);
    });
  }

  // Filter tabs click
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const deityKey = tab.getAttribute('data-deity');
      updateDeityShowcase(deityKey);
    });
  });

  // Mini cards click
  document.querySelectorAll('.mini-deity-card').forEach((card) => {
    card.addEventListener('click', () => {
      const deityKey = card.getAttribute('data-deity');
      updateDeityShowcase(deityKey);
    });
  });

  // ---------------------------------------------------------------------------
  // 07. CHAPTER 3: INTERACTIVE EPITHETS CODEX MATRIX
  // ---------------------------------------------------------------------------
  const epithetsDatabase = {
    apolo: [
      {
        epithet: 'Sminthaios (Σμινθεύς)',
        title: 'O Senhor dos Ratos e da Praga',
        desc: 'O semideus desenvolve controle sobre pestilências, miasmas bacterianos e enxames de roedores. Seu hálito pode contaminar poços inteiros em momentos de pânico.',
        power: 'Vetor Epidemiológico & Decomposição Acelerada',
        burden: 'Pele acinzentada e tosse crônica com sangue negro.',
      },
      {
        epithet: 'Phoibos (Φοῖβος)',
        title: 'O Radiante e Purificador',
        desc: 'Emissão de labaredas e pulsos de radiação solar pura. O semideus é capaz de queimar flechas em pleno voo e cegar perseguidores durante o confronto.',
        power: 'Fotocinese Térmica & Luminescência Solar',
        burden: 'Febres internas de até 42°C após o uso, queimando suas próprias córneas.',
      },
      {
        epithet: 'Paian (Παιάν)',
        title: 'O Médico Sagrado',
        desc: 'Capacidade milagrosa de purificar venenos e fechar feridas fatais. Para curar outro ser vivo, o semideus é forçado a absorver metade da aflição física para seu próprio corpo.',
        power: 'Regeneração Empática & Transfusão Vital',
        burden: 'Cicatrizes perpétuas e encurtamento drástico da expectativa de vida.',
      },
    ],
    poseidon: [
      {
        epithet: 'Enosichthon (Ἐνοσίχθων)',
        title: 'O Abalador da Terra',
        desc: 'Vibrações de baixa frequência emitidas pela palma das mãos e sola dos pés. Cria fendas no solo, desmorona muralhas de pedra e colapsa galerias subterrâneas.',
        power: 'Ressonância Sísmica & Quebra de Estruturas',
        burden: 'Calcificação precoce dos ossos e tremores musculares incontroláveis.',
      },
      {
        epithet: 'Pelagios (Πελάγιος)',
        title: 'O Habitante dos Abismos',
        desc: 'Respiração aquática adaptada a profundidades oceânicas extremas e pressão esmagadora. Manipulação de torrentes e redemoinhos marinhos em mar aberto.',
        power: 'Hidrocinese Abissal & Resistência Barométrica',
        burden: 'Desidratação rápida e queimação severa quando longe de água salgada.',
      },
      {
        epithet: 'Hippios (Ἵππιος)',
        title: 'O Senhor dos Corcéis Selvagens',
        desc: 'Comunicação mental e vínculo cinético com corcéis, touros e feras de casco. Capaz de cavalgar em velocidades sobrenaturais sem montaria.',
        power: 'Vínculo Bestial Primal & Frenesi Cinético',
        burden: 'Perda gradual da linguagem humana durante estados de fúria.',
      },
    ],
    atena: [
      {
        epithet: 'Polias (Πολιάς)',
        title: 'A Guardiã dos Baluartes Cívicos',
        desc: 'Criação de cúpulas e barreiras translúcidas geométricas que desviam projéteis e chamas. Protege pequenos perímetros contra ataques coordenados.',
        power: 'Construção de Baluartes Telecinéticos',
        burden: 'Hemorragia nasal severa e exaustão neural instantânea.',
      },
      {
        epithet: 'Promachos (Πρόμαχος)',
        title: 'A Campeã da Vanguarda',
        desc: 'Reflexos em velocidade de sinapses ampliadas. Antecipa o ângulo exato de lâminas e lanças com três segundos de antecedência.',
        power: 'Percepção Cinética Preditiva de Combate',
        burden: 'Enxaquecas alucinatórias e incapacidade de desligar o estado de alerta.',
      },
      {
        epithet: 'Ergane (Ἐργάνη)',
        title: 'A Mestra dos Artifícios',
        desc: 'Compreensão intuitiva instantânea de qualquer engrenagem, fechadura, veneno ou armadilha mecânica. Cria armas improvisadas mortais em minutos.',
        power: 'Engenharia Arcaica & Intuição Mecânica Divina',
        burden: 'Insônia obsessiva e isolamento social quase total.',
      },
    ],
    artemis: [
      {
        epithet: 'Agrotera (Ἀγροτέρα)',
        title: 'A Fera das Terras Ermas',
        desc: 'Mimetismo óptico absoluto entre folhagens e sombras florestais. Olfato e audição amplificados capazes de detectar o bater de asas de uma coruja a um quilômetro.',
        power: 'Camuflagem Predatória & Sentidos Sobrenaturais',
        burden: 'Agorafobia severa e ataques de pânico em cidades fechadas.',
      },
      {
        epithet: 'Lochia (Λοχία)',
        title: 'A Guardiã dos Nascimentos',
        desc: 'Percepção sensorial dos batimentos cardíacos e do fluxo sanguíneo de todos os seres vivos em um raio de duzentos metros. Pode induzir espasmos musculares vitais.',
        power: 'Ressonância Vital & Paralisia Cardíaca',
        burden: 'Sentir a morte agonizante de cada animal que perece na floresta.',
      },
    ],
    hades: [
      {
        epithet: 'Plouton (Πλούτων)',
        title: 'O Doador das Riquezas Subterrâneas',
        desc: 'Capacidade de magnetizar e moldar metais preciosos, ouro, prata e ferro fundido nas entranhas da terra. Encontra veios minerais sob montanhas sólidas.',
        power: 'Metalocinese Mineral & Extração Subterrânea',
        burden: 'O sangue torna-se pesado e tóxico como mercúrio com o tempo.',
      },
      {
        epithet: 'Nekrodektes (Νεκροδέκτης)',
        title: 'O Receptor das Sombras Perdidas',
        desc: 'Comunicação direta com espíritos não julgados que vagam pelos ermos da Grécia. Pode comandar névoas ectoplásmicas para desorientar caçadores mortais.',
        power: 'Nigromancia de Sombras & Comunicação Espectral',
        burden: 'Invasão constante de sussurros de agonia na mente durante o sono.',
      },
    ],
  };

  const epithetCardsContainer = document.getElementById('epithet-cards-container');
  const matrixNavButtons = document.querySelectorAll('.matrix-btn');

  function renderEpithetCards(deityKey) {
    if (!epithetCardsContainer) return;
    const items = epithetsDatabase[deityKey] || [];

    epithetCardsContainer.innerHTML = items
      .map(
        (item) => `
      <div class="matrix-card">
        <div>
          <span class="matrix-card-tag">Epíteto Desperto</span>
          <h4 class="matrix-card-title">${item.title}</h4>
          <div class="matrix-card-epithet">${item.epithet}</div>
          <p class="matrix-card-desc">${item.desc}</p>
        </div>
        <div>
          <div class="matrix-card-power">
            <strong>Poder:</strong> ${item.power}<br />
            <span style="color: #dfb76c; font-size: 0.85rem;"><strong>Fardo:</strong> ${item.burden}</span>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  matrixNavButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      matrixNavButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-matrix');
      renderEpithetCards(key);
    });
  });

  // Render initial matrix cards for Apollo
  renderEpithetCards('apolo');

  // ---------------------------------------------------------------------------
  // 08. CHAPTER 7: INTERACTIVE DELPHI ORACLE QUIZ
  // ---------------------------------------------------------------------------
  const oracleForm = document.getElementById('oracle-form');
  const oracleSteps = document.querySelectorAll('.oracle-step');
  const oracleResult = document.getElementById('oracle-result');
  const oracleSubmitBtn = document.getElementById('oracle-submit-btn');
  const oracleResetBtn = document.getElementById('oracle-reset-btn');

  // Step navigation buttons
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextStep = btn.getAttribute('data-goto');
      oracleSteps.forEach((step) => {
        step.classList.toggle('active', step.getAttribute('data-step') === nextStep);
      });
    });
  });

  const oracleArchetypes = {
    luz: {
      title: 'Apolo Phoibos (Φοῖβος)',
      deity: 'Filho Escolhido do Portador da Luz Ardente',
      power: 'Combustão Solar, Purificação por Fogo & Cegueira Fotônica',
      burden: 'Visão reduzida na penumbra & queimação interna contínua',
      haven: 'As Alturas Nebulosas do Monte Parnaso',
      flavor: '“Teu brilho é tua maior arma e tua mais cruel traição. Aprende a guardar a faísca nas entranhas da noite antes que o fogo consuma tuas próprias mãos.”',
    },
    sombra: {
      title: 'Ártemis Agrotera (Ἀγροτέρα)',
      deity: 'Cria das Florestas Indômitas da Caçadora Noturna',
      power: 'Camuflagem Óptica Absoluta, Mimetismo & Sentidos Ferais',
      burden: 'Pânico em cidades de pedra & agorafobia sob olhares mortais',
      haven: 'O Carvalho Monumental do Monte Helicão',
      flavor: '“As cidades foram erguidas pelos homens para escapar das trevas; para ti, a escuridão dos pinheiros é o único cobertor que preserva tua vida.”',
    },
    furia: {
      title: 'Poseidon Enosichthon (Ἐνοσίχθων)',
      deity: 'Herdeiro Tectônico do Abalador da Terra',
      power: 'Ressonância Sísmica, Fratura Pétrea & Ondas de Choque',
      burden: 'Calcificação e rigidez precoce dos ossos nas articulações',
      haven: 'As Fendas Vulcânicas da Ilha de Tera',
      flavor: '“A pedra cede ao teu comando, mas o preço da terra que estremeces é a rigidez do teu próprio esqueleto. Nunca permaneças no mesmo vale por duas luas.”',
    },
    cura: {
      title: 'Apolo Paian (Παιάν)',
      deity: 'Descendente Empático do Médico dos Imortais',
      power: 'Transfusão Celular Vital, Neutralização de Venenos & Selamento',
      burden: 'Absorção da dor e das enfermidades dos irmãos que salvas',
      haven: 'A Ravina da Água Morta na Arcádia Selvagem',
      flavor: '“Em um mundo afundado no ódio e no medo, tua escolha de curar é o ato mais radical de desafio contra os deuses silenciosos.”',
    },
  };

  if (oracleSubmitBtn) {
    oracleSubmitBtn.addEventListener('click', () => {
      const q1 = document.querySelector('input[name="q1"]:checked')?.value || 'luz';
      const q2 = document.querySelector('input[name="q2"]:checked')?.value || 'sombra';
      const q3 = document.querySelector('input[name="q3"]:checked')?.value || 'furia';

      // Score counter
      const scores = { luz: 0, sombra: 0, furia: 0, cura: 0 };
      scores[q1] = (scores[q1] || 0) + 1;
      scores[q2] = (scores[q2] || 0) + 1;
      scores[q3] = (scores[q3] || 0) + 1;

      // Find highest score archetype
      let topCategory = 'luz';
      let highest = -1;
      for (const [key, val] of Object.entries(scores)) {
        if (val > highest) {
          highest = val;
          topCategory = key;
        }
      }

      const archetype = oracleArchetypes[topCategory] || oracleArchetypes.luz;

      // Populate results
      document.getElementById('result-epithet-title').textContent = archetype.title;
      document.getElementById('result-deity-subtitle').textContent = archetype.deity;
      document.getElementById('result-power').textContent = archetype.power;
      document.getElementById('result-burden').textContent = archetype.burden;
      document.getElementById('result-haven').textContent = archetype.haven;
      document.getElementById('result-flavor').textContent = archetype.flavor;

      // Swap views
      oracleForm.style.display = 'none';
      oracleResult.style.display = 'block';

      // Scroll smoothly to results
      scrollToTarget('#oracle-result');
    });
  }

  if (oracleResetBtn) {
    oracleResetBtn.addEventListener('click', () => {
      oracleForm.reset();
      oracleResult.style.display = 'none';
      oracleForm.style.display = 'flex';
      oracleSteps.forEach((s) => s.classList.remove('active'));
      oracleSteps[0].classList.add('active');
      scrollToTarget('#oracle-experience');
    });
  }

  // ---------------------------------------------------------------------------
  // 09. WEB AUDIO API ATMOSPHERIC SOUNDTRACK (Procedural Ambient Soundscape)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  let isAudioPlaying = false;
  let masterGain = null;
  let droneOsc = null;
  let noiseNode = null;
  let chimeTimer = null;

  const audioToggleBtn = document.getElementById('audio-toggle-btn');

  function initAudioAtmosphere() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low Drone (A1: 55Hz + subharmonic)
      droneOsc = audioCtx.createOscillator();
      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);

      const droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, audioCtx.currentTime);

      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.28, audioCtx.currentTime);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start();

      // Atmospheric Wind Generator (Pink/Brown noise with modulated filter)
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
        lastOut = output[i];
        output[i] *= 3.5;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
      windFilter.Q.setValueAtTime(1.8, audioCtx.currentTime);

      // LFO for breathing wind movement
      const windLfo = audioCtx.createOscillator();
      windLfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
      const windLfoGain = audioCtx.createGain();
      windLfoGain.gain.setValueAtTime(160, audioCtx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      const windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

      noiseNode.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      noiseNode.start();

      // Gentle intermittent chime notes (ancient Greek pentatonic scale)
      const greekPentaFreqs = [220, 247.5, 275, 330, 366.6, 440];
      function triggerChime() {
        if (!isAudioPlaying || !audioCtx) return;
        const chimeOsc = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        const chimeFilter = audioCtx.createBiquadFilter();

        const freq = greekPentaFreqs[Math.floor(Math.random() * greekPentaFreqs.length)];
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        chimeFilter.type = 'bandpass';
        chimeFilter.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime);
        chimeFilter.Q.setValueAtTime(3, audioCtx.currentTime);

        const now = audioCtx.currentTime;
        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
        chimeGain.gain.exponentialRampToValueAtTime(0.00001, now + 3.5);

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(masterGain);

        chimeOsc.start(now);
        chimeOsc.stop(now + 4);

        const nextDelay = Math.random() * 5000 + 3500;
        chimeTimer = setTimeout(triggerChime, nextDelay);
      }

      chimeTimer = setTimeout(triggerChime, 2000);
      return true;
    } catch (err) {
      console.warn('Web Audio not supported or blocked:', err);
      return false;
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (!audioCtx) {
        const ok = initAudioAtmosphere();
        if (!ok) return;
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isAudioPlaying = !isAudioPlaying;

      if (isAudioPlaying) {
        masterGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.5);
        audioToggleBtn.classList.add('active');
        audioToggleBtn.querySelector('.audio-label').textContent = 'Som: Ativo';
      } else {
        masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        audioToggleBtn.classList.remove('active');
        audioToggleBtn.querySelector('.audio-label').textContent = 'Som: Mudo';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 10. GSAP SCROLL ENHANCEMENTS (Fallback safe)
  // ---------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    // Parallax on section headers
    gsap.utils.toArray('.section-header').forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power2.out',
      });
    });

    // Stagger in triptych cards
    gsap.utils.toArray('.threat-card, .dossier-card, .info-card').forEach((card, idx) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        delay: (idx % 3) * 0.15,
        ease: 'power2.out',
      });
    });

    // Fade in Manifesto Box
    gsap.from('.manifesto-box', {
      scrollTrigger: {
        trigger: '.manifesto-box',
        start: 'top 80%',
      },
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
    });
  }

  // ---------------------------------------------------------------------------
  // 11. 3D INTERACTIVE HERO EXPERIENCE (Lando Norris Style)
  // ---------------------------------------------------------------------------
  function init3DExperience() {
    const canvas3D = document.getElementById('three-canvas');
    const container = document.getElementById('canvas-3d-wrapper');
    const loaderOverlay = document.getElementById('canvas-3d-loader');
    if (!canvas3D || !container || typeof THREE === 'undefined') return;

    // WebGL Renderer with High-Performance Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas3D,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    if ('ACESFilmicToneMapping' in THREE) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
    }

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.35, 3.2);

    // Hierarchical Groups for Smooth Multi-Axis Transform
    const masterGroup = new THREE.Group();
    const modelPivot = new THREE.Group();
    masterGroup.add(modelPivot);
    scene.add(masterGroup);

    // Glowing Mystical Pedestal Ring (Ancient Greek Torus)
    const ringGeo = new THREE.TorusGeometry(1.22, 0.016, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xdfb76c,
      emissive: 0x9e7f3c,
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.85,
    });
    const pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = -0.92;
    masterGroup.add(pedestalRing);

    // Subtle Radial Glow Disc underneath
    const discGeo = new THREE.CircleGeometry(1.22, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xdfb76c,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const glowDisc = new THREE.Mesh(discGeo, discMat);
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.y = -0.92;
    masterGroup.add(glowDisc);

    // Multi-Point Studio Lighting (Lando Norris style)
    const ambientLight = new THREE.AmbientLight(0x1a1e28, 1.4);
    scene.add(ambientLight);

    // Key Light: Warm Olympian Gold
    const keyLight = new THREE.DirectionalLight(0xffe2a4, 2.8);
    keyLight.position.set(3.5, 4, 3.5);
    scene.add(keyLight);

    // Rim Light: Cool Celestial Slate Blue
    const rimLight = new THREE.DirectionalLight(0x5588cc, 2.2);
    rimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(rimLight);

    // Bottom Bounce Light: Fiery Ember Red-Orange (pulsing with burning embers)
    const emberBounceLight = new THREE.PointLight(0xff4500, 3.2, 8);
    emberBounceLight.position.set(0, -2.2, 1.2);
    scene.add(emberBounceLight);

    // Materials Palette (Finish Customizer)
    const materials = {
      gold: new THREE.MeshStandardMaterial({
        color: 0xdfb76c,
        roughness: 0.26,
        metalness: 0.94,
      }),
      bronze: new THREE.MeshStandardMaterial({
        color: 0x9a6839,
        roughness: 0.44,
        metalness: 0.86,
      }),
      obsidian: new THREE.MeshStandardMaterial({
        color: 0x14161a,
        roughness: 0.12,
        metalness: 0.96,
      }),
      ichor: new THREE.MeshStandardMaterial({
        color: 0x8b1a2b,
        roughness: 0.22,
        metalness: 0.88,
      }),
    };

    let activeMaterialKey = 'gold';
    let loadedMesh = null;

    function applyMaterial(matKey) {
      if (!loadedMesh || !materials[matKey]) return;
      activeMaterialKey = matKey;
      loadedMesh.material = materials[matKey];

      // Update button active state
      document.querySelectorAll('.mat-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-mat') === matKey);
      });
    }

    // Material Switcher Buttons
    document.querySelectorAll('.mat-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const matKey = btn.getAttribute('data-mat');
        applyMaterial(matKey);
      });
    });

    // -------------------------------------------------------------------------
    // Load Model: either from window.MODELO_FBX_BASE64 or fetch('modelo.fbx')
    // -------------------------------------------------------------------------
    function onModelLoaded(fbxObject) {
      fbxObject.traverse((child) => {
        if (child.isMesh) {
          loadedMesh = child;
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
          child.material = materials[activeMaterialKey];
        }
      });

      // Fit and center model properly
      const box = new THREE.Box3().setFromObject(fbxObject);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.6 / (maxDim || 1);
      fbxObject.scale.setScalar(scale);

      // Re-center
      const newBox = new THREE.Box3().setFromObject(fbxObject);
      const center = new THREE.Vector3();
      newBox.getCenter(center);
      fbxObject.position.sub(center);
      fbxObject.position.y += 0.05;

      modelPivot.add(fbxObject);

      // Hide loading spinner
      if (loaderOverlay) {
        loaderOverlay.classList.add('hidden');
      }
    }

    try {
      const fbxLoader = new THREE.FBXLoader();

      if (window.MODELO_FBX_BASE64) {
        // Fast instant decode from base64 (zero CORS issues on file://)
        const binaryString = atob(window.MODELO_FBX_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const parsed = fbxLoader.parse(bytes.buffer, '');
        onModelLoaded(parsed);
      } else {
        // Fallback fetch
        fbxLoader.load(
          'modelo.fbx',
          (object) => onModelLoaded(object),
          undefined,
          (err) => {
            console.warn('Could not load modelo.fbx via fetch:', err);
            if (loaderOverlay) loaderOverlay.classList.add('hidden');
          }
        );
      }
    } catch (err) {
      console.warn('FBXLoader error:', err);
      if (loaderOverlay) loaderOverlay.classList.add('hidden');
    }

    // -------------------------------------------------------------------------
    // Interactive 360° Drag & Physics (Lando Norris style)
    // -------------------------------------------------------------------------
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let autoRotate = true;

    // Default resting rotation
    const defaultRot = { x: 0.15, y: -0.45 };
    let currentRotX = defaultRot.x;
    let currentRotY = defaultRot.y;

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      dragVelocityX = 0;
      dragVelocityY = 0;
      container.classList.add('grabbing');
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      dragVelocityY = deltaX * 0.007;
      dragVelocityX = deltaY * 0.007;

      currentRotY += dragVelocityY;
      currentRotX += dragVelocityX;
      currentRotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, currentRotX));
    });

    function onPointerUp(e) {
      if (isDragging) {
        isDragging = false;
        container.classList.remove('grabbing');
        try { container.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    }
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // Auto-rotate toggle button
    const autoRotateBtn = document.getElementById('toggle-autorotate-btn');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        autoRotate = !autoRotate;
        autoRotateBtn.classList.toggle('active', autoRotate);
      });
    }

    // Reset view button
    const resetBtn = document.getElementById('reset-3d-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentRotX = defaultRot.x;
        currentRotY = defaultRot.y;
        dragVelocityX = 0;
        dragVelocityY = 0;
      });
    }

    // -------------------------------------------------------------------------
    // Mouse Parallax & Scroll Choreography
    // -------------------------------------------------------------------------
    let mouseNormX = 0;
    let mouseNormY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Choreographed scroll rotation targets across the story scroll
    let scrollRotationOffset = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;
      scrollRotationOffset = scrollRatio * Math.PI * 2.2;
    }, { passive: true });

    // -------------------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------------------
    let clockTime = 0;
    function animate3D() {
      requestAnimationFrame(animate3D);

      clockTime += 0.016;

      // Pulse bottom ember bounce light
      emberBounceLight.intensity = 2.4 + Math.sin(clockTime * 4) * 0.8;

      // Rotate pedestal ring
      pedestalRing.rotation.z += 0.003;

      if (!isDragging) {
        // Apply inertia drag damping
        dragVelocityX *= 0.92;
        dragVelocityY *= 0.92;
        currentRotX += dragVelocityX;
        currentRotY += dragVelocityY;

        // Gentle auto rotation
        if (autoRotate) {
          currentRotY += 0.006;
        }
      }

      // Mouse Parallax subtle tilt
      const targetParallaxX = mouseNormY * 0.14;
      const targetParallaxY = mouseNormX * 0.22;

      // Apply rotations smoothly
      modelPivot.rotation.x = currentRotX + targetParallaxX;
      modelPivot.rotation.y = currentRotY + targetParallaxY + (scrollRotationOffset * 0.15);

      // Idle floating breathing bob
      masterGroup.position.y = Math.sin(clockTime * 1.5) * 0.05;

      renderer.render(scene, camera);
    }
    animate3D();

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  init3DExperience();
});
