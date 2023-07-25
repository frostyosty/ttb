document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();
  
    // Check if the flag indicating previous submission exists in local storage or cookies
    const alreadySubmitted = localStorage.getItem('emailSubmitted'); // For local storage
  
    if (alreadySubmitted) {
      console.log('You have already submitted the form. Only one submission is allowed.');
      // Display a message to the user indicating that only one submission is allowed.
      return;
    }
  
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value,
    };
  
    // Replace YOUR_EMAILJS_USER_ID and YOUR_EMAILJS_TEMPLATE_ID with your actual values
    emailjs.send('service_rrotpos', 'template_b1rhpqe', formData)
      .then(function(response) {
        console.log('Email sent successfully!', response);
        // Handle success and show a confirmation message to the user
  
        // Set the flag in local storage or cookies to indicate that the user has submitted the form
        localStorage.setItem('emailSubmitted', 'true'); // For local storage
      }, function(error) {
        console.log('Error sending email:', error);
        // Handle error and show an error message to the user
      });
  });
  