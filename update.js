const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'egov-backend', 'views', 'documents.hbs');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Insert CSS
const cssToInsert = `
    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(5,13,31,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
    }
    .modal-overlay.active { opacity: 1; pointer-events: all; }
    .modal-content {
      background: rgba(10,24,51,0.95); border: 1px solid var(--border); border-radius: var(--r-xl);
      width: 100%; max-width: 500px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      transform: translateY(20px); transition: transform 0.3s ease;
    }
    .modal-overlay.active .modal-content { transform: translateY(0); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .modal-title { font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 600; color: var(--white); }
    .modal-close { background: none; border: none; color: var(--cream-dim); cursor: pointer; display: flex; transition: color 0.2s; }
    .modal-close:hover { color: var(--white); }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--cream-dim); margin-bottom: 8px; }
    .form-control {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: var(--r); padding: 12px 16px; color: var(--white); font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s, background 0.2s;
    }
    .form-control:focus { border-color: var(--gold); background: rgba(255,255,255,0.08); outline: none; }
    .form-control option { background: var(--navy-2); color: var(--white); }
    input[type="file"]::file-selector-button {
      background: var(--glass); border: 1px solid var(--border); color: var(--cream);
      padding: 8px 12px; border-radius: var(--r); margin-right: 12px; cursor: pointer; transition: background 0.2s;
    }
    input[type="file"]::file-selector-button:hover { background: var(--glass-b); color: var(--white); }
    .btn-submit { width: 100%; display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
    .spinner { display: none; width: 18px; height: 18px; border: 2px solid var(--navy); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
    .btn-loading .spinner { display: block; }
    .btn-loading .btn-text { opacity: 0.8; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* TOAST */
    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 1100; display: flex; flex-direction: column; gap: 10px; }
    .toast { background: var(--glass); backdrop-filter: blur(10px); border: 1px solid var(--border); border-left: 4px solid var(--success); border-radius: var(--r); padding: 16px 20px; color: var(--white); box-shadow: 0 10px 30px rgba(0,0,0,0.3); transform: translateX(120%); transition: transform 0.3s ease; }
    .toast.show { transform: translateX(0); }
    .toast.error { border-left-color: var(--danger); }
    .doc-status.rejected { background: rgba(239,68,68,0.15); color: #ef4444; }
</style>
`;
content = content.replace('</style>', cssToInsert);

// 2. Insert Button
content = content.replace('Filter\n        </button>', `Filter\n        </button>\n        <button id="digitize-btn" class="btn-primary" onclick="openModal()">\n          <span class="material-symbols-outlined">add</span>\n          Digitize New Document\n        </button>`);

// 3. Insert Modal HTML
const modalHtml = `
  <!-- DIGITIZE MODAL -->
  <div class="modal-overlay" id="digitize-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Digitize Document</h3>
        <button class="modal-close" onclick="closeModal()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form id="digitize-form" onsubmit="submitVerification(event)">
        <div class="form-group">
          <label class="form-label">Document Type</label>
          <select class="form-control" id="doc-type" required>
            <option value="" disabled selected>Select document type...</option>
            <option value="Birth Certificate">Birth Certificate</option>
            <option value="National ID">National ID</option>
            <option value="Passport">Passport</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Council Jurisdiction</label>
          <input type="text" class="form-control" id="council-jurisdiction" placeholder="e.g. City Council District 4" required />
        </div>
        <div class="form-group">
          <label class="form-label">Upload File</label>
          <input type="file" class="form-control" id="doc-file" accept="image/*,.pdf" required />
        </div>
        <button type="submit" class="btn-primary btn-submit" id="submit-btn">
          <div class="spinner"></div>
          <span class="btn-text">Submit for Verification</span>
        </button>
      </form>
    </div>
  </div>

  <div class="toast-container" id="toast-container"></div>
<script>
`;
content = content.replace('<script>', modalHtml);

// 4. Replace script logic
const newScript = `<script>
    const token = localStorage.getItem('egov_token');
    const citizenId = '{{user.citizenId}}';

    function openModal() {
      document.getElementById('digitize-modal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('digitize-modal').classList.remove('active');
      document.getElementById('digitize-form').reset();
    }

    function showToast(msg, isError = false) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast' + (isError ? ' error' : '');
      toast.innerText = msg;
      container.appendChild(toast);
      
      // trigger reflow
      void toast.offsetWidth;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }

    async function submitVerification(e) {
      e.preventDefault();
      
      const btn = document.getElementById('submit-btn');
      btn.classList.add('btn-loading');
      btn.disabled = true;

      try {
        const docType = document.getElementById('doc-type').value;
        const council = document.getElementById('council-jurisdiction').value;
        const fileInput = document.getElementById('doc-file');
        
        let filePath = "mock_path_or_base64";
        if (fileInput.files.length > 0) {
          filePath = await fileToBase64(fileInput.files[0]);
        }

        const payload = {
          citizenId: citizenId,
          documentType: docType,
          councilJurisdiction: council,
          filePath: filePath,
          purpose: "Verification"
        };

        const res = await fetch('/api/v1/documents/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          closeModal();
          showToast("Document sent to Civil Registry for verification");
          fetchWalletDocuments(); // Refresh wallet
        } else {
          showToast(data.message || 'Error submitting document', true);
        }
      } catch (err) {
        console.error(err);
        showToast('Submission failed. Please try again.', true);
      } finally {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
      }
    }

    async function fetchWalletDocuments() {
      try {
        if (!token) return;

        const res = await fetch(\`/api/v1/documents?citizenId=\${citizenId}\`, {
          headers: { Authorization: \`Bearer \${token}\` },
        });

        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        if (res.ok && data.data) {
          renderWalletDocuments(data.data);
        }
      } catch (err) {
        console.error('Fetch wallet error', err);
      }
    }

    function renderWalletDocuments(docs) {
      const grid = document.getElementById('docs-grid');
      grid.innerHTML = '';
      
      if (!docs || docs.length === 0) {
        grid.innerHTML = \`<div class="empty-state" style="grid-column: 1 / -1;">
          <span class="material-symbols-outlined ms">description</span>
          <h3>No documents in wallet</h3>
          <p>You haven't digitized any documents yet.</p>
        </div>\`;
        return;
      }

      docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card';
        
        const statusLower = (doc.status || '').toLowerCase();
        
        let badgeHtml = '';
        let actionHtml = '';
        
        if (statusLower === 'verified') {
          badgeHtml = \`<div class="doc-status verified">
            <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span>
            Verified
          </div>\`;
          actionHtml = \`<div class="doc-actions">
            <button class="doc-action-btn" onclick="downloadDocument('\${doc.id}', '\${doc.documentType}')">
              <span class="material-symbols-outlined">download</span> View/Download
            </button>
          </div>\`;
        } else if (statusLower === 'rejected') {
          badgeHtml = \`<div class="doc-status rejected">
            <span class="material-symbols-outlined" style="font-size: 14px;">cancel</span>
            Rejected
          </div>\`;
          actionHtml = \`<div class="doc-actions">
            <button class="doc-action-btn" style="color:var(--danger)" onclick="openModal()">
              <span class="material-symbols-outlined">upload</span> Re-upload
            </button>
          </div>\`;
        } else {
          // pending or anything else
          badgeHtml = \`<div class="doc-status pending">
            <span class="material-symbols-outlined" style="font-size: 14px;">lock</span>
            Pending Verification
          </div>\`;
          actionHtml = \`<div class="doc-actions">
            <button class="doc-action-btn" style="opacity: 0.5; cursor: not-allowed;" disabled>
              <span class="material-symbols-outlined">lock</span> Locked
            </button>
          </div>\`;
        }

        card.innerHTML = \`
          <div class="doc-header">
            <div class="doc-icon"><span class="material-symbols-outlined">\${statusLower === 'verified' ? 'verified' : 'description'}</span></div>
            <div class="doc-info">
              <div class="doc-name">\${doc.documentType}</div>
              <div class="doc-type">\${doc.councilJurisdiction || 'Certificate'}</div>
            </div>
          </div>
          <div class="doc-date">Submitted: \${new Date(doc.createdAt).toLocaleDateString()}</div>
          \${badgeHtml}
          \${actionHtml}
        \`;
        grid.appendChild(card);
      });
    }

    async function downloadDocument(id, name) {
      alert(\`Downloading/Viewing \${name}...\`);
    }

    // Search/filter
    document.getElementById('search-input').addEventListener('keyup', function(e) {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.doc-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? '' : 'none';
      });
    });

    // Fetch documents on load
    fetchWalletDocuments();
</script>`;

content = content.replace(/<script>[\s\S]*?<\/script>/, newScript);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update complete.');
