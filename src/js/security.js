/// src/js/security.js
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/+esm';
import { EMAIL_SERVICE_ID, EMAIL_PUBLIC_KEY } from './config.js';

// REPLACE THIS WITH YOUR NEW TEMPLATE ID FROM STEP 1
const SECURITY_TEMPLATE_ID = "template_security"; 

// Initialize (Safe to call multiple times)
emailjs.init(EMAIL_PUBLIC_KEY);

export function notifyAdminOfChange() {
    // 1. CHECK: Is this the Admin (You)?
    // We will set this flag on your computer later.
    if (localStorage.getItem('tweed_is_admin_device')) {
        console.log("Security: Change made by Admin. No email sent.");
        return;
    }

    // 2. CHECK: Throttle (Don't spam emails)
    // Only allow 1 email every 10 minutes
    const lastSent = localStorage.getItem('tweed_last_security_alert');
    const now = Date.now();
    if (lastSent && (now - parseInt(lastSent) < 10 * 60 * 1000)) {
        console.log("Security: Alert throttled (sent recently).");
        return;
    }

    console.warn("Security: Detected change from unknown device. Sending Alert...");

    // 3. SEND EMAIL
    const templateParams = {
        time: new Date().toLocaleString(),
        device_info: navigator.userAgent // Tells you if it was iPhone, Chrome, etc.
    };

    emailjs.send(EMAIL_SERVICE_ID, SECURITY_TEMPLATE_ID, templateParams)
        .then(() => {
            console.log("Security: Alert Sent.");
            localStorage.setItem('tweed_last_security_alert', now.toString());
        })
        .catch(err => console.error("Security: Failed to send alert", err));
}