const fs = require('fs');
function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(dir + '/' + file, 'utf-8');
            if (content.includes('Razorpay')) {
                console.log(`Found Razorpay in: ${dir}/${file}`);
                count += (content.match(/Razorpay/g) || []).length;
            }
        } else if (fs.statSync(dir + '/' + file).isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
            searchFiles(dir + '/' + file);
        }
    }
}
searchFiles('src');
