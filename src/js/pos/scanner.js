let buffer = '';
let lastKeyTime = 0;

export function initScanner() {
    console.log("🔫 Scanner Listener Active");

    document.addEventListener('keydown', (e) => {
        const currentTime = Date.now();
        const char = e.key;

        // Scanners type VERY fast (less than 50ms between keys usually)
        // If user is typing manually, it will be slower
        if (currentTime - lastKeyTime > 100) {
            buffer = ''; // Reset buffer if typing is too slow (human)
        }
        
        lastKeyTime = currentTime;

        if (char === 'Enter') {
            if (buffer.length > 3) {
                console.log("🔫 Scan Detected:", buffer);
                handleScan(buffer);
                buffer = '';
                e.preventDefault(); // Stop form submission if scanning in a form
            }
        } else if (char.length === 1) {
            // Only add printable characters
            buffer += char;
        }
    });
}

function handleScan(sku) {
    // Determine what to do based on context
    // If in Product Manager -> Do nothing (or warn duplicate)
    // If in Checkout -> Add item to cart
    
    // For now, just alert
    alert(`Scanned Item: ${sku}`);
    
    // Future: 
    // import('./checkout.js').then(m => m.addToCart(sku));
}