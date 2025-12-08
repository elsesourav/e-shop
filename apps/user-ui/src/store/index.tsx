import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  location: string;
  deviceInfo: string;
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
      },

      removeFromCart: (productId, context) => {
        const removeProduct = get().cart.filter(
          (item) => item.id !== productId
        );
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }));
      },

      addToWishlist: (product, context) => {
        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id))
            return state;
          return { wishlist: [...state.wishlist, product] };
        });
      },

      removeFromWishlist: (productId, context) => {
        const removeProduct = get().wishlist.filter(
          (item) => item.id !== productId
        );
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== productId),
        }));
      },
    }),
    { name: 'store-storage' }
  )
);
