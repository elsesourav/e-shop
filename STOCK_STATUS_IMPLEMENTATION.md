# Stock Status Filter Implementation

## Overview

Implemented backend-based stock status filtering with clickable stats cards that remain visible at all times, showing real-time product statistics.

## Features Implemented

### 1. **Separate Stats Endpoint** (Optimized Performance)

- **Route**: `GET /product/api/get-shop-product-stats`
- **Purpose**: Fetch product statistics separately from product list
- **Benefits**:
  - Stats remain constant regardless of search/filter
  - Faster queries with optimized count operations
  - Better caching strategy (5 min vs 2 min)

### 2. **Stock Status Filtering** (Backend)

- Filter products by stock status:
  - **All Products**: Shows all products (default)
  - **In Stock**: Products with stock > 0
  - **Low Stock**: Products with 0 < stock < 10
  - **Out of Stock**: Products with stock = 0

### 3. **Always Visible Stats Cards**

- Stats cards are always displayed (not hidden when no results)
- Clickable to filter products by status
- Visual feedback with ring border when active
- Shows real counts from ALL products, not just filtered results

### 4. **Database Optimization** (Schema Updates)

Added comprehensive indexes to `products` model for faster queries:

```prisma
@@index([stock])                    // Stock-based queries
@@index([shopId, stock])            // Seller's stock queries
@@index([shopId, isDeleted, stock]) // Combined filter queries
@@index([title])                    // Search by title
@@index([updatedAt])                // Sort by updated date
@@index([viewCount])                // Sort by views
@@index([soldCount])                // Sort by sales
```

## API Endpoints

### Get Product Stats (New)

```
GET /product/api/get-shop-product-stats
Authorization: Required (Seller)

Response:
{
  "success": true,
  "stats": {
    "total": 150,
    "inStock": 120,
    "lowStock": 25,
    "outOfStock": 5
  }
}
```

### Get Shop Products (Updated)

```
GET /product/api/get-shop-products
Authorization: Required (Seller)

Query Parameters:
- page: number (default: 1)
- limit: number (max: 100, default: 20)
- search: string (optional)
- sortBy: string (title|updatedAt|salePrice|createdAt|ratings|stock|viewCount|soldCount)
- order: string (asc|desc)
- stockStatus: string (in-stock|low-stock|out-of-stock) 👈 NEW
- status: string (ACTIVE|DRAFT|PENDING|OUT_OF_STOCK)
- category: string (optional)
- subCategory: string (optional)

Response:
{
  "success": true,
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalProducts": 150,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Frontend Implementation

### State Management

```typescript
const [stockStatus, setStockStatus] = useState<string>(''); // '' | 'in-stock' | 'low-stock' | 'out-of-stock'
```

### Separate Queries

1. **Product Stats Query** - Independent, slower refresh (5 min)
2. **Products Query** - Depends on filters, faster refresh (2 min)

### Click Behavior

- Click on a status card → Filters products by that status
- Click same status again → Clears filter (shows all products)
- Stats cards always show total counts (not affected by filters)
- Active status card has colored ring border

## Performance Optimizations

### Backend

1. **Separate Stats Endpoint**:

   - Uses optimized `count()` operations instead of fetching full products
   - Parallel execution with `Promise.all()`
   - Only fetches stock field for counting

2. **Indexed Queries**:

   - Compound indexes for common query patterns
   - Single-field indexes for sorting and filtering
   - Faster stock-based filtering with dedicated index

3. **Removed Redundant Operations**:
   - Stats no longer calculated on every product fetch
   - Removed duplicate stats from `getShopProducts` response

### Frontend

1. **Smart Caching**:

   - Stats: 5-minute cache (changes less frequently)
   - Products: 2-minute cache (changes more frequently)
   - Placeholder data during refetch (smooth UX)

2. **Separate Queries**:

   - Stats fetched independently from products
   - Stats query doesn't re-run on filter changes
   - Automatic refetch on mount

3. **Conditional Invalidation**:
   - Stats refreshed only on product deletion
   - Products query refreshed on all filter changes

## Database Migration Required

After schema changes, run:

```bash
npx prisma generate
npx prisma db push
```

Or for production:

```bash
npx prisma migrate dev --name add_product_indexes
```

## Files Modified

### Backend

1. `/apps/product-service/src/controllers/product.controller.ts`

   - Added `getShopProductStats()` function
   - Updated `getShopProducts()` to support `stockStatus` filter
   - Removed stats calculation from product list endpoint

2. `/apps/product-service/src/routes/product.route.ts`

   - Added route: `GET /get-shop-product-stats`

3. `/prisma/schema.prisma`
   - Added 9 new indexes to `products` model
   - Added 2 indexes to `shops` model
   - Added 2 indexes to `discountCodes` model

### Frontend

1. `/apps/seller-ui/src/app/(routes)/dashboard/all-products/page.tsx`
   - Added `fetchProductStats()` function
   - Added separate stats query with 5-min cache
   - Added `stockStatus` state and filter
   - Made stats cards clickable with `handleStockStatusClick()`
   - Stats cards always visible (removed conditional rendering)
   - Updated clear filters to include `stockStatus`
   - Stats refresh on product deletion

## Usage Example

### For Sellers

1. **View all products**: Click on "Total Products" card (or it's default)
2. **View in-stock products**: Click on "In Stock" card
3. **View low-stock products**: Click on "Low Stock" card (0 < stock < 10)
4. **View out-of-stock products**: Click on "Out of Stock" card (stock = 0)
5. **Clear filter**: Click on the active card again or use "Clear" button

### Stats Card Behavior

- **Always visible**: Even when search returns no results
- **Real counts**: Shows counts from ALL products, not filtered results
- **Visual feedback**: Active card has colored ring border
- **Fast loading**: Cached for 5 minutes, faster count queries

## Benefits

1. ✅ **Better Performance**: Separate optimized endpoint for stats
2. ✅ **Always Visible**: Stats never hidden, always show real data
3. ✅ **Backend Filtering**: All filtering done server-side
4. ✅ **Faster Queries**: Comprehensive database indexes
5. ✅ **Better UX**: Clickable cards with visual feedback
6. ✅ **Smart Caching**: Different cache strategies for stats vs products
7. ✅ **Scalable**: Works efficiently with thousands of products
8. ✅ **Accurate**: Stats always reflect ALL products, not filtered view

## Testing Checklist

- [ ] Stats cards show correct counts
- [ ] Click "In Stock" filters products correctly
- [ ] Click "Low Stock" filters products with stock 1-9
- [ ] Click "Out of Stock" filters products with stock 0
- [ ] Click same card again clears filter
- [ ] Stats remain visible when no search results
- [ ] Stats refresh after product deletion
- [ ] Clear filters button includes stock status
- [ ] Ring border shows on active status
- [ ] Pagination works with stock filters
- [ ] Search + stock filter works together
- [ ] Sort + stock filter works together
