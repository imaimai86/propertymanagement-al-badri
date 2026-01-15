document.addEventListener('DOMContentLoaded', () => {
    const loadingState = document.getElementById('loading-state');
    const propertyContent = document.getElementById('property-content');
    
    // UI Elements
    const carouselSlides = document.getElementById('carousel-slides');
    const carouselDots = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Extract ID and Slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propId = urlParams.get('id');
    const propSlugParam = urlParams.get('slug');
    const refParam = urlParams.get('ref');

    // Update Back Link if ref is present
    if (refParam) {
        // Find the back link which contains "Back to Properties"
        const backLinks = document.querySelectorAll('a[href*="properties.html"]');
        backLinks.forEach(link => {
            if (link.textContent.includes('Back to Properties')) {
                link.href = `properties.html${refParam}#property-list`;
            }
        });
    }

    if (!propId && !propSlugParam) {
        loadingState.innerHTML = '<p>Property not found. <a href="properties.html">Return to listings</a>.</p>';
        return;
    }

    // Helper to create slug from title
    function createSlug(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Fetch Data
    const dataSource = CONFIG.APPS_SCRIPT_URL_LISTINGS;
    fetch(dataSource)
        .then(res => res.json())
        .then(data => {
            let property = null;

            if (propId) {
                property = data.find(p => String(p.id) === String(propId));
            }
            
            // Fallback to slug lookup if ID didn't match or wasn't provided
            if (!property && propSlugParam) {
                property = data.find(p => createSlug(p.title) === propSlugParam);
            }

            if (property) {
                renderPropertyDetails(property);
            } else {
                loadingState.innerHTML = `<p>Property not found. <a href="properties.html">Return to listings</a>.</p>`;
            }
        })
        .catch(err => {
            console.error('Error:', err);
            loadingState.innerHTML = '<p>Error loading property. Please try again.</p>';
        });

    function renderPropertyDetails(p) {
        // Basic Info
        document.getElementById('prop-title').innerText = p.title;
        document.getElementById('prop-location').querySelector('span').innerText = p.location;
        document.getElementById('prop-beds').innerText = p.beds;
        document.getElementById('prop-baths').innerText = p.baths;
        document.getElementById('prop-area').innerText = p.area_sqm;
        document.getElementById('prop-category').innerText = p.category;
        document.getElementById('prop-price').innerText = `${p.currency} ${p.price.toLocaleString()}`;
        document.getElementById('prop-status').innerText = p.type === 'sale' ? 'For Sale' : 'For Rent';
        
        // Descriptions
        // Use long_desc from Sheet or description from local JSON
        document.getElementById('prop-long-desc').innerText = p.long_desc || p.description || ""; 
        
        // Agent Info
        // Google Sheet uses agent_name/agent_phone, JSON uses agent: {name, phone}
        const agentName = p.agent_name || (p.agent ? p.agent.name : 'Al Badri Agent');
        const agentPhone = p.agent_phone || (p.agent ? p.agent.phone : '');

        document.getElementById('agent-name').innerText = agentName;
        
        const agentCallBtn = document.getElementById('agent-call');
        if (agentCallBtn) {
            agentCallBtn.href = agentPhone ? `tel:${agentPhone}` : '#';
            
            // Handle click behavior based on device
            agentCallBtn.onclick = (e) => {
                // Check if mobile (width <= 768px)
                const isMobile = window.innerWidth <= 768;
                
                if (!isMobile && agentPhone) {
                    e.preventDefault();
                    // Reveal number on desktop
                    agentCallBtn.innerHTML = `<ion-icon name="call-outline"></ion-icon> ${agentPhone}`;
                    agentCallBtn.style.backgroundColor = '#fff';
                    agentCallBtn.style.color = 'var(--primary-color)';
                    agentCallBtn.style.border = '1px solid var(--primary-color)';
                }
                // On mobile, let the default behavior (opening phone app) happen
            };
        }
        
        // Form Hidden Fields
        document.getElementById('form-prop-id').value = p.id;
        document.getElementById('form-prop-title').value = p.title;
        document.getElementById('modal-prop-title').innerText = p.title;

        // Amenities
        const amenitiesList = document.getElementById('prop-amenities-list');
        amenitiesList.innerHTML = '';
        if (p.amenities) {
            p.amenities.forEach(amenity => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; align-items: center; gap: 10px; color: #555;";
                li.innerHTML = `<ion-icon name="checkmark-circle-outline" style="color: var(--primary-color);"></ion-icon> ${amenity}`;
                amenitiesList.appendChild(li);
            });
        }

        // Carousel Images
        // Use the images array from the data directly
        const images = p.images || [];

        // If no images array exists (legacy/fallback), try to use image or thumbnail
        if (images.length === 0) {
            if (p.image) images.push(p.image);
            else if (p.thumbnail) images.push(p.thumbnail);
        }

        images.forEach((imgSrc, index) => {
            // Resolve full URL
            let fullImgUrl = imgSrc;
            if (imgSrc && !imgSrc.startsWith('http')) {
                 const baseUrl = CONFIG.S3_BASE_URL.endsWith('/') ? CONFIG.S3_BASE_URL : CONFIG.S3_BASE_URL + '/';
                 const path = imgSrc.startsWith('/') ? imgSrc.substring(1) : imgSrc;
                 fullImgUrl = baseUrl + path;
            }

            // Slide
            const slide = document.createElement('div');
            slide.style.cssText = "min-width: 100%; height: 100%; position: relative;";
            slide.innerHTML = `<img src="${fullImgUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
            carouselSlides.appendChild(slide);

            // Dot
            const dot = document.createElement('span');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.style.cssText = `width: 12px; height: 12px; border-radius: 50%; background: ${index === 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)'}; cursor: pointer; transition: 0.3s;`;
            dot.addEventListener('click', () => goToSlide(index));
            carouselDots.appendChild(dot);
        });

        initCarousel();

        // Reveal content
        loadingState.style.display = 'none';
        propertyContent.style.display = 'block';
    }

    // Carousel Logic
    let currentSlide = 0;
    
    function initCarousel() {
        const totalSlides = carouselSlides.children.length;
        if (totalSlides <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    function updateCarousel() {
        carouselSlides.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        const dots = carouselDots.children;
        Array.from(dots).forEach((dot, idx) => {
            dot.style.background = idx === currentSlide ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)';
        });
    }

    // Modal Logic
    const modal = document.getElementById('contact-modal');
    const openModalBtn = document.getElementById('open-contact-modal');
    const closeModalBtn = document.getElementById('close-modal');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form Submission Logic
    const contactForm = document.getElementById('contact-agent-form');
    const formStatus = document.getElementById('form-status');
    const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                propId: document.getElementById('form-prop-id').value,
                propTitle: document.getElementById('form-prop-title').value,
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                contactNumber: document.getElementById('user-phone').value,
                message: document.getElementById('user-message').value
            };

            // Use the common contact form submission function
            // Pass a callback to auto-close the modal after 3 seconds
            submitContactForm(formData, formStatus, submitButton, contactForm, () => {
                setTimeout(() => {
                    modal.style.display = 'none';
                    formStatus.style.display = 'none';
                }, 3000);
            });
        });
    }
});
