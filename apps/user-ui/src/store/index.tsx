import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../actions/track-user';
import { LocationType } from '../hooks/useLocationTracking';
import { DeviceInfoType } from '../hooks/useDeviceTracking';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId?: string;
};

type UserActionContext = {
  user: any;
  location: LocationType | any;
  deviceInfo: DeviceInfoType | any;
};

type CartAction = (product: Product, context: UserActionContext) => void;
type WishlistAction = (product: Product, context: UserActionContext) => void;
type RemoveAction = (productId: string, context: UserActionContext) => void;

// Main Store type
type Store = {
  readonly cart: Product[];
  readonly wishlist: Product[];

  addToCart: CartAction;
  removeFromCart: RemoveAction;

  addToWishlist: WishlistAction;
  removeFromWishlist: RemoveAction;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, context) => {
        set((state) => {
          if (state.cart.find((item) => item.id === product.id)) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: (item.quantity || 1) + (product.quantity || 1),
                    }
                  : item
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              { ...product, quantity: product.quantity || 1 },
            ],
          };
        });

        console.log("Added to cart:", context);
        
        // send kafka event for adding to cart
        if (context.user?.id && context.location && context.deviceInfo) {
          sendKafkaEvent({
            action: 'ADD_TO_CART',
            userId: context.user.id,
            productId: product.id,
            shopId: product.shopId,
            deviceInfo: context.deviceInfo,
            location: context.location,
          });
        }
      },

      removeFromCart: (productId, context) => {
        const removeProduct = get().cart.find((item) => item.id === productId);
        
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }));

        console.log("Removed from cart:", context);
        
        // send kafka event for removing from cart
        if (
          context.user?.id &&
          context.location &&
          context.deviceInfo &&
          removeProduct
        ) {
          sendKafkaEvent({
            action: 'REMOVE_FROM_CART',
            userId: context.user.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            deviceInfo: context.deviceInfo,
            location: context.location,
          });
        }
      },

      addToWishlist: (product, context) => {
        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id))
            return state;
          return { wishlist: [...state.wishlist, product] };
        });

        console.log("Added to wishlist:", context);
        // send kafka event for adding to wishlist
        if (context.user?.id && context.location && context.deviceInfo) {
          sendKafkaEvent({
            action: 'ADD_TO_WISHLIST',
            userId: context.user.id,
            productId: product.id,
            shopId: product.shopId,
            deviceInfo: context.deviceInfo,
            location: context.location,
          });
        }
      },

      removeFromWishlist: (productId, context) => {
        const removeProduct = get().wishlist.find(
          (item) => item.id === productId
        );
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== productId),
        }));

        console.log("Removed from wishlist:", context);
        // send kafka event for removing from wishlist
        if (
          context.user?.id &&
          context.location &&
          context.deviceInfo &&
          removeProduct
        ) {
          sendKafkaEvent({
            action: 'REMOVE_FROM_WISHLIST',
            userId: context.user.id,
            productId: removeProduct?.id,
            shopId: removeProduct?.shopId,
            deviceInfo: context.deviceInfo,
            location: context.location,
          });
        }
      },
    }),
    { name: 'store-storage' }
  )
);
