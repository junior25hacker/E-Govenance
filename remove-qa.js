const fs = require('fs');
const path = require('path');

function removeQuickActions(fileRelPath) {
  const filePath = path.join(__dirname, fileRelPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');

  // Regex to remove the entire <section class="widget-card col-4 s4"> ... Quick Actions ... </section>
  // We match until we hit the </section> and then whitespace before the next <section>
  const regex = /<section class="widget-card col-4 s4">[\s\S]*?<div class="widget-title">Quick Actions<\/div>[\s\S]*?<\/section>\s*/;
  
  content = content.replace(regex, '');

  // Update the adjacent Recent Activity section to fill the space
  // from col-8 to col-12
  content = content.replace(
    /<section class="widget-card col-8 s4">(\s*<div class="widget-header">\s*<div class="widget-header-left">\s*<div class="widget-icon"><span class="material-symbols-outlined">history<\/span><\/div>\s*<div>\s*<div class="widget-title">Recent Activity<\/div>)/,
    '<section class="widget-card col-12 s4">$1'
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${fileRelPath}`);
}

removeQuickActions('egov-backend/views/dashboard.hbs');
removeQuickActions('dashboard.html');
