# Product Draft Feature - Database Implementation

## Overview

This document describes the database-backed draft system for product creation. Sellers can save incomplete products as drafts and continue editing them later.

## Backend Implementation

### Database Schema

The existing `products` table includes a `status` field with enum values:

- `ACTIVE` - Published products visible to customers
- `DRAFT` - Saved drafts, only visible to the seller

### API Endpoints

#### 1. Save/Update Draft

**POST** `/product/api/save-product-draft`

**Authentication:** Required (Seller only)

**Request Body:**

```json
{
  "title": "Product Title",
  "slug": "product-slug",
  "description": "Short description",
  "detailDescription": "Full description HTML",
  "category": "Electronics",
  "subCategory": "Mobile Phones",
  "brand": "Samsung",
  "tags": ["smartphone", "5g"],
  "warranty": "1 year",
  "cod": "yes",
  "regularPrice": 999,
  "salePrice": 799,
  "stock": 50,
  "colors": ["#FF0000", "#0000FF"],
  "sizes": ["S", "M", "L"],
  "discountCodes": ["discount-id-1", "discount-id-2"],
  "images": [
    {
      "fileId": "imagekit-file-id",
      "fileUrl": "https://..."
    }
  ],
  "videoUrl": "https://youtube.com/...",
  "customProperties": { "Material": "Leather" },
  "customSpecifications": { "Weight": "200g" }
}
```

**Response:**

```json
{
  "success": true,
  "product": {
    "id": "draft-id",
    "title": "Product Title",
    "slug": "product-slug",
    "status": "DRAFT",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T...",
    "images": [...]
  }
}
```

**Behavior:**

- If a draft with the same slug exists for the seller's shop, it updates that draft
- If no draft exists, creates a new draft
- Only requires `title` and `slug` to save
- Validates that the seller has a shop
- Stores all form data including images, colors, sizes, etc.

#### 2. Get All Drafts

**GET** `/product/api/get-draft-products`

**Authentication:** Required (Seller only)

**Response:**

```json
{
  "success": true,
  "drafts": [
    {
      "id": "draft-id-1",
      "title": "Product Title",
      "slug": "product-slug",
      "description": "...",
      "regularPrice": 999,
      "salePrice": 799,
      "stock": 50,
      "category": "Electronics",
      "subCategory": "Mobile Phones",
      "brand": "Samsung",
      "status": "DRAFT",
      "createdAt": "2025-10-20T...",
      "updatedAt": "2025-10-20T...",
      "images": [
        {
          "id": "image-id",
          "url": "https://...",
          "fileId": "imagekit-file-id"
        }
      ]
    }
  ]
}
```

**Behavior:**

- Returns all drafts for the authenticated seller's shop
- Includes images for preview
- Ordered by `updatedAt` descending (most recent first)

#### 3. Delete Draft

**DELETE** `/product/api/delete-draft-product/:id`

**Authentication:** Required (Seller only)

**Response:**

```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

**Behavior:**

- Verifies the draft belongs to the authenticated seller
- Only allows deletion of products with status `DRAFT`
- Cascade deletes associated images (handled by Prisma schema)

#### 4. Publish Draft

**PUT** `/product/api/publish-draft-product/:id`

**Authentication:** Required (Seller only)

**Response:**

```json
{
  "success": true,
  "message": "Product published successfully",
  "product": {
    "id": "product-id",
    "status": "ACTIVE",
    "title": "...",
    ...
  }
}
```

**Behavior:**

- Validates required fields: `description`, `detailDescription`, `category`, `subCategory`
- Changes status from `DRAFT` to `ACTIVE`
- Makes product visible to customers
- Verifies ownership before publishing

### Controller Functions

**File:** `/apps/product-service/src/controllers/product.controller.ts`

```typescript
// Save or update draft
export const saveProductDraft = async (req: any, res: Response, next: NextFunction)

// Get all drafts for seller
export const getDraftProducts = async (req: any, res: Response, next: NextFunction)

// Delete a draft
export const deleteDraftProduct = async (req: any, res: Response, next: NextFunction)

// Publish a draft
export const publishDraftProduct = async (req: any, res: Response, next: NextFunction)
```

## Frontend Implementation

### Create Product Page

**File:** `/apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`

#### Save Draft Button

```tsx
<button onClick={handleSaveDraft} disabled={savingDraft || !isDirty} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:bg-gray-400">
  {savingDraft ? 'Saving...' : 'Save as Draft'}
</button>
```

#### Save Draft Handler

```typescript
const handleSaveDraft = async () => {
  try {
    setSavingDraft(true);
    const formData = watch();

    // Validate required fields for draft
    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required to save draft');
      return;
    }

    // Save draft to backend
    await axiosInstance.post('/product/api/save-product-draft', formData);
    toast.success('Draft saved successfully!');
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to save draft');
  } finally {
    setSavingDraft(false);
  }
};
```

**Features:**

- Validates minimum required fields (title + slug)
- Sends all form data to backend
- Shows loading state while saving
- Displays success/error messages
- Button disabled when no changes (`isDirty` check)

### Drafts Management Page

**File:** `/apps/seller-ui/src/app/(routes)/dashboard/drafts/page.tsx`

#### Features

1. **List View**

   - Grid layout with draft cards
   - Shows product image, title, price, stock
   - Displays category and last saved time
   - Empty state with "Create Product" CTA

2. **Draft Card Actions**

   - **Edit** - Opens create-product page to continue editing
   - **Publish** - Publishes draft (validates required fields first)
   - **Delete** - Deletes draft with confirmation

3. **Data Fetching**

   - Uses TanStack Query for caching
   - Automatic refetch on mutations
   - Loading and error states

4. **Validation**
   - Checks for required fields before publishing
   - Redirects to edit if incomplete
   - Shows error messages for failed operations

## User Workflow

### Saving a Draft

1. Seller fills out product form (at minimum: title + slug)
2. Clicks "Save as Draft" button
3. Backend creates/updates draft in database
4. Success message shown
5. Seller can continue editing or navigate away

### Managing Drafts

1. Seller navigates to "Drafts" page
2. Sees all saved drafts in grid layout
3. Can perform actions:
   - **Edit** - Continue editing the draft
   - **Publish** - Make product live (if complete)
   - **Delete** - Remove draft permanently

### Publishing a Draft

1. Seller clicks "Publish" on a draft
2. System validates required fields
3. If incomplete, redirects to edit page
4. If complete, changes status to ACTIVE
5. Product becomes visible to customers

## Database Queries

### Create/Update Draft

```typescript
// Check existing draft
const existingDraft = await prisma.products.findFirst({
  where: {
    slug,
    shopId: seller.shop.id,
    status: 'DRAFT',
  },
});

// Update existing or create new
if (existingDraft) {
  product = await prisma.products.update({
    where: { id: existingDraft.id },
    data: { ...productData, images: { deleteMany: {}, create: filteredImages } },
    include: { images: true },
  });
} else {
  product = await prisma.products.create({
    data: { ...productData, images: { create: filteredImages } },
    include: { images: true },
  });
}
```

### Fetch Drafts

```typescript
const drafts = await prisma.products.findMany({
  where: {
    shopId: seller.shop.id,
    status: 'DRAFT',
  },
  include: { images: true },
  orderBy: { updatedAt: 'desc' },
});
```

### Publish Draft

```typescript
const publishedProduct = await prisma.products.update({
  where: { id },
  data: { status: 'ACTIVE' },
  include: { images: true },
});
```

## Security

1. **Authentication**

   - All draft endpoints require authentication
   - `isAuthenticated` middleware validates JWT token

2. **Authorization**

   - Sellers can only access their own drafts
   - Ownership verified by checking shop relationship
   - Draft actions (edit/delete/publish) validate seller ID

3. **Data Validation**
   - Minimum required fields enforced (title + slug for draft)
   - Additional validation for publishing (description, category, etc.)
   - Input sanitization handled by Prisma

## Benefits

### Compared to localStorage:

1. **Cross-Device Access** - Drafts available on any device
2. **Data Persistence** - No risk of losing data on browser clear
3. **Multi-User Support** - Each seller has their own drafts
4. **No Storage Limits** - Can save unlimited drafts
5. **Image Persistence** - Images saved to ImageKit, not browser
6. **Version History** - Database stores updatedAt timestamp
7. **Better Security** - Server-side validation and authorization

## Testing Checklist

### Backend Testing

- [ ] Save draft with minimum fields (title + slug)
- [ ] Save draft with all fields populated
- [ ] Update existing draft (same slug)
- [ ] Create new draft (different slug)
- [ ] Fetch drafts list
- [ ] Delete draft
- [ ] Publish complete draft
- [ ] Publish incomplete draft (should fail)
- [ ] Unauthorized access (should fail)
- [ ] Draft for seller without shop (should fail)

### Frontend Testing

- [ ] Save draft from create-product page
- [ ] View drafts in drafts page
- [ ] Edit draft and save again
- [ ] Publish complete draft
- [ ] Try to publish incomplete draft
- [ ] Delete draft with confirmation
- [ ] Empty state when no drafts
- [ ] Loading states during operations
- [ ] Error handling for failed operations
- [ ] Button disabled when no changes

## Next Steps

1. **Run Prisma Generate**

   ```bash
   npx prisma generate
   ```

2. **Restart Services**

   ```bash
   # Restart product-service
   # Restart seller-ui
   ```

3. **Test the Feature**

   - Create a product draft
   - View in drafts page
   - Edit and update
   - Publish or delete

4. **Optional Enhancements**
   - Add draft auto-save (save every 30 seconds)
   - Add draft conflict resolution (if multiple tabs)
   - Add draft preview mode
   - Add draft sharing between team members
   - Add draft expiration (auto-delete after 30 days)

## File Changes Summary

### Modified Files

1. `/apps/product-service/src/controllers/product.controller.ts`

   - Added `saveProductDraft` function
   - Added `getDraftProducts` function
   - Added `deleteDraftProduct` function
   - Added `publishDraftProduct` function

2. `/apps/product-service/src/routes/product.route.ts`

   - Added `POST /save-product-draft`
   - Added `GET /get-draft-products`
   - Added `DELETE /delete-draft-product/:id`
   - Added `PUT /publish-draft-product/:id`

3. `/apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`
   - Updated `handleSaveDraft` to use backend API
   - Removed localStorage logic
   - Removed useEffect for draft restoration

### New Files

1. `/apps/seller-ui/src/app/(routes)/dashboard/drafts/page.tsx`
   - Complete drafts management page
   - Grid view with draft cards
   - Edit, publish, delete actions
   - TanStack Query integration

## API Route Summary

| Method | Endpoint                                 | Auth     | Description                     |
| ------ | ---------------------------------------- | -------- | ------------------------------- |
| POST   | `/product/api/save-product-draft`        | Required | Save/update product draft       |
| GET    | `/product/api/get-draft-products`        | Required | Get all drafts for seller       |
| DELETE | `/product/api/delete-draft-product/:id`  | Required | Delete a draft                  |
| PUT    | `/product/api/publish-draft-product/:id` | Required | Publish draft as active product |
