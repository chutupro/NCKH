# HƯỚNG DẪN MIGRATE DATA SAU KHI CHẠY MIGRATION SQL

## ✅ ĐÃ HOÀN THÀNH:

1. Migration SQL đã tạo columns mới:
   - `MapLocations.MainImageID`, `MapLocations.OldImageID`
   - `Timelines.ImageID`, `Timelines.LocationID`
   - `Images.CategoryID`

2. Entity files đã update theo cấu trúc mới

## ⚠️ CẦN LÀM TIẾP:

### BƯỚC 1: CHẠY MIGRATION SQL

```bash
# Vào MySQL/SSMS và chạy file:
BackEnd/src/migrations/20241210-refactor-three-pillars-system.sql
```

### BƯỚC 2: MIGRATE DATA TỪ URL STRING → ImageID

**Script Node.js để migrate:**

```javascript
// migrate-images.js
const mysql = require('mysql2/promise');

async function migrateData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'DaNangDynamicVault'
  });

  try {
    // 1. Migrate MapLocations.Image → MainImageID
    console.log('Migrating MapLocations.Image...');
    const [mapLocs] = await connection.query(
      'SELECT LocationID, Image_backup FROM MapLocations WHERE Image_backup IS NOT NULL'
    );

    for (const loc of mapLocs) {
      const url = loc.Image_backup;
      
      // Tìm hoặc tạo Images record
      let [images] = await connection.query(
        'SELECT ImageID FROM Images WHERE FilePath = ?',
        [url]
      );

      let imageId;
      if (images.length === 0) {
        // Tạo mới
        const [result] = await connection.query(
          'INSERT INTO Images (FilePath, Type, AltText) VALUES (?, ?, ?)',
          [url, 'map', 'Migrated from MapLocations']
        );
        imageId = result.insertId;
        console.log(`Created Images #${imageId} for ${url}`);
      } else {
        imageId = images[0].ImageID;
      }

      // Update MainImageID
      await connection.query(
        'UPDATE MapLocations SET MainImageID = ? WHERE LocationID = ?',
        [imageId, loc.LocationID]
      );
    }

    // 2. Migrate MapLocations.OldImage → OldImageID
    console.log('Migrating MapLocations.OldImage...');
    const [oldMapLocs] = await connection.query(
      'SELECT LocationID, OldImage_backup FROM MapLocations WHERE OldImage_backup IS NOT NULL'
    );

    for (const loc of oldMapLocs) {
      const url = loc.OldImage_backup;
      
      let [images] = await connection.query(
        'SELECT ImageID FROM Images WHERE FilePath = ?',
        [url]
      );

      let imageId;
      if (images.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO Images (FilePath, Type, AltText) VALUES (?, ?, ?)',
          [url, 'map-old', 'Migrated from MapLocations (old)']
        );
        imageId = result.insertId;
        console.log(`Created Images #${imageId} for old image ${url}`);
      } else {
        imageId = images[0].ImageID;
      }

      await connection.query(
        'UPDATE MapLocations SET OldImageID = ? WHERE LocationID = ?',
        [imageId, loc.LocationID]
      );
    }

    // 3. Migrate Timelines.image → ImageID
    console.log('Migrating Timelines.image...');
    const [timelines] = await connection.query(
      'SELECT TimelineID, image_backup FROM Timelines WHERE image_backup IS NOT NULL'
    );

    for (const timeline of timelines) {
      const url = timeline.image_backup;
      
      let [images] = await connection.query(
        'SELECT ImageID FROM Images WHERE FilePath = ?',
        [url]
      );

      let imageId;
      if (images.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO Images (FilePath, Type, AltText) VALUES (?, ?, ?)',
          [url, 'timeline', 'Migrated from Timelines']
        );
        imageId = result.insertId;
        console.log(`Created Images #${imageId} for ${url}`);
      } else {
        imageId = images[0].ImageID;
      }

      await connection.query(
        'UPDATE Timelines SET ImageID = ? WHERE TimelineID = ?',
        [imageId, timeline.TimelineID]
      );
    }

    // 4. Liên kết Timelines với MapLocations (theo tên địa điểm)
    console.log('Linking Timelines to MapLocations...');
    const [unlinkedTimelines] = await connection.query(
      'SELECT t.TimelineID, t.title FROM Timelines t WHERE t.LocationID IS NULL'
    );

    for (const timeline of unlinkedTimelines) {
      // Tìm MapLocation có tên giống hoặc chứa trong title
      const titleKeywords = timeline.title.toLowerCase();
      
      const [locations] = await connection.query(
        'SELECT LocationID, Name FROM MapLocations WHERE LOWER(Name) LIKE ?',
        [`%${titleKeywords}%`]
      );

      if (locations.length > 0) {
        await connection.query(
          'UPDATE Timelines SET LocationID = ? WHERE TimelineID = ?',
          [locations[0].LocationID, timeline.TimelineID]
        );
        console.log(`Linked Timeline "${timeline.title}" to Location "${locations[0].Name}"`);
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrateData();
```

### BƯỚC 3: CHẠY SCRIPT MIGRATE

```bash
cd BackEnd
node migrate-images.js
```

### BƯỚC 4: XÁC NHẬN DATA ĐÚNG

```sql
-- Kiểm tra MapLocations có MainImageID
SELECT COUNT(*) FROM MapLocations WHERE MainImageID IS NOT NULL;

-- Kiểm tra Timelines có ImageID
SELECT COUNT(*) FROM Timelines WHERE ImageID IS NOT NULL;

-- Kiểm tra Timelines có LocationID
SELECT COUNT(*) FROM Timelines WHERE LocationID IS NOT NULL;
```

### BƯỚC 5: XÓA COLUMNS CŨ (SAU KHI ĐÃ MIGRATE XONG)

Uncomment phần STEP 7 trong file migration SQL và chạy lại:

```sql
ALTER TABLE MapLocations DROP COLUMN Image;
ALTER TABLE MapLocations DROP COLUMN OldImage;
ALTER TABLE MapLocations DROP COLUMN Image_backup;
ALTER TABLE MapLocations DROP COLUMN OldImage_backup;

ALTER TABLE Timelines DROP COLUMN image;
ALTER TABLE Timelines DROP COLUMN image_backup;
```

## 🔄 LUỒNG MỚI SAU KHI MIGRATE:

### Upload ảnh mới:
```
1. POST /upload → Lưu vào Images (ImageID = 123)
2. POST /gallery → Dùng ImageID = 123
3. Admin gán vào Map → MapLocation.MainImageID = 123
4. Admin gán vào Timeline → Timeline.ImageID = 123, LocationID = X
```

### Query ảnh từ Gallery:
```sql
-- Lấy ảnh + thông tin liên quan
SELECT 
  i.ImageID,
  i.FilePath,
  c.Name as CategoryName,
  ml.Name as LocationName,
  ml.Latitude,
  ml.Longitude,
  t.title as TimelineTitle,
  t.eventDate
FROM Images i
LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
LEFT JOIN MapLocations ml ON (i.ImageID = ml.MainImageID OR i.ImageID = ml.OldImageID)
LEFT JOIN Timelines t ON i.ImageID = t.ImageID
WHERE i.ImageID = 123;
```

## ✅ DONE!

Sau khi hoàn thành, bạn có thể:
- Xóa folder `BackEnd/uploads/` (vì đã dùng media-service)
- Update frontend TimelineManagement để dùng ImageID thay vì URL
- Tạo API endpoints mới cho 3 trụ cột
