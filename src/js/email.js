// ./src/js/email.js 


import emailjs from '@emailjs/browser';

import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, EMAIL_PUBLIC_KEY } from './config.js';

let isInitialized = false;

export function initEmailConfig() {
  if (!isInitialized) {
    emailjs.init(EMAIL_PUBLIC_KEY);
    isInitialized = true;
  }
}

export function attachEmailListeners() {
  bindEmailForm(document.getElementById('embedded-email-form'));

  const modal = document.getElementById('email-modal');
  const closeBtn = document.getElementById('close-email');
  if (modal && closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
  bindEmailForm(document.getElementById('email-form'), () => modal.classList.add('hidden'));
}

function bindEmailForm(form, onSent) {
  if (!form) return;
  if (form.getAttribute('data-listening') === 'true') return;
  form.setAttribute('data-listening', 'true');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const lastSubmit = localStorage.getItem('lastEmailSubmit');
    const now = Date.now();
    const COOLDOWN_MS = 2 * 60 * 1000;

    if (lastSubmit) {
      const timeDiff = now - parseInt(lastSubmit);
      if (timeDiff < COOLDOWN_MS) {
        const secondsLeft = Math.ceil((COOLDOWN_MS - timeDiff) / 1000);
        showPopup(`To prevent spam, please wait ${secondsLeft} seconds before sending another message.`);
        return;
      }
    }

    const btn = form.querySelector('.submit-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Sending...';
    btn.disabled = true;

    const templateParams = {
      from_name: form.elements['user_name'].value,
      from_email: form.elements['user_email'].value,
      subject: "Website Inquiry",
      message: form.elements['message'].value
    };

    emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams).
    then(() => {
      showPopup('Message successfully sent!');
      localStorage.setItem('lastEmailSubmit', Date.now().toString());
      form.reset();
      if (onSent) onSent();
    }).
    catch((err) => {
      showPopup('Error sending email. Please try again later.');
      console.error(err);
    }).
    finally(() => {
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
    popup.style.background = '';
    setTimeout(() => popup.classList.add('hidden'), 4000);
  } else {
    alert(message);
  }
}