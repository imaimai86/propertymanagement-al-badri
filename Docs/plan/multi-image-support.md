# Implementation Plan - Multi-Image Support with Thumbnail and Gallery

## Overview
Add support for a single thumbnail image and multiple gallery images for each property, with the ability to upload, display in a carousel, and soft-delete images.

## Data Structure Changes

### Backend (Google Sheets)
- **`thumbnail`**: Single image path (string) - e.g., `assets/props-imgs/prop-id-1/thumbnail.jpg`
- **`images`**: Multiple image paths (JSON array as string) - e.g., `["assets/props-imgs/prop-id-1/gallery1.jpg", "assets/props-imgs/prop-id-1/gallery2.jpg"]`

### Frontend State
```typescript
{
  thumbnail: string,           // Single path
  images: string[]            // Array of paths
}
```

## Proposed Changes

### Backend (Apps Script)

#### [MODIFY] [Code.js](file:///Volumes/Medable/Projects/trials/Design-Trial/Property-management-2/management-portal/admin-api/Code.js)

**1. Update `saveProperty` function (lines 340-368)**
- Change `thumbnail` field to store single image from `params.thumbnail`
- Change `images` field to store JSON stringified array from `params.images`
- Handle both string and array inputs for backward compatibility

**2. Update `getProperties` function (lines 298-312)**
- Parse `images` field from JSON string to array when returning data
- Ensure backward compatibility if `images` is not JSON

**3. Add new `deleteImage` action**
- Create new function to handle image deletion (soft delete)
- Move file from `assets/props-imgs/` to `assets/props-imgs-deleted/` in S3
- Update property record to remove deleted image from `images` array

---

### Mobile App (Expo)

#### [MODIFY] [edit.tsx](file:///Volumes/Medable/Projects/trials/Design-Trial/Property-management-2/management-portal/mobile-app/app/property/edit.tsx)

**1. Update State Management**
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  thumbnail: '',      // Single image
  images: []         // Array of images
});
```

**2. Update `loadProperty` function**
- Parse `images` field from string to array if needed
- Separate `thumbnail` and `images` fields

**3. Add Thumbnail Upload Section**
- Single image picker for thumbnail
- Display current thumbnail with replace option
- Upload to `assets/props-imgs/prop-id-{id}/thumbnail_{timestamp}.jpg`

**4. Add Gallery Images Section**
- Multiple image picker for gallery
- Display all gallery images in a grid
- Each image has a delete button (X icon)
- Upload to `assets/props-imgs/prop-id-{id}/gallery_{timestamp}_{index}.jpg`

**5. Implement Image Deletion**
- Add delete handler that calls backend `deleteImage` action
- Remove image from local state after successful deletion
- Show confirmation dialog before deleting

**6. Update `handleSave` function**
- Send `thumbnail` as string
- Send `images` as array

---

#### [MODIFY] [[id].tsx](file:///Volumes/Medable/Projects/trials/Design-Trial/Property-management-2/management-portal/mobile-app/app/property/[id].tsx)

**1. Update Image Carousel**
- Use `images` array instead of single image
- Fall back to `thumbnail` if `images` is empty
- Add dots/indicators for multiple images

---

### S3 Operations (Apps Script)

#### [NEW] Add S3 Move/Copy Functions to [AwsSignature.js](file:///Volumes/Medable/Projects/trials/Design-Trial/Property-management-2/management-portal/admin-api/AwsSignature.js)

**1. Add `copyObject` function**
- Generate presigned URL for S3 COPY operation
- Copy from source to destination

**2. Add `deleteObject` function**  
- Generate presigned URL for S3 DELETE operation

**3. Soft Delete Implementation**
- Copy image from `assets/props-imgs/` to `assets/props-imgs-deleted/`
- Delete original image
- Return success/failure

---

## API Changes

### New Backend Action: `deleteImage`

**Request:**
```javascript
{
  action: 'deleteImage',
  params: {
    propertyId: '1',
    imagePath: 'assets/props-imgs/prop-id-1/gallery1.jpg'
  },
  token: 'user-token'
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    deletedPath: 'assets/props-imgs/prop-id-1/gallery1.jpg',
    movedTo: 'assets/props-imgs-deleted/prop-id-1/gallery1.jpg'
  }
}
```

---

## UI/UX Design

### Edit Page Layout

```
┌─────────────────────────────────────┐
│ Thumbnail Image                     │
│ ┌─────────────────────────────────┐ │
│ │  [Current Thumbnail or Upload]  │ │
│ │  Tap to upload/replace          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Gallery Images                      │
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │ Img 1 │ │ Img 2 │ │ Img 3 │     │
│ │   X   │ │   X   │ │   X   │     │
│ └───────┘ └───────┘ └───────┘     │
│ ┌───────┐                          │
│ │  +    │ Add More Images          │
│ └───────┘                          │
└─────────────────────────────────────┘
```

---

## Verification Plan

### Backend Testing
1. Test `saveProperty` with thumbnail and images array
2. Test `getProperties` returns parsed images array
3. Test `deleteImage` moves file correctly
4. Verify backward compatibility with existing single-image properties

### Frontend Testing
1. Upload thumbnail - verify single image upload
2. Upload multiple gallery images - verify array handling
3. Delete gallery image - verify soft delete and UI update
4. Edit existing property - verify images load correctly
5. Save property - verify thumbnail and images saved separately
6. View property detail - verify carousel shows all images

### Manual Verification
1. Create new property with thumbnail + 3 gallery images
2. Edit property and delete 1 gallery image
3. Verify deleted image moved to `assets/props-imgs-deleted/`
4. View property on frontend - verify carousel works
5. Check Google Sheet - verify `images` field contains JSON array
