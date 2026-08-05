const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('overflow-y-auto')) return;

  // Ensure import
  if (!content.includes('ScrollView')) {
    content = "import { ScrollView } from '../ScrollView';\n" + content;
  }

  let i = 0;
  while ((i = content.indexOf('<div', i)) !== -1) {
    let endTag = content.indexOf('>', i);
    if (endTag === -1) break;
    
    let tagContent = content.substring(i, endTag + 1);
    if (tagContent.includes('overflow-y-auto')) {
      // Find matching closing div
      let count = 1;
      let j = endTag + 1;
      while (count > 0 && j < content.length) {
        let nextOpen = content.indexOf('<div', j);
        let nextClose = content.indexOf('</div', j);
        
        if (nextClose === -1) break; // Error
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          count++;
          j = nextOpen + 4;
        } else {
          count--;
          j = nextClose + 6;
        }
      }
      
      if (count === 0) {
        let closingIndex = j - 6;
        
        // Replace opening tag
        let newTag = tagContent.replace('<div', '<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "40px" }}');
        // Clean up classes
        newTag = newTag.replace('overflow-y-auto', '').replace('flex-1', '').replace('pb-[30px]', '').replace('[&::-webkit-scrollbar]:hidden', '');
        
        content = content.substring(0, i) + newTag + content.substring(endTag + 1, closingIndex) + '</ScrollView>' + content.substring(j);
        
        i = i + newTag.length;
        continue;
      }
    }
    i = endTag + 1;
  }
  
  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
}

walk('src/components/modals');
console.log('Done');
