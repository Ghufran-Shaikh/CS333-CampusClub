document.addEventListener('DOMContentLoaded', () => {
    const openFormBtn = document.getElementById('openFormBtn');
    const addGroupForm = document.getElementById('myForm');
    const closeBtn = addGroupForm ? addGroupForm.querySelector('.close-form') : null;
    if (addGroupForm) {
        addGroupForm.style.display = 'none';
    }
    if (openFormBtn && addGroupForm) {
        openFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addGroupForm.style.display = 'block';
            addGroupForm.scrollTop = 0; // Scroll to top of form
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll window to top
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addGroupForm.style.display = 'none';
        });
    }
});