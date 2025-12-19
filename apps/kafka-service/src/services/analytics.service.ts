import { Record } from '@/generated/prisma/runtime/library';
import prisma from '@packages/libs/prisma';

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: { actions: true },
    });

    const add_to_actions = ['ADD_TO_CART', 'ADD_TO_WISHLIST'];
    const remove_from_actions = ['REMOVE_FROM_CART', 'REMOVE_FROM_WISHLIST'];

    const updatedActions: any[] = existingData?.actions || [];

    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action
    );

    // Always store PRODUCT_VIEW for recommendation
    if (event.action === 'PRODUCT_VIEW') {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event.action,
        timestamp: new Date().toISOString(),
      });
    }

    // add ADD_TO_? when triggered
    else if (add_to_actions.includes(event.action) && !actionExists) {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event.action,
        timestamp: new Date().toISOString(),
      });
    }

    // remove ADD_TO_? when REMOVE_FROM_? is triggered
    else if (remove_from_actions.includes(event.action) && actionExists) {
      const actionToRemove =
        event.action === 'REMOVE_FROM_CART' ? 'ADD_TO_CART' : 'ADD_TO_WISHLIST';
      const index = updatedActions.findIndex(
        (entry: any) =>
          entry.productId === event.productId && entry.action === actionToRemove
      );
      if (index > -1) {
        updatedActions.splice(index, 1);
      }
    }

    // keep only the latest 100 actions (for storage efficiency)
    if (updatedActions.length > 100) {
      updatedActions.splice(0, updatedActions.length - 100);
    }

    const extraFields: Record<string, any> = {};

    if (event.location?.country || event.country) {
      extraFields.country = event.location?.country || event.country;
    }

    if (event.location?.city || event.city) {
      extraFields.city = event.location?.city || event.city;
    }

    if (event.deviceInfo || event.device) {
      const deviceData = event.deviceInfo || event.device;
      extraFields.device =
        typeof deviceData === 'object'
          ? `${deviceData.os || ''} ${deviceData.browser || ''}`.trim() ||
            JSON.stringify(deviceData)
          : deviceData;
    }

    // update or create the user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    // Also update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.log('Error in updateUserAnalytics:', error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    // Define update fields dynamically
    const updateFields: Record<string, any> = {};

    if (event.action === 'PRODUCT_VIEW') updateFields.views = { increment: 1 };

    if (event.action === 'ADD_TO_CART')
      updateFields.addedToCarts = { increment: 1 };
    if (event.action === 'ADD_TO_WISHLIST')
      updateFields.addedToWishlists = { increment: 1 };

    if (event.action === 'REMOVE_FROM_CART')
      updateFields.removedFromCarts = { increment: 1 };
    if (event.action === 'REMOVE_FROM_WISHLIST')
      updateFields.removedFromWishlists = { increment: 1 };

    if (event.action === 'PURCHASE') updateFields.purchases = { increment: 1 };

    // update or create the product analytics
    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastVisitedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === 'PRODUCT_VIEW' ? 1 : 0,
        purchases: event.action === 'PURCHASE' ? 1 : 0,
        addedToCarts: event.action === 'ADD_TO_CART' ? 1 : 0,
        addedToWishlists: event.action === 'ADD_TO_WISHLIST' ? 1 : 0,
        removedFromCarts: event.action === 'REMOVE_FROM_CART' ? 1 : 0,
        removedFromWishlists: event.action === 'REMOVE_FROM_WISHLIST' ? 1 : 0,
        lastVisitedAt: new Date(),
      },
    });
  } catch (error) {
    console.log('Error in update Product Analytics:', error);
  }
};
