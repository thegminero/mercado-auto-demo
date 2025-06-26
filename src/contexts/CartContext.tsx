import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import insights from 'search-insights';

export interface CartItem {
  objectID: string;
  productID: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  quantity: number;
  queryID?: string;
  searchQuery?: string;
  addedFrom?: 'search' | 'autocomplete' | 'product_detail';
  __autocomplete_indexName?: string;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { objectID: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Load cart from localStorage on initialization
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('automercado_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return {
        items: parsedCart.items || [],
        isOpen: false, // Always start with cart closed
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return initialState;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.objectID === action.payload.objectID);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.objectID === action.payload.objectID
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.objectID !== action.payload),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.objectID !== action.payload.objectID),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.objectID === action.payload.objectID
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }
    
    case 'TOGGLE_CART': {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }
    
    case 'CLOSE_CART': {
      return {
        ...state,
        isOpen: false,
      };
    }
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void;
  removeItem: (objectID: string) => void;
  updateQuantity: (objectID: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('automercado_cart', JSON.stringify({
        items: state.items,
        // Don't save isOpen state as we want it to always start closed
      }));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item as CartItem });
    
    // Send "Added to cart" insights event
    try {
      const eventData = {
        eventName: 'Products Added To Cart',
        eventType: 'conversion',
        eventSubtype: 'addToCart',
        index: item.__autocomplete_indexName || 'auto_productos',
        userToken: 'anonymous-user-1',
        authenticatedUserToken: 'user-1',
        objectIDs: [item.objectID],
        objectData: [{
          discount: item.discount || 0,
          price: item.price,
          quantity: item.quantity,
        }],
        currency: 'USD',
        queryID: item.queryID,
      };
      
      console.log('Sending "Added to cart" insights event:', eventData);
      
      insights('purchasedObjectIDsAfterSearch', eventData as any);
      
      console.log('"Added to cart" insights event sent successfully');
    } catch (error) {
      console.error('Error sending "Added to cart" insights event:', error);
    }
  };

  const removeItem = (objectID: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: objectID });
  };

  const updateQuantity = (objectID: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { objectID, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 