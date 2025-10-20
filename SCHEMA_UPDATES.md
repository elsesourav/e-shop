# Database Schema & Application Updates

## 📋 Overview

This document summarizes all the changes made to align the application with the new Prisma schema.

## 🗄️ Database Schema Changes

### 1. **Images Model**

- ✅ Added `createdAt` and `updatedAt` timestamps
- ✅ Removed incorrect `@unique` constraints on `userId` and `shopId`
- ✅ Added cascade delete on all relations
- ✅ Added indexes for `userId`, `shopId`, and `productId`
- ✅ Changed user avatar from one-to-one to one-to-many relationship

### 2. **Users Model**

- ✅ Changed `avatar` from single image to array of images
- ✅ Added `productReviews` relation
- ✅ Changed `following` field to use `@db.ObjectId` array type

### 3. **Shop Reviews Model**

- ✅ Fixed field name: `shopsId` → `shopId`
- ✅ Fixed relation name: `shops` → `shop`
- ✅ Added cascade delete behavior
- ✅ Added indexes on `userId`, `shopId`, and `rating`

### 4. **Product Reviews Model** (NEW)

- ✅ Created new model for product reviews
- ✅ Linked to users and products with cascade delete
- ✅ Includes rating, review text, and timestamps
- ✅ Added indexes for performance

### 5. **Shops Model**

- ✅ Fixed relation name: `sellers` → `seller`
- ✅ Changed `avatar` from single to multiple images
- ✅ Added cascade delete on seller relation
- ✅ Added indexes on `category` and `ratings`

### 6. **Sellers Model**

- ✅ Removed redundant `shopsId` field
- ✅ Added `discountCodes` relation

### 7. **Discount Codes Model**

- ✅ Added `minAmount` - Minimum order amount to apply discount
- ✅ Added `maxAmount` - Maximum discount amount cap
- ✅ Added `usageLimit` - Usage limit (0 = unlimited)
- ✅ Added `usedCount` - Track number of times used
- ✅ Added `expiresAt` - Optional expiration date
- ✅ Added `isActive` - Enable/disable discount code
- ✅ Added relation to `sellers` with cascade delete
- ✅ Added indexes on `sellerId` and `isActive`

### 8. **Products Model**

- ✅ Added `viewCount` - Track product views
- ✅ Added `soldCount` - Track sales
- ✅ Added `productReviews` relation
- ✅ Added `OUT_OF_STOCK` status to enum
- ✅ Added cascade delete on shop relation
- ✅ Added comprehensive indexes

---

## 🔧 Backend Controller Updates

### **auth.controller.ts**

#### Fixed Issues:

1. ✅ **`refreshToken` function logic error**: Changed `|| decoded.role` to `|| !decoded.role`
2. ✅ **Error handling**: Changed `return new Error()` to `return next(new Error())`
3. ✅ **Response status**: Changed from `201` to `200` for refresh token
4. ✅ **Added field selection**: Only return necessary user/seller fields

### **product.controller.ts**

#### Updated Existing Functions:

1. ✅ **`createDiscountCode`**: Now supports all new fields:

   - `minAmount`, `maxAmount`, `usageLimit`
   - `expiresAt`, `isActive`

2. ✅ **`getDiscountCodes`**: Added filtering:
   - Filter by active status
   - Filter by expiration
   - Order by creation date

#### New Functions Added:

3. ✅ **`updateDiscountCode`**: Update discount code settings
4. ✅ **`validateDiscountCode`**: Validate discount codes with:

   - Active status check
   - Expiration check
   - Usage limit validation
   - Minimum order amount validation
   - Discount calculation (percentage/fixed)
   - Maximum discount cap application

5. ✅ **`incrementDiscountUsage`**: Track discount code usage
6. ✅ **`createProductReview`**: Allow users to review products
7. ✅ **`getProductReviews`**: Get product reviews with pagination
8. ✅ **`createShopReview`**: Allow users to review shops
9. ✅ **`getShopReviews`**: Get shop reviews with pagination
10. ✅ **`incrementProductView`**: Track product view counts

---

## 🎨 Frontend Updates

### **create-product/page.tsx**

#### Changes Made:

1. ✅ Fixed field name: `discountCode` → `discountCodes` (array)
2. ✅ Added query parameter to fetch only active discount codes
3. ✅ Enhanced discount code display:
   - Show discount code itself (not just name)
   - Show expiration status with 🔴 indicator
   - Show usage limit status with ⚠️ indicator
   - Disable expired/inactive/limit-reached codes
   - Show proper discount format (percentage vs fixed)
   - Added tooltips for disabled states
4. ✅ Added empty state message when no discount codes available

### **discount-codes/page.tsx**

#### Changes Made:

1. ✅ Added new form fields:

   - `minAmount` - Minimum order amount
   - `maxAmount` - Maximum discount (for percentage)
   - `usageLimit` - Usage limit (0 = unlimited)
   - `expiresAt` - Expiry date/time picker
   - `isActive` - Active status checkbox

2. ✅ Enhanced discount codes table:

   - Added columns: Code, Min Order, Usage, Status
   - Show usage statistics (used/limit)
   - Show status indicators (Active, Expired, Limit Reached)
   - Show expiration date for active codes
   - Show max discount cap for percentage codes
   - Improved responsive design with overflow

3. ✅ Conditional field display:
   - Show `maxAmount` only for percentage discounts

---

## 🛣️ Route Updates

### **product.route.ts**

#### New Routes Added:

```typescript
// Discount codes
PUT  /update-discount-code/:id          // Update discount code
POST /validate-discount-code            // Validate discount code
POST /increment-discount-usage          // Increment usage count

// Product reviews
POST /create-product-review             // Create product review
GET  /get-product-reviews/:productId    // Get product reviews

// Shop reviews
POST /create-shop-review                // Create shop review
GET  /get-shop-reviews/:shopId          // Get shop reviews

// Product analytics
POST /increment-product-view/:productId // Track product views
```

---

## 📝 Next Steps

### Required:

1. **Run Prisma Generate**:

   ```bash
   npx prisma generate
   ```

   This will update the Prisma client types to include all new fields.

2. **Restart Development Servers**:
   - Restart auth-service
   - Restart product-service
   - Restart seller-ui

### Optional Enhancements:

1. Create update product page with new features
2. Add product reviews UI for users
3. Add shop reviews UI for users
4. Create analytics dashboard showing:
   - Product views
   - Discount code usage
   - Sales statistics
5. Add discount code validation on checkout
6. Create product filters by reviews/ratings
7. Add notification when discount codes are about to expire

---

## 🎯 Benefits of These Changes

### For Sellers:

- ✅ More control over discount codes (expiry, limits, min order)
- ✅ Better discount code management with status tracking
- ✅ Usage analytics for discount codes
- ✅ Prevent misuse with usage limits
- ✅ View product and shop ratings

### For Users:

- ✅ Clear discount code information
- ✅ Can't select expired/invalid codes
- ✅ Can write product reviews
- ✅ Can write shop reviews
- ✅ Better shopping experience

### For System:

- ✅ Better data integrity with cascade deletes
- ✅ Improved query performance with indexes
- ✅ Proper validation and error handling
- ✅ Scalable review system
- ✅ Analytics tracking capabilities

---

## ⚠️ Breaking Changes

1. **Field Name Changes**:

   - `shopsId` → `shopId` in shopReviews
   - `discountCode` → `discountCodes` (now array)
   - `sellers` → `seller` in shops relation

2. **Relation Changes**:

   - User avatar: one-to-one → one-to-many
   - Shop avatar: one-to-one → one-to-many

3. **New Required Behavior**:
   - Discount codes must be validated before checkout
   - Product reviews affect product ratings
   - Shop reviews affect shop ratings

---

## 🧪 Testing Checklist

- [ ] Create new discount code with all fields
- [ ] Update existing discount code
- [ ] Validate active discount code
- [ ] Validate expired discount code
- [ ] Validate discount code with usage limit
- [ ] Create product with multiple images
- [ ] Create product review
- [ ] Create shop review
- [ ] Track product views
- [ ] Delete shop (cascade test)
- [ ] Delete user (cascade test)
- [ ] Seller authentication with new fields
- [ ] User authentication with new fields

---

**Last Updated**: 20 October 2025
**Version**: 2.0.0
