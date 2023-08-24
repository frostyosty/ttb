document.getElementById('contactForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const alreadySubmitted = localStorage.getItem('emailSubmitted');

  if (alreadySubmitted) {
    showPopup('You have already submitted the form. Only one submission is allowed.');
    return;
  }

  const formData = {
    from_name: document.getElementById('name').value,
    from_email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
  };

  // need to swap YOUR_EMAILJS_USER_ID and YOUR_EMAILJS_TEMPLATE_ID with real values
  emailjs.send('service_rrotpos', 'template_b1rhpqe', formData)
    .then(function(response) {
      showPopup('Message successfully sent!');
      console.log('Email sent successfully!', response);
      localStorage.setItem('emailSubmitted', 'true');
    }, function(error) {
      showPopup('Error sending email. Please try again later.');
      console.log('Error sending email:', error);
    });
});

function showPopup(message) {
  const popup = document.getElementById('popup');
  popup.textContent = message;
  popup.style.display = 'block';
  setTimeout(function () {
    popup.style.display = 'none';
  }, 3000);
}
