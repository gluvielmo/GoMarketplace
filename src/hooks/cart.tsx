import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:storagedProducts',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
        // await AsyncStorage.clear();
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const isProductAlreadyInStorage = products.filter(
        stateProduct => stateProduct.id === product.id,
      );

      if (isProductAlreadyInStorage.length > 0) {
        products.forEach(el => {
          if (el.id === product.id) {
            // eslint-disable-next-line no-param-reassign
            el.quantity += 1;
          }
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:storagedProducts',
          JSON.stringify([...products]),
        );

        setProducts([...products]);
      } else {
        // eslint-disable-next-line no-param-reassign
        product.quantity = 1;

        await AsyncStorage.setItem(
          '@GoMarketplace:storagedProducts',
          JSON.stringify([...products, product]),
        );

        setProducts([...products, product]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      products.forEach(el => {
        if (el.id === id) {
          // eslint-disable-next-line no-param-reassign
          el.quantity += 1;
        }
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:storagedProducts',
        JSON.stringify([...products]),
      );

      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      products.forEach(el => {
        if (el.id === id) {
          // eslint-disable-next-line no-param-reassign
          el.quantity -= 1;
        }
      });

      const newProducts = products.filter(el => el.quantity > 0);

      await AsyncStorage.setItem(
        '@GoMarketplace:storagedProducts',
        JSON.stringify([...newProducts]),
      );

      setProducts([...newProducts]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
