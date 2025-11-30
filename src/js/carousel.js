/// src/js/carousel.js

// 👇 CORRECT SUPABASE URL (Based on your logs)
const BASE_URL = 'https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/assets/';

const imageMap = {
    // We use the BASE_URL variable so we don't have to type the long string every time
    doors: [BASE_URL + 'door2.jpg', BASE_URL + 'door3.jpg', BASE_URL + 'door4.jpg'],
    windows: [BASE_URL + 'window1.jpg', BASE_URL + 'window2.jpg'],
    handles: [BASE_URL + 'handles1.jpg', BASE_URL + 'handles2.jpg'],
    electrical: [BASE_URL + 'elec2.jpg', BASE_URL + 'elec3.jpg'],
    tiles: [BASE_URL + 'tiles1.jpg', BASE_URL + 'tiles2.jpg', BASE_URL + 'tiles3.jpg']
};

let interval;

export function initCarousel() {
    const carouselImage = document.getElementById('carouselImage');
    
    // Silent exit if not on Home page
    if (!carouselImage) return; 

    // DEBUG: Verify we are using the correct URL now
    // console.log("Carousel: Base URL is:", BASE_URL);

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