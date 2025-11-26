/// src/js/carousel.js
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
    
    // Silent exit if not on Home page (Fixes the console warnings)
    if (!carouselImage) return; 

    const startShow = (category) => {
        const images = imageMap[category];
        if (!images) return;

        let index = 0;
        carouselImage.src = images[0];

        if (interval) clearInterval(interval);

        interval = setInterval(() => {
            index = (index + 1) % images.length;
            carouselImage.src = images[index];
        }, 3000);
    };

    const setupBtn = (id, category) => {
        const btn = document.getElementById(id);
        if (btn) {
            // Clone to remove old listeners (prevents duplicate clicks)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
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