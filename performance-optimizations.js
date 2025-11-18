// ================================
// PERFORMANCE OPTIMIZATIONS
// AGANG SA WEBSITE
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // LAZY LOADING FOR IMAGES
    // ================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ================================
    // DEBOUNCE SCROLL EVENTS
    // ================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optimized scroll event for mobile menu
    const optimizedScroll = debounce(function() {
        // Your scroll-related code here
    }, 10);

    window.addEventListener('scroll', optimizedScroll);

    // ================================
    // PRELOAD CRITICAL RESOURCES
    // ================================
    function preloadCriticalResources() {
        const criticalImages = [
            '_images/logo.png',
            '_images/hero-background.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // ================================
    // SERVICE WORKER FOR CACHING
    // ================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================
    window.addEventListener('load', function() {
        // Measure page load time
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Log Core Web Vitals (simplified)
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        const lcp = performance.getEntriesByName('largest-contentful-paint')[0];
        
        if (fcp) console.log(`First Contentful Paint: ${fcp.startTime}ms`);
        if (lcp) console.log(`Largest Contentful Paint: ${lcp.startTime}ms`);
    });

});

// ================================
// ERROR HANDLING AND MONITORING
// ================================
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // Here you could send errors to a monitoring service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
});