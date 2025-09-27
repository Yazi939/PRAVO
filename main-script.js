// Отслеживание взаимодействия пользователя для вибрации
function markUserInteracted() {
    document.body.classList.add('user-interacted');
    // Убираем слушатели после первого взаимодействия
    document.removeEventListener('touchstart', markUserInteracted);
    document.removeEventListener('mousedown', markUserInteracted);
    document.removeEventListener('keydown', markUserInteracted);
}

document.addEventListener('touchstart', markUserInteracted, { once: true });
document.addEventListener('mousedown', markUserInteracted, { once: true });
document.addEventListener('keydown', markUserInteracted, { once: true });

// Простая отладка загрузки скрипта
console.log('Main script loaded!');

// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    // Отключаем авто-восстановление скролла и якорный прыжок при первом визите
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) {}
    if (!sessionStorage.getItem('siteLoaded') && location.hash) {
        try { history.replaceState({ view: 'main' }, '', window.location.pathname); } catch (_) {}
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const progressText = document.getElementById('progressText');

    // Если сайт уже загружался (возврат со страницы услуги) — пропускаем прелоадер
    const siteLoaded = sessionStorage.getItem('siteLoaded') === 'true';
    if (siteLoaded) {
        if (preloader) preloader.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '1';
        }
        return;
    }

    // Первый визит — запускаем прелоадер и помечаем как загруженный
    sessionStorage.setItem('siteLoaded', 'true');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Скрываем прелоадер и показываем контент
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '0';
                    setTimeout(() => {
                        mainContent.style.transition = 'opacity 0.5s ease-in';
                        mainContent.style.opacity = '1';
                        // Гарантируем начало сверху после показа и разблокируем скролл
                        if (advancedSmoothScrollInstance) {
                            advancedSmoothScrollInstance.scrollToTop();
                            advancedSmoothScrollInstance.unlock();
                        } else {
                            window.scrollTo({ top: 0, behavior: 'auto' });
                        }
                    }, 100);
                }, 500);
            }, 500);
        }

        progressText.textContent = Math.floor(progress) + '%';
    }, 100);
});

// ================= SPA НАВИГАЦИЯ ДЛЯ УСЛУГ =================
(function initSpaNavigation() {
    const SERVICE_FILE_MAP = {
        'family-law': 'family-law.html',
        'auto-law': 'auto-law.html',
        'corporate-law': 'corporate-law.html',
        'real-estate-law': 'real-estate.html',
        'real-estate': 'real-estate.html',
        'inheritance-law': 'inheritance.html',
        'inheritance': 'inheritance.html',
        'labor-law': 'labor-law.html'
    };

    let serviceContainer; // динамический контейнер для контента услуги
    let serviceStylesLink; // <link> для стилей страницы услуги

    // Встроенные шаблоны услуг (без загрузки отдельных страниц)
    const SERVICE_TEMPLATES = {
        'family-law': {
            title: 'Семейное право',
            mission: 'Семейное право — это одна из самых деликатных областей юриспруденции, требующая особого подхода и понимания. Мы специализируемся на решении семейных споров, защите интересов детей и обеспечении справедливого раздела имущества.',
            items: ['(1) Развод и раздел имущества','(2) Алименты','(3) Определение места жительства детей','(4) Опека и усыновление']
        },
        'auto-law': {
            title: 'Авто право',
            mission: 'ДТП, страховые споры, лишение прав, оформление автомобилей. Решаем автомобильные вопросы быстро и профессионально.',
            items: ['(1) Оспаривание штрафов','(2) ДТП и возмещение ущерба','(3) Споры со страховыми','(4) Возврат прав']
        },
        'corporate-law': {
            title: 'Корпоративное право',
            mission: 'Регистрация бизнеса, договоры, M&A и корпоративные споры. Ваш бизнес под надежной правовой защитой.',
            items: ['(1) Регистрация и реорганизация','(2) Договорное сопровождение','(3) Корпоративные конфликты','(4) Сделки M&A']
        },
        'real-estate': {
            title: 'Недвижимость',
            mission: 'Сделки с недвижимостью, споры по договорам, регистрация прав. Защищаем ваши интересы в вопросах недвижимости.',
            items: ['(1) Проверка объектов','(2) Сопровождение сделок','(3) Судебные споры','(4) Регистрация прав']
        },
        'inheritance': {
            title: 'Наследственные дела',
            mission: 'Вступление в наследство, оспаривание завещаний, раздел наследства. Помогаем в сложных наследственных вопросах.',
            items: ['(1) Вступление в наследство','(2) Оспаривание завещаний','(3) Раздел наследства','(4) Представительство в суде']
        },
        'labor-law': {
            title: 'Трудовое право',
            mission: 'Трудовые споры, увольнения, восстановление на работе. Защищаем права работников и работодателей.',
            items: ['(1) Восстановление на работе','(2) Взыскание зарплаты','(3) Оспаривание увольнений','(4) Охрана труда']
        }
    };

    function buildServiceTemplate(serviceKey) {
        const data = SERVICE_TEMPLATES[serviceKey];
        if (!data) return null;
        const wrapper = document.createElement('div');
        wrapper.className = 'container';
        wrapper.innerHTML = `
            <div class="main-layout">
                <div class="left-column">
                    <div class="top-nav">
                        <a href="main.html" class="back-link">Назад</a>
                    </div>
                    <div class="service-title-block">
                        <h1 class="service-title">${data.title}</h1>
                    </div>
                    <div class="services-section">
                        <h3 class="services-title">Услуги</h3>
                        <ul class="services-list">
                            ${data.items.map((t, i) => `<li class="service-item${i===0?' active':''}" data-index="${i}">${t}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="right-column">
                    <div class="mission-section">
                        <p class="mission-text">${data.mission}</p>
                        <div class="cta-section">
                            <a href="#contact" class="cta-button">Нажмите, чтобы записаться на консультацию</a>
                        </div>
                    </div>
                    <div class="white-content-block">
                        <div class="navigation-controls">
                            <button class="nav-button" id="prevBtn">←</button>
                            <button class="nav-button" id="nextBtn">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // мини-инициализация навигации по списку как на страницах услуг
        setTimeout(() => {
            const prevBtn = wrapper.querySelector('#prevBtn');
            const nextBtn = wrapper.querySelector('#nextBtn');
            const listItems = Array.from(wrapper.querySelectorAll('.service-item'));
            let idx = 0;
            function update() {
                listItems.forEach((li, i) => li.classList.toggle('active', i === idx));
                if (prevBtn) prevBtn.disabled = idx === 0;
                if (nextBtn) nextBtn.disabled = idx === listItems.length - 1;
            }
            if (prevBtn) prevBtn.addEventListener('click', () => { if (idx>0){ idx--; update(); } });
            if (nextBtn) nextBtn.addEventListener('click', () => { if (idx<listItems.length-1){ idx++; update(); } });
            listItems.forEach((li, i) => li.addEventListener('click', () => { idx = i; update(); }));
            update();
        }, 0);
        return wrapper;
    }

    // Универсальная анимация появления/исчезновения
    function fade(element, show = true, durationMs = 180) {
        return new Promise(resolve => {
            if (!element) return resolve();
            element.style.willChange = 'opacity, transform';
            element.style.transition = `opacity ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.pointerEvents = 'none';
            if (show) {
                element.style.display = element.dataset._prevDisplay || (element === document.getElementById('mainContent') ? 'block' : 'block');
                element.style.opacity = '0';
                element.style.transform = 'translateY(2px) scale(0.98)';
                // force reflow
                void element.getBoundingClientRect();
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1)';
                    setTimeout(() => {
                        element.style.pointerEvents = '';
                        resolve();
                    }, durationMs);
                });
            } else {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) scale(1)';
                // force reflow
                void element.getBoundingClientRect();
                requestAnimationFrame(() => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(2px) scale(0.98)';
                    setTimeout(() => {
                        element.dataset._prevDisplay = element.style.display;
                        element.style.display = 'none';
                        element.style.pointerEvents = '';
                        resolve();
                    }, durationMs);
                });
            }
        });
    }

    function ensureServiceContainer() {
        if (!serviceContainer) {
            serviceContainer = document.createElement('div');
            serviceContainer.id = 'serviceView';
            serviceContainer.style.display = 'none';
            document.body.appendChild(serviceContainer);
        }
    }

    function addServiceStyles() {
        if (!serviceStylesLink) {
            serviceStylesLink = document.createElement('link');
            serviceStylesLink.rel = 'stylesheet';
            serviceStylesLink.href = 'service-page-styles.css';
            document.head.appendChild(serviceStylesLink);
        }
    }

    function removeServiceStyles() {
        if (serviceStylesLink && serviceStylesLink.parentNode) {
            serviceStylesLink.parentNode.removeChild(serviceStylesLink);
            serviceStylesLink = null;
        }
    }

    async function hideMainAnimated() {
        const mainContent = document.getElementById('mainContent');
        await fade(mainContent, false);
    }

    async function showMainAnimated() {
        if (serviceContainer) {
            await fade(serviceContainer, false);
            serviceContainer.style.display = 'none';
        }
        removeServiceStyles();
        const mainContent = document.getElementById('mainContent');
        await fade(mainContent, true);
        
        // Используем кастомный скролл если доступен, иначе нативный
        if (advancedSmoothScrollInstance) {
            advancedSmoothScrollInstance.scrollToTop();
        } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }

    function bindBackLink(container) {
        const back = container.querySelector('.back-link');
        if (back) {
            back.addEventListener('click', async function(e) {
                e.preventDefault();
                // Плавно скрываем контент услуги, затем показываем главную и обновляем URL
                await fade(serviceContainer, false);
                await showMainAnimated();
                const mainUrl = (location.pathname.endsWith('main.html') ? location.pathname : 'main.html');
                history.replaceState({ view: 'main' }, '', mainUrl);
            });
        }
    }

    async function loadService(serviceKey, push = true) {
        ensureServiceContainer();
        addServiceStyles();
        await hideMainAnimated();

        const templateEl = buildServiceTemplate(serviceKey);
        if (templateEl) {
            serviceContainer.innerHTML = '';
            serviceContainer.appendChild(templateEl);
            serviceContainer.style.display = 'block';
            await fade(serviceContainer, true);
            bindBackLink(serviceContainer);
            if (push) {
                // Чистый URL без физической страницы
                const url = `#${serviceKey}`;
                history.pushState({ view: 'service', serviceKey }, '', url);
            }
            return;
        }

        // Фоллбек: если нет шаблона — пробуем загрузить файл
        const file = SERVICE_FILE_MAP[serviceKey] || serviceKey;
        if (!file) { await showMainAnimated(); return; }
        try {
            const resp = await fetch(file, { credentials: 'same-origin' });
            const html = await resp.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const inner = doc.querySelector('.container');
            if (!inner) throw new Error('Service content not found');
            serviceContainer.innerHTML = '';
            serviceContainer.appendChild(inner);
            serviceContainer.style.display = 'block';
            await fade(serviceContainer, true);
            bindBackLink(serviceContainer);
            if (push) {
                history.pushState({ view: 'service', serviceKey }, '', file);
            }
        } catch (err) {
            console.error('Failed to load service page:', err);
            await showMainAnimated();
        }
    }

    // Перехват кликов по карточкам и ссылкам «Подробнее» на главной
    function interceptServiceClicks() {
        // Карточки с data-service
        document.querySelectorAll('[data-service]').forEach(card => {
            card.addEventListener('click', function(e) {
                // Не перехватываем если клик по внутренней ссылке с явным href
                const link = e.target.closest('a[href]');
                if (link && !link.classList.contains('button-link')) return;
                const key = this.getAttribute('data-service');
                if (SERVICE_FILE_MAP[key]) {
                    e.preventDefault();
                    loadService(key, true);
                }
            });
        });

        // Кнопки «Подробнее» внутри карточек
        document.querySelectorAll('.button-link').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (/\.(html)$/.test(href)) {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    // попытка получить ключ по карте
                    const key = Object.keys(SERVICE_FILE_MAP).find(k => SERVICE_FILE_MAP[k] === href);
                    loadService(key || href, true);
                });
            }
        });

        // Ссылки в меню/футере на страницы услуг
        document.querySelectorAll('a[href$=".html"]').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (/(family-law|auto-law|corporate-law|real-estate|inheritance|labor-law)\.html$/.test(href)) {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    const key = Object.keys(SERVICE_FILE_MAP).find(k => SERVICE_FILE_MAP[k] === href) || href;
                    loadService(key, true);
                });
            }
        });
    }

    // Обработка кнопок назад/вперед браузера
    window.addEventListener('popstate', function(e) {
        const state = e.state || {};
        if (state.view === 'service' && state.serviceKey) {
            // Плавный переход при навигации назад/вперед
            (async () => {
                if (serviceContainer && serviceContainer.style.display !== 'none') {
                    await fade(serviceContainer, false);
                } else {
                    await hideMainAnimated();
                }
                await loadService(state.serviceKey, false);
            })();
        } else {
            // Любое другое состояние — показываем главную
            showMainAnimated();
        }
    });

    // Инициализация перехватов после загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        interceptServiceClicks();
        // Начальное состояние, если пользователь пришел на главную
        if (!history.state) {
            history.replaceState({ view: 'main' }, '', window.location.pathname);
        }
    });

    // Экспортируем для использования другими обработчиками внутри файла
    window.__loadServicePage = loadService;
})();

// Продвинутый плавный скролл как на pleasecallmechamp.com
class AdvancedSmoothScroll {
    constructor(options = {}) {
        this.isScrolling = false;
        this.scrollSpeed = 0;
        this.targetScrollY = 0;
        this.currentScrollY = 0;
        this.ease = options.ease || 0.08; // Коэффициент плавности (меньше = плавнее)
        this.wheelMultiplier = options.wheelMultiplier || 1.5; // Чувствительность колеса мыши
        this.touchMultiplier = options.touchMultiplier || 2; // Чувствительность тач-скролла
        this.keyboardMultiplier = options.keyboardMultiplier || 100; // Чувствительность клавиатуры
        this.isLocked = false;
        this.rafId = null;
        
        // Параметры инерции
        this.velocity = 0;
        this.friction = options.friction || 0.95; // Трение (0.9-0.98)
        this.maxVelocity = options.maxVelocity || 15; // Максимальная скорость
        this.minVelocity = options.minVelocity || 0.1; // Минимальная скорость для остановки
        this.lastWheelTime = 0;
        this.wheelVelocity = 0;
        this.isInertiaScrolling = false;
        
        this.init();
    }
    
    init() {
        // Отключаем нативный скролл
        this.disableNativeScroll();
        
        // Инициализируем кастомный скролл
        this.initCustomScroll();
        
        // Инициализируем навигацию
        this.initNavigationScroll();
        
        // Запускаем анимационный цикл
        this.startScrollLoop();
        
        // Обновляем начальные значения
        this.currentScrollY = window.pageYOffset;
        this.targetScrollY = this.currentScrollY;
    }
    
    disableNativeScroll() {
        // Отключаем стандартное поведение скролла
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
        
        // Предотвращаем стандартные события скролла
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener('keydown', this.handleKeyDown.bind(this), { passive: false });
    }
    
    handleWheel(e) {
        if (this.isLocked) return;
        
        e.preventDefault();
        
        // Нормализуем значение дельты для разных браузеров и устройств
        let delta = 0;
        if (e.deltaY) {
            // Стандартное wheel событие
            delta = e.deltaY;
            // Нормализуем для разных режимов deltaMode
            if (e.deltaMode === 1) { // DOM_DELTA_LINE
                delta *= 40;
            } else if (e.deltaMode === 2) { // DOM_DELTA_PAGE
                delta *= 800;
            }
        } else if (e.wheelDelta) {
            // Старые браузеры
            delta = -e.wheelDelta / 3;
        } else if (e.detail) {
            // Firefox
            delta = e.detail * 40;
        }
        
        // Ограничиваем максимальную дельту для предотвращения огромных прыжков
        delta = Math.max(-150, Math.min(150, delta));
        
        // Вычисляем скорость для инерции
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastWheelTime;
        
        if (timeDiff > 0) {
            // Накопление скорости для инерции
            const instantVelocity = (delta * this.wheelMultiplier) / Math.max(timeDiff, 1);
            this.velocity += instantVelocity * 0.3; // Коэффициент накопления
            
            // Ограничиваем максимальную скорость
            this.velocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity));
        }
        
        // Применяем множитель
        const scrollAmount = delta * this.wheelMultiplier;
        this.targetScrollY += scrollAmount;
        
        // Ограничиваем скролл в пределах документа
        this.clampTargetScroll();
        
        this.lastWheelTime = currentTime;
        this.isInertiaScrolling = true;
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
    }
    
    handleTouchMove(e) {
        if (this.isLocked) return;
        
        e.preventDefault();
        
        const touchY = e.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;
        const deltaTime = Date.now() - this.touchStartTime;
        
        // Вычисляем скорость для инерции
        this.touchVelocity = deltaY / deltaTime;
        
        this.targetScrollY += deltaY * this.touchMultiplier;
        this.clampTargetScroll();
        
        this.touchStartY = touchY;
        this.touchStartTime = Date.now();
    }
    
    handleKeyDown(e) {
        if (this.isLocked) return;
        
        let scrollAmount = 0;
        
        switch(e.key) {
            case 'ArrowDown':
                scrollAmount = this.keyboardMultiplier;
                break;
            case 'ArrowUp':
                scrollAmount = -this.keyboardMultiplier;
                break;
            case 'PageDown':
                scrollAmount = window.innerHeight * 0.8;
                break;
            case 'PageUp':
                scrollAmount = -window.innerHeight * 0.8;
                break;
            case 'Home':
                this.targetScrollY = 0;
                e.preventDefault();
                return;
            case 'End':
                this.targetScrollY = document.documentElement.scrollHeight - window.innerHeight;
                e.preventDefault();
                return;
        }
        
        if (scrollAmount !== 0) {
            e.preventDefault();
            this.targetScrollY += scrollAmount;
            this.clampTargetScroll();
        }
    }
    
    clampTargetScroll() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, maxScroll));
    }
    
    startScrollLoop() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            // Вычисляем разность между целевой и текущей позицией
            const diff = this.targetScrollY - this.currentScrollY;
            
            // Отладочная информация
            if (this.debugMode && frameCount % 30 === 0) {
                console.log(`Scroll Debug: diff=${diff.toFixed(2)}, current=${this.currentScrollY.toFixed(2)}, target=${this.targetScrollY.toFixed(2)}, velocity=${this.velocity.toFixed(2)}, ease=${this.ease}`);
            }
            frameCount++;
            
            // Применяем инерцию если есть накопленная скорость
            if (Math.abs(this.velocity) > this.minVelocity) {
                // Применяем скорость к целевой позиции
                this.targetScrollY += this.velocity;
                this.clampTargetScroll();
                
                // Применяем трение для замедления
                this.velocity *= this.friction;
                
                // Если скорость стала очень маленькой, останавливаем инерцию
                if (Math.abs(this.velocity) < this.minVelocity) {
                    this.velocity = 0;
                    this.isInertiaScrolling = false;
                }
            }
            
            // Если разность очень маленькая и нет инерции, останавливаем анимацию
            if (Math.abs(diff) < 0.1 && !this.isInertiaScrolling) {
                this.currentScrollY = this.targetScrollY;
                this.isScrolling = false;
                window.scrollTo(0, this.currentScrollY);
                this.rafId = requestAnimationFrame(animate);
                return;
            }
            
            // Применяем плавность (linear interpolation)
            this.currentScrollY += diff * this.ease;
            this.isScrolling = true;
            
            // Применяем скролл
            window.scrollTo(0, this.currentScrollY);
            
            // Обновляем вращение иконки если функция доступна
            if (this.rotateIcon) {
                this.rotateIcon();
            }
            
            // Продолжаем анимацию
            this.rafId = requestAnimationFrame(animate);
        };
        
        animate(performance.now());
    }
    
    initCustomScroll() {
        // Синхронизируем при изменении размера окна
        window.addEventListener('resize', () => {
            this.clampTargetScroll();
        });
        
        // Отключаем все конфликтующие обработчики скролла
        this.disableConflictingScrollHandlers();
    }
    
    disableConflictingScrollHandlers() {
        // Создаем новую функцию-заглушку для rotateCenterIcon
        const originalRotateCenterIcon = window.rotateCenterIcon;
        window.rotateCenterIcon = () => {
            if (originalRotateCenterIcon) {
                // Получаем текущую позицию из нашего кастомного скролла
                const centerIcon = document.querySelector('.center-icon');
                if (centerIcon) {
                    const rotationAngle = this.currentScrollY * 0.5;
                    centerIcon.style.transform = `rotate(${rotationAngle}deg)`;
                }
            }
        };
        
        // Вызываем функцию вращения иконки в нашем цикле анимации
        this.rotateIcon = () => {
            window.rotateCenterIcon();
        };
    }
    
    initNavigationScroll() {
        document.querySelectorAll('.nav-link, .menu-nav-link, a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    this.smoothScrollToElement(targetSection);
                }
            });
        });
    }
    
    smoothScrollToElement(targetElement, offset = 80) {
        const targetPosition = targetElement.offsetTop - offset;
        this.smoothScrollTo(targetPosition);
    }
    
    smoothScrollTo(targetPosition) {
        // Вычисляем расстояние для адаптивной скорости
        const distance = Math.abs(targetPosition - this.currentScrollY);
        
        // Временно настраиваем плавность в зависимости от расстояния
        const originalEase = this.ease;
        if (distance > window.innerHeight * 2) {
            this.ease = 0.08; // Быстрее для больших расстояний
        } else if (distance > window.innerHeight) {
            this.ease = 0.06; // Средняя скорость
        } else {
            this.ease = 0.04; // Медленнее для коротких расстояний
        }
        
        this.targetScrollY = targetPosition;
        this.clampTargetScroll();
        
        // Возвращаем исходную плавность через адаптивное время
        const restoreTime = Math.min(2000, distance / 2);
        setTimeout(() => {
            this.ease = originalEase;
        }, restoreTime);
    }
    
    // Методы для внешнего управления
    lock() {
        this.isLocked = true;
    }
    
    unlock() {
        this.isLocked = false;
    }
    
    // Метод для получения текущего состояния (для отладки)
    getStatus() {
        return {
            isScrolling: this.isScrolling,
            isLocked: this.isLocked,
            currentScrollY: Math.round(this.currentScrollY),
            targetScrollY: Math.round(this.targetScrollY),
            ease: this.ease.toFixed(3),
            diff: Math.round(this.targetScrollY - this.currentScrollY),
            wheelMultiplier: this.wheelMultiplier,
            touchMultiplier: this.touchMultiplier,
            keyboardMultiplier: this.keyboardMultiplier
        };
    }
    
    // Методы для настройки параметров на лету (для отладки)
    setEase(value) {
        this.ease = Math.max(0.01, Math.min(0.3, value));
        console.log(`Ease установлен на: ${this.ease}`);
    }
    
    setWheelMultiplier(value) {
        this.wheelMultiplier = Math.max(0.1, Math.min(10, value));
        console.log(`Wheel multiplier установлен на: ${this.wheelMultiplier}`);
    }
    
    setTouchMultiplier(value) {
        this.touchMultiplier = Math.max(0.1, Math.min(10, value));
        console.log(`Touch multiplier установлен на: ${this.touchMultiplier}`);
    }
    
    // Методы для настройки инерции
    setFriction(value) {
        this.friction = Math.max(0.8, Math.min(0.99, value));
        console.log(`Friction установлен на: ${this.friction} (чем больше - тем дольше инерция)`);
    }
    
    setMaxVelocity(value) {
        this.maxVelocity = Math.max(1, Math.min(50, value));
        console.log(`Max velocity установлен на: ${this.maxVelocity}`);
    }
    
    // Включить/выключить отладочные логи
    enableDebug() {
        this.debugMode = true;
        console.log('Debug mode включен');
    }
    
    disableDebug() {
        this.debugMode = false;
        console.log('Debug mode выключен');
    }
    
    scrollToTop() {
        this.smoothScrollTo(0);
    }
    
    scrollToBottom() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.smoothScrollTo(maxScroll);
    }
    
    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Восстанавливаем нативный скролл
        document.documentElement.style.scrollBehavior = '';
        document.body.style.scrollBehavior = '';
    }
}

// Инициализируем продвинутый плавный скролл
let advancedSmoothScrollInstance;

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за элементами для анимации
document.querySelectorAll('.hero-content, .bottom-left, .bottom-center, .bottom-right').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Интерактивность для CTA кнопки
document.querySelector('.cta-button').addEventListener('click', function() {
    // Здесь можно добавить логику для открытия формы или модального окна
    console.log('CTA button clicked');
});

// Адаптивное меню для мобильных устройств
function initMobileMenu() {
    const navigation = document.querySelector('.navigation');
    const header = document.querySelector('.header');
    
    if (window.innerWidth <= 768) {
        // Добавляем класс для мобильного меню
        header.classList.add('mobile-layout');
    } else {
        header.classList.remove('mobile-layout');
    }
}

// Инициализация мобильного меню
initMobileMenu();
window.addEventListener('resize', initMobileMenu);

// Дополнительные стили для мобильного меню
const mobileStyles = `
    .mobile-layout .navigation {
        flex-direction: column;
        gap: 15px;
    }
    
    .mobile-layout .header-right {
        margin-top: 15px;
    }
`;

// Добавляем стили для мобильного меню
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet); 

// Оптимизированный параллакс эффект - движение отключено, но вращение остается
let ticking = false;

function updateParallax() {
    // Движение элементов отключено - они остаются на месте
    ticking = false;
}

// Кастомный скролл полностью отключен - используем нативный браузерный скролл
// Это самый надежный и быстрый способ

// Вращение центральной иконки синхронно со скроллом - ВКЛЮЧЕНО
function rotateCenterIcon() {
    const centerIcon = document.querySelector('.center-icon');
    if (!centerIcon) return;
    
    // Получаем текущую позицию скролла
    const scrollY = window.pageYOffset;
    
    // Вычисляем угол поворота (1 пиксель скролла = 0.5 градуса поворота)
    const rotationAngle = scrollY * 0.5;
    
    // Применяем только вращение, без движения
    centerIcon.style.transform = `rotate(${rotationAngle}deg)`;
}

// Слушаем событие скролла для вращения иконки
window.addEventListener('scroll', rotateCenterIcon, { passive: true });

// Инициализируем при загрузке
document.addEventListener('DOMContentLoaded', rotateCenterIcon);

// Инертный скролл
let isScrolling = false;
let scrollTimeout;

window.addEventListener('scroll', function() {
    isScrolling = true;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        isScrolling = false;
    }, 150);
    
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
    
    if (!fullscreenTicking) {
        requestAnimationFrame(updateFullscreen);
        fullscreenTicking = true;
    }
}, { passive: true });

// Старый код плавного скролла заменен на новый класс SmoothScroll выше

// ========== МОБИЛЬНАЯ АДАПТИВНОСТЬ И TOUCH ВЗАИМОДЕЙСТВИЯ ==========

// Детекция мобильного устройства
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Touch взаимодействия
class TouchInteractions {
    constructor() {
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.init();
    }
    
    init() {
        // Предотвращаем зум при двойном тапе
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (this.lastTouchEnd && (now - this.lastTouchEnd) <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);
        
        // Улучшенный скролл для мобильных
        if (isMobileDevice()) {
            this.initMobileScroll();
            this.initSwipeGestures();
            this.initTouchFeedback();
        }
    }
    
    initMobileScroll() {
        // Плавный скролл для iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Улучшенный плавный скролл для мобильных
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Предотвращаем bounce эффект
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchDiff = this.touchStartY - touchY;
            
            if (window.scrollY === 0 && touchDiff < 0) {
                e.preventDefault();
            } else if (window.scrollY >= document.body.scrollHeight - window.innerHeight && touchDiff > 0) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Добавляем инерционный скролл для мобильных
        this.initMobileInertialScroll();
    }
    
    initMobileInertialScroll() {
        let lastTouchY = 0;
        let touchVelocity = 0;
        let isTouching = false;
        
        document.addEventListener('touchstart', (e) => {
            isTouching = true;
            lastTouchY = e.touches[0].clientY;
            touchVelocity = 0;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isTouching) return;
            
            const currentTouchY = e.touches[0].clientY;
            const deltaY = lastTouchY - currentTouchY;
            touchVelocity = deltaY;
            lastTouchY = currentTouchY;
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!isTouching) return;
            isTouching = false;
            
            // Добавляем инерцию после окончания касания
            if (Math.abs(touchVelocity) > 5) {
                this.addMobileMomentum(touchVelocity);
            }
        }, { passive: true });
    }
    
    addMobileMomentum(velocity) {
        const momentum = velocity * 0.3; // Усиленная инерция для мобильных
        const currentScroll = window.pageYOffset;
        const targetScroll = currentScroll + momentum;
        
        // Ограничиваем инерцию
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const finalScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        if (Math.abs(finalScroll - currentScroll) > 2) {
            window.scrollTo({
                top: finalScroll,
                behavior: 'smooth'
            });
        }
    }
    
    initSwipeGestures() {
        // Свайп для слайдера отзывов
        const testimonialCard = document.querySelector('.testimonial-card');
        if (testimonialCard) {
            let startX = 0;
            let startY = 0;
            
            testimonialCard.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: true });
            
            testimonialCard.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Проверяем, что это горизонтальный свайп
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0 && testimonialsSliderInstance) {
                        // Свайп влево - следующий слайд
                        testimonialsSliderInstance.nextSlide();
                    } else if (diffX < 0 && testimonialsSliderInstance) {
                        // Свайп вправо - предыдущий слайд
                        testimonialsSliderInstance.previousSlide();
                    }
                }
            }, { passive: true });
        }
    }
    
    initTouchFeedback() {
        // Добавляем тактильную обратную связь для кнопок
        const buttons = document.querySelectorAll('button, .radius-btn, .submit-button, .service-block-item-1, .service-block-item-2, .service-block-item-3');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                // Вибрация только после первого взаимодействия пользователя
                if (navigator.vibrate && document.body.classList.contains('user-interacted')) {
                    try {
                        navigator.vibrate(10);
                    } catch (e) {
                        // Игнорируем ошибки вибрации
                    }
                }
                
                // Визуальная обратная связь
                button.style.transform = 'scale(0.98)';
                button.style.opacity = '0.9';
            }, { passive: true });
            
            button.addEventListener('touchend', () => {
                // Возвращаем исходное состояние
                setTimeout(() => {
                    button.style.transform = '';
                    button.style.opacity = '';
                }, 150);
            }, { passive: true });
        });
    }
}

// Оптимизация производительности для мобильных
class MobilePerformance {
    constructor() {
        this.init();
    }
    
    init() {
        if (isMobileDevice()) {
            this.optimizeAnimations();
            this.optimizeImages();
            this.optimizeScrolling();
        }
    }
    
    optimizeAnimations() {
        // Уменьшаем сложность анимаций на мобильных
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                * {
                    animation-duration: 0.2s !important;
                    transition-duration: 0.2s !important;
                }
                
                .center-icon {
                    will-change: transform;
                    transform: translateZ(0);
                }
                
                .stat-item, .testimonial-card, .service-block-item-1,
                .service-block-item-2, .service-block-item-3 {
                    will-change: transform;
                    transform: translateZ(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    optimizeImages() {
        // Ленивая загрузка изображений
        const images = document.querySelectorAll('img');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
    
    optimizeScrolling() {
        // Пассивные слушатели для лучшей производительности скролла
        let ticking = false;
        
        function updateScrollElements() {
            // Минимальные обновления при скролле
            rotateCenterIcon();
            ticking = false;
        }
        
        // Оптимизированный обработчик скролла с throttling
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollElements);
                ticking = true;
            }
        }, { passive: true });
        
        // Добавляем CSS для оптимизации производительности
        this.addScrollOptimizationCSS();
    }
    
    addScrollOptimizationCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Оптимизация производительности скролла */
            * {
                will-change: auto;
            }
            
            .center-icon, .hero-section, .about-section, 
            .testimonials-section, .services-section, .form-section {
                will-change: transform;
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
            
            /* Улучшенный плавный скролл для мобильных */
            @media (max-width: 768px) {
                html {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                
                body {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }
            }
            
            /* Оптимизация для высокочастотных обновлений */
            .parallax-element {
                will-change: transform;
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
    }
}

// Адаптивная навигация
class AdaptiveNavigation {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }
    
    init() {
        if (isMobileDevice()) {
            this.setupMobileMenu();
            this.setupTouchNavigation();
        }
    }
    
    setupMobileMenu() {
        const header = document.querySelector('.header');
        const burgerMenu = document.querySelector('.burger-menu');
        
        if (header && burgerMenu) {
            // Делаем навигацию sticky на мобильных
            header.style.position = 'fixed';
            header.style.top = '0';
            header.style.left = '0';
            header.style.right = '0';
            header.style.zIndex = '1001';
            header.style.background = 'rgba(239, 233, 220, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            
            // Улучшенная анимация бургер-меню
            burgerMenu.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (navigator.vibrate && document.body.classList.contains('user-interacted')) {
                    try {
                        navigator.vibrate(5);
                    } catch (e) {
                        // Игнорируем ошибки вибрации
                    }
                }
            });
        }
    }
    
    setupTouchNavigation() {
        // Улучшенное полноэкранное меню для мобильных
        const fullscreenMenu = document.querySelector('.fullscreen-menu');
        if (fullscreenMenu) {
            // Предотвращаем скролл фона при открытом меню
            const menuToggle = (isOpen) => {
                if (isOpen) {
                    document.body.classList.add('menu-open');
                } else {
                    document.body.classList.remove('menu-open');
                }
            };
            
            // Интеграция с существующим меню
            if (fullscreenMenuInstance) {
                const originalOpen = fullscreenMenuInstance.open.bind(fullscreenMenuInstance);
                const originalClose = fullscreenMenuInstance.close.bind(fullscreenMenuInstance);
                
                fullscreenMenuInstance.open = function() {
                    originalOpen();
                    menuToggle(true);
                };
                
                fullscreenMenuInstance.close = function() {
                    originalClose();
                    menuToggle(false);
                };
            }
        }
    }
}

// Медитативные анимации для полноэкранной секции
let fullscreenTicking = false;

function updateFullscreen() {
    const scrolled = window.pageYOffset;
    const fullscreenSection = document.querySelector('.fullscreen-section');
    const fullscreenCenterImage = document.querySelector('.fullscreen-center-image');
    const fullscreenContent = document.querySelector('.fullscreen-content');
    
    if (fullscreenSection) {
        const sectionTop = fullscreenSection.offsetTop;
        const sectionHeight = fullscreenSection.offsetHeight;
        const progress = (scrolled - sectionTop + window.innerHeight) / (sectionHeight + window.innerHeight);
        
        // Плавное появление центральной иконки
        if (fullscreenCenterImage && progress > 0.2) {
            fullscreenCenterImage.style.opacity = Math.min(1, (progress - 0.2) * 2);
        }
        
        // Плавное появление контента
        if (fullscreenContent && progress > 0.5) {
            fullscreenContent.style.opacity = Math.min(1, (progress - 0.5) * 2);
            fullscreenContent.style.transform = `translateX(-50%) translateY(${Math.max(0, (progress - 0.5) * 50)}px)`;
        }
    }
    fullscreenTicking = false;
} 

// Pixel-level инверсия теперь работает через CSS mix-blend-mode
// JavaScript больше не нужен - CSS автоматически инвертирует части букв

// Простые интерактивные эффекты
function enhanceNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// ========== УМНАЯ НАВИГАЦИЯ ПРИ СКРОЛЛЕ ==========

// Управление видимостью навигации при скролле
class SmartNavigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollTop = 0;
        this.scrollThreshold = 5; // Минимальное изменение скролла для реакции
        this.hideTimeout = null;
        
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        // Изначально навигация видима
        this.header.classList.add('visible');
        
        // Обработчик скролла с throttling для производительности
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
    
    handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Игнорируем очень маленькие изменения скролла
        if (Math.abs(currentScrollTop - this.lastScrollTop) < this.scrollThreshold) {
            return;
        }
        
        // Всегда показываем навигацию в самом верху страницы
        if (currentScrollTop <= 50) {
            this.showNavigation();
        }
        // Скрываем при скролле вниз
        else if (currentScrollTop > this.lastScrollTop && currentScrollTop > 100) {
            this.hideNavigation();
        }
        // Показываем при скролле вверх
        else if (currentScrollTop < this.lastScrollTop) {
            this.showNavigation();
        }
        
        this.lastScrollTop = currentScrollTop;
    }
    
    hideNavigation() {
        if (this.header.classList.contains('visible')) {
            this.header.classList.remove('visible');
            this.header.classList.add('hidden');
        }
    }
    
    showNavigation() {
        if (this.header.classList.contains('hidden')) {
            this.header.classList.remove('hidden');
            this.header.classList.add('visible');
        }
    }
    
    // Принудительно показать навигацию (например, при открытии меню)
    forceShow() {
        this.showNavigation();
    }
}

// ========== АНИМАЦИЯ СЧЕТЧИКОВ СТАТИСТИКИ ==========

// Функция анимации счетчика
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для плавности
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        // Обновляем текст, сохраняя процентный знак если есть
        const percentSpan = element.querySelector('.percent');
        if (percentSpan) {
            element.childNodes[0].textContent = current;
        } else {
            element.textContent = current;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Инициализация счетчиков статистики
function initStatisticsCounters() {
    const statisticsSection = document.querySelector('.statistics-section');
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statisticsSection || statNumbers.length === 0) return;
    
    // Intersection Observer для запуска анимации при появлении в viewport
    const statisticsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Запускаем анимацию всех счетчиков
                statNumbers.forEach((statNumber, index) => {
                    // Добавляем класс для CSS анимации появления
                    setTimeout(() => {
                        statNumber.classList.add('animated');
                        
                        // Извлекаем число из текста
                        const textContent = statNumber.childNodes[0].textContent || statNumber.textContent;
                        const targetNumber = parseInt(textContent);
                        
                        if (!isNaN(targetNumber)) {
                            // Запускаем анимацию счетчика с задержкой
                            setTimeout(() => {
                                animateCounter(statNumber, targetNumber, 2000);
                            }, 300);
                        }
                    }, index * 200); // Задержка между элементами
                });
                
                // Отключаем наблюдение после запуска анимации
                statisticsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });
    
    // Начинаем наблюдение за секцией статистики
    statisticsObserver.observe(statisticsSection);
}

// ========== ПОЛНОЭКРАННОЕ МЕНЮ ==========

// Управление полноэкранным меню
class FullscreenMenu {
    constructor(smartNavigation) {
        // Проверяем, что мы на десктопе
        console.log('FullscreenMenu constructor called, window width:', window.innerWidth);
        if (window.innerWidth <= 768) {
            console.log('FullscreenMenu: Skipping initialization on mobile device');
            return;
        }
        
        this.menu = document.getElementById('fullscreenMenu');
        this.burgerButton = document.getElementById('burgerMenu');
        this.closeButton = document.getElementById('menuClose');
        this.overlay = document.querySelector('.fullscreen-menu-overlay');
        this.smartNavigation = smartNavigation; // Ссылка на умную навигацию
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Отладка - проверяем что элементы найдены
        console.log('FullscreenMenu init:', {
            menu: this.menu,
            burgerButton: this.burgerButton,
            closeButton: this.closeButton,
            overlay: this.overlay
        });
        
        // Проверяем, что меню изначально скрыто
        if (this.menu) {
            console.log('Initial menu state:', {
                classes: this.menu.className,
                display: window.getComputedStyle(this.menu).display,
                visibility: window.getComputedStyle(this.menu).visibility,
                opacity: window.getComputedStyle(this.menu).opacity
            });
        }
        
        // Обработчики событий
        if (this.burgerButton) {
            this.burgerButton.addEventListener('click', (e) => {
                console.log('Burger clicked!');
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        } else {
            console.error('Burger button not found!');
        }
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Закрытие при клике на навигационные ссылки
        const menuNavLinks = document.querySelectorAll('.menu-nav-link');
        menuNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 200); // Небольшая задержка для красоты
            });
        });
    }
    
    open() {
        if (this.isOpen) return;
        
        console.log('Opening menu...');
        this.isOpen = true;
        this.menu.classList.add('active');
        this.burgerButton.classList.add('active');
        document.body.classList.add('menu-open'); // Блокируем скролл через CSS класс
        
        console.log('Menu opened:', {
            classes: this.menu.className,
            display: window.getComputedStyle(this.menu).display,
            visibility: window.getComputedStyle(this.menu).visibility,
            opacity: window.getComputedStyle(this.menu).opacity
        });
        
        // Принудительно показываем навигацию при открытии меню
        if (this.smartNavigation) {
            this.smartNavigation.forceShow();
        }
        
        // Анимация бургера в крестик
        this.animateBurgerToClose();
        
        // Запускаем анимации элементов меню
        this.animateMenuElements();
    }
    
    close() {
        if (!this.isOpen) return;
        
        console.log('Closing menu...');
        this.isOpen = false;
        this.menu.classList.remove('active');
        this.burgerButton.classList.remove('active');
        document.body.classList.remove('menu-open'); // Возвращаем скролл через CSS класс
        
        console.log('Menu closed:', {
            classes: this.menu.className,
            display: window.getComputedStyle(this.menu).display,
            visibility: window.getComputedStyle(this.menu).visibility,
            opacity: window.getComputedStyle(this.menu).opacity
        });
        
        // Анимация крестика обратно в бургер
        this.animateCloseToburger();
    }
    
    animateBurgerToClose() {
        // Анимация теперь управляется через CSS
        // Никаких inline стилей не требуется
    }
    
    animateCloseToburger() {
        // Анимация теперь управляется через CSS
        // Никаких inline стилей не требуется
    }
    
    animateMenuElements() {
        // Анимация теперь управляется полностью через CSS
        // Никаких дополнительных JS анимаций не требуется
    }
}

// Инициализация полноэкранного меню
let fullscreenMenuInstance;
let smartNavigationInstance;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded!');
    
    enhanceNavigation();
    
    // Создаем экземпляр умной навигации
    smartNavigationInstance = new SmartNavigation();
    
    // Создаем экземпляр полноэкранного меню с передачей умной навигации
    fullscreenMenuInstance = new FullscreenMenu(smartNavigationInstance);
    
    // Инициализируем счетчики статистики
    initStatisticsCounters();
    
    // Дополнительная инициализация для мобильных устройств
    initMobileMenu();
    
    // Дополнительная инициализация с задержкой для надежности
    setTimeout(initMobileMenu, 500);
    setTimeout(initMobileMenu, 1000);
    
    // Принудительно показываем мобильную кнопку при загрузке DOM
    setTimeout(function() {
        const mobileButton = document.querySelector('.mobile-cta-button');
        if (mobileButton && window.innerWidth <= 768) {
            console.log('Forcing mobile button visibility on DOM load...');
            mobileButton.style.setProperty('display', 'flex', 'important');
            mobileButton.style.setProperty('visibility', 'visible', 'important');
            mobileButton.style.setProperty('opacity', '1', 'important');
            mobileButton.style.setProperty('position', 'relative', 'important');
            mobileButton.style.setProperty('z-index', '1000', 'important');
            mobileButton.style.setProperty('justify-content', 'center', 'important');
            mobileButton.style.setProperty('align-items', 'center', 'important');
            mobileButton.style.setProperty('width', 'auto', 'important');
            mobileButton.style.setProperty('max-width', 'none', 'important');
            mobileButton.style.setProperty('margin', '20px 0 0 0', 'important');
            mobileButton.style.setProperty('padding', '0', 'important');
            mobileButton.style.setProperty('box-sizing', 'border-box', 'important');
            mobileButton.style.setProperty('flex-direction', 'row', 'important');
            mobileButton.style.setProperty('flex-wrap', 'nowrap', 'important');
            mobileButton.style.setProperty('flex-shrink', '0', 'important');
            mobileButton.style.setProperty('flex-grow', '0', 'important');
            mobileButton.style.setProperty('flex-basis', 'auto', 'important');
            console.log('Mobile button forced on DOM load!');
        }
    }, 100);
});

// Функция инициализации мобильного меню
function initMobileMenu() {
    console.log('Initializing mobile menu... Window width:', window.innerWidth);
    
    // Проверяем, что мы действительно на мобильном
    if (window.innerWidth > 768) {
        console.log('Not mobile device, skipping mobile menu initialization');
        return;
    }
    
    const burgerButton = document.getElementById('burgerMenu');
    const menu = document.getElementById('fullscreenMenu');
    const closeButton = document.getElementById('menuClose');
    
    console.log('Mobile menu elements:', { burgerButton, menu, closeButton });
    
    if (burgerButton && menu) {
        // Принудительно удаляем ВСЕ обработчики
        const newBurgerButton = burgerButton.cloneNode(true);
        burgerButton.parentNode.replaceChild(newBurgerButton, burgerButton);
        
        // Добавляем новый обработчик
        newBurgerButton.addEventListener('click', mobileMenuHandler);
        
        console.log('Mobile burger handler added (replaced element)');
    }
    
    if (closeButton && menu) {
        // Удаляем старые обработчики если есть
        closeButton.removeEventListener('click', mobileCloseHandler);
        
        // Добавляем новый обработчик
        closeButton.addEventListener('click', mobileCloseHandler);
        
        console.log('Mobile close handler added');
    }
}

// Обработчик для мобильного бургер-меню
function mobileMenuHandler(e) {
    console.log('Mobile burger clicked! Window width:', window.innerWidth);
    e.preventDefault();
    e.stopPropagation();
    
    const menu = document.getElementById('fullscreenMenu');
    const burgerButton = document.getElementById('burgerMenu');
    
    if (menu && burgerButton) {
        if (menu.classList.contains('active')) {
            console.log('Closing mobile menu...');
            menu.classList.remove('active');
            burgerButton.classList.remove('active');
            document.body.classList.remove('menu-open');
            console.log('Menu classes after closing:', menu.className);
        } else {
            console.log('Opening mobile menu...');
            menu.classList.add('active');
            burgerButton.classList.add('active');
            document.body.classList.add('menu-open');
            console.log('Menu classes after opening:', menu.className);
            console.log('Menu computed styles:', {
                display: window.getComputedStyle(menu).display,
                visibility: window.getComputedStyle(menu).visibility,
                opacity: window.getComputedStyle(menu).opacity,
                zIndex: window.getComputedStyle(menu).zIndex
            });
        }
    }
}

// Обработчик для мобильной кнопки закрытия
function mobileCloseHandler(e) {
    console.log('Mobile close clicked!');
    e.preventDefault();
    e.stopPropagation();
    
    const menu = document.getElementById('fullscreenMenu');
    const burgerButton = document.getElementById('burgerMenu');
    
    if (menu && burgerButton) {
        menu.classList.remove('active');
        burgerButton.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
    console.log('Window resized, reinitializing mobile menu...');
    
    // Если переключились на мобильный режим
    if (window.innerWidth <= 768) {
        // Уничтожаем десктопный экземпляр если есть
        if (fullscreenMenuInstance) {
            console.log('Destroying desktop menu instance for mobile');
            fullscreenMenuInstance = null;
        }
        // Инициализируем мобильное меню
        setTimeout(initMobileMenu, 100);
        
        // Принудительно показываем мобильную кнопку
        setTimeout(function() {
            const mobileButton = document.querySelector('.mobile-cta-button');
            if (mobileButton) {
                console.log('Forcing mobile button visibility on resize...');
                mobileButton.style.setProperty('display', 'flex', 'important');
                mobileButton.style.setProperty('visibility', 'visible', 'important');
                mobileButton.style.setProperty('opacity', '1', 'important');
            }
        }, 200);
    } else {
        // Если переключились на десктопный режим
        console.log('Switching to desktop mode');
        // Создаем десктопный экземпляр
        if (!fullscreenMenuInstance && smartNavigationInstance) {
            fullscreenMenuInstance = new FullscreenMenu(smartNavigationInstance);
        }
        
        // Скрываем мобильную кнопку на десктопе
        const mobileButton = document.querySelector('.mobile-cta-button');
        if (mobileButton) {
            mobileButton.style.setProperty('display', 'none', 'important');
        }
    }
});

// Обработчик полной загрузки страницы
window.addEventListener('load', function() {
    console.log('Page fully loaded, final mobile menu initialization...');
    setTimeout(initMobileMenu, 200);
    
    // Принудительно показываем мобильную кнопку при загрузке
    setTimeout(function() {
        const mobileButton = document.querySelector('.mobile-cta-button');
        if (mobileButton && window.innerWidth <= 768) {
            console.log('Forcing mobile button visibility on load...');
            mobileButton.style.setProperty('display', 'flex', 'important');
            mobileButton.style.setProperty('visibility', 'visible', 'important');
            mobileButton.style.setProperty('opacity', '1', 'important');
            mobileButton.style.setProperty('position', 'relative', 'important');
            mobileButton.style.setProperty('z-index', '1000', 'important');
            mobileButton.style.setProperty('justify-content', 'center', 'important');
            mobileButton.style.setProperty('align-items', 'center', 'important');
            mobileButton.style.setProperty('width', 'auto', 'important');
            mobileButton.style.setProperty('max-width', 'none', 'important');
            mobileButton.style.setProperty('margin', '20px 0 0 0', 'important');
            mobileButton.style.setProperty('padding', '0', 'important');
            mobileButton.style.setProperty('box-sizing', 'border-box', 'important');
            mobileButton.style.setProperty('flex-direction', 'row', 'important');
            mobileButton.style.setProperty('flex-wrap', 'nowrap', 'important');
            mobileButton.style.setProperty('flex-shrink', '0', 'important');
            mobileButton.style.setProperty('flex-grow', '0', 'important');
            mobileButton.style.setProperty('flex-basis', 'auto', 'important');
            console.log('Mobile button forced on load!');
        }
    }, 100);
    
    // Проверяем мобильную кнопку
    setTimeout(function() {
        const mobileButton = document.querySelector('.mobile-cta-button');
        console.log('Mobile button check:', mobileButton);
        
        if (!mobileButton) {
            console.log('Mobile button not found, creating it...');
            const bottomBlock = document.querySelector('.bottom-block');
            if (bottomBlock) {
                const newButton = document.createElement('div');
                newButton.className = 'mobile-cta-button';
                newButton.innerHTML = `
                    <div class="radius-btn">
                        <span class="mobile-btn-text">Начать работать</span>
                    </div>
                `;
                bottomBlock.appendChild(newButton);
                console.log('Mobile button created!');
            }
        } else {
            console.log('Mobile button found, checking styles...');
            const computedStyle = window.getComputedStyle(mobileButton);
            console.log('Mobile button computed styles:', {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity,
                position: computedStyle.position,
                zIndex: computedStyle.zIndex
            });
            
            // Принудительно показываем кнопку на мобильных
            if (window.innerWidth <= 768) {
                console.log('Forcing mobile button visibility...');
                mobileButton.style.setProperty('display', 'flex', 'important');
                mobileButton.style.setProperty('visibility', 'visible', 'important');
                mobileButton.style.setProperty('opacity', '1', 'important');
                mobileButton.style.setProperty('position', 'relative', 'important');
                mobileButton.style.setProperty('z-index', '1000', 'important');
                mobileButton.style.setProperty('justify-content', 'center', 'important');
                mobileButton.style.setProperty('align-items', 'center', 'important');
                mobileButton.style.setProperty('width', 'auto', 'important');
                mobileButton.style.setProperty('max-width', 'none', 'important');
                mobileButton.style.setProperty('margin', '20px 0 0 0', 'important');
                mobileButton.style.setProperty('padding', '0', 'important');
                mobileButton.style.setProperty('box-sizing', 'border-box', 'important');
                mobileButton.style.setProperty('flex-direction', 'row', 'important');
                mobileButton.style.setProperty('flex-wrap', 'nowrap', 'important');
                mobileButton.style.setProperty('flex-shrink', '0', 'important');
                mobileButton.style.setProperty('flex-grow', '0', 'important');
                mobileButton.style.setProperty('flex-basis', 'auto', 'important');
                console.log('Mobile button styles forced!');
                
                // Проверяем результат
                setTimeout(() => {
                    const computedStyle = window.getComputedStyle(mobileButton);
                    console.log('Mobile button after forcing:', {
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex,
                        justifyContent: computedStyle.justifyContent,
                        alignItems: computedStyle.alignItems
                    });
                }, 100);
            }
        }
    }, 500);
});

// ========== СЛАЙДЕР ОТЗЫВОВ ==========

// Класс для управления слайдером отзывов
class TestimonialsSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 6; // Общее количество отзывов
        this.prevBtn = document.querySelector('.nav-prev');
        this.nextBtn = document.querySelector('.nav-next');
        this.pageCurrentElement = document.querySelector('.page-current');
        this.pageTotalElement = document.querySelector('.page-total');
        
        // Данные отзывов
        this.testimonials = [
            {
                name: "Швитанова",
                surname: "Луиза", 
                avatar: "images/christopher-campbell-rDEOVtE7vOs-unsplash.jpg",
                text: "Виталий предоставил очень профессиональную консультацию по моей проблеме. Разобрали все возможные варианты, обсудили дальнейший план действий. Подошел с душой, пояснил все непонятные мне моменты. Рекомендую его!"
            },
            {
                name: "Петров",
                surname: "Алексей",
                avatar: "images/juuu.jpg", 
                text: "Отличная юридическая поддержка в сложном корпоративном споре. Команда проработала все детали, предложила оптимальную стратегию. Результат превзошел ожидания - дело выиграли досрочно!"
            },
            {
                name: "Иванова", 
                surname: "Мария",
                avatar: "images/ma.jpg",
                text: "Семейные вопросы требуют деликатного подхода. Здесь я получила именно это - профессионализм с человеческим участием. Все прошло максимально корректно и быстро."
            },
            {
                name: "Сидоров",
                surname: "Дмитрий", 
                avatar: "images/seed.jpg",
                text: "Вопрос с недвижимостью решился в нашу пользу благодаря грамотной правовой позиции. Каждый этап был разъяснен, никаких неожиданностей. Рекомендую как надежных партнеров."
            },
            {
                name: "Козлова",
                surname: "Елена",
                avatar: "images/koz.jpg", 
                text: "Наследственное дело оказалось сложнее, чем казалось. Но профессиональный подход помог разобраться во всех нюансах и защитить интересы семьи. Спасибо за терпение и результат!"
            },
            {
                name: "Морозов",
                surname: "Игорь",
                avatar: "images/mor.jpg",
                text: "Трудовой спор с работодателем казался безнадежным. Но юристы нашли правильные аргументы и добились справедливого решения. Профессионализм на высшем уровне!"
            }
        ];
        
        this.init();
    }
    
    init() {
        if (!this.prevBtn || !this.nextBtn) return;
        
        // Устанавливаем общее количество слайдов
        if (this.pageTotalElement) {
            this.pageTotalElement.textContent = String(this.totalSlides).padStart(2, '0');
        }
        
        // Обработчики событий
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Обновляем отображение
        this.updateSlide();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlide();
    }
    
    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlide();
    }
    
    updateSlide() {
        const testimonial = this.testimonials[this.currentSlide];
        
        // Обновляем номер текущего слайда
        if (this.pageCurrentElement) {
            this.pageCurrentElement.textContent = String(this.currentSlide + 1).padStart(2, '0');
        }
        
        // Обновляем контент отзыва с анимацией
        const quoteElement = document.querySelector('.testimonial-quote');
        const nameElement = document.querySelector('.author-name');
        const surnameElement = document.querySelector('.author-surname');
        const avatarElement = document.querySelector('.avatar-image');
        
        if (quoteElement && nameElement && surnameElement && avatarElement) {
            // Добавляем класс для fade-out анимации
            const testimonialCard = document.querySelector('.testimonial-card');
            testimonialCard.style.opacity = '0.7';
            
            setTimeout(() => {
                // Обновляем контент
                quoteElement.textContent = testimonial.text;
                nameElement.textContent = testimonial.name;
                surnameElement.textContent = testimonial.surname;
                avatarElement.src = testimonial.avatar;
                avatarElement.alt = `${testimonial.name} ${testimonial.surname}`;
                
                // Возвращаем непрозрачность
                testimonialCard.style.opacity = '1';
            }, 200);
        }
    }
}

// Инициализация слайдера отзывов
let testimonialsSliderInstance;

// Обновляем основную инициализацию
document.addEventListener('DOMContentLoaded', function() {
    enhanceNavigation();
    
    // Создаем экземпляр умной навигации
    smartNavigationInstance = new SmartNavigation();
    
    // Создаем экземпляр полноэкранного меню с передачей умной навигации
    fullscreenMenuInstance = new FullscreenMenu(smartNavigationInstance);
    
    // Инициализируем счетчики статистики
    initStatisticsCounters();
    
    // Инициализируем слайдер отзывов
    testimonialsSliderInstance = new TestimonialsSlider();
    
    // Инициализируем кастомный курсор для карточек услуг
    initServiceCardsInteraction();
    
    // ========== МОБИЛЬНЫЕ УЛУЧШЕНИЯ ==========
    
    // Инициализируем мобильные взаимодействия
    if (isMobileDevice()) {
        new TouchInteractions();
        new MobilePerformance();
        new AdaptiveNavigation();
        
        // Добавляем класс для мобильных устройств
        document.body.classList.add('mobile-device');
        
        // Скрываем курсор на touch устройствах
        document.body.style.cursor = 'none';
        document.querySelectorAll('*').forEach(el => {
            el.style.cursor = 'none';
        });
        
        // Оптимизируем viewport для мобильных
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
    }
    
    // Адаптивные изображения
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Добавляем loading="lazy" для всех изображений
        img.setAttribute('loading', 'lazy');
        
        // Добавляем обработчик ошибок
        img.addEventListener('error', function() {
            this.style.display = 'none';
        });
    });
    
    // Оптимизация производительности
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        // Можно добавить service worker для кэширования
        console.log('Service Worker поддерживается');
    }
}); 

// ========== КАСТОМНЫЙ КУРСОР ДЛЯ КАРТОЧЕК УСЛУГ ==========

// Функция инициализации интерактивности карточек услуг
function initServiceCardsInteraction() {
    // Создаем кастомный курсор
    const customCursor = document.createElement('div');
    customCursor.className = 'custom-cursor';
    document.body.appendChild(customCursor);
    
    // Получаем все карточки услуг
    const serviceCards = document.querySelectorAll('.service-block-item-1, .service-block-item-2, .service-block-item-3');
    
    serviceCards.forEach((card, index) => {
        // Делаем карточку кликабельной
        card.style.cursor = 'none';
        
        // Добавляем обработчики событий мыши
        card.addEventListener('mouseenter', (e) => {
            customCursor.classList.add('active');
            updateCursorPosition(e);
        });
        
        card.addEventListener('mousemove', (e) => {
            updateCursorPosition(e);
        });
        
        card.addEventListener('mouseleave', () => {
            customCursor.classList.remove('active');
        });
        
        // Добавляем обработчик клика
        card.addEventListener('click', () => {
            // Определяем какая это карточка и перенаправляем на соответствующую страницу
            let serviceType;
            if (index === 0) serviceType = 'family-law';
            else if (index === 1) serviceType = 'auto-law';
            else if (index === 2) serviceType = 'corporate-law';
            redirectToServicePage(serviceType);
        });
        
        // Добавляем анимацию при клике
        card.addEventListener('mousedown', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        
        card.addEventListener('mouseup', () => {
            customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
    
    // Функция обновления позиции курсора
    function updateCursorPosition(e) {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    }
    
    // Функция перенаправления на страницу услуги
    function redirectToServicePage(serviceType) {
        // Добавляем анимацию перед переходом
        const card = event.currentTarget;
        card.style.transform = 'translateY(-2px) scale(0.98)';
        
        setTimeout(() => {
            // Реальные URL страниц услуг
            const serviceUrls = {
                'family-law': 'family-law.html',
                'auto-law': 'auto-law.html',
                'corporate-law': 'corporate-law.html'
            };
            
            const targetUrl = serviceUrls[serviceType];
            
            if (targetUrl) {
                // Переходим на страницу услуги
                window.location.href = targetUrl;
            } else {
                console.log(`Страница услуги не найдена: ${serviceType}`);
            }
        }, 150);
    }
}

// Функциональность для формы обратной связи
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Валидация и отправка формы
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = new FormData(this);
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // Простая валидация
            if (!firstName || !lastName || !phone || !message) {
                showNotification('Пожалуйста, заполните все поля', 'error');
                return;
            }
            
            // Валидация телефона (простая)
            const phoneRegex = /^\+7\s?\(\d{3}\)\s?-\s?\d{3}\s?-\s?\d{2}\s?-\s?\d{2}$/;
            if (!phoneRegex.test(phone)) {
                showNotification('Пожалуйста, введите корректный номер телефона', 'error');
                return;
            }
            
            // Имитация отправки формы
            showNotification('Отправляем вашу заявку...', 'info');
            
            // Здесь будет реальная отправка на сервер
            setTimeout(() => {
                showNotification('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
                contactForm.reset();
            }, 2000);
        });
        
        // Маска для телефона
        const phoneInput = contactForm.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value.length <= 1) {
                        value = '+7 (' + value;
                    } else if (value.length <= 4) {
                        value = '+7 (' + value.substring(1, 4);
                    } else if (value.length <= 7) {
                        value = '+7 (' + value.substring(1, 4) + ') - ' + value.substring(4, 7);
                    } else if (value.length <= 9) {
                        value = '+7 (' + value.substring(1, 4) + ') - ' + value.substring(4, 7) + ' - ' + value.substring(7, 9);
                    } else if (value.length <= 11) {
                        value = '+7 (' + value.substring(1, 4) + ') - ' + value.substring(4, 7) + ' - ' + value.substring(7, 9) + ' - ' + value.substring(9, 11);
                    }
                }
                
                e.target.value = value;
            });
        }
        
        // Анимация полей формы при фокусе
        const formFields = contactForm.querySelectorAll('.form-field input, .form-field textarea');
        formFields.forEach(field => {
            field.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            field.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }
});

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Добавляем стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Обработчик закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Добавляем CSS анимации для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
        padding: 0;
        line-height: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .notification-message {
        flex: 1;
    }
`;
document.head.appendChild(notificationStyles);

// ========== ФУНКЦИОНАЛЬНОСТЬ РАСШИРЕНИЯ УСЛУГ ==========

// Класс для управления расширением секции услуг
class ServicesExpansion {
    constructor() {
        this.toggleBtn = document.getElementById('toggleServicesBtn');
        this.additionalServices = document.getElementById('additionalServices');
        this.isExpanded = false;
        
        this.init();
    }
    
    init() {
        if (!this.toggleBtn || !this.additionalServices) {
            console.log('Services expansion elements not found');
            return;
        }
        
        // Обработчик клика на кнопку
        this.toggleBtn.addEventListener('click', () => {
            this.toggleServices();
        });
        
        // Добавляем интерактивность для дополнительных карточек
        this.initAdditionalCardsInteraction();
    }
    
    toggleServices() {
        if (this.isExpanded) {
            this.hideServices();
        } else {
            this.showServices();
        }
    }
    
    showServices() {
        // Показываем контейнер с дополнительными услугами
        this.additionalServices.style.display = 'grid';
        
        // Небольшая задержка для плавной анимации
        setTimeout(() => {
            this.additionalServices.classList.add('show');
        }, 50);
        
        // Обновляем кнопку
        this.toggleBtn.textContent = 'Скрыть услуги';
        this.toggleBtn.classList.add('expanded');
        
        this.isExpanded = true;
        
        // Инициализируем кастомный курсор для дополнительных карточек после их появления
        setTimeout(() => {
            this.initAdditionalCardsInteraction();
        }, 100);
        
        // Плавный скролл к дополнительным услугам только по запросу пользователя
        // Отключено авто-прокручивание при загрузке страницы
    }
    
    hideServices() {
        // Убираем класс для анимации скрытия
        this.additionalServices.classList.remove('show');
        
        // После завершения анимации скрываем контейнер
        setTimeout(() => {
            this.additionalServices.style.display = 'none';
        }, 600);
        
        // Обновляем кнопку
        this.toggleBtn.textContent = 'Посмотреть все услуги';
        this.toggleBtn.classList.remove('expanded');
        
        this.isExpanded = false;
    }
    
    initAdditionalCardsInteraction() {
        // Получаем все дополнительные карточки
        const additionalCards = this.additionalServices.querySelectorAll('.service-block-item-4, .service-block-item-5, .service-block-item-6');
        
        // Получаем существующий кастомный курсор
        const customCursor = document.querySelector('.custom-cursor');
        
        additionalCards.forEach((card, index) => {
            // Делаем карточку кликабельной
            card.style.cursor = 'none';
            
            // Добавляем обработчики событий мыши для кастомного курсора
            if (customCursor) {
                card.addEventListener('mouseenter', (e) => {
                    customCursor.classList.add('active');
                    this.updateCursorPosition(e, customCursor);
                });
                
                card.addEventListener('mousemove', (e) => {
                    this.updateCursorPosition(e, customCursor);
                });
                
                card.addEventListener('mouseleave', () => {
                    customCursor.classList.remove('active');
                });
            }
            
            // Обработчик клика для перехода на страницу услуги
            card.addEventListener('click', () => {
                this.handleServiceCardClick(card, index);
            });
            
            // Добавляем анимацию при клике (как у основных карточек)
            card.addEventListener('mousedown', () => {
                if (customCursor) {
                    customCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
                }
                card.style.transform = 'translateY(-2px) scale(0.98)';
            });
            
            card.addEventListener('mouseup', () => {
                if (customCursor) {
                    customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                card.style.transform = 'translateY(-2px) scale(1)';
            });
        });
    }
    
    // Функция обновления позиции курсора
    updateCursorPosition(e, customCursor) {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    }
    
    handleServiceCardClick(card, index) {
        // Определяем тип услуги по индексу
        const serviceTypes = ['real-estate', 'inheritance', 'labor-law'];
        const serviceUrls = ['real-estate.html', 'inheritance.html', 'labor-law.html'];
        
        const serviceType = serviceTypes[index];
        const targetUrl = serviceUrls[index];
        
        // Добавляем анимацию перед переходом
        card.style.transform = 'translateY(-2px) scale(0.95)';
        card.style.opacity = '0.8';
        
        setTimeout(() => {
            if (targetUrl) {
                // Переходим на страницу услуги
                window.location.href = targetUrl;
            } else {
                console.log(`Страница услуги не найдена: ${serviceType}`);
                // Возвращаем карточку в исходное состояние
                card.style.transform = 'translateY(-2px) scale(1)';
                card.style.opacity = '1';
            }
        }, 150);
    }
}

// Инициализация расширения услуг
let servicesExpansionInstance;

// Обновляем основную инициализацию
document.addEventListener('DOMContentLoaded', function() {
    enhanceNavigation();
    
    // Создаем экземпляр умной навигации
    smartNavigationInstance = new SmartNavigation();
    
    // Создаем экземпляр полноэкранного меню с передачей умной навигации
    fullscreenMenuInstance = new FullscreenMenu(smartNavigationInstance);
    
    // Инициализируем счетчики статистики
    initStatisticsCounters();
    
    // Инициализируем слайдер отзывов
    testimonialsSliderInstance = new TestimonialsSlider();
    
    // Инициализируем кастомный курсор для карточек услуг
    initServiceCardsInteraction();
    
    // Инициализируем расширение услуг
    servicesExpansionInstance = new ServicesExpansion();
    
    // Инициализируем продвинутый плавный скролл (только на десктопе)
    if (!isMobileDevice()) {
        // Небольшая задержка для корректной инициализации после прелоадера
        setTimeout(() => {
            // Настройки для плавного скролла с инерцией как на pleasecallmechamp.com
            advancedSmoothScrollInstance = new AdvancedSmoothScroll({
                ease: 0.08, // Плавный но отзывчивый скролл
                wheelMultiplier: 0.8, // Умеренная чувствительность колеса
                touchMultiplier: 1.2, // Умеренная отзывчивость на тач
                keyboardMultiplier: 60, // Комфортная скорость клавиатуры
                friction: 0.96, // Трение для инерции (0.9-0.98, чем больше - тем дольше инерция)
                maxVelocity: 12, // Максимальная скорость инерции
                minVelocity: 0.05 // Минимальная скорость для остановки
            });
            
            // Блокируем скролл если прелоадер еще активен
            const preloader = document.getElementById('preloader');
            if (preloader && window.getComputedStyle(preloader).display !== 'none') {
                advancedSmoothScrollInstance.lock();
            }
            
            // Делаем доступным глобально для отладки (можно убрать в продакшене)
            window.smoothScroll = advancedSmoothScrollInstance;
            
            // Выводим инструкции по отладке
            console.log('%c🎯 Smooth Scroll Debug Commands:', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            console.log('%cwindow.smoothScroll.getStatus()', 'color: #2196F3; font-family: monospace;', '- получить текущее состояние');
            console.log('%cwindow.smoothScroll.setEase(0.15)', 'color: #2196F3; font-family: monospace;', '- настроить плавность (0.01-0.3)');
            console.log('%cwindow.smoothScroll.setWheelMultiplier(3)', 'color: #2196F3; font-family: monospace;', '- настроить чувствительность колеса (0.1-10)');
            console.log('%cwindow.smoothScroll.setTouchMultiplier(4)', 'color: #2196F3; font-family: monospace;', '- настроить чувствительность тача (0.1-10)');
            console.log('%cwindow.smoothScroll.setFriction(0.98)', 'color: #9C27B0; font-family: monospace;', '- настроить инерцию (0.8-0.99, больше = дольше)');
            console.log('%cwindow.smoothScroll.setMaxVelocity(20)', 'color: #9C27B0; font-family: monospace;', '- настроить максимальную скорость (1-50)');
            console.log('%cwindow.smoothScroll.enableDebug()', 'color: #FF9800; font-family: monospace;', '- включить отладочные логи');
            console.log('%cwindow.smoothScroll.disableDebug()', 'color: #FF9800; font-family: monospace;', '- выключить отладочные логи');
        }, 100);
    }
    
    // ========== МОБИЛЬНЫЕ УЛУЧШЕНИЯ ==========
    
    // Инициализируем мобильные взаимодействия
    if (isMobileDevice()) {
        new TouchInteractions();
        new MobilePerformance();
        new AdaptiveNavigation();
        
        // Добавляем класс для мобильных устройств
        document.body.classList.add('mobile-device');
        
        // Скрываем курсор на touch устройствах
        document.body.style.cursor = 'none';
        document.querySelectorAll('*').forEach(el => {
            el.style.cursor = 'none';
        });
        
        // Оптимизируем viewport для мобильных
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
    }
    
    // Адаптивные изображения
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Добавляем loading="lazy" для всех изображений
        img.setAttribute('loading', 'lazy');
        
        // Добавляем обработчик ошибок
        img.addEventListener('error', function() {
            this.style.display = 'none';
        });
    });
    
    // Оптимизация производительности
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        // Можно добавить service worker для кэширования
        console.log('Service Worker поддерживается');
    }
});