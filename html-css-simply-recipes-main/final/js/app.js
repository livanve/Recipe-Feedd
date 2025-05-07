const getElement = (selector) => {
  const element = document.querySelector(selector);
  if (element) return element;
  throw Error(`Please double check your class names, there is no ${selector} class`);
};

// This is the part where you conditionally select elements
let links;
let navBtnDOM;

if (document.body.classList.contains('navbar-page')) {
  // Only get these elements if the page has the navbar
  links = getElement('.nav-links');
  navBtnDOM = getElement('.nav-btn');

  navBtnDOM.addEventListener('click', () => {
    links.classList.toggle('show-links');  // Toggle the navbar menu on click
  });
}

// Toggle between login and sign-up forms
function toggleForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log('Login Response:', data); // Debugging line

  if (response.ok) {
    localStorage.setItem('token', data.token);  // Store JWT token in localStorage
    console.log('Token stored:', data.token);  // Debugging line
    window.location.href = '/recipes.html';  // Redirect to recipes page
  } else {
    alert(data.msg);  // Show error message from backend
  }
});

// Handle sign-up form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  console.log('Sign-up Response:', data); // Debugging line

  if (response.ok) {
    alert('Sign up successful');
    toggleForm();  // Show login form after successful sign-up
  } else {
    alert(data.msg);  // Show error message from backend
  }
});

const date = getElement('#date');
const currentYear = new Date().getFullYear();
date.textContent = currentYear;
