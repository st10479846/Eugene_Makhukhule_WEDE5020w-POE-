// ================================
// AGANG SA WEBSITE - MAIN JS
// ================================
document.addEventListener('DOMContentLoaded', () => {

    // ================================
    // MOBILE NAVIGATION
    // ================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', e => {
            e.stopPropagation();
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', e => {
            if (navLinks.classList.contains('active') && !e.target.closest('.navbar')) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ================================
    // SCROLL TO TOP BUTTON
    // ================================
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = "↑ Top";
    scrollBtn.id = "scrollTopBtn";
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 12px 16px;
        background-color: #f1c40f;
        color: #007a4d;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: none;
        z-index: 1000;
    `;
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ================================
    // DYNAMIC FOOTER YEAR
    // ================================
    const yearSpan = document.getElementById('footerYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ================================
    // FORM HANDLER CLASS WITH EMAIL FUNCTIONALITY
    // ================================
    class FormHandler {
        constructor(formId, options = {}) {
            this.form = document.getElementById(formId);
            if (!this.form) return;

            this.submitBtn = this.form.querySelector('button[type="submit"]');
            this.submitText = this.submitBtn.querySelector('#submitText');
            this.submitLoading = this.submitBtn.querySelector('#submitLoading');
            this.successMessage = options.successMessageId ? document.getElementById(options.successMessageId) : null;
            this.formType = options.formType || 'contact'; // contact, volunteer, event, donation
            this.fields = options.fields || [];
            this.isSubmitting = false;

            this.addEventListeners();
        }

        addEventListeners() {
            if (!this.form) return;

            this.form.addEventListener('submit', e => this.handleSubmit(e));

            this.fields.forEach(f => {
                const field = this.form.querySelector(`[name="${f.name}"]`);
                if (field) {
                    field.addEventListener('blur', () => this.validateField(f, field));
                    field.addEventListener('input', () => this.clearError(field));
                }
            });
        }

        async handleSubmit(e) {
            e.preventDefault();
            if (this.isSubmitting) return;

            const valid = this.validateForm();
            if (!valid) {
                this.showError('Please fix the errors in the form.');
                return;
            }

            this.isSubmitting = true;
            this.setLoadingState(true);

            try {
                const formData = new FormData(this.form);
                const result = await this.sendForm(formData);
                
                if (result.success) {
                    this.showSuccess('Message sent successfully! We\'ll get back to you soon.');
                    this.form.reset();
                } else {
                    this.showError(result.message || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                this.showError('Network error. Please try again.');
            } finally {
                this.isSubmitting = false;
                this.setLoadingState(false);
            }
        }

        async sendForm(formData) {
            // Formspree endpoint - you'll need to create a free account at formspree.io
            let formspreeEndpoint = '';
            
            // Set different Formspree IDs for different forms
            switch(this.formType) {
                case 'contact':
                    formspreeEndpoint = 'https://formspree.io/f/myzoyqgv'; // Replace with your actual Formspree ID
                    break;
                case 'volunteer':
                    formspreeEndpoint = 'https://formspree.io/f/myzoyqgv'; // Replace with your actual Formspree ID
                    break;
                case 'event':
                    formspreeEndpoint = 'https://formspree.io/f/myzoyqgv'; // Replace with your actual Formspree ID
                    break;
                case 'donation':
                    formspreeEndpoint = 'https://formspree.io/f/myzoyqgv'; // Replace with your actual Formspree ID
                    break;
                default:
                    formspreeEndpoint = 'https://formspree.io/f/myzoyqgv'; // Replace with your actual Formspree ID
            }

            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true, message: 'Message sent successfully!' };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.error || 'Failed to send message' };
            }
        }

        validateField(f, field) {
            const valid = f.validate(field.value);
            let errorEl = field.parentElement.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                field.parentElement.appendChild(errorEl);
            }
            errorEl.textContent = valid ? '' : f.message;
            field.classList.toggle('input-error', !valid);
            return valid;
        }

        validateForm() {
            return this.fields.every(f => {
                const field = this.form.querySelector(`[name="${f.name}"]`);
                return !field || this.validateField(f, field);
            });
        }

        clearError(field) {
            field.classList.remove('input-error');
            const errorEl = field.parentElement.querySelector('.error-message');
            if (errorEl) errorEl.textContent = '';
        }

        setLoadingState(loading) {
            if (loading) {
                this.submitBtn.disabled = true;
                this.submitBtn.classList.add('loading');
                if (this.submitText) this.submitText.style.display = 'none';
                if (this.submitLoading) this.submitLoading.style.display = 'inline-flex';
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.classList.remove('loading');
                if (this.submitText) this.submitText.style.display = 'inline';
                if (this.submitLoading) this.submitLoading.style.display = 'none';
            }
        }

        showSuccess(message) {
            if (this.successMessage) {
                this.successMessage.textContent = message;
                this.successMessage.style.display = 'block';
                setTimeout(() => {
                    this.successMessage.style.display = 'none';
                }, 5000);
            } else {
                alert(message);
            }
        }

        showError(message) {
            if (this.successMessage) {
                this.successMessage.textContent = message;
                this.successMessage.style.color = '#e74c3c';
                this.successMessage.style.display = 'block';
                setTimeout(() => {
                    this.successMessage.style.display = 'none';
                    this.successMessage.style.color = '';
                }, 5000);
            } else {
                alert(message);
            }
        }
    }

    // ================================
    // CONTACT FORM
    // ================================
    new FormHandler('contactForm', {
        formType: 'contact',
        successMessageId: 'successMessage',
        fields: [
            {name:'name', validate: v=>v.length>=2, message:'Enter at least 2 characters'},
            {name:'email', validate: v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'phone', validate: v=>!v||/^0\d{9}$/.test(v), message:'Invalid SA phone'},
            {name:'subject', validate: v=>!!v, message:'Select a subject'},
            {name:'message', validate: v=>v.length>=10 && v.length<=1000, message:'Message must be 10-1000 chars'}
        ]
    });

    // ================================
    // VOLUNTEER FORM
    // ================================
    new FormHandler('volunteerForm', {
        formType: 'volunteer',
        successMessageId: 'volunteerSuccess',
        fields: [
            {name:'name', validate:v=>v.length>=2, message:'Enter full name'},
            {name:'email', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'phone', validate:v=>/^0\d{9}$/.test(v), message:'Invalid phone number'},
            {name:'interest', validate:v=>v.length>0, message:'Select interest area'}
        ]
    });

    // ================================
    // EVENT FORM
    // ================================
    new FormHandler('ward-event-form', {
        formType: 'event',
        successMessageId: 'eventSuccess',
        fields: [
            {name:'name', validate:v=>v.length>=2, message:'Enter full name'},
            {name:'email', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'phone', validate:v=>/^0\d{9}$/.test(v), message:'Invalid phone number'},
            {name:'province', validate:v=>v.length>0, message:'Select province'}
        ]
    });

    // ================================
    // DONATION FORM
    // ================================
    new FormHandler('donation-form', {
        formType: 'donation',
        successMessageId: 'donationSuccess',
        fields: [
            {name:'name', validate:v=>v.length>=2, message:'Enter your name'},
            {name:'email', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'amount', validate:v=>parseFloat(v)>0, message:'Enter valid amount'}
        ]
    });

    // Stripe integration placeholder
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', e=>{
            e.preventDefault();
            alert('Stripe donation flow would trigger here.');
        });
    }

    // ================================
    // LIGHTBOX GALLERY
    // ================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-img');
    const closeBtn = lightbox?.querySelector('.close');
    const prevBtn = lightbox?.querySelector('.prev');
    const nextBtn = lightbox?.querySelector('.next');
    let currentIndex = 0;

    function showLightbox(index) {
        currentIndex = index;
        lightbox.style.display = 'flex';
        lightboxImg.src = galleryItems[index].src;
    }
    function closeLightbox() { lightbox.style.display = 'none'; }
    function showNext() { currentIndex = (currentIndex+1)%galleryItems.length; lightboxImg.src = galleryItems[currentIndex].src; }
    function showPrev() { currentIndex = (currentIndex-1+galleryItems.length)%galleryItems.length; lightboxImg.src = galleryItems[currentIndex].src; }

    galleryItems.forEach((item, i)=>item.addEventListener('click', ()=>showLightbox(i)));
    closeBtn?.addEventListener('click', closeLightbox);
    nextBtn?.addEventListener('click', showNext);
    prevBtn?.addEventListener('click', showPrev);
    lightbox?.addEventListener('click', e=>{ if(e.target===lightbox) closeLightbox(); });
    document.addEventListener('keydown', e=>{
        if(lightbox.style.display==='flex'){
            if(e.key==='ArrowRight') showNext();
            if(e.key==='ArrowLeft') showPrev();
            if(e.key==='Escape') closeLightbox();
        }
    });

    // ================================
    // NEWS SEARCH
    // ================================
    const searchInput = document.getElementById("newsSearch");
    const newsGrid = document.getElementById("newsGrid");
    if(searchInput && newsGrid){
        const articles = newsGrid.querySelectorAll(".news-card");
        searchInput.addEventListener("keydown", e => {
            if(e.key==="Enter"){
                e.preventDefault();
                const query = searchInput.value.toLowerCase();
                articles.forEach(a => a.style.display = a.textContent.toLowerCase().includes(query) ? "" : "none");
            }
        });
    }

});