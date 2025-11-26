/// src/js/fallbackData.js
export const FALLBACK_ITEMS = [
    // --- HOME PAGE ---
    {
        type: 'section',
        page: 'home',
        content: '<h3>About Us</h3><p>Founded over 30 years ago by Malcolm Tweed, Tweed Trading has been consistently providing Tauranga with an abundance of recycled building materials.</p><p><b>Open Hours:</b> Saturdays 11:00 AM - 1:00 PM</p>',
        styles: { padding: "30px", maxWidth: "800px", margin: "20px auto", background: "white", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }
    },
    {
        type: 'header',
        page: 'products',
        content: '<h3>Current Inventory</h3><p>We stock a wide range of recycled materials.</p>',
        styles: { textAlign: "center", marginTop: "40px", color: "#2e7d32" }
    },
    // --- PRODUCTS PAGE ---
    {
        type: 'product',
        page: 'products',
        content: '<h4>Timber</h4><ul><li>Reclaimed Wood</li><li>Rimu & Matai Flooring</li><li>Wooden Beams</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },
    {
        type: 'product',
        page: 'products',
        content: '<h4>Doors</h4><ul><li>Wooden Doors</li><li>Paneled Doors</li><li>French Doors</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },
    {
        type: 'product',
        page: 'products',
        content: '<h4>Windows</h4><ul><li>Sash windows</li><li>Casement windows</li><li>Leadlights</li></ul>',
        styles: { padding: "20px", margin: "10px auto", maxWidth: "600px", background: "white", borderLeft: "5px solid #2e7d32", borderRadius: "5px" }
    },
    // --- CONTACT PAGE ---
    {
        type: 'contact',
        page: 'contact',
        content: '<h3>Contact Us</h3><p><b>Email:</b> admin@tweedtrading.com</p><p><b>Address:</b> 40 Courtney Rd, Gate Pa, Tauranga</p>',
        styles: { padding: "30px", maxWidth: "800px", margin: "20px auto", textAlign: "center", background: "#2e7d32", color: "white", borderRadius: "8px" }
    },
    // --- MAP (On Contact Page) ---
    {
        type: 'map',
        page: 'contact',
        content: '<h3>Location</h3><div style="position: relative; overflow: hidden; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.8742754005966!2d176.14208587676032!3d-37.71683830148812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d6dda452fcab65d%3A0x1f1b293584d1e986!2s40%20Courtney%20Road%2C%20Gate%20Pa%2C%20Tauranga%203112!5e0!3m2!1sen!2snz" width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: 0;" allowfullscreen loading="lazy"></iframe></div>',
        styles: { padding: "30px", maxWidth: "800px", margin: "40px auto", background: "white", borderRadius: "8px" }
    }
];