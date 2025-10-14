const fs = require('fs');
const path = require('path');

// Hàm đệ quy để duyệt tất cả các thư mục con
function findEntities(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Nếu là thư mục, tiếp tục tìm kiếm đệ quy
      results = results.concat(findEntities(filePath));
    } else if (file.endsWith('.entity.ts')) {
      // Nếu là entity file
      results.push(filePath);
    }
  }
  
  return results;
}

// Tìm tất cả các entity trong thư mục src
const entitiesFiles = findEntities('src');
console.log(`Tìm thấy ${entitiesFiles.length} entity files:`);

// Đếm số lỗi đã sửa
let fixedProperties = 0;

// Sửa từng file
entitiesFiles.forEach(filePath => {
  console.log(`Đang xử lý: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern tìm properties không có dấu !
  // Tìm tất cả thuộc tính trong class (sau decorator và trước dấu :)
  const propertyRegex = /(@(?:Column|PrimaryGeneratedColumn|CreateDateColumn|ManyToOne|OneToMany|OneToOne|JoinColumn)(?:\(.*?\))?\s+)(\w+)(\s*:)/g;
  
  // Thay thế bằng cách thêm dấu ! sau tên thuộc tính
  let match;
  const newContent = content.replace(propertyRegex, (match, decorator, propName, colon) => {
    fixedProperties++;
    return `${decorator}${propName}!${colon}`;
  });
  
  // Lưu nội dung đã sửa
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  - Đã sửa file: ${filePath}`);
  }
});

console.log(`\nĐã sửa ${fixedProperties} thuộc tính trong ${entitiesFiles.length} entity files`);
console.log('\nLưu ý: Script này có thể không bắt được 100% các trường hợp.');
console.log('Vui lòng kiểm tra lại các file nếu vẫn còn lỗi "Property has no initializer"');
