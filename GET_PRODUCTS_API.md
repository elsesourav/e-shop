# Get Products API Documentation

## Overview

Comprehensive API endpoints to fetch products from the database with advanced filtering, pagination, sorting, and search capabilities.

## API Endpoints

### 1. Get All Products (Public)

**GET** `/product/api/get-all-products`

**Authentication:** Not required (Public endpoint)

**Description:** Fetches all active products with powerful filtering, search, pagination, and sorting options.

#### Query Parameters

| Parameter     | Type    | Default   | Description                                                            |
| ------------- | ------- | --------- | ---------------------------------------------------------------------- |
| `page`        | number  | 1         | Page number for pagination                                             |
| `limit`       | number  | 20        | Number of products per page                                            |
| `category`    | string  | -         | Filter by category (e.g., "Electronics")                               |
| `subCategory` | string  | -         | Filter by subcategory (e.g., "Mobile Phones")                          |
| `search`      | string  | -         | Search in title, description, or tags                                  |
| `minPrice`    | number  | -         | Minimum sale price                                                     |
| `maxPrice`    | number  | -         | Maximum sale price                                                     |
| `sortBy`      | string  | createdAt | Sort field: createdAt, salePrice, ratings, viewCount, soldCount, title |
| `order`       | string  | desc      | Sort order: asc or desc                                                |
| `ratings`     | number  | -         | Minimum rating (0-5)                                                   |
| `brand`       | string  | -         | Filter by brand name                                                   |
| `colors`      | string  | -         | Comma-separated colors (e.g., "#FF0000,#0000FF")                       |
| `sizes`       | string  | -         | Comma-separated sizes (e.g., "S,M,L")                                  |
| `shopId`      | string  | -         | Filter by shop ID                                                      |
| `tags`        | string  | -         | Comma-separated tags (e.g., "smartphone,5g")                           |
| `cod`         | boolean | -         | Cash on Delivery available (true/false)                                |
| `inStock`     | boolean | -         | Only in-stock products (true)                                          |

#### Example Requests

**Basic request:**

```
GET /product/api/get-all-products
```

**With pagination:**

```
GET /product/api/get-all-products?page=2&limit=10
```

**Search products:**

```
GET /product/api/get-all-products?search=samsung
```

**Filter by category:**

```
GET /product/api/get-all-products?category=Electronics&subCategory=Mobile Phones
```

**Filter by price range:**

```
GET /product/api/get-all-products?minPrice=500&maxPrice=1000
```

**Filter by ratings:**

```
GET /product/api/get-all-products?ratings=4
```

**Filter by multiple criteria:**

```
GET /product/api/get-all-products?category=Electronics&minPrice=500&maxPrice=2000&ratings=4&sortBy=salePrice&order=asc
```

**Filter by colors and sizes:**

```
GET /product/api/get-all-products?colors=#FF0000,#0000FF&sizes=S,M,L
```

**Filter by brand:**

```
GET /product/api/get-all-products?brand=Samsung
```

**Filter by shop:**

```
GET /product/api/get-all-products?shopId=507f1f77bcf86cd799439011
```

**Filter by tags:**

```
GET /product/api/get-all-products?tags=smartphone,5g
```

**Only in-stock products with COD:**

```
GET /product/api/get-all-products?inStock=true&cod=true
```

**Sort by price (low to high):**

```
GET /product/api/get-all-products?sortBy=salePrice&order=asc
```

**Sort by popularity:**

```
GET /product/api/get-all-products?sortBy=viewCount&order=desc
```

**Sort by best selling:**

```
GET /product/api/get-all-products?sortBy=soldCount&order=desc
```

#### Response

```json
{
  "success": true,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "status": "ACTIVE",
      "title": "Samsung Galaxy S24",
      "slug": "samsung-galaxy-s24",
      "category": "Electronics",
      "subCategory": "Mobile Phones",
      "description": "Latest Samsung flagship phone",
      "detailDescription": "<p>Full HTML description...</p>",
      "stock": 50,
      "salePrice": 799.99,
      "regularPrice": 999.99,
      "ratings": 4.5,
      "discountCodes": ["discount-code-id-1"],
      "tags": ["smartphone", "5g", "android"],
      "colors": ["#000000", "#FFFFFF"],
      "sizes": [],
      "cod": true,
      "brand": "Samsung",
      "warranty": "1 year",
      "videoUrl": "https://youtube.com/...",
      "customSpecifications": {
        "RAM": "8GB",
        "Storage": "256GB"
      },
      "customProperties": {
        "Material": "Glass",
        "Weight": "168g"
      },
      "isDeleted": false,
      "viewCount": 1250,
      "soldCount": 89,
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2025-10-24T15:30:00.000Z",
      "shopId": "507f1f77bcf86cd799439022",
      "images": [
        {
          "id": "image-id-1",
          "url": "https://ik.imagekit.io/...",
          "fileId": "file-id-1"
        }
      ],
      "shop": {
        "id": "507f1f77bcf86cd799439022",
        "name": "Tech Store",
        "ratings": 4.7,
        "category": "Electronics"
      },
      "reviews": [
        {
          "id": "review-id-1",
          "rating": 5,
          "review": "Excellent product!",
          "userId": "user-id-1",
          "createdAt": "2025-10-23T12:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 95,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Product by ID or Slug

**GET** `/product/api/get-product/:identifier`

**Authentication:** Not required (Public endpoint)

**Description:** Fetches a single product by its ID or slug. Automatically increments view count.

#### URL Parameters

| Parameter    | Type   | Description        |
| ------------ | ------ | ------------------ |
| `identifier` | string | Product ID or slug |

#### Example Requests

**By ID:**

```
GET /product/api/get-product/507f1f77bcf86cd799439011
```

**By Slug:**

```
GET /product/api/get-product/samsung-galaxy-s24
```

#### Response

```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Samsung Galaxy S24",
    "slug": "samsung-galaxy-s24",
    "status": "ACTIVE",
    "category": "Electronics",
    "subCategory": "Mobile Phones",
    "description": "Latest Samsung flagship phone",
    "detailDescription": "<p>Full HTML description...</p>",
    "stock": 50,
    "salePrice": 799.99,
    "regularPrice": 999.99,
    "ratings": 4.5,
    "tags": ["smartphone", "5g", "android"],
    "colors": ["#000000", "#FFFFFF"],
    "sizes": [],
    "cod": true,
    "brand": "Samsung",
    "warranty": "1 year",
    "videoUrl": "https://youtube.com/...",
    "customSpecifications": {
      "RAM": "8GB",
      "Storage": "256GB"
    },
    "customProperties": {
      "Material": "Glass",
      "Weight": "168g"
    },
    "viewCount": 1251,
    "soldCount": 89,
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-24T15:30:00.000Z",
    "images": [
      {
        "id": "image-id-1",
        "fileId": "file-id-1",
        "url": "https://ik.imagekit.io/...",
        "productId": "507f1f77bcf86cd799439011",
        "createdAt": "2025-10-20T10:00:00.000Z",
        "updatedAt": "2025-10-20T10:00:00.000Z"
      }
    ],
    "shop": {
      "id": "507f1f77bcf86cd799439022",
      "name": "Tech Store",
      "description": "Leading electronics store",
      "category": "Electronics",
      "ratings": 4.7,
      "address": "123 Main St, City",
      "website": "https://techstore.com",
      "avatar": [],
      "seller": {
        "id": "seller-id-1",
        "name": "John Doe",
        "email": "john@techstore.com"
      }
    },
    "reviews": [
      {
        "id": "review-id-1",
        "rating": 5,
        "review": "Excellent product!",
        "userId": "user-id-1",
        "productId": "507f1f77bcf86cd799439011",
        "createdAt": "2025-10-23T12:00:00.000Z",
        "user": {
          "id": "user-id-1",
          "name": "Jane Smith",
          "avatar": []
        }
      }
    ]
  }
}
```

---

### 3. Get Related Products

**GET** `/product/api/get-related-products/:productId`

**Authentication:** Not required (Public endpoint)

**Description:** Fetches products related to a specific product based on category, subcategory, and tags.

#### URL Parameters

| Parameter   | Type   | Description                             |
| ----------- | ------ | --------------------------------------- |
| `productId` | string | Product ID to find related products for |

#### Query Parameters

| Parameter | Type   | Default | Description                          |
| --------- | ------ | ------- | ------------------------------------ |
| `limit`   | number | 8       | Number of related products to return |

#### Example Requests

```
GET /product/api/get-related-products/507f1f77bcf86cd799439011
```

```
GET /product/api/get-related-products/507f1f77bcf86cd799439011?limit=4
```

#### Response

```json
{
  "success": true,
  "products": [
    {
      "id": "related-product-id-1",
      "title": "Samsung Galaxy S23",
      "slug": "samsung-galaxy-s23",
      "status": "ACTIVE",
      "category": "Electronics",
      "subCategory": "Mobile Phones",
      "description": "Previous generation flagship",
      "stock": 30,
      "salePrice": 699.99,
      "regularPrice": 899.99,
      "ratings": 4.6,
      "tags": ["smartphone", "5g", "android"],
      "colors": ["#000000", "#FFFFFF"],
      "cod": true,
      "brand": "Samsung",
      "viewCount": 980,
      "soldCount": 125,
      "images": [
        {
          "id": "image-id-2",
          "url": "https://ik.imagekit.io/...",
          "fileId": "file-id-2"
        }
      ],
      "shop": {
        "id": "507f1f77bcf86cd799439022",
        "name": "Tech Store",
        "ratings": 4.7
      }
    }
  ],
  "count": 8
}
```

---

## Schema-Based Features

### Product Status Filtering

Only **ACTIVE** products are returned in public endpoints. The schema supports these statuses:

- `ACTIVE` - Visible to customers ✅
- `PENDING` - Awaiting approval ❌
- `DRAFT` - Not published ❌
- `OUT_OF_STOCK` - No stock ❌

### Deleted Products

Products with `isDeleted: true` are automatically excluded from all public queries.

### Data Included

#### Images

- Fetches all product images with ImageKit URLs
- Includes `fileId` for image management

#### Shop Information

- Shop name, ratings, category
- Seller details (on single product view)
- Shop avatar

#### Reviews

- Latest 5 reviews on list view
- All reviews on single product view
- Includes user information (name, avatar)

#### Custom Fields

- `customSpecifications` - Technical specs (RAM, Storage, etc.)
- `customProperties` - Physical properties (Material, Weight, etc.)

### Automatic Features

#### View Count Tracking

The `getProductById` endpoint automatically increments `viewCount` each time a product is viewed.

#### Ratings

Products store average ratings calculated from reviews.

#### Stock Management

Filter by `inStock=true` to show only products with `stock > 0`.

---

## Use Cases

### 1. Product Listing Page

```javascript
// Fetch first page of products
const response = await fetch('/product/api/get-all-products?page=1&limit=20');
```

### 2. Search Functionality

```javascript
// Search for "samsung"
const response = await fetch('/product/api/get-all-products?search=samsung');
```

### 3. Category Page

```javascript
// Show all Electronics > Mobile Phones
const response = await fetch('/product/api/get-all-products?category=Electronics&subCategory=Mobile Phones');
```

### 4. Price Range Filter

```javascript
// Products between $500-$1000
const response = await fetch('/product/api/get-all-products?minPrice=500&maxPrice=1000');
```

### 5. Product Detail Page

```javascript
// Get product by slug
const response = await fetch('/product/api/get-product/samsung-galaxy-s24');
```

### 6. Related Products Section

```javascript
// Get related products
const response = await fetch('/product/api/get-related-products/507f1f77bcf86cd799439011?limit=4');
```

### 7. Best Selling Products

```javascript
// Sort by sold count
const response = await fetch('/product/api/get-all-products?sortBy=soldCount&order=desc&limit=10');
```

### 8. New Arrivals

```javascript
// Sort by creation date
const response = await fetch('/product/api/get-all-products?sortBy=createdAt&order=desc&limit=10');
```

### 9. Top Rated Products

```javascript
// Sort by ratings
const response = await fetch('/product/api/get-all-products?sortBy=ratings&order=desc&limit=10');
```

### 10. Shop Products

```javascript
// All products from a specific shop
const response = await fetch('/product/api/get-all-products?shopId=507f1f77bcf86cd799439022');
```

---

## Frontend Integration Examples

### React with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';

// Get all products
const useProducts = (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await fetch(`/product/api/get-all-products?${queryString}`);
      return res.json();
    },
  });
};

// Usage
const { data, isLoading, error } = useProducts({
  page: 1,
  limit: 20,
  category: 'Electronics',
  minPrice: 500,
  maxPrice: 1000,
});
```

### Get Single Product

```typescript
const useProduct = (identifier: string) => {
  return useQuery({
    queryKey: ['product', identifier],
    queryFn: async () => {
      const res = await fetch(`/product/api/get-product/${identifier}`);
      return res.json();
    },
  });
};

// Usage
const { data: product } = useProduct('samsung-galaxy-s24');
```

### Get Related Products

```typescript
const useRelatedProducts = (productId: string, limit = 8) => {
  return useQuery({
    queryKey: ['related-products', productId, limit],
    queryFn: async () => {
      const res = await fetch(`/product/api/get-related-products/${productId}?limit=${limit}`);
      return res.json();
    },
  });
};
```

---

## Performance Optimizations

### Database Indexes

The schema includes indexes on frequently queried fields:

- `shopId` - Filter by shop
- `category` - Filter by category
- `subCategory` - Filter by subcategory
- `status` - Filter by status
- `ratings` - Sort/filter by ratings
- `salePrice` - Sort/filter by price
- `createdAt` - Sort by date
- `isDeleted` - Exclude deleted products

### Pagination

Always use pagination to avoid loading too many products at once. Default limit is 20 products per page.

### Selective Field Loading

On list view, only 5 latest reviews are included to reduce payload size.

### Non-Blocking Operations

View count increment runs asynchronously and doesn't block the response.

---

## Error Handling

### Product Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Invalid Parameters

```json
{
  "success": false,
  "message": "Invalid price range"
}
```

---

## Testing Checklist

### Get All Products

- [ ] Fetch without filters (default pagination)
- [ ] Test pagination (page 1, 2, 3)
- [ ] Search by keyword
- [ ] Filter by category
- [ ] Filter by subcategory
- [ ] Filter by price range
- [ ] Filter by ratings
- [ ] Filter by brand
- [ ] Filter by colors
- [ ] Filter by sizes
- [ ] Filter by shop
- [ ] Filter by tags
- [ ] Filter by COD availability
- [ ] Filter by in-stock status
- [ ] Sort by price (asc/desc)
- [ ] Sort by ratings
- [ ] Sort by view count
- [ ] Sort by sold count
- [ ] Combine multiple filters
- [ ] Verify only ACTIVE products returned
- [ ] Verify deleted products excluded

### Get Product by ID/Slug

- [ ] Fetch by valid ID
- [ ] Fetch by valid slug
- [ ] Fetch non-existent product (404)
- [ ] Verify view count increments
- [ ] Verify all relations loaded (shop, images, reviews)
- [ ] Verify deleted products return 404

### Get Related Products

- [ ] Fetch for valid product
- [ ] Verify limit parameter works
- [ ] Verify current product excluded
- [ ] Verify only ACTIVE products returned
- [ ] Verify products match by category/tags

---

## Summary

✅ **3 New Endpoints Added:**

1. `GET /product/api/get-all-products` - Comprehensive product listing with 18+ filters
2. `GET /product/api/get-product/:identifier` - Single product by ID or slug
3. `GET /product/api/get-related-products/:productId` - Related products

✅ **Features:**

- Advanced filtering (category, price, ratings, colors, sizes, etc.)
- Full-text search (title, description, tags)
- Pagination with metadata
- Multiple sorting options
- Related products by category/tags
- Automatic view count tracking
- Performance-optimized with indexes

✅ **Schema Compliance:**

- Respects `productStatus` enum
- Excludes deleted products
- Includes all relations (images, shop, reviews)
- Supports custom specifications/properties

**Status:** ✅ Ready to use!
