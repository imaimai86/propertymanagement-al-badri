document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuIcon = document.querySelector('.mobile-menu-icon');
    const nav = document.querySelector('.nav');

    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            nav.classList.toggle('open');
            const icon = nav.classList.contains('open') ? 'close-outline' : 'menu-outline';
            menuIcon.querySelector('ion-icon').setAttribute('name', icon);
        });
    }

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.nav-item');
    dropdowns.forEach(item => {
        const link = item.querySelector('.nav-link');
        const menu = item.querySelector('.dropdown-menu');
        
        if (menu && link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    // Only toggle if the icon was clicked
                    if (e.target.tagName === 'ION-ICON' || e.target.closest('ion-icon')) {
                        e.preventDefault();
                        e.stopPropagation(); // Stop bubbling
                        menu.classList.toggle('active');
                        
                        // Rotate icon
                        const icon = link.querySelector('ion-icon');
                        if (icon) {
                            icon.style.transform = menu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                            icon.style.transition = 'transform 0.3s ease';
                        }
                    } 
                    // Otherwise let the link navigate normally
                }
            });
        }
    });

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Only handle links that actually start with #
            if (!targetId || !targetId.startsWith('#')) return;
            
            // If it's just "#" with no ID, do nothing (or let default happen if you prefer, but usually we prevent jump)
            if (targetId === '#') {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            
            try {
                const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    menuIcon.querySelector('ion-icon').setAttribute('name', 'menu-outline');
                }

                // Get current header height which might change
                const headerHeight = document.querySelector('.header').classList.contains('scrolled') ? 80 : 100;
                
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            } catch (err) {
                console.warn('Smooth scroll invalid target:', targetId);
            }
        });
    });

    // Simple fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.about-card, .gallery-item, .contact-wrapper');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Configuration - Set this to your Apps Script URL once deployed
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqtr-5Caf5O_ZyckSeqEbc5LuP9041SD7rfVzNkJK4R2vn8JeDASFQdiUTPmoCa67V/exec"; // AI - Do not change this

    // Load Featured Properties immediately with slight delay
    const featuredContainer = document.getElementById('featured-properties');
    if (featuredContainer) {
        // Add a slight delay for better UX
        setTimeout(() => {
            const dataSource = APPS_SCRIPT_URL || 'properties.json';
            fetch(dataSource)
                .then(res => res.json())
                .then(data => {
                    const featured = data.filter(p => p.featured === true).slice(0, 4);
                    featuredContainer.innerHTML = '';

                    featured.forEach(p => {
                        const item = document.createElement('a'); // Changed to <a>
                        item.href = `property-details.html?id=${p.id}`; // Add link
                        item.style.display = "block";
                        item.className = 'gallery-item';
                        item.innerHTML = `
                            <img src="${p.image || p.thumbnail}" alt="${p.title}" class="gallery-img-real">
                            <div class="gallery-info">
                                <h4>${p.title}</h4>
                                <p>${p.location}</p>
                            </div>
                        `;
                        // Add scroll animation to dynamic items
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        observer.observe(item);
                        
                        featuredContainer.appendChild(item);
                    });
                })
                .catch(err => {
                    console.error('Error loading featured properties:', err);
                    featuredContainer.innerHTML = '<p>Error loading properties.</p>';
                });
        }, 300); // 300ms delay for better UX
    }

    // Homepage Contact Form Submission Logic
    const homeContactForm = document.getElementById('home-contact-form');
    const homeFormStatus = document.getElementById('home-form-status');
    const homeSubmitButton = homeContactForm ? homeContactForm.querySelector('button[type="submit"]') : null;

    if (homeContactForm) {
        homeContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                // Use placeholders for propId and propTitle as this is a general inquiry
                propId: 'general-inquiry',
                propTitle: 'General Inquiry',
                name: document.getElementById('home-user-name').value,
                email: document.getElementById('home-user-email').value,
                contactNumber: document.getElementById('home-user-phone').value,
                message: document.getElementById('home-user-message').value
            };

            // Use the common contact form submission function
            submitContactForm(formData, homeFormStatus, homeSubmitButton, homeContactForm, () => {
                // Auto-hide success message after 5 seconds for homepage form
                setTimeout(() => {
                    homeFormStatus.style.display = 'none';
                }, 5000);
            });
        });
    }
});
