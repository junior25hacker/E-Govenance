const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = 'login.html';
}

// Check role from token
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'super_admin') {
        alert('Super admin access required');
        window.location.href = 'login.html';
    }
} catch (e) {
    window.location.href = 'login.html';
}

// Load admins on page load
loadAdmins();

// Add admin form
document.getElementById('addAdminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('addMessage');
    
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Admin added successfully';
            document.getElementById('addAdminForm').reset();
            loadAdmins(); // Refresh list
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Failed to add admin';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Error adding admin';
    }
    
    setTimeout(() => {
        messageDiv.className = '';
        messageDiv.textContent = '';
    }, 3000);
});

async function loadAdmins() {
    const tbody = document.getElementById('adminsList');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const admins = await response.json();
        
        if (admins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No admins found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        admins.forEach(admin => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = admin.id;
            row.insertCell(1).textContent = admin.email;
            row.insertCell(2).textContent = new Date(admin.createdAt).toLocaleDateString();
            const actionCell = row.insertCell(3);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete';
            deleteBtn.onclick = () => deleteAdmin(admin.id);
            actionCell.appendChild(deleteBtn);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading admins</td></tr>';
    }
}

async function deleteAdmin(id) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadAdmins(); // Refresh list
        } else {
            alert(data.message || 'Failed to delete admin');
        }
    } catch (error) {
        alert('Error deleting admin');
    }
}