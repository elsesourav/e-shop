import prisma from '@packages/libs/prisma';
import cron from 'node-cron';

/**
 * Cron job to permanently delete soft-deleted products
 * Runs every hour to check and delete products where deletePermanentlyAt <= now
 */
// Run every hour at the start of the hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    console.log(`[${now.toISOString()}] Running product cleanup cron job...`);

    // Find all soft-deleted products that need to be permanently deleted
    const productsToDelete = await prisma.products.findMany({
      where: {
        isDeleted: true,
        deletePermanentlyAt: {
          lte: now, // Less than or equal to current time
        },
      },
      select: {
        id: true,
        title: true,
        deletePermanentlyAt: true,
      },
    });

    if (productsToDelete.length === 0) {
      console.log('[Product Cleanup] No products to delete at this time.');
      return;
    }

    console.log(
      `[Product Cleanup] Found ${productsToDelete.length} products to permanently delete:`,
      productsToDelete.map((p) => ({
        id: p.id,
        title: p.title,
        deleteAt: p.deletePermanentlyAt,
      }))
    );

    // Permanently delete the products
    const deleteResult = await prisma.products.deleteMany({
      where: {
        id: {
          in: productsToDelete.map((p) => p.id),
        },
      },
    });

    console.log(
      `[Product Cleanup] Successfully deleted ${deleteResult.count} products permanently.`
    );
  } catch (error) {
    console.error('[Product Cleanup] Error during cleanup:', error);
  }
});

console.log(
  '[Product Cleanup] Cron job initialized - running every hour at minute 0'
);
