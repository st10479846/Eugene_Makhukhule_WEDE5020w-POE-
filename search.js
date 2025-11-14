const searchInput = document.getElementById('newsSearch');
const newsCards = document.querySelectorAll('.news-card');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    newsCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
});
