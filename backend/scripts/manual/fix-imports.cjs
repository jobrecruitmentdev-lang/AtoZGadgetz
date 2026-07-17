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
    // Match import and export statements with relative paths
    // Example: import X from '../services/address.service'
    let newContent = content.replace(/(import|export)\s+(?:.*?\s+from\s+)?['"](\.[^'"]*)['"]/g, (match, p1, p2) => {
      // If it already ends with .js, leave it
      if (p2.endsWith('.js')) return match;
      // Replace with .js
      return match.replace(p2, p2 + '.js');
    });
    // Match require statements with relative paths? Probably no requires, but just in case
    
    // Some static imports might not have "from", like import '../config/env'
    newContent = newContent.replace(/import\s+['"](\.[^'"]*)['"]/g, (match, p1) => {
      if (p1.endsWith('.js')) return match;
      return match.replace(p1, p1 + '.js');
    });

    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
      console.log('Fixed', file);
    }
  });
  console.log('Done!');
} catch(e) {
  console.error(e);
}
