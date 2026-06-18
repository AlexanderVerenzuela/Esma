const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.css') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace rgba(204, 255, 0, x) -> rgba(var(--primary-rgb), x)
    content = content.replace(/rgba\(\s*204\s*,\s*255\s*,\s*0\s*,\s*([0-9.]+)\s*\)/g, 'rgba(var(--primary-rgb), $1)');
    
    // Replace the stray orange in Navbar.css
    content = content.replace(/rgba\(\s*255\s*,\s*90\s*,\s*0\s*,\s*([0-9.]+)\s*\)/g, 'rgba(var(--primary-rgb), $1)');

    // Replace #CCFF00 with var(--primary) in JSX
    if (filePath.endsWith('.jsx')) {
      content = content.replace(/color="#CCFF00"/gi, 'color="var(--primary)"');
      content = content.replace(/color: '#CCFF00'/gi, "color: 'var(--primary)'");
    }

    // Make sure index.css defines --primary-rgb
    if (filePath.endsWith('index.css') && !content.includes('--primary-rgb')) {
      content = content.replace('--primary: #CCFF00;', '--primary-rgb: 204, 255, 0;\n  --primary: #CCFF00;');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
