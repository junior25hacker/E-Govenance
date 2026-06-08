const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.hbs') && !f.includes('dashboard') && !f.includes('track-requests'));

const sidebarHtml = `
    <div class="sidebar-requests-section" style="padding: 12px 20px; margin-top: auto; border-top: 1px solid var(--border);">
      <div style="font-size: 11px; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">My Requests</div>
      <ul id="sidebar-requests-list" style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
        <!-- Dynamically populated -->
      </ul>
    </div>
`;

const scriptHtml = `
<script>
  async function fetchSidebarRequests() {
    const list = document.getElementById('sidebar-requests-list');
    if(!list) return;
    try {
      const res = await fetch('/tracking');
      const result = await res.json();
      if (result.data && result.data.length > 0) {
        list.innerHTML = '';
        result.data.forEach(req => {
          const li = document.createElement('li');
          li.style.marginBottom = '6px';
          li.innerHTML = \`<a href="/tracking-request/\${req.requestId}" onmouseover="this.style.background='var(--glass-b)'; this.style.color='var(--white)';" onmouseout="this.style.background='transparent'; this.style.color='var(--cream-dim)';" style="color: var(--cream-dim); text-decoration: none; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; transition: background 0.2s, color 0.2s;"><span class="material-symbols-outlined" style="font-size: 16px;">receipt_long</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">\${req.title}</span></a>\`;
          list.appendChild(li);
        });
      } else {
        list.innerHTML = '<li style="color: var(--cream-dim); padding: 6px 8px; font-style: italic;">No requests found.</li>';
      }
    } catch(e) {
      console.error('Failed to load sidebar requests', e);
    }
  }
  document.addEventListener('DOMContentLoaded', fetchSidebarRequests);
</script>
`;

files.forEach(file => {
  let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
  if (!content.includes('<aside class="sidebar">')) return;
  if (content.includes('sidebar-requests-section')) return;

  // Insert before </aside> if it exists
  content = content.replace(/(<\/ul>\s*<\/aside>)/g, sidebarHtml + '$1');
  
  // Insert before </body>
  content = content.replace(/(<\/body>)/g, scriptHtml + '$1');
  
  fs.writeFileSync(path.join(viewsDir, file), content);
  console.log('Updated ' + file);
});
