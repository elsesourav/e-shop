import { Prisma } from '@/generated/prisma';
import { NotFoundError, ValidationError } from '@/packages/error-handler';
import redis from '@/packages/libs/redis';
import prisma from '@packages/libs/prisma';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import { sendEmail } from '../utils/send-mail';

type Product = {
  id: string;
  salePrice: number;
  quantity?: number;
  shopId?: string;
  selectedOptions?: any;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string, {
  apiVersion: '2025-09-30.clover',
});

// create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.round(customerAmount * 0.1); // 10% platform fee

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'inr',
      payment_method_types: ['card'],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, couponCode } = req.body;

    if (!req.user || !req.user.id) {
      console.error('Authentication check failed: req.user is missing');
      throw new ValidationError('Authentication failed');
    }
    const userId = req.user.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('Cart is empty or invalid'));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: Product) => ({
          id: item.id,
          quantity: item.quantity,
          salePrice: item.salePrice,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a: Product, b: Product) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys(`payment_session:*`);

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        let session;
        if (typeof data === 'string') {
          try {
            session = JSON.parse(data);
          } catch (error) {
            console.log(`Failed to parse redis key ${key}:`, data);
            continue;
          }
        } else {
          session = data;
        }

        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: Product) => ({
                id: item.id,
                quantity: item.quantity,
                salePrice: item.salePrice,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: Product, b: Product) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).send({
              sessionId: key.split(':')[1],
            });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    // fetch seller and their stripe account ids
    const uniqueShopIds = [
      ...new Set(cart.map((item: Product) => item.shopId)),
    ];

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds as string[] },
      },
      select: {
        id: true,
        sellerId: true,
        seller: {
          select: { stripeId: true },
        },
      },
    });

    const sellerData = shops.map((shop: any) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop.seller?.stripeId,
    }));

    // calculate total amount
    const totalAmount = cart.reduce((acc: number, item: Product) => {
      return acc + item.salePrice * (item.quantity || 1);
    }, 0);

    // create session id
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId: userId,
      cart,
      sellers: sellerData,
      selectedAddressId: selectedAddressId,
      totalAmount,
      couponCode: couponCode,
    };

    const sessionKey = `payment_session:${sessionId}`;

    await redis.setex(
      sessionKey,
      10 * 60, // 10 minutes expiry
      JSON.stringify(sessionData)
    );

    return res.status(201).json({ sessionId });
  } catch (error) {
    console.error('Error in createPaymentSession:', error);
    next(error);
  }
};

// Verify payment session
export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return next(new ValidationError('Session ID is required'));
    }

    // fetch session data from redis
    const sessionKey = `payment_session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) {
      return next(new NotFoundError('Invalid or expired session ID'));
    }

    const session =
      typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;

    return res.status(200).json({ success: true, session });
  } catch (error) {
    return next(error);
  }
};

// Create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'] as string;
    if (!stripeSignature) {
      return next(new ValidationError('Stripe signature is required'));
    }

    const rawBody = (req as any).rawBody;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET! as string
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return next(new ValidationError(`Webhook Error: ${error.message}`));
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      // Check if metadata is present (test webhooks from CLI won't have it)
      if (!sessionId || !userId) {
        return res.status(200).json({
          received: true,
          message: 'Test webhook received but skipped (no metadata)',
        });
      }

      const sessionKey = `payment_session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        return next(new NotFoundError('Payment session not found'));
      }

      const { cart, selectedAddressId, couponCode } =
        typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;

      const user = await prisma.users.findUnique({ where: { id: userId } });
      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      let shippingAddress = {};
      if (selectedAddressId) {
        const address = await prisma.addresses.findUnique({
          where: { id: selectedAddressId },
        });
        if (address) {
          shippingAddress = address;
        }
      }

      const name = user?.name || 'Unnamed User';
      const email = user?.email || 'Unnamed Email';

      const shopGrouped = cart.reduce((acc: any, item: Product) => {
        if (!acc[item?.shopId!]) {
          acc[item?.shopId!] = [];
        }
        acc[item?.shopId!].push(item);
        return acc;
      }, {});

      // Fetch all shops involved in the cart
      const createdShopIds = Object.keys(shopGrouped);
      const shops = await prisma.shops.findMany({
        where: { id: { in: createdShopIds } },
        select: { id: true, sellerId: true, name: true },
      });

      const shopMap = new Map(shops.map((shop) => [shop.id, shop]));

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];
        const shop = shopMap.get(shopId);

        if (!shop) continue;

        let orderTotal = orderItems.reduce((sum: number, item: Product) => {
          return sum + item.salePrice * (item.quantity || 1);
        }, 0);

        // Apply discount if applicable
        if (
          couponCode &&
          couponCode.discountedProductId &&
          orderItems.find(
            (it: Product) => it.id === couponCode.discountedProductId
          )
        ) {
          const discountItem = orderItems.find(
            (it: Product) => it.id === couponCode.discountedProductId
          );

          if (discountItem) {
            const discount =
              couponCode.discountPercentage > 0
                ? (discountItem.salePrice * couponCode.discountPercentage) / 100
                : couponCode.discountAmount;

            orderTotal -= discount;
          }
        }

        // create order
        const order = await prisma.orders.create({
          data: {
            userId,
            shopId,
            totalAmount: orderTotal,
            paymentStatus: 'PAID',
            shippingAddressId: selectedAddressId || null,
            discountCode: couponCode?.code || null,
            discountAmount: couponCode?.discountAmount || null,
            paymentMethod: 'STRIPE',
            shippingAddress,
            items: {
              create: orderItems.map((item: Product) => ({
                productId: item.id,
                quantity: item.quantity || 1,
                price: item.salePrice,
                selectedOptions: item.selectedOptions || {},
              })),
            },
          },
        });

        // Collect actions for user analytics
        const newActions: any[] = [];

        // Update Product Analytics
        for (const item of orderItems) {
          const { id: productId, shopId } = item;

          // update product stock and sold count
          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: item.quantity || 1 },
              soldCount: { increment: item.quantity || 1 },
            },
          });

          // upsert product analytics
          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: item.quantity || 1,
              lastVisitedAt: new Date(),
            },
            update: {
              purchases: { increment: item.quantity || 1 },
              lastVisitedAt: new Date(),
            },
          });

          newActions.push({
            productId,
            shopId,
            action: 'PURCHASE',
            timestamp: new Date(),
          });
        }

        // Update User Analytics once per order
        const existingAnalytics = await prisma.userAnalytics.findUnique({
          where: { userId },
        });

        const currentActions = Array.isArray(existingAnalytics?.actions)
          ? (existingAnalytics?.actions as Prisma.JsonArray)
          : [];

        if (existingAnalytics) {
          await prisma.userAnalytics.update({
            where: { userId },
            data: {
              lastVisited: new Date(),
              actions: [...currentActions, ...newActions] as any,
            },
          });
        } else {
          await prisma.userAnalytics.create({
            data: {
              userId,
              lastVisited: new Date(),
              actions: newActions as any,
            },
          });
        }

        // send email to user
        try {
          await sendEmail(
            email,
            'Your Order has been Placed Successfully!',
            'order-confirmation',
            {
              name,
              orderId: order.id,
              orderDate: new Date().toLocaleDateString(),
              totalAmount: orderTotal.toFixed(2),
              items: orderItems,
              shippingAddress,
              trackingUrl: `https://eshop.com/orders/${order.id}`,
            }
          );
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }

        // create notification for seller
        const firstProduct = orderItems[0];
        const productTitle = firstProduct?.title || 'new item';

        await prisma.notifications.create({
          data: {
            title: `New Order for ${productTitle}`,
            message: `You have a new order (ID: ${order.id}) for your shop "${shop.name}".`,
            creatorId: userId,
            receiverId: shop.sellerId,
            redirectLink: `https://eshop.com/orders/${order.id}`,
            type: 'ORDER_UPDATE',
          },
        });

        // Create notification for admin
        // Note: 'admin' is not a valid ObjectId. This needs to be a real user ID or handled differently.
        /* 
        await prisma.notifications.create({
          data: {
            title: `New Order Placed`,
            message: `A new order (ID: ${order.id}) has been placed in the shop "${shop.name}".`,
            creatorId: userId,
            receiverId: 'admin',
            redirectLink: `https://eshop.com/orders/${order.id}`,
            type: 'ORDER_UPDATE',
          },
        });
        */
      }

      // delete session from redis
      await redis.del(sessionKey);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return next(error);
  }
};

// Verify and process payment (fallback for when webhook doesn't fire)
export const verifyAndProcessPayment = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { payment_intent, sessionId } = req.query;

    if (!payment_intent || !sessionId) {
      return next(
        new ValidationError('Payment intent and session ID are required')
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment_intent as string
    );

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }

    const userId = paymentIntent.metadata.userId;
    const sessionKey = `payment_session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(200).json({
        success: true,
        message: 'Order already processed',
        alreadyProcessed: true,
      });
    }

    const { cart, selectedAddressId, couponCode } =
      typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    let shippingAddress = {};
    if (selectedAddressId) {
      const address = await prisma.addresses.findUnique({
        where: { id: selectedAddressId },
      });
      if (address) {
        shippingAddress = address;
      }
    }

    const name = user?.name || 'Unnamed User';
    const email = user?.email || 'Unnamed Email';

    const shopGrouped = cart.reduce((acc: any, item: Product) => {
      if (!acc[item?.shopId!]) {
        acc[item?.shopId!] = [];
      }
      acc[item?.shopId!].push(item);
      return acc;
    }, {});

    const createdShopIds = Object.keys(shopGrouped);
    const shops = await prisma.shops.findMany({
      where: { id: { in: createdShopIds } },
      select: { id: true, sellerId: true, name: true },
    });

    const shopMap = new Map(shops.map((shop) => [shop.id, shop]));
    const createdOrders = [];

    for (const shopId in shopGrouped) {
      const orderItems = shopGrouped[shopId];
      const shop = shopMap.get(shopId);

      if (!shop) continue;

      let orderTotal = orderItems.reduce((sum: number, item: Product) => {
        return sum + item.salePrice * (item.quantity || 1);
      }, 0);

      if (
        couponCode &&
        couponCode.discountedProductId &&
        orderItems.find(
          (it: Product) => it.id === couponCode.discountedProductId
        )
      ) {
        const discountItem = orderItems.find(
          (it: Product) => it.id === couponCode.discountedProductId
        );

        if (discountItem) {
          const discount =
            couponCode.discountPercentage > 0
              ? (discountItem.salePrice * couponCode.discountPercentage) / 100
              : couponCode.discountAmount;

          orderTotal -= discount;
        }
      }

      const order = await prisma.orders.create({
        data: {
          userId,
          shopId,
          totalAmount: orderTotal,
          paymentStatus: 'PAID',
          shippingAddressId: selectedAddressId || null,
          discountCode: couponCode?.code || null,
          discountAmount: couponCode?.discountAmount || null,
          paymentMethod: 'STRIPE',
          shippingAddress,
          items: {
            create: orderItems.map((item: Product) => ({
              productId: item.id,
              quantity: item.quantity || 1,
              price: item.salePrice,
              selectedOptions: item.selectedOptions || {},
            })),
          },
        },
      });

      createdOrders.push(order.id);

      const newActions: any[] = [];

      for (const item of orderItems) {
        const { id: productId, shopId } = item;

        await prisma.products.update({
          where: { id: productId },
          data: {
            stock: { decrement: item.quantity || 1 },
            soldCount: { increment: item.quantity || 1 },
          },
        });

        await prisma.productAnalytics.upsert({
          where: { productId },
          create: {
            productId,
            shopId,
            purchases: item.quantity || 1,
            lastVisitedAt: new Date(),
          },
          update: {
            purchases: { increment: item.quantity || 1 },
            lastVisitedAt: new Date(),
          },
        });

        newActions.push({
          productId,
          shopId,
          action: 'PURCHASE',
          timestamp: new Date(),
        });
      }

      const existingAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId },
      });

      const currentActions = Array.isArray(existingAnalytics?.actions)
        ? (existingAnalytics?.actions as Prisma.JsonArray)
        : [];

      if (existingAnalytics) {
        await prisma.userAnalytics.update({
          where: { userId },
          data: {
            lastVisited: new Date(),
            actions: [...currentActions, ...newActions] as any,
          },
        });
      } else {
        await prisma.userAnalytics.create({
          data: {
            userId,
            lastVisited: new Date(),
            actions: newActions as any,
          },
        });
      }

      try {
        await sendEmail(
          email,
          'Your Order has been Placed Successfully!',
          'order-confirmation',
          {
            name,
            orderId: order.id,
            orderDate: new Date().toLocaleDateString(),
            totalAmount: orderTotal.toFixed(2),
            items: orderItems,
            shippingAddress,
            trackingUrl: `https://eshop.com/orders/${order.id}`,
          }
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      const firstProduct = orderItems[0];
      const productTitle = firstProduct?.title || 'new item';

      await prisma.notifications.create({
        data: {
          title: `New Order for ${productTitle}`,
          message: `You have a new order (ID: ${order.id}) for your shop "${shop.name}".`,
          creatorId: userId,
          receiverId: shop.sellerId,
          redirectLink: `https://eshop.com/orders/${order.id}`,
          type: 'ORDER_UPDATE',
        },
      });
    }

    await redis.del(sessionKey);

    return res.status(200).json({
      success: true,
      message: 'Order created successfully',
      orders: createdOrders,
    });
  } catch (error) {
    console.error('Error in verifyAndProcessPayment:', error);
    return next(error);
  }
};

// get seller orders
export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: req?.seller?.id },
    });

    // fetch orders for the shop
    const orders = await prisma.orders.findMany({
      where: { shopId: shop?.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(201).json({ orders });
  } catch (error) {
    return next(error);
  }
};

