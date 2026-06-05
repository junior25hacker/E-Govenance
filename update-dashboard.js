const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'egov-backend', 'views', 'dashboard.hbs');
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
</style>
`;
content = content.replace('</style>', cssToInsert);

// 2. Insert Button ID and rename function
content = content.replace('onclick="digitizeDocument(event)"', 'id="digitize-btn" onclick="openDigitizeModal(event)"');

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

<script>
`;
content = content.replace('<script>', modalHtml);

// 4. Replace script logic
const newScript = `

    const citizenId = '{{user.citizenId}}';

    function openDigitizeModal(e) {
      e.preventDefault();
      if (e.currentTarget.classList.contains('disabled-action')) return;
      document.getElementById('digitize-modal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('digitize-modal').classList.remove('active');
      document.getElementById('digitize-form').reset();
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
            'Authorization': \`Bearer \${localStorage.getItem('egov_token')}\`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          closeModal();
          showToast("Document sent to Civil Registry for verification");
          // Re-fetch dashboard stats or simply wait
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

</script>`;

content = content.replace('</script>', newScript);

// Remove the old dummy digitizeDocument(e) function
content = content.replace(/function digitizeDocument[\s\S]*?}/, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Dashboard update complete.');
