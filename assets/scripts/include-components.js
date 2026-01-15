async function loadComponent(id, url, callback) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const html = await response.text();
        placeholder.innerHTML = html;
        if (callback) callback(placeholder);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load Header
    loadComponent('header-placeholder', 'assets/components/header.html', (placeholder) => {
        const header = placeholder.querySelector('.header');
        if (!header) return;

        // Unwrap the header from the placeholder if we want to preserve exact structure, 
        // or just operate on the header inside. 
        // Best to just leave it inside or move children out. 
        // Let's leave it inside but ensure styles apply.
        
        // Apply active state
        const activePage = placeholder.getAttribute('data-active');
        if (activePage) {
            const links = header.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === activePage) {
                    link.classList.add('active');
                }
            });
        }

        // Apply background style override
        if (placeholder.getAttribute('data-force-bg') === 'true') {
            header.style.backgroundColor = 'var(--primary-color)';
        }

        // Re-initialize header scripts
        if (window.initHeader) {
            window.initHeader();
        }
    });

    // Load Footer
    loadComponent('footer-placeholder', 'assets/components/footer.html');
});
