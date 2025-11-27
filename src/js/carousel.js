/// src/js/carousel.js

// --- CONFIG YOUR BASE URL HERE ---
// Option A: Local Assets (Default)
// const BASE_URL = '/assets/';

// Option B: Supabase Storage (Uncomment and replace ID if using Supabase)
// const BASE_URL = 'https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/assets/';

// DEBUG: Check what the URL is currently set to
// If BASE_URL isn't defined above, we assume the user hardcoded paths below.
// Let's create a dynamic check:

const imageMap = {
    // If you haven't switched to Supabase yet, ensure these start with /assets/
    // If you HAVE switched, paste the full URL here or use a BASE_URL variable.
    doors: ['/assets/door2.jpg', '/assets/door3.jpg', '/assets/door4.jpg'],
    windows: ['/assets/window1.jpg', '/assets/window2.jpg'],
    handles: ['/assets/handles1.jpg', '/assets/handles2.jpg'],
    electrical: ['/assets/elec2.jpg', '/assets/elec3.jpg'],
    tiles: ['/assets/tiles1.jpg', '/assets/tiles2.jpg', '/assets/tiles3.jpg']
};

let interval;

export function initCarousel() {
    console.log("Carousel: Initializing..."); 
    
    // DEBUG: Log the first image path to see what it's trying to load
    console.log("Carousel: Debug Image Path [Doors 1]:", imageMap.doors[0]);

    const carouselImage = document.getElementById('carouselImage');
    
    if (!carouselImage) {
        // Silent exit if not on Home page
        return; 
    }

    const startShow = (category) => {
        const images = imageMap[category];
        if (!images) {
            console.warn(`Carousel: No images defined for category '${category}'`);
            return;
        }

        console.log(`Carousel: Switching to '${category}'. Loading:`, images[0]);

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
        } else {
            // Only warn if we are on the home page but missing buttons
            // (If we are on home page, carouselImage exists, so we should see buttons)
            console.warn(`Carousel: Button '${id}' not found in DOM.`);
        }
    };

    setupBtn('doorsButton', 'doors');
    setupBtn('windowsButton', 'windows');
    setupBtn('handlesButton', 'handles');
    setupBtn('electricalButton', 'electrical');
    setupBtn('tilesButton', 'tiles');
}