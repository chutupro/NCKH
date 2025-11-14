# Quick Start Guide - Multi-Image Reviews Feature

## Prerequisites
- Backend server running on `http://localhost:3000`
- Frontend running on `http://localhost:5173` (or your configured port)
- MySQL database `danangdynamicvault` accessible

## Step 1: Apply Database Migration

### Option A: Run SQL File Directly
```bash
# Navigate to backend directory
cd BackEnd

# Run migration using mysql command
mysql -u root -p danangdynamicvault < migrations/1737374400000-add-images-to-feedback.sql
```

### Option B: Execute SQL Manually
Open MySQL Workbench or command line and run:

```sql
USE danangdynamicvault;

-- Add ImageUrls column
ALTER TABLE `feedback` 
ADD COLUMN `ImageUrls` TEXT NULL 
AFTER `Likes`;

-- Add ImagesApproved column
ALTER TABLE `feedback` 
ADD COLUMN `ImagesApproved` BOOLEAN NOT NULL DEFAULT FALSE 
AFTER `ImageUrls`;

-- Verify columns were added
DESCRIBE feedback;
```

## Step 2: Restart Backend Server

The entity changes are already in place, so just restart:

```bash
cd BackEnd
npm run start:dev
```

Verify no errors in console. You should see TypeORM connecting successfully.

## Step 3: Test the Feature

### 1. Open Map Page
- Navigate to the map page in your frontend
- Click on any location marker

### 2. Submit Review with Images
- Click "Viết đánh giá" button
- Select 1-5 stars
- Enter a comment
- Click the file input and select 1-5 images (jpg, png, etc.)
- Verify image previews appear below the file input
- Click "Gửi đánh giá"

### 3. Check Backend Response
Open browser DevTools Console, you should see:
```
🚀 [SUBMIT] Sending to API: { userId: ..., rating: ..., comment: ... }
✅ [SUBMIT] Review submitted successfully!
✅ [SUBMIT] Reviews updated: X total reviews
```

### 4. Check Database
```sql
USE danangdynamicvault;

-- View feedback with images
SELECT 
    FeedbackID, 
    UserID, 
    Rating, 
    Comment, 
    ImageUrls, 
    ImagesApproved,
    CreatedAt
FROM feedback
WHERE ImageUrls IS NOT NULL
ORDER BY CreatedAt DESC;
```

You should see:
- `ImageUrls`: `["/ uploads/abc123.jpg","/uploads/def456.jpg"]` (JSON array)
- `ImagesApproved`: `0` (false)

### 5. Check Uploaded Files
```bash
cd BackEnd/uploads
ls -lt | head -10
```

You should see newly uploaded image files with random filenames.

## Step 4: Approve Images (Manual)

Since admin UI is not implemented yet, approve images via SQL:

```sql
-- Approve all images for testing
UPDATE feedback SET ImagesApproved = 1 WHERE ImageUrls IS NOT NULL;

-- Or approve specific feedback
UPDATE feedback SET ImagesApproved = 1 WHERE FeedbackID = 123;
```

Refresh the map page and verify images now appear in the review.

## Testing Checklist

### Basic Upload
- [ ] Can select 1 image
- [ ] Preview appears after selection
- [ ] Can submit review with image
- [ ] Image saved to `BackEnd/uploads/`
- [ ] `ImageUrls` in DB contains file path
- [ ] `ImagesApproved = 0` initially

### Multiple Images
- [ ] Can select up to 5 images
- [ ] All previews appear
- [ ] All images uploaded to server
- [ ] `ImageUrls` contains array of all paths

### Validation
- [ ] Cannot select more than 5 images (alert shown)
- [ ] Only image file types accepted
- [ ] Review submit works with 0 images (optional)

### Display
- [ ] Images NOT shown when `ImagesApproved = 0`
- [ ] Images appear after setting `ImagesApproved = 1`
- [ ] Images displayed as 80x80px thumbnails
- [ ] Multiple images displayed in flex row

### Image Removal
- [ ] Click ✕ button on preview removes that image
- [ ] Can remove all images
- [ ] Re-selecting files replaces previous selection

## Troubleshooting

### Images not uploading
**Check:**
1. Backend console for errors
2. Network tab in DevTools - is request showing multipart/form-data?
3. File permissions on `BackEnd/uploads/` directory
4. Disk space available

**Fix:**
```bash
# Create uploads directory if missing
cd BackEnd
mkdir -p uploads
chmod 755 uploads
```

### Images uploaded but not shown
**Check:**
1. Database: is `ImagesApproved = 1`?
2. Browser console: any errors parsing `ImageUrls` JSON?
3. Network tab: is image path correct?

**Fix:**
```sql
-- Approve images
UPDATE feedback SET ImagesApproved = 1 WHERE FeedbackID = [ID];
```

### "ImageUrls column doesn't exist" error
**Check:**
1. Migration was run successfully
2. Correct database selected

**Fix:**
```bash
cd BackEnd
mysql -u root -p danangdynamicvault < migrations/1737374400000-add-images-to-feedback.sql
```

### File type validation failing
**Check:**
1. File extension is .jpg, .jpeg, .png, .gif, or .webp
2. MIME type is correct (not renamed file)

**Fix:**
Use actual image files, not renamed files.

### Form reset not working
**Check:**
1. Browser console for JavaScript errors
2. Event listeners attached correctly

**Fix:**
Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)

## Next Steps

### Implement Admin Approval UI
Create admin panel route to:
1. List all pending reviews (where `ImagesApproved = 0` and `ImageUrls IS NOT NULL`)
2. Show image previews
3. Approve/Reject buttons
4. Bulk operations

Example query for admin panel:
```sql
SELECT 
    f.FeedbackID,
    f.Comment,
    f.Rating,
    f.ImageUrls,
    f.CreatedAt,
    u.FullName as UserName,
    ml.Name as LocationName
FROM feedback f
JOIN users u ON f.UserID = u.UserID
JOIN map_locations ml ON f.LocationID = ml.LocationID
WHERE f.ImagesApproved = 0 
  AND f.ImageUrls IS NOT NULL
ORDER BY f.CreatedAt DESC;
```

### Prevent Duplicate Likes
Create join table:
```sql
CREATE TABLE feedback_likes (
    UserID INT NOT NULL,
    FeedbackID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, FeedbackID),
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (FeedbackID) REFERENCES feedback(FeedbackID) ON DELETE CASCADE
);
```

Update like/unlike endpoints to check this table.

### Image Optimization
Install sharp:
```bash
cd BackEnd
npm install sharp
```

Add compression in controller:
```typescript
import sharp from 'sharp';

// In multer config
storage: diskStorage({
  destination: './uploads',
  filename: async (req, file, cb) => {
    const randomName = Array(32).fill(null).map(() => 
      Math.round(Math.random() * 16).toString(16)
    ).join('');
    
    // Compress image
    const outputPath = `./uploads/${randomName}.jpg`;
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    
    cb(null, `${randomName}.jpg`);
  }
})
```

## Summary

The multi-image review feature is now fully functional:
- ✅ Backend accepts up to 5 images per review
- ✅ Images stored in `BackEnd/uploads/`
- ✅ Image paths saved as JSON in `ImageUrls` column
- ✅ Admin approval flag controls public visibility
- ✅ Frontend shows image upload UI with previews
- ✅ Reviews display approved images as thumbnails
- ✅ Like/unlike functionality integrated

**Next:** Build admin panel for image approval workflow.
