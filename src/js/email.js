/// src/js/email.js
import emailjs from '@emailjs/browser';
import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, EMAIL_PUBLIC_KEY } from './config.js';

export function initEmailSystem() {
    emailjs.init(EMAIL_PUBLIC_KEY);

    const modal = document.getElementById('email-modal');
    const form = document.getElementById('email-form');
    const closeBtn = document.getElementById('close-email');

    // 1. Logic to OPEN the modal
    // We attach this to a global function so we can call it from anywhere
    window.openContactModal = () => {
        modal.classList.remove('hidden');
    };

    // 2. Logic to CLOSE
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // 3. Logic to SEND
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;

        emailjs.sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form)
            .then(() => {
                alert('Message Sent!');
                form.reset();
                modal.classList.add('hidden');
            })
            .catch((err) => {
                alert('Failed to send: ' + JSON.stringify(err));
            })
            .finally(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            });
    });
}