# Review Images Feature - Implementation Guide

## Overview
This document describes the multi-image upload feature for map location reviews, allowing users to attach up to 5 images to their reviews. Images require admin approval before being displayed publicly.

## Backend Changes

### 1. Feedback Entity (`BackEnd/src/modules/entities/feedback.entity.ts`)
Added new fields:
- `ImageUrls: string` - JSON array of uploaded image paths (text type)
- `ImagesApproved: boolean` - Admin approval flag (default: false)
- `Likes: number` - Like count for feedback (default: 0)

### 2. Controller (`BackEnd/src/modules/maplocations/map-locations.controller.ts`)
Modified `addFeedback` endpoint to accept multi-image uploads:
```typescript
@Post(':id/feedback')
@UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], ...))
async addFeedback(..., @UploadedFiles() files: { images?: Express.Multer.File[] })
```

Features:
- Accepts up to 5 images per review
- File validation for image types (jpeg, jpg, png, gif, webp)
- Random filename generation for security
- Stores files in `./uploads` directory

### 3. Service (`BackEnd/src/modules/maplocations/map-locations.service.ts`)
Modified `addFeedback` method:
- Accepts `imageUrls?: string[]` parameter
- Converts image paths to JSON string
- Sets `ImagesApproved: false` by default
- Includes `user.profile` in feedback fetch (for avatar display)

Added methods:
- `likeFeedback(feedbackId)` - Increments like count
- `unlikeFeedback(feedbackId)` - Decrements like count

## Frontend Changes

### 1. State Management (`FrontEnd/src/pages/map/MapPage.jsx`)
Added new state:
```javascript
const [selectedImages, setSelectedImages] = useState([]);
```

### 2. Review Form UI
Added file input to review forms:
```html
<input type="file" id="review-images" accept="image/*" multiple />
<div id="image-preview"></div>
```

Features:
- Multi-select file input (max 5 images)
- Real-time image preview with thumbnails
- Remove button (✕) for each preview image
- Validation: alerts if more than 5 images selected

### 3. Submit Handler
Modified to use `FormData` for multipart upload:
```javascript
const formData = new FormData();
formData.append('userId', user.userId);
formData.append('rating', currentRating);
formData.append('comment', comment);

// Add images
Array.from(imageInput.files).forEach(file => {
  formData.append('images', file);
});

await axios.post(`${BASE_URL}/map-locations/${place.id}/feedback`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 4. Review Display
Reviews now show uploaded images (only if approved):
```javascript
${r.images && r.images.length > 0 && r.imagesApproved ? `
  <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
    ${r.images.map(img => `
      <img src="${img.startsWith('http')?img:`${BASE_URL}${img}`}" 
           style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>
    `).join('')}
  </div>
` : ''}
```

## Database Migration

### Required SQL
File: `BackEnd/migrations/add-images-to-feedback.sql`

```sql
-- Add ImageUrls column (stores JSON array of image paths)
ALTER TABLE `feedback` 
ADD COLUMN `ImageUrls` TEXT NULL AFTER `Likes`;

-- Add ImagesApproved column (admin approval flag)
ALTER TABLE `feedback` 
ADD COLUMN `ImagesApproved` BOOLEAN NOT NULL DEFAULT FALSE AFTER `ImageUrls`;

-- Ensure Likes column exists (if not already added)
ALTER TABLE `feedback` 
ADD COLUMN `Likes` INT NOT NULL DEFAULT 0 AFTER `Rating`;

-- Add index on Likes for performance
CREATE INDEX idx_feedback_likes ON `feedback`(`Likes`);
```

## Workflow

### User Submits Review with Images
1. User selects up to 5 images in review form
2. Image previews appear below file input
3. User can remove individual images using ✕ button
4. On submit:
   - FormData is built with rating, comment, userId, and images
   - POST to `/map-locations/:id/feedback` with multipart/form-data
   - Backend saves images to `./uploads` directory
   - Image paths stored in `ImageUrls` as JSON array
   - `ImagesApproved` set to `false`

### Admin Approval Process (TODO)
**Not yet implemented** - requires admin panel:
1. Admin views pending image reviews
2. Admin approves or rejects each image
3. Approved images: `ImagesApproved = true`
4. Only approved images are displayed publicly

### Public Display
- Frontend fetches reviews including `ImageUrls` and `ImagesApproved`
- Parses JSON string to array: `JSON.parse(r.ImageUrls)`
- Only renders images if `imagesApproved === true`
- Images displayed as 80x80px thumbnails with rounded corners

## File Structure
```
BackEnd/
  uploads/                          # Uploaded review images
  src/
    modules/
      entities/
        feedback.entity.ts          # ✅ Added ImageUrls, ImagesApproved, Likes
      maplocations/
        map-locations.controller.ts # ✅ Modified addFeedback endpoint
        map-locations.service.ts    # ✅ Modified addFeedback service method

FrontEnd/
  src/
    pages/
      map/
        MapPage.jsx                 # ✅ Added image input, preview, FormData upload
```

## Testing

### Frontend Testing
1. Open map page and select a location
2. Click "Viết đánh giá" button
3. Select 1-5 stars
4. Enter comment
5. Click file input and select 1-5 images
6. Verify previews appear
7. Click ✕ to remove an image, verify it's removed
8. Submit review
9. Verify review appears immediately (images not shown yet since not approved)

### Backend Testing
1. Submit review with images via frontend
2. Check `./uploads` directory - uploaded files should appear
3. Query database:
   ```sql
   SELECT FeedbackID, ImageUrls, ImagesApproved FROM feedback WHERE ImageUrls IS NOT NULL;
   ```
4. Verify `ImageUrls` contains JSON array of paths
5. Verify `ImagesApproved = 0` (false)

### Manual Admin Approval (temporary)
Until admin UI is built:
```sql
-- Approve images for a specific feedback
UPDATE feedback SET ImagesApproved = 1 WHERE FeedbackID = [ID];
```

After approval, refresh frontend and verify images appear in the review.

## Security Considerations

1. **File Type Validation**: Only image types accepted (jpeg, jpg, png, gif, webp)
2. **File Count Limit**: Maximum 5 images per review
3. **Random Filenames**: Prevents path traversal and filename conflicts
4. **Admin Approval**: Images not shown until approved (prevents spam/inappropriate content)
5. **Path Storage**: Only relative paths stored in DB (`/uploads/...`)

## Future Enhancements

### Admin Panel (High Priority)
- [ ] Admin route to list all pending image reviews
- [ ] Bulk approve/reject functionality
- [ ] Image preview in admin panel
- [ ] Rejection reason field
- [ ] Email notification to user on approval/rejection

### Advanced Features
- [ ] Image compression before upload (reduce storage)
- [ ] Client-side image preview before upload
- [ ] Image carousel/lightbox for viewing full-size
- [ ] Allow users to edit/delete their reviews
- [ ] Report inappropriate images
- [ ] Automatic NSFW detection using ML

## API Endpoints

### POST `/map-locations/:id/feedback`
Submit new review with optional images

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `userId` (number)
  - `rating` (number, 1-5)
  - `comment` (string)
  - `images` (file[], optional, max 5)

**Response:**
```json
{
  "FeedbackID": 123,
  "LocationID": 45,
  "UserID": 67,
  "Rating": 5,
  "Comment": "Great place!",
  "ImageUrls": "[\"/uploads/abc123.jpg\", \"/uploads/def456.jpg\"]",
  "ImagesApproved": false,
  "CreatedAt": "2024-01-20T10:30:00.000Z"
}
```

### GET `/map-locations/:id/feedback`
Get all feedback for a location

**Response:**
```json
[
  {
    "FeedbackID": 123,
    "Rating": 5,
    "Comment": "Amazing!",
    "ImageUrls": "[\"/uploads/abc123.jpg\"]",
    "ImagesApproved": true,
    "Likes": 10,
    "user": {
      "FullName": "John Doe",
      "profile": {
        "Avatar": "/uploads/avatar123.jpg"
      }
    },
    "CreatedAt": "2024-01-20T10:30:00.000Z"
  }
]
```

### POST `/map-locations/:locationId/feedback/:feedbackId/like`
Like a review

**Response:**
```json
{
  "message": "Liked successfully",
  "likes": 11
}
```

### DELETE `/map-locations/:locationId/feedback/:feedbackId/like`
Unlike a review

**Response:**
```json
{
  "message": "Unliked successfully",
  "likes": 10
}
```

## Known Issues

1. **No duplicate like prevention**: Same user can like multiple times (requires user-feedback-likes join table)
2. **No admin UI**: Image approval must be done manually via SQL
3. **No image optimization**: Large images uploaded as-is (should compress)
4. **No edit/delete review**: Once submitted, reviews are permanent
5. **Migration not run**: DB schema changes need to be applied manually

## Summary

This feature enables rich user-generated content with multi-image reviews similar to Google Maps. The admin approval workflow ensures quality control before images go live. The implementation uses modern practices (FormData, multipart upload, JSON storage) and is ready for production after running the database migration.
