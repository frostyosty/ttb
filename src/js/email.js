/// src/js/email.js
import emailjs from '@emailjs/browser';
import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, EMAIL_PUBLIC_KEY } from './config.js';

let isInitialized = false;

// We export this to run ONCE at startup to set keys
export function initEmailConfig() {
    if (!isInitialized) {
        emailjs.init(EMAIL_PUBLIC_KEY);
        isInitialized = true;
    }
}

// We export this to run AFTER EVERY RENDER to attach listeners to the new form
export function attachEmailListeners() {
    const form = document.getElementById('embedded-email-form');
    
    // If form isn't on this page (e.g. Home page), just exit
    if (!form) return;

    // Prevent duplicate listeners
    if (form.getAttribute('data-listening') === 'true') return;
    form.setAttribute('data-listening', 'true');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Spam Prevention
        const alreadySubmitted = localStorage.getItem('emailSubmitted');
        if (alreadySubmitted) {
            showPopup('You have already submitted the form. Only one submission is allowed.');
            return;
        }

        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;

        // 2. Prepare Data
        const templateParams = {
            from_name: form.elements['user_name'].value,
            from_email: form.elements['user_email'].value,
            subject: "Website Inquiry",
            message: form.elements['message'].value
        };

        // 3. Send
        emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams)
            .then(() => {
                showPopup('Message successfully sent!');
                localStorage.setItem('emailSubmitted', 'true');
                form.reset();
            })
            .catch((err) => {
                showPopup('Error sending email. Please try again later.');
                console.error('Error sending email:', err);
            })
            .finally(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            });
    });
}

function showPopup(message) {
    const popup = document.getElementById('toast');
    if (popup) {
        popup.innerText = message;
        popup.classList.remove('hidden');
        popup.style.background = '#333'; // Reset color just in case
        setTimeout(() => popup.classList.add('hidden'), 3000);
    } else {
        alert(message);
    }
}