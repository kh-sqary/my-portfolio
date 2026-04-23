import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// If user is already logged in, redirect them to the dashboard immediately
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/dashboard';
  }
});

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.querySelector('.login-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    loginBtn.textContent = 'Signing in...';
    loginBtn.style.opacity = '0.7';
    loginBtn.disabled = true;
    errorMessage.textContent = '';
    
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will trigger redirect on success
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === 'auth/invalid-credential') {
        errorMessage.textContent = 'Invalid credentials.';
    } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/network-request-failed') {
        errorMessage.textContent = 'Missing Firebase Config. Please add your config in firebase-config.js';
    } else {
        errorMessage.textContent = 'An error occurred during sign in. Check console.';
    }
    
    loginBtn.textContent = 'Sign In';
    loginBtn.style.opacity = '1';
    loginBtn.disabled = false;
  }
});
