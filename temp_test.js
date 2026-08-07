
    /* ============================================================
       MENÚ MÓVIL Y SCROLL
    ============================================================ */
    document.getElementById('mobileMenu').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('open');
    });

    document.querySelectorAll('.submenu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 680) {
                document.getElementById('navMenu').classList.remove('open');
            }
        });
    });

    document.querySelectorAll('.menu-group > a').forEach(groupLink => {
        groupLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 680) {
                e.preventDefault();
                const parentLi = groupLink.closest('.menu-group');
                parentLi.classList.toggle('open');
            }
        });
    });

    window.addEventListener('scroll', () => {
        document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 40);
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* ============================================================
       CARGAR DATOS DESDE JSON (data_portal.json)
    ============================================================ */
    async function cargarDatos() {
        try {
            const response = await fetch('data_portal.json');
            if (!response.ok) throw new Error('No se pudo cargar data_portal.json');
            const data = await response.json();

            document.getElementById('oficinasProbidad').innerText = data.oficinasProbidad || 0;
            document.getElementById('canalesDenuncia').innerText = data.canalesDenuncia || 0;
            document.getElementById('denunciasPenales').innerText = data.denunciasPenales || 0;
            document.getElementById('plataformasActivas').innerText = data.plataformasActivas || 8;

            if (data.descripciones) {
                if (data.descripciones.oficinasProbidad) document.getElementById('descOficinas').innerText = data.descripciones.oficinasProbidad;
                if (data.descripciones.canalesDenuncia) document.getElementById('descCanales').innerText = data.descripciones.canalesDenuncia;
                if (data.descripciones.denunciasPenales) document.getElementById('descDenuncias').innerText = data.descripciones.denunciasPenales;
                if (data.descripciones.plataformasActivas) document.getElementById('descPlataformas').innerText = data.descripciones.plataformasActivas;
            }

            console.log('✅ Datos cargados correctamente desde data_portal.json', data);
            startCounters();
        } catch (error) {
            console.error('❌ Error cargando data_portal.json:', error);
            document.getElementById('oficinasProbidad').innerText = '67';
            document.getElementById('canalesDenuncia').innerText = '191';
            document.getElementById('denunciasPenales').innerText = '423';
            document.getElementById('plataformasActivas').innerText = '8';
            startCounters();
        }
    }

    let countersStarted = false;
    let countersRunning = false;

    function startCounters() {
        if (countersRunning) return;
        countersRunning = true;
        const counters = document.querySelectorAll('.stats-ribbon .counter');
        counters.forEach(counter => {
            const target = parseInt(counter.innerText);
            if (isNaN(target)) return;
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 80));
            const update = () => {
                current = Math.min(current + step, target);
                counter.innerText = current;
                if (current < target) setTimeout(update, 18);
            };
            update();
        });
    }

    const ribbonObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
            }
        });
    }, { threshold: 0.3 });
    ribbonObserver.observe(document.querySelector('.stats-ribbon'));

    /* ============================================================
       HERO BANNER BACKGROUND SLIDER
    ============================================================ */
    (function initHeroBgSlider() {
        const slides = document.querySelectorAll('#heroBgSlider .hero-slide');
        const dots = document.querySelectorAll('#heroSliderDots .hero-dot');
        if (!slides.length) return;

        let currentIndex = 0;
        let slideInterval = null;

        function goToSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        function nextSlide() {
            let nextIndex = (currentIndex + 1) % slides.length;
            goToSlide(nextIndex);
        }

        function startAutoplay() {
            stopAutoplay();
            slideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            if (slideInterval) clearInterval(slideInterval);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                startAutoplay();
            });
        });

        startAutoplay();
    })();

    /* ============================================================
       SWIPER DE PLATAFORMAS
    ============================================================ */
    const platSwiper = new Swiper('#platSwiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        observer: true,
        observeParents: true,
        autoplay: { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.plat-next', prevEl: '.plat-prev' },
        breakpoints: {
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 }
        }
    });

    /* ============================================================
       FADE-UP ON SCROLL
    ============================================================ */
    const fadeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

    cargarDatos();
