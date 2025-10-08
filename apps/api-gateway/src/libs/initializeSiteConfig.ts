import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.siteConfigs.findFirst();

    if (!existingConfig) {
      await prisma.siteConfigs.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Garden',
            'Sports',
            'Toys',
            'Automotive',
            'Books',
            'Music',
            'Health & Beauty',
            'Groceries',
            'Pet Supplies',
            'Office Supplies',
            'Baby Products',
            'Jewelry & Accessories',
            'Art & Collectibles',
            'Industrial & Scientific',
            'Travel & Luggage',
            'Software & Video Games',
            'Movies & TV Shows',
            'Handmade Goods',
          ],
          subCategories: {
            Electronics: [
              'Mobile Phones',
              'Laptops',
              'Cameras',
              'Televisions',
              'Headphones',
              'Wearable Technology',
            ],
            Fashion: [
              "Men's Clothing",
              "Women's Clothing",
              "Kid's Clothing",
              'Footwear',
              'Accessories',
            ],
            'Home & Garden': [
              'Furniture',
              'Kitchen & Dining',
              'Bedding & Bath',
              'Garden & Outdoor',
              'Home Decor',
            ],
            Sports: [
              'Exercise & Fitness',
              'Outdoor Recreation',
              'Team Sports',
              'Cycling',
              'Water Sports',
            ],
            Toys: [
              'Action Figures',
              'Dolls & Accessories',
              'Puzzles & Games',
              'Educational Toys',
              'Outdoor Play',
            ],
            Automotive: [
              'Car Electronics',
              'Exterior Accessories',
              'Interior Accessories',
              'Replacement Parts',
              'Tools & Equipment',
            ],
            Books: [
              'Fiction',
              'Non-Fiction',
              "Children's Books",
              'Educational Books',
              'Comics & Graphic Novels',
            ],
            Music: [
              'Instruments & Gear',
              'Vinyl Records',
              'CDs & DVDs',
              'Sheet Music',
              'Music Accessories',
            ],
            'Health & Beauty': [
              'Skincare',
              'Haircare',
              'Makeup',
              'Fragrances',
              'Personal Care',
            ],
            Groceries: [
              'Beverages',
              'Snacks',
              'Pantry Staples',
              'Fresh Produce',
              'Frozen Foods',
            ],
            'Pet Supplies': [
              'Dog Supplies',
              'Cat Supplies',
              'Fish & Aquatic Pets',
              'Bird Supplies',
              'Small Animal Supplies',
            ],
            'Office Supplies': [
              'Writing & Correction',
              'Paper Products',
              'Office Electronics',
              'Filing & Organization',
              'School Supplies',
            ],
            'Baby Products': [
              'Diapers & Wipes',
              'Feeding',
              'Nursery Furniture',
              'Strollers & Car Seats',
              'Toys & Activities',
            ],
            'Jewelry & Accessories': [
              'Necklaces & Pendants',
              'Earrings',
              'Bracelets & Bangles',
              'Rings',
              'Watches',
            ],
            'Art & Collectibles': [
              'Paintings & Prints',
              'Sculptures',
              'Photography',
              'Collectible Coins',
              'Memorabilia',
            ],
            'Industrial & Scientific': [
              'Lab & Scientific Products',
              'Test, Measure & Inspect',
              'Janitorial & Sanitation Supplies',
              'Occupational Health & Safety Products',
              'Power & Hand Tools',
            ],
            'Travel & Luggage': [
              'Luggage & Travel Bags',
              'Travel Accessories',
              'Backpacks & Daypacks',
              'Suitcases',
              'Travel Organizers',
            ],
            'Software & Video Games': [
              'PC Software',
              'Mac Software',
              'Video Game Consoles',
              'Video Games',
              'Gaming Accessories',
            ],
            'Movies & TV Shows': [
              'Blu-ray Discs',
              'DVDs',
              '4K Ultra HD',
              'Digital Movies & TV',
              'Movie Merchandise',
            ],
            'Handmade Goods': [
              'Jewelry',
              'Clothing & Accessories',
              'Home Decor',
              'Art & Collectibles',
              'Toys & Games',
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error('Error initializing site config:', error);
  }
};

export default initializeSiteConfig;
