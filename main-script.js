// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const progressText = document.getElementById('progressText');
    
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
                    }, 100);
                }, 500);
            }, 500);
        }
        
        progressText.textContent = Math.floor(progress) + '%';
    }, 100);
});

// Плавный скролл для навигации
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

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

// Плавный скролл для навигации с инерцией
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const targetPosition = targetSection.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000;
            let start = null;
            
            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }
            
            function easeInOutCubic(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }
            
            requestAnimationFrame(animation);
        }
    });
});

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
        this.menu = document.getElementById('fullscreenMenu');
        this.burgerButton = document.getElementById('burgerMenu');
        this.closeButton = document.getElementById('menuClose');
        this.overlay = document.querySelector('.fullscreen-menu-overlay');
        this.smartNavigation = smartNavigation; // Ссылка на умную навигацию
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Обработчики событий
        this.burgerButton.addEventListener('click', () => this.open());
        this.closeButton.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
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
        
        this.isOpen = true;
        this.menu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл
        
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
        
        this.isOpen = false;
        this.menu.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем скролл
        
        // Анимация крестика обратно в бургер
        this.animateCloseToburger();
    }
    
    animateBurgerToClose() {
        const burgerLines = this.burgerButton.querySelectorAll('.burger-line');
        burgerLines[0].style.transform = 'translate(-50%, -50%) rotate(45deg)';
        burgerLines[1].style.transform = 'translate(-50%, -50%) rotate(-45deg)';
    }
    
    animateCloseToburger() {
        const burgerLines = this.burgerButton.querySelectorAll('.burger-line');
        burgerLines[0].style.transform = 'translate(-50%, calc(-50% - 5px))';
        burgerLines[1].style.transform = 'translate(-50%, calc(-50% + 5px))';
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
    enhanceNavigation();
    
    // Создаем экземпляр умной навигации
    smartNavigationInstance = new SmartNavigation();
    
    // Создаем экземпляр полноэкранного меню с передачей умной навигации
    fullscreenMenuInstance = new FullscreenMenu(smartNavigationInstance);
    
    // Инициализируем счетчики статистики
    initStatisticsCounters();
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
}); 