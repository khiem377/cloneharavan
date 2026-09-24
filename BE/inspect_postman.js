const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'postman_collection.json');
const postman = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Postman info:', postman.info);
console.log('Folder count:', postman.item ? postman.item.length : 0);
if (postman.item) {
  postman.item.forEach((folder, idx) => {
    const reqCount = folder.item ? folder.item.length : 0;
    console.log(`${idx + 1}. [${folder.name}] - ${reqCount} requests`);
  });
}
