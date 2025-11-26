/// src/js/email.js
import emailjs from '@emailjs/browser';
import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, EMAIL_PUBLIC_KEY } from './config.js';

export function initEmailSystem() {
    emailjs.init(EMAIL_PUBLIC_KEY);

    const modal = document.getElementById('email-modal');
    const form = document.getElementById('email-form');
    const closeBtn = document.getElementById('close-email');

    // Open Modal Logic
    window.openContactModal = () => {
        modal.classList.remove('hidden');
    };

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // --- FORM SUBMISSION LOGIC ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Check LocalStorage (Spam Prevention)
        const alreadySubmitted = localStorage.getItem('emailSubmitted');
        if (alreadySubmitted) {
            showPopup('You have already submitted the form. Only one submission is allowed.');
            modal.classList.add('hidden');
            return;
        }

        const btn = form.querySelector('.submit-btn');
        btn.innerText = 'Sending...';
        btn.disabled = true;

        // 2. Prepare Data (Matching your snippet's field names)
        // Note: We use form.elements to get values cleanly
        const templateParams = {
            from_name: form.elements['user_name'].value,
            from_email: form.elements['user_email'].value,
            subject: "Website Inquiry", // Or add a subject field to HTML if needed
            message: form.elements['message'].value
        };

        // 3. Send via EmailJS
        emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams)
            .then(() => {
                showPopup('Message successfully sent!');
                console.log('Email sent successfully!');
                
                // Set the lock
                localStorage.setItem('emailSubmitted', 'true');
                
                form.reset();
                modal.classList.add('hidden');
            })
            .catch((err) => {
                showPopup('Error sending email. Please try again later.');
                console.error('Error sending email:', err);
            })
            .finally(() => {
                btn.innerText = 'Send';
                btn.disabled = false;
            });
    });
}

// --- POPUP LOGIC ---
function showPopup(message) {
    // We'll reuse the "toast" element we already have in index.html, 
    // or create a new one if you prefer. Here we use the existing one:
    const popup = document.getElementById('toast');
    
    // Override styles to look like your request
    popup.innerText = message;
    popup.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(function () {
        popup.classList.add('hidden');
    }, 3000);
}