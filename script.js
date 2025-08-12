document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    const progressText = document.getElementById('progressText');
    const content = document.getElementById('content');
    
    let progress = 0;
    let resourcesLoaded = 0;
    let totalResources = 0;
    let animationProgress = 0;
    let targetProgress = 0;
    let isAnimationComplete = false;
    let isResourcesComplete = false;
    let animationStarted = false;
    
    // Функция для обновления прогресса с анимацией
    function updateProgress() {
        progressText.textContent = Math.floor(animationProgress) + '%';
    }
    
    // Функция для плавной анимации счетчика
    function animateCounter() {
        // Плавно приближаемся к целевой позиции
        if (animationProgress < targetProgress) {
            const diff = targetProgress - animationProgress;
            const speed = Math.max(0.5, diff * 0.1); // Минимальная скорость 0.5, максимальная зависит от разницы
            animationProgress += speed;
            
            if (animationProgress > targetProgress) {
                animationProgress = targetProgress;
            }
        }
        
        updateProgress();
        
        // Продолжаем анимацию пока не достигнем 100% и все ресурсы не загружены
        if (animationProgress < 100 || !isResourcesComplete) {
            requestAnimationFrame(animateCounter);
        } else {
            // Анимация завершена и ресурсы загружены
            isAnimationComplete = true;
            setTimeout(completeLoading, 500);
        }
    }
    
    // Функция для подсчета всех ресурсов на странице
    function countResources() {
        const images = document.querySelectorAll('img');
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        const iframes = document.querySelectorAll('iframe[src]');
        const videos = document.querySelectorAll('video source');
        const audios = document.querySelectorAll('audio source');
        
        totalResources = images.length + scripts.length + links.length + 
                        iframes.length + videos.length + audios.length + 1; // +1 для самого DOM
        
        console.log(`Найдено ресурсов: ${totalResources}`);
        
        // Если ресурсов нет, считаем что загрузка завершена
        if (totalResources <= 1) {
            isResourcesComplete = true;
            targetProgress = 100;
            console.log('Ресурсов не найдено, помечаем как завершенные');
        }
        
        // Начинаем отслеживание загрузки ресурсов
        trackResourceLoading();
        
        // Запускаем анимацию счетчика только один раз
        if (!animationStarted) {
            animationStarted = true;
            requestAnimationFrame(animateCounter);
        }
    }
    
    // Функция для отслеживания загрузки ресурсов
    function trackResourceLoading() {
        // Отслеживаем загрузку изображений
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) {
                resourceLoaded();
            } else {
                img.addEventListener('load', resourceLoaded);
                img.addEventListener('error', resourceLoaded); // Считаем ошибки тоже как загруженные
            }
        });
        
        // Отслеживаем загрузку скриптов
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.complete || script.readyState === 'complete' || script.readyState === 'loaded') {
                resourceLoaded();
            } else {
                script.addEventListener('load', resourceLoaded);
                script.addEventListener('error', resourceLoaded);
            }
        });
        
        // Отслеживаем загрузку CSS
        const links = document.querySelectorAll('link[href]');
        links.forEach(link => {
            if (link.sheet || link.href) {
                resourceLoaded();
            } else {
                link.addEventListener('load', resourceLoaded);
                link.addEventListener('error', resourceLoaded);
            }
        });
        
        // Отслеживаем загрузку iframe
        const iframes = document.querySelectorAll('iframe[src]');
        iframes.forEach(iframe => {
            iframe.addEventListener('load', resourceLoaded);
            iframe.addEventListener('error', resourceLoaded);
        });
        
        // Отслеживаем загрузку видео
        const videos = document.querySelectorAll('video source');
        videos.forEach(video => {
            video.addEventListener('load', resourceLoaded);
            video.addEventListener('error', resourceLoaded);
        });
        
        // Отслеживаем загрузку аудио
        const audios = document.querySelectorAll('audio source');
        audios.forEach(audio => {
            audio.addEventListener('load', resourceLoaded);
            audio.addEventListener('error', resourceLoaded);
        });
        
        // DOM уже загружен
        resourceLoaded();
    }
    
    // Функция вызывается при загрузке каждого ресурса
    function resourceLoaded() {
        resourcesLoaded++;
        progress = Math.min((resourcesLoaded / totalResources) * 100, 100);
        
        // Обновляем целевую позицию для анимации
        targetProgress = progress;
        
        console.log(`Загружено: ${resourcesLoaded}/${totalResources} (${Math.floor(progress)}%)`);
        
        // Если все ресурсы загружены
        if (resourcesLoaded >= totalResources) {
            isResourcesComplete = true;
            targetProgress = 100;
            console.log('Все ресурсы загружены!');
        }
    }
    
    // Функция завершения загрузки
    function completeLoading() {
        progressText.textContent = '100%';
        updateProgress();
        
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                content.style.display = 'flex';
            }, 500);
        }, 500);
    }
    
    // Дополнительная проверка через window.onload
    window.addEventListener('load', function() {
        // Если ресурсы еще не загружены, помечаем как завершенные
        if (!isResourcesComplete) {
            isResourcesComplete = true;
            targetProgress = 100;
            console.log('Window load: принудительное завершение загрузки ресурсов');
        }
    });
    
    // Запускаем подсчет ресурсов
    countResources();
    
    // Fallback: если через 20 секунд загрузка не завершилась, принудительно завершаем
    setTimeout(() => {
        if (!isResourcesComplete) {
            console.log('Fallback: принудительное завершение загрузки');
            isResourcesComplete = true;
            targetProgress = 100;
        }
    }, 20000);
}); 