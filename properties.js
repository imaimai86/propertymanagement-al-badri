document.addEventListener('DOMContentLoaded', () => {
    const propertyList = document.getElementById('property-list');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const resetBtn = document.getElementById('reset-filters');

    // Configuration - Set this to your Apps Script URL once deployed
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqtr-5Caf5O_ZyckSeqEbc5LuP9041SD7rfVzNkJK4R2vn8JeDASFQdiUTPmoCa67V/exec"; // AI - Do not change this
    
    let allProperties = [];

    // Fetch data
    const dataSource = APPS_SCRIPT_URL || 'properties.json';

    fetch(dataSource)
        .then(response => response.json())
        .then(data => {
            allProperties = data;
            
            // Check for URL parameters to set initial filters
            const urlParams = new URLSearchParams(window.location.search);
            const typeParam = urlParams.get('type');
            
            if (typeParam && filterType) {
                // Determine if the param matches a value in our select
                // (handling case-insensitivity)
                const options = Array.from(filterType.options).map(o => o.value);
                if (options.includes(typeParam.toLowerCase())) {
                    filterType.value = typeParam.toLowerCase();
                } else if (typeParam === 'all') {
                    filterType.value = 'all';
                }
            }

            const categoryParam = urlParams.get('category');
            if (categoryParam && filterCategory) {
                 const options = Array.from(filterCategory.options).map(o => o.value);
                 // Since category values in HTML might be Title Case (Villa) but param might vary
                 // Find matching option ignoring case
                 const match = options.find(opt => opt.toLowerCase() === categoryParam.toLowerCase());
                 if (match) {
                     filterCategory.value = match;
                 }
            }

            // Initial render
            renderProperties(getFilteredProperties());
        })
        .catch(error => {
            console.error('Error loading properties:', error);
             if (propertyList) {
                propertyList.innerHTML = '<p>Error loading properties. Please ensure you are running this on a web server.</p>';
            }
        });

    // Event Listeners for Filters
    if(filterType) filterType.addEventListener('change', updateFilters);
    if(filterCategory) filterCategory.addEventListener('change', updateFilters);
    if(resetBtn) resetBtn.addEventListener('click', resetFilters);

    function updateFilters() {
        const filtered = getFilteredProperties();
        renderProperties(filtered);
    }

    function resetFilters() {
        if(filterType) filterType.value = 'all';
        if(filterCategory) filterCategory.value = 'all';
        
        // Remove query params from URL without reload
        const url = new URL(window.location);
        url.search = '';
        window.history.pushState({}, '', url);
        
        updateFilters();
    }

    function getFilteredProperties() {
        if (!filterType || !filterCategory) return allProperties;

        const typeValue = filterType.value;
        const categoryValue = filterCategory.value;

        return allProperties.filter(p => {
            const matchType = typeValue === 'all' || p.type.toLowerCase() === typeValue.toLowerCase();
            const matchCategory = categoryValue === 'all' || p.category.toLowerCase() === categoryValue.toLowerCase();
            return matchType && matchCategory;
        });
    }

    function renderProperties(properties) {
        if (!propertyList) return;
        
        propertyList.innerHTML = '';

        if (properties.length === 0) {
            propertyList.innerHTML = '<p class="no-results" style="grid-column: 1/-1; text-align: center; color: #666; font-size: 1.1em; padding: 40px;">No properties found matching your criteria.</p>';
            return;
        }

        properties.forEach(p => {
            const card = document.createElement('a'); // Changed to <a>
            card.href = `property-details.html?id=${p.id}`; // Add link
            card.style.display = "block";
            card.className = 'gallery-item';
            
            // Format price: 5000000 -> 5,000,000
            const formattedPrice = p.price.toLocaleString();
            const priceLabel = `${p.currency} ${formattedPrice}`;

            card.innerHTML = `
                <div class="image-container" style="position: relative; overflow: hidden; height: 250px;">
                    <img src="${p.image || p.thumbnail}" alt="${p.title}" class="gallery-img-real" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;">
                    <span class="badge" style="position: absolute; top: 15px; right: 15px; background: var(--secondary-color); color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.8em; text-transform: uppercase; font-weight: 500; letter-spacing: 0.5px;">${p.type}</span>
                </div>
                <div class="gallery-info" style="padding: 20px; text-align: left;">
                    <div style="margin-bottom: 10px;">
                        <h4 style="margin: 0; font-size: 1.25em; margin-bottom: 5px;">${p.title}</h4>
                        <p style="color: #666; font-size: 0.9em; margin:0;">
                            <ion-icon name="location-outline" style="vertical-align: text-bottom; color: var(--primary-color);"></ion-icon> ${p.location}
                        </p>
                    </div>
                    
                    <div style="font-weight: 700; color: var(--primary-color); font-size: 1.1em; margin-bottom: 15px;">${priceLabel}</div>

                    <div class="property-features" style="display: flex; gap: 15px; border-top: 1px solid #eee; padding-top: 15px; color: #555; font-size: 0.9em;">
                        ${p.beds > 0 ? `<span style="display: flex; align-items: center; gap: 5px;"><ion-icon name="bed-outline"></ion-icon> ${p.beds}</span>` : ''}
                        ${p.baths > 0 ? `<span style="display: flex; align-items: center; gap: 5px;"><ion-icon name="water-outline"></ion-icon> ${p.baths}</span>` : ''}
                        <span style="display: flex; align-items: center; gap: 5px;"><ion-icon name="scan-outline"></ion-icon> ${p.area_sqm} m²</span>
                    </div>
                </div>
            `;
            
            // Hover effect for image zoom needs CSS, but we can rely on existing gallery-item CSS if it covers it.
            // Just in case, I added inline styles above, but let's assume global CSS handles .gallery-img-real hover.
            
            propertyList.appendChild(card);
        });
    }
});
