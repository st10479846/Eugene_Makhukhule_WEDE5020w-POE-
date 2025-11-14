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
    // GENERIC FORM HANDLER CLASS
    // ================================
    class FormHandler {
        constructor(formId, options = {}) {
            this.form = document.getElementById(formId);
            if (!this.form) return;

            this.submitBtn = this.form.querySelector('button[type="submit"]');
            this.successMessage = options.successMessageId ? document.getElementById(options.successMessageId) : null;
            this.fields = options.fields || []; // Array of {name, validate: fn, message}
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

        handleSubmit(e) {
            e.preventDefault();
            if (this.isSubmitting) return;

            const valid = this.validateForm();
            if (!valid) return alert('Please fix the errors in the form.');

            this.isSubmitting = true;
            this.submitBtn.disabled = true;

            const formData = {};
            this.fields.forEach(f => {
                const field = this.form.querySelector(`[name="${f.name}"]`);
                if (field) formData[f.name] = field.value.trim();
            });

            if (this.sendForm) this.sendForm(formData);

            this.isSubmitting = false;
            this.submitBtn.disabled = false;

            if (this.successMessage) {
                this.successMessage.style.display = 'block';
                setTimeout(() => this.successMessage.style.display = 'none', 5000);
            } else {
                alert('Form submitted successfully!');
            }

            this.form.reset();
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
    }

    // ================================
    // CONTACT FORM
    // ================================
    new FormHandler('contactForm', {
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
        successMessageId: 'volunteerSuccess',
        fields: [
            {name:'volName', validate:v=>v.length>=2, message:'Enter full name'},
            {name:'volEmail', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'volPhone', validate:v=>/^0\d{9}$/.test(v), message:'Invalid phone number'},
            {name:'volInterest', validate:v=>v.length>0, message:'Select interest area'}
        ]
    });

    // ================================
    // EVENT FORM
    // ================================
    new FormHandler('eventForm', {
        successMessageId: 'eventSuccess',
        fields: [
            {name:'eventName', validate:v=>v.length>=2, message:'Enter full name'},
            {name:'eventEmail', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'eventPhone', validate:v=>/^0\d{9}$/.test(v), message:'Invalid phone number'},
            {name:'eventType', validate:v=>v.length>0, message:'Select event type'}
        ]
    });

    // ================================
    // DONATION FORM (Stripe placeholder)
    // ================================
    new FormHandler('donationForm', {
        successMessageId: 'donationSuccess',
        fields: [
            {name:'donorName', validate:v=>v.length>=2, message:'Enter your name'},
            {name:'donorEmail', validate:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message:'Invalid email'},
            {name:'donationAmount', validate:v=>parseFloat(v)>0, message:'Enter valid amount'}
        ]
    });

    // Stripe integration placeholder: You can replace this with your Stripe checkout code
    const donationForm = document.getElementById('donationForm');
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
