const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
document.body.appendChild(lightbox);

const images = document.querySelectorAll('.news-card img');
images.forEach(img => {
    img.addEventListener('click', e => {
        lightbox.classList.add('active');
        const lightboxImg = document.createElement('img');
        lightbox.innerHTML = '';
        lightbox.appendChild(lightboxImg);
        lightboxImg.src = img.src;
    });
});

lightbox.addEventListener('click', e => {
    if (e.target !== e.currentTarget) return;
    lightbox.classList.remove('active');
});
