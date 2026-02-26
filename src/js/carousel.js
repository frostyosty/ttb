// ./src/js/carousel.js 


const BASE_URL = 'https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/';

const imageMap = {
  doors: [BASE_URL + 'marco_doors_IMG_9808.jpg', BASE_URL + 'door4.jpg'],
  windows: [BASE_URL + 'window1.jpg', BASE_URL + 'window2.jpg'],
  handles: [BASE_URL + 'marco_handles_IMG_9805.jpg', BASE_URL + 'handles1.jpg'],
  electrical: [BASE_URL + 'marco_elec_IMG_9797.jpg', BASE_URL + 'elec2.jpg']

};

let interval;

export function initCarousel() {
  const carouselImage = document.getElementById('carouselImage');

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

  startShow('doors');
}