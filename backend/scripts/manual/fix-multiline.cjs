const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

try {
  const files = walk(path.join(__dirname, '../../src'));
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix multi-line imports
    let newContent = content.replace(/(import|export)\s+([\s\S]*?)\s+from\s+['"](\.[^'"]*)['"]/g, (match, p1, p2, p3) => {
      if (p3.endsWith('.js')) return match;
      return match.replace(p3, p3 + '.js');
    });

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log('Fixed multiline', file);
    }
  });
  console.log('Done fixing multiline!');
} catch(e) {
  console.error(e);
}
