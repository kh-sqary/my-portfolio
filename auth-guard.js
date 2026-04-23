import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Apply initial hidden state to prevent UI Flash
const hideStyle = document.createElement('style');
hideStyle.textContent = `
    body {
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.4s ease, visibility 0.4s ease;
    }
    body.auth-resolved {
        opacity: 1;
        visibility: visible;
    }
`;
document.head.appendChild(hideStyle);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // If not authenticated, send strictly to login page
    window.location.href = '/login';
  } else {
    // Reveal dashboard
    document.body.classList.add('auth-resolved');
  }
});

// Expose a logout function for UI mapping
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = '/login';
    } catch(err) {
        console.error("Error signing out", err);
    }
}
