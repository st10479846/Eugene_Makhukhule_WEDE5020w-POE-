// ================================
// SECURITY CONFIGURATION
// AGANG SA WEBSITE
// ================================

const SecurityConfig = {
    // Content Security Policy
    csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdn.emailjs.com"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "https:"],
        'connect-src': ["'self'", "https://formspree.io", "https://api.emailjs.com"]
    },

    // Security headers (for server implementation)
    headers: {
        'X-XSS-Protection': '1; mode=block',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    },

    // File types to protect
    protectedFiles: ['.env', '.ini', '.log', '.sql', '.bak', '.inc'],

    // Validate file access
    validateFileAccess: function(filename) {
        const extension = filename.split('.').pop();
        return !this.protectedFiles.includes('.' + extension);
    },

    // Sanitize user input
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Prevent XSS in dynamic content
    safeInnerHTML: function(element, content) {
        if (element && content) {
            element.textContent = content; // Safer than innerHTML
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityConfig;
}