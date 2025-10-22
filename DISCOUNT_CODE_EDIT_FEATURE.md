# Discount Code Management - Edit & Toggle Active Status

## Overview

Enhanced discount code management with the ability to edit existing codes and toggle their active/inactive status after creation.

## Features Added

### 1. Toggle Active/Inactive Status

**Quick toggle button** in the discount codes table to activate or deactivate codes instantly.

- **Orange Power Button (⚡)** - Shown when discount is active
  - Click to deactivate the discount
  - Customers won't be able to use it
- **Green Power Button (⚡)** - Shown when discount is inactive
  - Click to activate the discount
  - Makes it available to customers immediately

**Benefits:**

- No need to delete and recreate inactive codes
- Can temporarily disable codes during promotions
- Easy to reactivate codes for recurring campaigns
- Preserves usage statistics and history

### 2. Edit Discount Codes

**Blue Edit Button (✏️)** in the actions column allows editing existing discount codes.

**Editable Fields:**

- ✅ Title (Public Name)
- ✅ Discount Type (Percentage/Flat)
- ✅ Discount Value
- ✅ Minimum Order Amount
- ✅ Maximum Discount Amount
- ✅ Usage Limit
- ✅ Expiry Date
- ✅ Active Status

**Non-Editable Fields:**

- ❌ Discount Code (locked after creation to prevent issues with orders)

**Features:**

- Pre-filled form with current values
- Shows usage count if code was already used
- Real-time validation
- Success/error notifications

## UI Changes

### Discount Codes Table - Actions Column

Before:

```
| Actions |
|---------|
| [🗑️]   |
```

After:

```
| Actions                    |
|----------------------------|
| [⚡] [✏️] [🗑️]            |
```

### Button Color Coding

- **Orange (⚡)** - Deactivate active discount
- **Green (⚡)** - Activate inactive discount
- **Blue (✏️)** - Edit discount details
- **Red (🗑️)** - Delete discount

### Status Indicators

The status column now shows:

- 🟢 **Active** - Code is working and available
- 🔴 **Inactive** - Code is disabled by seller
- 🟠 **Expired** - Expiry date passed
- 🟡 **Limit Reached** - Usage limit exceeded

## API Endpoints Used

### Toggle Active Status

```typescript
PUT /product/api/update-discount-code/:id
Body: { isActive: true/false }
```

### Update Discount Code

```typescript
PUT /product/api/update-discount-code/:id
Body: {
  discountName: string,
  discountType: 'percentage' | 'flat',
  discountValue: number,
  minAmount: number,
  maxAmount: number,
  usageLimit: number,
  expiresAt: Date,
  isActive: boolean
}
```

## User Workflows

### Workflow 1: Deactivate a Discount

1. Go to Discount Codes page
2. Find the active discount (orange power button)
3. Click the **orange power button (⚡)**
4. Status changes to "Inactive"
5. Success toast: "Discount code deactivated!"
6. Customers can no longer use this code

### Workflow 2: Reactivate a Discount

1. Go to Discount Codes page
2. Find the inactive discount (green power button)
3. Click the **green power button (⚡)**
4. Status changes to "Active"
5. Success toast: "Discount code activated!"
6. Code is immediately available to customers

### Workflow 3: Edit Discount Details

1. Go to Discount Codes page
2. Click the **blue edit button (✏️)**
3. Edit modal opens with pre-filled values
4. Modify any editable fields:
   - Change discount value
   - Update min/max amounts
   - Adjust usage limit
   - Change expiry date
   - Toggle active status
5. Click "Update Discount"
6. Success toast: "Discount code updated successfully!"
7. Table refreshes with new values

### Workflow 4: Activate During Edit

If you created a discount as inactive:

1. Click edit button on the inactive discount
2. Check the "Active" checkbox in the modal
3. Optionally modify other fields
4. Click "Update Discount"
5. Discount is now active!

## Use Cases

### Seasonal Promotions

```
SUMMER20 → Active during summer
         → Deactivate after season ends
         → Reactivate next summer
```

### Flash Sales

```
FLASH50 → Activate at start of flash sale
        → Deactivate when sale ends
        → Edit and reuse for next flash sale
```

### Testing

```
TEST10 → Create as inactive
       → Test checkout flow
       → Activate when ready
```

### Adjusting Limits

```
NEWYEAR → Created with 100 usage limit
        → Edit to increase to 200
        → Without losing 50 existing uses
```

### Expired Codes

```
BLACKFRIDAY → Expired on Dec 1
            → Edit expiry date for next year
            → Reactivate when ready
```

## Code Changes

### File: `/apps/seller-ui/src/app/(routes)/dashboard/discount-codes/page.tsx`

#### Added State

```typescript
const [showEditModal, setShowEditModal] = useState(false);
```

#### Added Mutations

```typescript
// Update discount code (full edit)
const updateDiscountCodeMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    const res = await axiosInstance.put(`/product/api/update-discount-code/${id}`, data);
    return res?.data;
  },
  // ... handlers
});

// Toggle active status (quick action)
const toggleActiveMutation = useMutation({
  mutationFn: async ({ id, isActive }) => {
    const res = await axiosInstance.put(`/product/api/update-discount-code/${id}`, { isActive });
    return res?.data;
  },
  // ... handlers
});
```

#### Added Handlers

```typescript
const handleDiscountEdit = (discount) => {
  // Pre-fill form with discount data
  reset({ ...discount });
  setShowEditModal(true);
};

const handleToggleActive = (id, currentStatus) => {
  // Toggle between active/inactive
  toggleActiveMutation.mutate({ id, isActive: !currentStatus });
};

const onEditSubmit = async (data) => {
  // Submit edited discount
  updateDiscountCodeMutation.mutate({ id: selectedDiscount.id, data });
};
```

#### Updated UI

- Added Power, Edit icons to imports
- Added 3 action buttons in table (Power, Edit, Delete)
- Added Edit Modal with form (similar to Create Modal)
- Disabled discount code field in edit mode
- Shows usage count warning in edit mode

## Backend Support

The backend already has the `updateDiscountCode` function that supports:

- Updating all discount fields
- Partial updates (only send changed fields)
- Ownership validation (seller can only edit their codes)
- Field validation

**File:** `/apps/product-service/src/controllers/product.controller.ts`

```typescript
export const updateDiscountCode = async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Validate ownership
  // Update fields
  // Return updated code
};
```

## Testing Checklist

### Toggle Active Status

- [ ] Click orange button to deactivate active discount
- [ ] Verify status changes to "Inactive"
- [ ] Confirm customers cannot use deactivated code
- [ ] Click green button to reactivate
- [ ] Verify status changes to "Active"
- [ ] Confirm customers can use reactivated code
- [ ] Check success toasts appear

### Edit Discount

- [ ] Click edit button, modal opens
- [ ] Verify all fields pre-filled correctly
- [ ] Verify discount code field is disabled
- [ ] Edit title, save successfully
- [ ] Edit discount value, verify in table
- [ ] Edit min amount, verify validation
- [ ] Edit max amount, verify validation
- [ ] Edit usage limit (higher than current uses)
- [ ] Try to set usage limit below current uses
- [ ] Edit expiry date
- [ ] Toggle active checkbox
- [ ] Cancel edit, verify no changes saved
- [ ] Check usage count warning displays

### Edge Cases

- [ ] Edit discount that's been used (verify usage preserved)
- [ ] Toggle expired discount (should work)
- [ ] Toggle discount at usage limit (should work)
- [ ] Edit inactive discount, make it active
- [ ] Try editing another seller's discount (should fail)
- [ ] Toggle while another mutation is pending
- [ ] Edit with invalid values (negative amounts)
- [ ] Edit with missing required fields

## Benefits

### For Sellers

1. **Flexibility** - Can adjust discounts without recreation
2. **Control** - Enable/disable codes on demand
3. **Efficiency** - No need to delete and recreate
4. **History** - Preserves usage statistics
5. **Testing** - Can create inactive codes for testing
6. **Campaigns** - Easy to manage recurring promotions

### For Customers

1. **Reliability** - Same code works across campaigns
2. **Consistency** - Familiar codes (e.g., SAVE10)
3. **Availability** - Codes can be quickly enabled

### For System

1. **Data Integrity** - No need to delete historical data
2. **Audit Trail** - Track code modifications
3. **Performance** - Update instead of delete+create
4. **Simplicity** - Single endpoint for updates

## Future Enhancements

### 1. Bulk Actions

```typescript
// Toggle multiple codes at once
<Checkbox /> Select all active codes
[Deactivate Selected]
```

### 2. Schedule Activation

```typescript
// Auto-activate on specific date/time
activateAt: '2025-12-01T00:00:00Z';
```

### 3. Usage Analytics

```typescript
// Show usage chart in edit modal
<Chart data={usageHistory} />
```

### 4. Duplicate Code

```typescript
// Create new code based on existing
<button onClick={handleDuplicate}>Duplicate</button>
```

### 5. Version History

```typescript
// Track all edits
history: [{ field: 'value', from: 10, to: 20, date: '...' }];
```

### 6. Smart Suggestions

```typescript
// Suggest optimal values based on usage
'This code has 90% usage. Consider increasing limit.';
```

## Troubleshooting

### Issue: Toggle button not working

**Solution:** Check if `toggleActiveMutation` has errors. Verify backend endpoint is accessible.

### Issue: Edit modal not opening

**Solution:** Ensure discount data is properly passed to `handleDiscountEdit`.

### Issue: Discount code field editable in edit mode

**Solution:** Verify `disabled` attribute on code input. Code should be locked.

### Issue: Changes not reflecting in table

**Solution:** Check if `queryClient.invalidateQueries` is called after mutation success.

### Issue: Cannot edit another seller's discount

**Solution:** This is expected behavior. Backend validates ownership.

## Summary

✅ **Added Toggle Active/Inactive** - Quick power button to enable/disable codes  
✅ **Added Edit Functionality** - Full modal to update discount details  
✅ **Preserved Code Immutability** - Code field locked after creation  
✅ **Added Usage Warnings** - Shows how many times code was used  
✅ **Improved UX** - Color-coded buttons with clear icons  
✅ **Real-time Updates** - Table refreshes after changes

**Status:** ✅ Ready to use  
**Backend Required:** No changes needed (already has update endpoint)  
**Next Steps:** Test the features and provide feedback!
