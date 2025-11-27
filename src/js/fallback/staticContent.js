/// src/js/fallback/staticContent.js

export const STATIC_CONTENT = [
    // --- HOME PAGE ---
    {
        id: 'static_1',
        type: 'section',
        page: 'home',
        position: 1,
        content: '<h3>About Us</h3><p>Founded over 30 years ago by Malcolm Tweed, Tweed Trading has been consistently providing Tauranga with an abundance of recycled building materials.</p><p><b>Open Hours:</b> Saturdays 11:00 AM - 1:00 PM</p>',
        styles: { padding: "30px", maxWidth: "800px", margin: "20px auto", background: "white", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }
    },
    {
        id: 'static_2',
        type: 'carousel', // Triggers the slideshow logic
        page: 'home',
        position: 2,
        content: '<h3 style="color:#2e7d32; text-transform: uppercase;">Sample Stock</h3><div style="text-align: center; margin-bottom: 20px;"><button id="doorsButton" class="filter-btn">Doors</button><button id="windowsButton" class="filter-btn">Windows</button><button id="handlesButton" class="filter-btn">Handles</button><button id="electricalButton" class="filter-btn">Electrical</button><button id="tilesButton" class="filter-btn">Tiles</button></div><div style="text-align: center;"><img id="carouselImage" src="/assets/window2.jpg" alt="Sample Stock" style="max-width: 100%; height: 350px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>',
        styles: { padding: "30px", maxWidth: "800px", margin: "20px auto", background: "white", borderRadius: "8px" }
    },
    {
        id: 'static_3',
        type: 'map', // Triggers Google Map
        page: 'home',
        position: 10,
        content: '<h3>Location</h3><p>40 Courtney Road, Gate Pa, Tauranga 3112</p><div style="position: relative; overflow: hidden; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.8742754005966!2d176.14208587676032!3d-37.71683830148812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d6dda452fcab65d%3A0x1f1b293584d1e986!2s40%20Courtney%20Road%2C%20Gate%20Pa%2C%20Tauranga%203112!5e0!3m2!1sen!2snz" width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: 0;" allowfullscreen loading="lazy"></iframe></div>',
        styles: { padding: "30px", maxWidth: "800px", margin: "40px auto", background: "white", borderRadius: "8px" }
    },

    // --- PRODUCTS PAGE ---
    {
        id: 'static_4',
        type: 'header',
        page: 'products',
        position: 1,
        content: '<h3>Current Inventory</h3><p>We stock a wide range of recycled materials.</p>',
        styles: { textAlign: "center", marginTop: "40px", color: "#2e7d32" }
    },
    {
        id: 'static_5',
        type: 'section',
        page: 'products',
        position: 2,
        content: '<h4>Timber</h4><ul><li>Reclaimed Wood</li><li>Rimu & Matai Flooring</li><li>Wooden Beams</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },
    {
        id: 'static_6',
        type: 'section',
        page: 'products',
        position: 3,
        content: '<h4>Doors</h4><ul><li>Wooden Doors</li><li>Paneled Doors</li><li>French Doors</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },
    {
        id: 'static_7',
        type: 'section',
        page: 'products',
        position: 4,
        content: '<h4>Windows</h4><ul><li>Sash windows</li><li>Casement windows</li><li>Leadlights</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },

    // --- CONTACT PAGE ---
    {
        id: 'static_8',
        type: 'contact',
        page: 'contact',
        position: 1,
        content: '<h3>Contact Us</h3><p><b>Email:</b> admin@tweedtrading.com</p><p><b>Address:</b> 40 Courtney Rd, Gate Pa, Tauranga</p>',
        styles: { padding: "30px", maxWidth: "800px", margin: "20px auto", textAlign: "center", background: "#2e7d32", color: "white", borderRadius: "8px" }
    },
    {
        id: 'static_9',
        type: 'form', // Triggers the Email Form logic
        page: 'contact',
        position: 2,
        content: '<h3>Send us a message</h3><form id="embedded-email-form" style="display: flex; flex-direction: column; gap: 10px;"><input type="text" name="user_name" placeholder="Your Name" required style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"><input type="email" name="user_email" placeholder="Your Email" required style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"><textarea name="message" rows="5" placeholder="What are you looking for?" required style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; resize: vertical;"></textarea><button type="submit" class="submit-btn" style="background-color: #2e7d32; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem; margin-top: 10px;">Send Message</button></form>',
        styles: { padding: "30px", maxWidth: "600px", margin: "20px auto", background: "white", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }
    },

    // --- UTILITIES ---
    {
        id: 'static_10',
        type: 'notepad', // LocalStorage Notepad (Works Offline!)
        page: 'home',
        position: 99,
        content: '',
        styles: { padding: "10px", margin: "20px auto", maxWidth: "600px", background: "transparent" }
    }
];