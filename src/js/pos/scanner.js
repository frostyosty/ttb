// ./src/js/pos/scanner.js 

let buffer = '';
let lastKeyTime = 0;

let isListening = false;

export function initScanner() {
  if (isListening) return;
  isListening = true;
  console.log("🔫 Scanner Listener Active");

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('pos-view')) return;

    const currentTime = Date.now();
    const char = e.key;

    if (currentTime - lastKeyTime > 100) {
      buffer = '';
    }

    lastKeyTime = currentTime;

    if (char === 'Enter') {
      if (buffer.length > 3) {
        console.log("🔫 Scan Detected:", buffer);
        handleScan(buffer);
        buffer = '';
        e.preventDefault();
      }
    } else if (char.length === 1) {

      buffer += char;
    }
  });
}

function handleScan(sku) {

  alert(`Scanned Item: ${sku}`);

}