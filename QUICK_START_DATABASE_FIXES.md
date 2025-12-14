# Quick Start: Apply Database & Logic Fixes

## 🚀 Quick Steps

### 1. Run Database Migration

```bash
# Option 1: From MySQL Workbench or phpMyAdmin
# Copy and paste contents of BackEnd/migrations/20241214-fix-foreign-key-cascade.sql

# Option 2: From command line
mysql -u root -p danangdynamicvault < BackEnd/migrations/20241214-fix-foreign-key-cascade.sql
```

### 2. Restart Backend

```bash
cd BackEnd
npm run start:dev
```

### 3. Restart Frontend (optional, but recommended)

```bash
cd FrontEnd
npm run dev
```

---

## ✅ Verify Fixes

### Test 1: Delete Collection
1. Navigate to admin panel → Collections
2. Try deleting a collection that has images
3. ✅ **Expected:** Deletion succeeds, images have CollectionID = NULL

### Test 2: Delete Timeline
1. Navigate to admin panel → Timeline Management
2. Delete a timeline entry
3. ✅ **Expected:** Timeline deleted, image remains in Gallery

### Test 3: Delete Image from Gallery
1. Navigate to admin panel → Gallery/Collections
2. Delete an image that's referenced in MapLocations
3. ✅ **Expected:** Image deleted, MapLocation references set to NULL

### Test 4: Assign Image to Location
1. Navigate to Map Admin → "📍 Gắn Địa điểm vào Ảnh"
2. Select an old image and create location
3. ✅ **Expected:** Image disappears from available list immediately
4. Press F5 to refresh
5. ✅ **Expected:** Image still not in available list

---

## 🔍 Quick Verification Query

Run this in your database to verify the migration:

```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE
FROM 
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = 'danangdynamicvault'
    AND CONSTRAINT_NAME IN (
        'FK_26cc98bb28cf424dec88c4d10a3',
        'FK_0f75d61b7b7e6851a07ec7d2436',
        'FK_4ba92476a5b08a0ff23638d844e'
    );
```

**Expected Result:**
| CONSTRAINT_NAME | TABLE_NAME | REFERENCED_TABLE_NAME | DELETE_RULE |
|-----------------|------------|----------------------|-------------|
| FK_26cc98bb28cf424dec88c4d10a3 | images | collections | SET NULL |
| FK_0f75d61b7b7e6851a07ec7d2436 | maplocations | images | SET NULL |
| FK_4ba92476a5b08a0ff23638d844e | maplocations | images | SET NULL |

---

## 🎯 What Was Fixed

1. **Foreign Key Constraints** → Now use `ON DELETE SET NULL`
2. **Timeline Deletion** → Only deletes timeline entry, keeps image
3. **Gallery Deletion** → Cascades properly to Timeline & MapLocations
4. **Image Availability** → Properly filters assigned images
5. **Data Flow** → Timeline and MapLocations are now independent

---

## 📖 Full Documentation

See [FIX_FOREIGN_KEY_AND_DELETION.md](./FIX_FOREIGN_KEY_AND_DELETION.md) for complete details.
