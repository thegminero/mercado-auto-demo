import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import insights from 'search-insights';
import './CartModal.css';

const CartModal: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart, closeCart, getTotalItems, getTotalPrice } = useCart();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleCheckout = () => {
    // Send purchase events for each item with attribution data
    state.items.forEach((item) => {
      if (item.queryID) {
        try {
          insights('purchasedObjectIDsAfterSearch', {
            eventName: 'Purchase',
            index: 'auto_productos',
            objectIDs: [item.objectID],
            userToken: 'anonymous',
          });
          
          console.log('Purchase event sent:', {
            eventName: 'Purchase',
            objectID: item.objectID,
            queryID: item.queryID,
            searchQuery: item.searchQuery,
            addedFrom: item.addedFrom,
            quantity: item.quantity,
            totalValue: item.price * item.quantity
          });
        } catch (error) {
          console.warn('Failed to send purchase event:', error);
        }
      }
    });
    
    // TODO: Implement checkout functionality
    console.log('Proceeding to checkout with items:', state.items);
    alert('Checkout functionality will be implemented here');
  };

  const handleQuantityChange = (objectID: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(objectID, newQuantity);
    }
  };

  const getAttributionText = (item: any) => {
    if (item.queryID) {
      const sourceText = item.addedFrom === 'search' ? 'Search Results' : 
                        item.addedFrom === 'autocomplete' ? 'Search Suggestions' : 
                        'Product Detail';
      
      return `Source: ${sourceText}
Query ID: ${item.queryID}
${item.searchQuery ? `Search Query: "${item.searchQuery}"` : 'No search query'}`;
    }
    return 'No attribution data available for this item.';
  };

  if (!state.isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={closeCart}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button className="cart-close-btn" onClick={closeCart}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cart-content">
          {state.items.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-cart"></i>
              <p>Tu carrito está vacío</p>
              <span>Agrega productos para comenzar</span>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {state.items.slice(0, 4).map((item) => (
                  <div key={item.objectID} className="cart-item">
                    <div className="cart-item-image">
                      <img 
                        src={item.image || '/placeholder-product.jpg'} 
                        alt={item.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-brand">{item.brand}</p>
                      <p className="cart-item-category">{item.category}</p>
                      <div className="cart-item-price">
                        ${item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>

                    <div className="cart-item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.objectID, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.objectID, item.quantity + 1)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>

                    <div className="cart-item-total">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </div>

                    <div className="cart-item-actions">
                      <div className="tooltip-container">
                        <button
                          className="cart-item-info"
                          onMouseEnter={() => {
                            console.log('Mouse enter on info button for:', item.objectID);
                            setActiveTooltip(item.objectID);
                          }}
                          onMouseLeave={() => {
                            console.log('Mouse leave on info button for:', item.objectID);
                            setActiveTooltip(null);
                          }}
                          title="Ver información de atribución"
                        >
                          <i className="fas fa-info-circle"></i>
                        </button>
                        {activeTooltip === item.objectID && (
                          <div className="tooltip">
                            <pre>{getAttributionText(item)}</pre>
                          </div>
                        )}
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeItem(item.objectID)}
                        title="Eliminar del carrito"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {state.items.length > 4 && (
                <div className="cart-more-items">
                  <div className="more-items-indicator">
                    <i className="fas fa-ellipsis-h"></i>
                    <span>Y {state.items.length - 4} producto{state.items.length - 4 !== 1 ? 's' : ''} más</span>
                  </div>
                  <a href="/cart" className="btn-view-all-items">
                    <i className="fas fa-external-link-alt"></i>
                    Ver todos los productos
                  </a>
                </div>
              )}
              
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Total ({getTotalItems()} items):</span>
                  <span className="cart-total-price">${getTotalPrice().toFixed(2)}</span>
                </div>
              
                <div className="cart-actions">
                  <button 
                    className="btn-clear-cart"
                    onClick={clearCart}
                    disabled={state.items.length === 0}
                  >
                    <i className="fas fa-trash"></i>
                    Vaciar Carrito
                  </button>
                  <a href="/cart" className="btn-view-cart">
                    <i className="fas fa-shopping-cart"></i>
                    Ver Carrito
                  </a>
                  <button 
                    className="btn-checkout"
                    onClick={handleCheckout}
                    disabled={state.items.length === 0}
                  >
                    <i className="fas fa-credit-card"></i>
                    Proceder al Pago
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal; 