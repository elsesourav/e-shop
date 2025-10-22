# Draft Feature Migration: localStorage → Database

## Summary

Successfully migrated the product draft feature from localStorage to database-backed storage with full CRUD operations.

## Changes Made

### 1. Backend - Product Controller

**File:** `/apps/product-service/src/controllers/product.controller.ts`

Added 4 new functions:

#### `saveProductDraft`

- Saves or updates product drafts in database
- Validates seller has a shop
- Updates existing draft if same slug exists
- Only requires `title` and `slug` minimum
- Stores all form data including images, colors, sizes, custom properties

#### `getDraftProducts`

- Fetches all drafts for authenticated seller's shop
- Returns drafts with images included
- Ordered by most recently updated

#### `deleteDraftProduct`

- Deletes a draft product
- Validates ownership (draft belongs to seller)
- Only allows deletion of DRAFT status products

#### `publishDraftProduct`

- Changes draft status from DRAFT → ACTIVE
- Validates required fields before publishing
- Makes product visible to customers

### 2. Backend - Routes

**File:** `/apps/product-service/src/routes/product.route.ts`

Added 4 new routes:

```typescript
POST   /product/api/save-product-draft       // Save/update draft
GET    /product/api/get-draft-products       // List all drafts
DELETE /product/api/delete-draft-product/:id // Delete draft
PUT    /product/api/publish-draft-product/:id // Publish draft
```

All routes require authentication (`isAuthenticated` middleware).

### 3. Frontend - Create Product Page

**File:** `/apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`

**Changes:**

- ✅ Updated `handleSaveDraft` to call backend API
- ✅ Removed localStorage save logic
- ✅ Removed useEffect for draft restoration
- ✅ Validates title + slug before saving
- ✅ Shows loading state while saving
- ✅ Displays success/error toast messages

**Removed Code:**

```typescript
// ❌ Removed localStorage logic
localStorage.setItem('product-draft', JSON.stringify(draftData));

// ❌ Removed restoration useEffect
useEffect(() => {
  const savedDraft = localStorage.getItem('product-draft');
  // ... restoration logic
}, []);
```

**New Code:**

```typescript
// ✅ New database-backed save
const handleSaveDraft = async () => {
  setSavingDraft(true);
  const formData = watch();

  if (!formData.title || !formData.slug) {
    toast.error('Title and Slug are required to save draft');
    return;
  }

  await axiosInstance.post('/product/api/save-product-draft', formData);
  toast.success('Draft saved successfully!');
  setSavingDraft(false);
};
```

### 4. Frontend - New Drafts Page

**File:** `/apps/seller-ui/src/app/(routes)/dashboard/drafts/page.tsx` (NEW)

Complete drafts management interface:

**Features:**

- 📋 Grid view of all saved drafts
- 🖼️ Product image preview
- 💰 Price and stock display
- 📁 Category and subcategory
- ⏰ Last saved timestamp
- 🎨 Status badge (DRAFT)
- ✏️ Edit button - opens create-product page
- 📤 Publish button - validates & publishes
- 🗑️ Delete button - confirms & deletes

**Tech Stack:**

- TanStack Query for data fetching
- React hooks for state management
- react-hot-toast for notifications
- Next.js navigation
- Responsive grid layout

**UI States:**

- Loading spinner while fetching
- Empty state with CTA when no drafts
- Error state for failed requests
- Disabled buttons during mutations

## Database Schema

Uses existing `products` table with `status` field:

```prisma
model products {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  slug        String   @unique
  status      Status   @default(ACTIVE) // ACTIVE or DRAFT
  // ... other fields

  shopId      String   @db.ObjectId
  shop        shops    @relation(fields: [shopId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Status {
  ACTIVE
  DRAFT
}
```

No schema changes required - uses existing structure!

## Benefits Over localStorage

| Feature              | localStorage            | Database                  |
| -------------------- | ----------------------- | ------------------------- |
| **Cross-Device**     | ❌ Single browser only  | ✅ Access from any device |
| **Data Persistence** | ❌ Lost on clear cache  | ✅ Permanent storage      |
| **Multi-User**       | ❌ Shared between users | ✅ Per-seller isolation   |
| **Storage Limit**    | ❌ 5-10MB limit         | ✅ Unlimited              |
| **Image Storage**    | ❌ Base64 or URLs only  | ✅ ImageKit integration   |
| **Version History**  | ❌ Manual timestamp     | ✅ Auto updatedAt         |
| **Security**         | ❌ Client-side only     | ✅ Server validation      |
| **Collaboration**    | ❌ Not possible         | ✅ Future team support    |
| **Search/Filter**    | ❌ Manual iteration     | ✅ Database queries       |
| **Backup**           | ❌ Browser dependent    | ✅ Database backups       |

## User Workflows

### Workflow 1: Save Draft

1. Seller fills product form (minimum: title + slug)
2. Clicks "Save as Draft"
3. Backend validates and saves to database
4. Success toast shown
5. Can continue editing or navigate away

### Workflow 2: Continue Editing

1. Seller navigates to "Drafts" page
2. Sees grid of all drafts
3. Clicks "Edit" on a draft
4. Opens create-product page
5. Can modify and save again

### Workflow 3: Publish Draft

1. Seller opens "Drafts" page
2. Clicks "Publish" on complete draft
3. Backend validates required fields
4. If incomplete → redirects to edit
5. If complete → status changes to ACTIVE
6. Product visible to customers

### Workflow 4: Delete Draft

1. Seller opens "Drafts" page
2. Clicks delete button
3. Confirmation dialog appears
4. On confirm → draft deleted from database
5. Success message shown

## Security

### Authentication

- All draft endpoints require valid JWT token
- `isAuthenticated` middleware validates token
- Unauthenticated requests rejected with 401

### Authorization

- Drafts scoped to seller's shop
- Backend verifies ownership before operations
- Seller A cannot access Seller B's drafts

### Validation

- **Save Draft:** Requires title + slug minimum
- **Publish Draft:** Requires all mandatory fields
- **Delete Draft:** Only DRAFT status allowed
- **Input Sanitization:** Handled by Prisma

## Next Steps

### 1. Run Prisma Generate

```bash
cd /Users/sourav/Developer/WEB/2025/October/e-shop
npx prisma generate
```

This regenerates Prisma client with updated types.

### 2. Restart Backend Services

```bash
# Terminal 1 - Product Service
cd apps/product-service
npm run dev

# Terminal 2 - Auth Service (if needed)
cd apps/auth-service
npm run dev
```

### 3. Restart Frontend

```bash
# Terminal 3 - Seller UI
cd apps/seller-ui
npm run dev
```

### 4. Test the Feature

#### Test Saving Draft

1. Go to `/dashboard/create-product`
2. Fill in title and slug
3. Click "Save as Draft"
4. Verify success toast
5. Check database for draft entry

#### Test Drafts Page

1. Go to `/dashboard/drafts`
2. Verify draft appears in grid
3. Check image, title, price display
4. Verify "Last saved" timestamp

#### Test Edit Draft

1. Click "Edit" on a draft
2. Verify form populated with data
3. Modify some fields
4. Save draft again
5. Verify updates reflected

#### Test Publish Draft

1. Complete all required fields
2. Go to drafts page
3. Click "Publish"
4. Verify product now in all-products
5. Check status changed to ACTIVE

#### Test Delete Draft

1. Click delete button
2. Confirm deletion
3. Verify draft removed from list
4. Check database entry deleted

### 5. Optional Enhancements

#### Auto-Save Feature

Add auto-save every 30 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (isDirty) {
      handleSaveDraft(true); // silent save, no toast
    }
  }, 30000);
  return () => clearInterval(interval);
}, [isDirty]);
```

#### Draft Preview

Add preview mode before publishing:

```typescript
router.push(`/dashboard/preview/${draft.id}`);
```

#### Draft Expiration

Auto-delete old drafts after 30 days:

```typescript
// Cron job in backend
async function cleanupOldDrafts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.products.deleteMany({
    where: {
      status: 'DRAFT',
      updatedAt: { lt: thirtyDaysAgo },
    },
  });
}
```

#### Conflict Resolution

Handle multiple tabs editing same draft:

```typescript
// Check version before save
if (serverUpdatedAt > localUpdatedAt) {
  // Show merge dialog
}
```

## Files Modified

### Backend

1. ✅ `/apps/product-service/src/controllers/product.controller.ts`

   - Added 4 new functions (175+ lines)

2. ✅ `/apps/product-service/src/routes/product.route.ts`
   - Added 4 new routes
   - Updated imports

### Frontend

3. ✅ `/apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`

   - Updated handleSaveDraft function
   - Removed localStorage code
   - Removed useEffect restoration

4. ✅ `/apps/seller-ui/src/app/(routes)/dashboard/drafts/page.tsx` (NEW)
   - Complete drafts management page (220+ lines)

### Documentation

5. ✅ `/DRAFT_FEATURE_DATABASE.md`

   - Comprehensive technical documentation

6. ✅ `/DRAFT_FEATURE_MIGRATION.md` (this file)
   - Migration guide and summary

## API Reference

### POST /product/api/save-product-draft

Save or update a product draft.

**Request:**

```json
{
  "title": "My Product",
  "slug": "my-product",
  "description": "Short description",
  "category": "Electronics",
  "regularPrice": 999,
  "images": [{ "fileId": "...", "fileUrl": "..." }]
  // ... other fields
}
```

**Response:**

```json
{
  "success": true,
  "product": {
    "id": "...",
    "title": "My Product",
    "status": "DRAFT",
    "updatedAt": "2025-10-20T..."
  }
}
```

### GET /product/api/get-draft-products

Get all drafts for authenticated seller.

**Response:**

```json
{
  "success": true,
  "drafts": [
    {
      "id": "...",
      "title": "My Product",
      "slug": "my-product",
      "status": "DRAFT",
      "images": [...],
      "updatedAt": "2025-10-20T..."
    }
  ]
}
```

### DELETE /product/api/delete-draft-product/:id

Delete a draft by ID.

**Response:**

```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

### PUT /product/api/publish-draft-product/:id

Publish a draft (change status to ACTIVE).

**Response:**

```json
{
  "success": true,
  "message": "Product published successfully",
  "product": {
    "id": "...",
    "status": "ACTIVE",
    "title": "..."
  }
}
```

## Troubleshooting

### Issue: TypeScript errors in controller

**Solution:** Run `npx prisma generate` to regenerate Prisma client

### Issue: 401 Unauthorized on draft endpoints

**Solution:** Ensure JWT token is sent in cookies/headers

### Issue: Draft not appearing in list

**Solution:** Check that seller has a shop created

### Issue: Cannot publish draft

**Solution:** Ensure all required fields are filled (description, category, etc.)

### Issue: Images not loading in drafts page

**Solution:** Verify ImageKit URLs are valid and accessible

## Conclusion

The draft feature has been successfully migrated from localStorage to a robust database-backed solution. This provides:

- ✅ **Better UX:** Cross-device access, no data loss
- ✅ **Scalability:** Unlimited drafts per seller
- ✅ **Security:** Server-side validation and authorization
- ✅ **Maintainability:** Centralized data management
- ✅ **Features:** View, edit, publish, delete operations

The implementation follows REST principles, includes proper error handling, and provides a clean UI for draft management.

**Status:** ✅ Ready for testing
**Next Action:** Run `npx prisma generate` and restart services
