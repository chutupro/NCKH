const fs = require('fs');
const path = require('path');

// Hàm đệ quy để duyệt tất cả các thư mục con
function findDtos(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Nếu là thư mục, tiếp tục tìm kiếm đệ quy
      results = results.concat(findDtos(filePath));
    } else if (file.endsWith('.dto.ts') || file.includes('response.dto')) {
      // Nếu là DTO file
      results.push(filePath);
    }
  }
  
  return results;
}

// Tìm tất cả các DTO trong thư mục src
const dtoFiles = findDtos('src');
console.log(`Tìm thấy ${dtoFiles.length} DTO files:`);

// Đếm số lỗi đã sửa
let fixedProperties = 0;

// Sửa từng file
dtoFiles.forEach(filePath => {
  console.log(`Đang xử lý: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern tìm properties không có dấu !
  // Tìm tất cả thuộc tính readonly trong class DTO
  const propertyRegex = /(readonly\s+)(\w+)(\s*:)/g;
  
  // Thay thế bằng cách thêm dấu ! sau tên thuộc tính
  const newContent = content.replace(propertyRegex, (match, prefix, propName, colon) => {
    fixedProperties++;
    return `${prefix}${propName}!${colon}`;
  });
  
  // Lưu nội dung đã sửa
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  - Đã sửa file: ${filePath}`);
  }
});

console.log(`\nĐã sửa ${fixedProperties} thuộc tính trong ${dtoFiles.length} DTO files`);
console.log('\nLưu ý: Script này có thể không bắt được 100% các trường hợp.');
console.log('Vui lòng kiểm tra lại các file nếu vẫn còn lỗi "Property has no initializer"');
