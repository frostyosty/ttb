// ./src/js/security.js 


import emailjs from '@emailjs/browser';
import { EMAIL_SERVICE_ID, EMAIL_PUBLIC_KEY } from './config.js';

const SECURITY_TEMPLATE_ID = "template_security";

emailjs.init(EMAIL_PUBLIC_KEY);

export function notifyAdminOfChange() {

  if (localStorage.getItem('tweed_is_admin_device')) {
    console.log("Security: Change made by Admin. No email sent.");
    return;
  }

  const lastSent = localStorage.getItem('tweed_last_security_alert');
  const now = Date.now();
  if (lastSent && now - parseInt(lastSent) < 10 * 60 * 1000) {
    console.log("Security: Alert throttled (sent recently).");
    return;
  }

  console.warn("Security: Detected change from unknown device. Sending Alert...");

  const templateParams = {
    time: new Date().toLocaleString(),
    device_info: navigator.userAgent
  };

  emailjs.send(EMAIL_SERVICE_ID, SECURITY_TEMPLATE_ID, templateParams).
  then(() => {
    console.log("Security: Alert Sent.");
    localStorage.setItem('tweed_last_security_alert', now.toString());
  }).
  catch((err) => console.error("Security: Failed to send alert", err));
}