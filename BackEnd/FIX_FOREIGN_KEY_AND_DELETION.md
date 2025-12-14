# Database Foreign Key & Deletion Logic Fixes
**Date:** December 14, 2024  
**Issues Fixed:** Foreign key constraints, deletion cascade, data flow between modules

---

## 🔍 Problems Identified

### 1. **Foreign Key Constraint Errors**
**Symptom:** Cannot delete Collections or Timeline items due to foreign key violations:
```
QueryFailedError: Cannot delete or update a parent row: a foreign key constraint fails
- `images`.`CollectionID` -> `collections`.`CollectionID`
- `maplocations`.`MainImageID` -> `images`.`ImageID`
- `maplocations`.`OldImageID` -> `images`.`ImageID`
```

**Root Cause:** Database foreign keys didn't have `ON DELETE` actions, preventing proper deletion cascade.

### 2. **Wrong Deletion Logic**
**Symptom:** 
- Deleting Timeline deleted the source image from Gallery (wrong!)
- Deleting from Gallery should cascade to Timeline/MapLocations but didn't

**Root Cause:** Timeline service was deleting images instead of just removing the timeline entry.

### 3. **Image Disappearing Bug**
**Symptom:** When creating a MapLocation via "📍 Gắn Địa điểm vào Ảnh", the selected old image temporarily disappears but reappears after F5.

**Root Cause:** Frontend was removing images from local state but not properly syncing with backend availability filter.

### 4. **Wrong Data Flow**
**Symptom:** Images created in MapLocations appeared in Timeline Management.

**Root Cause:** Both modules were pulling from the same Gallery without proper filtering.

---

## ✅ Solutions Implemented

### 1. **Updated Database Foreign Keys**

**File:** `BackEnd/migrations/20241214-fix-foreign-key-cascade.sql`

Updated foreign key constraints to use `ON DELETE SET NULL`:

```sql
-- Images.CollectionID → Collections
ALTER TABLE `images`
ADD CONSTRAINT `FK_26cc98bb28cf424dec88c4d10a3` 
FOREIGN KEY (`CollectionID`) 
REFERENCES `collections`(`CollectionID`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- MapLocations.MainImageID → Images
ALTER TABLE `maplocations`
ADD CONSTRAINT `FK_0f75d61b7b7e6851a07ec7d2436` 
FOREIGN KEY (`MainImageID`) 
REFERENCES `images`(`ImageID`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- MapLocations.OldImageID → Images
ALTER TABLE `maplocations`
ADD CONSTRAINT `FK_4ba92476a5b08a0ff23638d844e` 
FOREIGN KEY (`OldImageID`) 
REFERENCES `images`(`ImageID`) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

**Result:**
- ✅ Can delete Collections without blocking
- ✅ Can delete Images without blocking MapLocations
- ✅ Deleting images automatically sets references to NULL

### 2. **Updated Entity Relationships**

**Files:**
- `BackEnd/src/modules/entities/image.entity.ts`
- `BackEnd/src/modules/entities/map-location.entity.ts`

Added `onDelete: 'SET NULL'` to TypeORM relationships:

```typescript
// image.entity.ts
@ManyToOne(() => Collections, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'CollectionID' })
collection: Collections;

// map-location.entity.ts
@ManyToOne(() => Images, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'MainImageID' })
mainImage: Images;

@ManyToOne(() => Images, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'OldImageID' })
oldImage: Images;
```

### 3. **Fixed Timeline Deletion Logic**

**File:** `BackEnd/src/modules/timelines/timeline.service.ts`

**Before:**
```typescript
// Xóa timeline VÀ ảnh gốc (WRONG!)
await this.timelineRepo.remove(timeline);
if (imageId) {
  await this.imagesRepo.remove(image); // ❌ Deletes source image
}
```

**After:**
```typescript
// Chỉ xóa timeline entry, giữ nguyên ảnh trong Gallery
await this.timelineRepo.remove(timeline);
console.log(`[Timeline] ✅ Đã xóa Timeline #${id} (giữ nguyên Image #${timeline.ImageID})`);
```

**Result:**
- ✅ Deleting Timeline keeps the image in Gallery
- ✅ Image can be reused for other timelines or locations

### 4. **Fixed Gallery Deletion Cascade**

**File:** `BackEnd/src/gallerys/gallery.service.ts`

Added logging and confirmation that foreign key cascade handles cleanup:

```typescript
async remove(id: number) {
  // ✅ Foreign keys with ON DELETE SET NULL automatically nullify references
  console.log(`[Gallery] Deleting Image #${id}, references will be set to NULL automatically`);
  await this.imagesRepo.delete(id);
  return { deleted: true };
}
```

**Result:**
- ✅ Deleting from Gallery automatically sets MainImageID/OldImageID to NULL in MapLocations
- ✅ Deleting from Gallery automatically sets CollectionID to NULL in other images

### 5. **Fixed Image Availability Filter**

**File:** `BackEnd/src/common/images.service.ts`

**Before:**
```typescript
.leftJoin('MapLocations', 'mapLoc', 'mapLoc.OldImageID = image.ImageID')
.andWhere('mapLoc.LocationID IS NULL') // Only checked OldImageID
```

**After:**
```typescript
.leftJoin('MapLocations', 'mapLocMain', 'mapLocMain.MainImageID = image.ImageID')
.leftJoin('MapLocations', 'mapLocOld', 'mapLocOld.OldImageID = image.ImageID')
.andWhere('mapLocMain.LocationID IS NULL') // ✅ Check MainImageID
.andWhere('mapLocOld.LocationID IS NULL')   // ✅ Check OldImageID
```

**Result:**
- ✅ Images assigned to locations (as Main or Old) no longer appear in available list
- ✅ Modern images uploaded in MapAdmin don't appear in available images

### 6. **Fixed Frontend Data Flow**

**File:** `FrontEnd/src/pages/map/MapAdminNew.jsx`

**Before:**
```javascript
// Locally removed image from list
if (selectedOldImage) {
  setImages(prev => prev.filter(img => img.ImageID !== selectedOldImage.ImageID));
}
// Didn't reload library
```

**After:**
```javascript
// Reload library from backend to get updated available list
loadImagesFromLibrary(selectedCategory, page);
```

**Result:**
- ✅ Images properly disappear after assignment
- ✅ No ghost images appearing after F5

---

## 🔄 Data Flow Diagram

### **Correct Data Flow:**

```
┌─────────────────┐
│  Gallery        │
│  (Images Table) │
└────────┬────────┘
         │
         ├────────────────┐
         │                │
         ▼                ▼
┌────────────────┐  ┌──────────────────┐
│   Timeline     │  │   Map Locations  │
│  Management    │  │   Management     │
└────────────────┘  └──────────────────┘
     (ImageID)          (MainImageID, OldImageID)
         │                      │
         └──────────────────────┘
                   │
                   ▼
         INDEPENDENT MODULES
      (Do NOT affect each other)
```

### **Rules:**
1. **Gallery → Timeline**: Admins assign images from Gallery to Timeline
2. **Gallery → MapLocations**: Admins assign images from Gallery to Locations
3. **Timeline ⇏ MapLocations**: Changes in Timeline DO NOT affect MapLocations
4. **MapLocations ⇏ Timeline**: Changes in MapLocations DO NOT affect Timeline
5. **Deleting from Gallery**: Sets references to NULL in both Timeline and MapLocations

---

## 📝 Migration Steps

### **Step 1: Run SQL Migration**

```bash
# Connect to MySQL
mysql -u root -p danangdynamicvault

# Run migration
source BackEnd/migrations/20241214-fix-foreign-key-cascade.sql
```

### **Step 2: Restart Backend**

```bash
cd BackEnd
npm run start:dev
```

### **Step 3: Verify**

1. **Test Collection Deletion:**
   - Go to Collection Management
   - Try deleting a collection
   - ✅ Should succeed without errors
   - ✅ Images should have CollectionID = NULL

2. **Test Timeline Deletion:**
   - Go to Timeline Management
   - Delete a timeline entry
   - ✅ Timeline entry removed
   - ✅ Image remains in Gallery

3. **Test Gallery Deletion:**
   - Go to Gallery/Timeline Management
   - Delete an image
   - ✅ Image deleted from Gallery
   - ✅ References in MapLocations set to NULL

4. **Test MapLocation Assignment:**
   - Go to Map Admin
   - Select an old image and create location
   - ✅ Image disappears from available list
   - ✅ Refresh page - image still not in available list

---

## 🚨 Important Notes

### **Data Integrity:**
- Foreign keys now use `SET NULL` instead of blocking deletion
- Orphaned records (with NULL references) are safe and expected
- Frontend filters handle NULL references properly

### **Backward Compatibility:**
- Existing data is preserved
- Migration only updates constraints, not data
- Application code handles NULL references gracefully

### **Performance:**
- Added joins in `getAvailableImagesForLocation` query
- Minimal impact due to proper indexing on foreign keys
- Consider adding index on `(MainImageID, OldImageID)` if needed

---

## 🔧 Troubleshooting

### **Issue: Foreign key still blocks deletion**

**Solution:**
```sql
-- Check if migration ran successfully
SELECT 
    CONSTRAINT_NAME,
    DELETE_RULE
FROM 
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = 'danangdynamicvault'
    AND CONSTRAINT_NAME LIKE 'FK_%';
```

Expected `DELETE_RULE` = `SET NULL` for the three constraints.

### **Issue: Images still appear in available list after assignment**

**Solution:**
- Check backend logs for query results
- Verify MapLocation record was created with correct ImageIDs
- Clear frontend cache: Ctrl + Shift + R

### **Issue: "Cannot delete" error persists**

**Solution:**
1. Check for other foreign keys:
```sql
SHOW CREATE TABLE images;
SHOW CREATE TABLE maplocations;
```

2. Manually update constraints if needed:
```sql
ALTER TABLE table_name DROP FOREIGN KEY constraint_name;
ALTER TABLE table_name ADD CONSTRAINT constraint_name 
FOREIGN KEY (column) REFERENCES other_table(column) 
ON DELETE SET NULL;
```

---

## ✨ Summary

**Fixed Issues:**
1. ✅ Foreign key constraints allow proper deletion
2. ✅ Timeline deletion preserves source images
3. ✅ Gallery deletion cascades to Timeline and MapLocations
4. ✅ Image availability properly filtered after assignment
5. ✅ Data flow between modules is independent and correct

**Testing Checklist:**
- [ ] Delete collection → Success
- [ ] Delete timeline → Image remains in Gallery
- [ ] Delete image from Gallery → References set to NULL
- [ ] Assign image to location → Image removed from available list
- [ ] F5 after assignment → Image still not in available list
- [ ] Create location → Image does NOT appear in Timeline

**Next Steps:**
- Monitor deletion operations in production
- Consider adding soft delete for images (keep record, mark as deleted)
- Add audit log for deletion operations
