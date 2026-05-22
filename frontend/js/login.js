const API_URL = 'http://localhost:3000/api';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const formError = document.getElementById('formError');

// Check if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear errors
    emailError.textContent = '';
    passwordError.textContent = '';
    formError.textContent = '';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email) {
        emailError.textContent = 'Email is required';
        return;
    }
    if (!/^\S+@\S+$/.test(email)) {
        emailError.textContent = 'Valid email is required';
        return;
    }
    if (!password) {
        passwordError.textContent = 'Password is required';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        formError.textContent = error.message;
    }
});