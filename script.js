// ====================================
// MOBILE NAVIGATION - SINGLE VERSION
// ====================================
document.addEventListener("DOMContentLoaded", function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    // Check if elements exist (for pages without navigation)
    if (!mobileMenuBtn || !navLinks) {
        return;
    }
    
    // Toggle menu on hamburger click
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = event.target.closest('.navbar');
        if (!isClickInsideNav) {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// ====================================
// STRIPE DONATION (for donate.html only)
// ====================================
// This will only run on pages that have the donation form
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('donation-form');
    
    if (form) {
        // Only initialize Stripe if we're on a donation page
        const stripe = Stripe('pk_test_YOUR_PUBLIC_STRIPE_KEY'); // Replace with your Stripe public key
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const amount = document.getElementById('amount').value;

            // Call your backend to create a Stripe Checkout session
            const response = await fetch('/create-checkout-session.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, amount })
            });

            const session = await response.json();

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({ sessionId: session.id });

            if (result.error) {
                alert(result.error.message);
            }
        });
    }
});


/**
 * Contact Form Validation and Email Handler
 * Agang SA - South African Political Movement
 * Client-side validation with error handling and email submission
 * File: js/contact-form.js
 */

class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitLoading = document.getElementById('submitLoading');
        this.successMessage = document.getElementById('successMessage');
        this.isSubmitting = false;

        if (this.form) {
            this.initializeEventListeners();
        } else {
            console.error('Contact form not found');
        }
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const fields = ['name', 'email', 'phone', 'subject', 'message'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('blur', () => this.validateField(element));
                element.addEventListener('input', () => this.clearError(element));
            }
        });

        // Character count for message
        const messageField = document.getElementById('message');
        if (messageField) {
            messageField.addEventListener('input', (e) => this.updateCharacterCount(e.target));
            // Initialize character count
            this.updateCharacterCount(messageField);
        }

        // Phone number formatting
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => this.formatPhoneNumber(e.target));
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter your full name (minimum 2 characters)';
                }
                break;

            case 'email':
                if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid South African phone number';
                }
                break;

            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a subject';
                }
                break;

            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a message (minimum 10 characters)';
                } else if (value.length > 1000) {
                    isValid = false;
                    errorMessage = 'Message must be less than 1000 characters';
                }
                break;
        }

        this.displayFieldError(field, isValid, errorMessage);
        return isValid;
    }

    validateForm() {
        const fields = ['name', 'email', 'subject', 'message'];
        let isFormValid = true;

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const isValid = this.validateField(field);
                if (!isValid) isFormValid = false;
            }
        });

        // Validate phone if provided
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value.trim()) {
            const isValid = this.validateField(phoneField);
            if (!isValid) isFormValid = false;
        }

        return isFormValid;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;

        const isValid = this.validateForm();
        
        if (!isValid) {
            this.showError('Please fix the errors in the form before submitting.');
            return;
        }

        this.setSubmitting(true);

        try {
            // Prepare form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim() || 'Not provided',
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim(),
                timestamp: new Date().toISOString()
            };

            // Send email using mailto link (client-side fallback)
            await this.sendEmail(formData);
            
            this.showSuccess();
            this.form.reset();
            this.updateCharacterCount(document.getElementById('message'));

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again or contact us directly at info@agangsa.org');
        } finally {
            this.setSubmitting(false);
        }
    }

    async sendEmail(formData) {
        const recipient = 'info@agangsa.org';
        const subject = `Agang SA Contact: ${this.getSubjectText(formData.subject)}`;
        const body = this.formatEmailBody(formData);

        // Create mailto link
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open email client
        window.location.href = mailtoLink;

        // For actual server-side submission, you would use:
        /*
        try {
            const response = await fetch('/contact-submit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Server response was not ok');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Server submission failed:', error);
            // Fall back to mailto
            throw error;
        }
        */
    }

    formatEmailBody(formData) {
        return `
New Contact Form Submission - Agang SA

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Subject: ${this.getSubjectText(formData.subject)}

Message:
${formData.message}

---
Submitted on: ${new Date().toLocaleString('en-ZA')}
        `.trim();
    }

    getSubjectText(subjectValue) {
        const subjects = {
            'general': 'General Inquiry',
            'membership': 'Membership Information',
            'volunteer': 'Volunteer Opportunities',
            'donation': 'Donation Questions',
            'event': 'Event Information',
            'media': 'Media Inquiry',
            'complaint': 'Complaint',
            'suggestion': 'Suggestion',
            'other': 'Other'
        };
        return subjects[subjectValue] || 'General Inquiry';
    }


    /* ====================================
   Volunteer Form Section 
   ==================================== */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // South African phone number validation
        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanedPhone);
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/[^\d+]/g, '');
        
        if (value.startsWith('0') && value.length >= 2) {
            value = '+27' + value.substring(1);
        }
        
        // Format: +27 12 345 6789
        if (value.length > 3) value = value.replace(/(\+\d{2})(\d{2})/, '$1 $2');
        if (value.length > 6) value = value.replace(/(\+\d{2} \d{2})(\d{3})/, '$1 $2');
        if (value.length > 9) value = value.replace(/(\+\d{2} \d{2} \d{3})(\d{4})/, '$1 $2');
        
        input.value = value;
    }

    // UI helpers
    displayFieldError(field, isValid, errorMessage) {
        const errorElement = document.getElementById(field.name + 'Error');
        
        if (errorElement) {
            if (!isValid) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                field.classList.add('input-error');
                field.classList.remove('input-success');
            } else {
                errorElement.style.display = 'none';
                field.classList.remove('input-error');
                field.classList.add('input-success');
            }
        }
    }

    clearError(field) {
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
            field.classList.remove('input-error');
        }
    }

    updateCharacterCount(textarea) {
        const count = textarea.value.length;
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = count;
            
            if (count > 900) {
                charCount.style.color = '#dc3545';
            } else if (count > 750) {
                charCount.style.color = '#ffc107';
            } else {
                charCount.style.color = '#6c757d';
            }
        }
    }

    setSubmitting(submitting) {
        this.isSubmitting = submitting;
        this.submitBtn.disabled = submitting;
        
        if (submitting) {
            this.submitText.style.display = 'none';
            this.submitLoading.style.display = 'inline';
            this.form.classList.add('loading');
        } else {
            this.submitText.style.display = 'inline';
            this.submitLoading.style.display = 'none';
            this.form.classList.remove('loading');
        }
    }

    showSuccess() {
        if (this.successMessage) {
            this.successMessage.style.display = 'block';
            setTimeout(() => {
                this.successMessage.style.display = 'none';
            }, 5000);
        }
    }

    showError(message) {
        alert(message); // You can replace this with a better error display
    }
}

// Initialize the contact form handler when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new ContactFormHandler();
});

   /* ====================================
   Map
   ==================================== */
   /**
 * Interactive Map Functionality for Agang SA Website
 * File: js/map-interactive.js
 */

class InteractiveMap {
    constructor() {
        this.mapEmbed = document.getElementById('mapEmbed');
        this.googleMap = document.getElementById('googleMap');
        this.mapLoading = document.getElementById('mapLoading');
        this.mapInfo = document.getElementById('mapInfo');
        this.mapDirections = document.getElementById('mapDirections');
        
        this.buttons = {
            toggleInfo: document.getElementById('toggleInfoBtn'),
            getDirections: document.getElementById('getDirectionsBtn'),
            toggleTheme: document.getElementById('toggleThemeBtn'),
            refreshMap: document.getElementById('refreshMapBtn')
        };
        
        this.directionsForm = document.getElementById('directionsForm');
        this.startLocation = document.getElementById('startLocation');
        
        this.isDarkTheme = false;
        this.isInfoVisible = false;
        this.isDirectionsVisible = false;
        
        this.init();
    }

    init() {
        this.addEventListeners();
        this.showMapLoading();
        this.checkMapLoad();
    }

    addEventListeners() {
        // Map control buttons
        this.buttons.toggleInfo.addEventListener('click', () => this.toggleInfoPanel());
        this.buttons.getDirections.addEventListener('click', () => this.toggleDirectionsPanel());
        this.buttons.toggleTheme.addEventListener('click', () => this.toggleTheme());
        this.buttons.refreshMap.addEventListener('click', () => this.refreshMap());

        // Directions form
        this.directionsForm.addEventListener('submit', (e) => this.handleDirections(e));

        // Close panels when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    toggleInfoPanel() {
        this.isInfoVisible = !this.isInfoVisible;
        
        if (this.isInfoVisible) {
            this.mapInfo.classList.add('show');
            this.buttons.toggleInfo.innerHTML = '<i>❌</i> Close Details';
            // Close directions if open
            if (this.isDirectionsVisible) {
                this.toggleDirectionsPanel();
            }
        } else {
            this.mapInfo.classList.remove('show');
            this.buttons.toggleInfo.innerHTML = '<i>ℹ️</i> Location Details';
        }
    }

    toggleDirectionsPanel() {
        this.isDirectionsVisible = !this.isDirectionsVisible;
        
        if (this.isDirectionsVisible) {
            this.mapDirections.classList.add('show');
            this.buttons.getDirections.innerHTML = '<i>❌</i> Close Directions';
            this.startLocation.focus();
            // Close info if open
            if (this.isInfoVisible) {
                this.toggleInfoPanel();
            }
        } else {
            this.mapDirections.classList.remove('show');
            this.buttons.getDirections.innerHTML = '<i>🗺️</i> Get Directions';
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        
        if (this.isDarkTheme) {
            this.mapEmbed.classList.add('dark-theme');
            this.buttons.toggleTheme.innerHTML = '<i>☀️</i> Light Theme';
        } else {
            this.mapEmbed.classList.remove('dark-theme');
            this.buttons.toggleTheme.innerHTML = '<i>🌙</i> Dark Theme';
        }
    }

    refreshMap() {
        this.showMapLoading();
        
        // Add cache busting parameter to force refresh
        const currentSrc = this.googleMap.src;
        const separator = currentSrc.includes('?') ? '&' : '?';
        this.googleMap.src = currentSrc + separator + 'refresh=' + Date.now();
        
        this.checkMapLoad();
    }

    handleDirections(event) {
        event.preventDefault();
        
        const startLocation = this.startLocation.value.trim();
        if (!startLocation) {
            alert('Please enter your starting location');
            return;
        }

        // Create Google Maps directions URL
        const destination = '717+President+Steyn+St,+Pretoria+North,+Pretoria,+0188';
        const directionsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(startLocation)}/${destination}`;
        
        // Open in new tab
        window.open(directionsUrl, '_blank');
        
        // Reset form
        this.directionsForm.reset();
    }

    showMapLoading() {
        this.mapLoading.classList.add('show');
    }

    hideMapLoading() {
        this.mapLoading.classList.remove('show');
    }

    checkMapLoad() {
        // Check if map is loaded (this is a basic implementation)
        this.googleMap.addEventListener('load', () => {
            setTimeout(() => {
                this.hideMapLoading();
            }, 1000);
        });

        // Fallback in case load event doesn't fire
        setTimeout(() => {
            this.hideMapLoading();
        }, 3000);
    }

    handleOutsideClick(event) {
        // Close panels if clicked outside
        if (this.isInfoVisible && !this.mapInfo.contains(event.target) && !this.buttons.toggleInfo.contains(event.target)) {
            this.toggleInfoPanel();
        }
        
        if (this.isDirectionsVisible && !this.mapDirections.contains(event.target) && !this.buttons.getDirections.contains(event.target)) {
            this.toggleDirectionsPanel();
        }
    }

    handleKeyboard(event) {
        // Keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch(event.key) {
                case 'i':
                    event.preventDefault();
                    this.toggleInfoPanel();
                    break;
                case 'd':
                    event.preventDefault();
                    this.toggleDirectionsPanel();
                    break;
                case 't':
                    event.preventDefault();
                    this.toggleTheme();
                    break;
                case 'r':
                    event.preventDefault();
                    this.refreshMap();
                    break;
            }
        }
    }

    // Additional utility methods
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.startLocation.value = `${lat}, ${lng}`;
                    this.startLocation.placeholder = 'Using your current location';
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your current location. Please enter it manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }
}

// Initialize the interactive map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new InteractiveMap();
});

 document.addEventListener("DOMContentLoaded", function() {
    const iframe = document.getElementById("googleMap");
    const loader = document.getElementById("mapLoading");

    // When iframe finishes loading
    iframe.addEventListener("load", function() {
      loader.classList.add("hidden");   // Hide spinner
      iframe.classList.add("loaded");   // Fade in map
    });
  });

// Add to your existing contact-form.js or include separately


/* ====================================
  Submit Button for contact form
   ==================================== */
  document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitLoading = document.getElementById("submitLoading");

    form.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent page reload

        // Show loading state
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;

        // Simulate sending message (replace with real AJAX/fetch)
        setTimeout(() => {
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;
            form.reset(); // Optional: reset form fields
            alert("Message sent successfully!");
        }, 2000); // 2 seconds delay to simulate network
    });
});


/* ====================================
  Volunteer Page
   ==================================== */

   // Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("volunteerForm");
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitLoading = document.getElementById("submitLoading");

    // Function to show spinner
    function showLoading() {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
        submitLoading.style.display = "inline-flex";
    }

    // Function to hide spinner
    function hideLoading() {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        submitLoading.style.display = "none";
    }

    // Function to validate form (simple check for empty fields)
    function validateForm() {
        let isValid = true;
        const fields = form.querySelectorAll("input, select, textarea");

        fields.forEach(field => {
            if (field.hasAttribute("required") && !field.value.trim()) {
                field.style.borderColor = "#e74c3c"; // Highlight empty fields
                isValid = false;
            } else {
                field.style.borderColor = "#e9ecef"; // Reset border
            }
        });

        return isValid;
    }

    // Handle form submission
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please fill in all required fields correctly.");
            return;
        }

        showLoading();

        // Simulate sending form (replace with actual AJAX request if needed)
        setTimeout(() => {
            hideLoading();
            alert("Thank you for registering as a volunteer!");
            form.reset();
        }, 2000);
    });

    // Optional: Highlight field on focus
    const fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(field => {
        field.addEventListener("focus", () => {
            field.style.borderColor = "#3498db";
        });
        field.addEventListener("blur", () => {
            field.style.borderColor = "#e9ecef";
        });
    });
});


/* ====================================
  Events Page
==================================== */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('ward-event-form');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoading = document.getElementById('submitLoading');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    // Simulate sending data
    setTimeout(() => {
      alert('Thank you for registering your ward event! We will contact you soon.');
      form.reset();
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
      submitBtn.disabled = false;
    }, 2000);
  });
});

/* ====================================
  Gallery Page
==================================== */
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const closeBtn = document.querySelector('.lightbox .close');
    const prevBtn = document.querySelector('.lightbox .prev');
    const nextBtn = document.querySelector('.lightbox .next');

    let currentIndex = 0;

    function showLightbox(index) {
        currentIndex = index;
        lightbox.style.display = 'flex';
        lightbox.classList.add('show');
        lightboxImg.src = galleryItems[index].src;
        lightboxImg.alt = galleryItems[index].alt;
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.src = '';
            lightboxImg.alt = '';
        }, 500);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        lightboxImg.src = galleryItems[currentIndex].src;
        lightboxImg.alt = galleryItems[currentIndex].alt;
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        lightboxImg.src = galleryItems[currentIndex].src;
        lightboxImg.alt = galleryItems[currentIndex].alt;
    }

    // Event Listeners
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => showLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Close when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') closeLightbox();
        }
    });
});


// =============================
// NEWS SEARCH FUNCTIONALITY
// =============================

// Get search input
const searchInput = document.getElementById("newsSearch");

// Get all news cards
const newsGrid = document.getElementById("newsGrid");
const articles = newsGrid.querySelectorAll(".news-card");

// SEARCH FUNCTION
function searchNews() {
    const query = searchInput.value.toLowerCase();

    articles.forEach(article => {
        const text = article.textContent.toLowerCase();

        // Show or hide based on match
        if (text.includes(query)) {
            article.style.display = "";
        } else {
            article.style.display = "none";
        }
    });
}

// RUN SEARCH ON ENTER
searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        searchNews();
    }
});

// OPTIONAL: Run search while typing (live search)
// Uncomment if you want live update
// searchInput.addEventListener("input", searchNews);

