import React from 'react';
import { useCart } from '../contexts/CartContext';
import './CartIcon.css';

const CartIcon: React.FC = () => {
  const { toggleCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <div className="cart-icon-container">
      <button className="cart-icon-btn" onClick={toggleCart}>
        <i className="fas fa-shopping-cart"></i>
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
        )}
      </button>
    </div>
  );
};

export default CartIcon; 