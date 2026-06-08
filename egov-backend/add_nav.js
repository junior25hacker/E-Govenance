const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.hbs'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(viewsDir, file), 'utf8');
  
  // Look for Track Requests <li> block
  const regex = /(<li>\s*<a[^>]*href="\/track-requests"[^>]*>[\s\S]*?<\/a>\s*<\/li>)/;
  
  if (regex.test(content) && !content.includes('/system-activity-log')) {
    const replacement = `$1
      <li><a href="/system-activity-log"${file === 'system-activity.hbs' ? ' class="active"' : ''}>
          <span class="material-symbols-outlined">history</span>
          <span>System Activity Log</span>
        </a></li>`;
    content = content.replace(regex, replacement);
    fs.writeFileSync(path.join(viewsDir, file), content);
    console.log('Updated nav in ' + file);
  }
});
