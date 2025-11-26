// src/js/carousel.js

// Define image paths (Updated to point to your assets folder)
const imageMap = {
    doors: ['/assets/door2.jpg', '/assets/door3.jpg', '/assets/door4.jpg'],
    windows: ['/assets/window1.jpg', '/assets/window2.jpg'],
    handles: ['/assets/handles1.jpg', '/assets/handles2.jpg'],
    electrical: ['/assets/elec2.jpg', '/assets/elec3.jpg'],
    tiles: ['/assets/tiles1.jpg', '/assets/tiles2.jpg', '/assets/tiles3.jpg']
};

let interval;

export function initCarousel() {
    const carouselImage = document.getElementById('carouselImage');
    
    // Safety check: If we aren't on the Home page, these elements won't exist.
    if (!carouselImage) return; 

    // Helper to run the slideshow
    const startShow = (category) => {
        const images = imageMap[category];
        if (!images) return;

        let index = 0;
        carouselImage.src = images[0];

        // Clear old timer
        if (interval) clearInterval(interval);

        // Start new timer (3 seconds)
        interval = setInterval(() => {
            index = (index + 1) % images.length;
            carouselImage.src = images[index];
        }, 3000);
    };

    // Attach Listeners to Buttons
    // We utilize a helper to keep code dry
    const setupBtn = (id, category) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                startShow(category);
            });
        }
    };

    setupBtn('doorsButton', 'doors');
    setupBtn('windowsButton', 'windows');
    setupBtn('handlesButton', 'handles');
    setupBtn('electricalButton', 'electrical');
    setupBtn('tilesButton', 'tiles');
}