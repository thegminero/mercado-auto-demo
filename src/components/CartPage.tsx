import React, { useState } from 'react';
import { useCart, CartItem } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import insights from 'search-insights';
import './CartPage.css';

type AlgoliaLanguage = 'es' | 'en' | 'fr' | 'pt';

const algoliaTranslations = {
  es: {
    title: 'Eventos de Compra - Algolia',
    purchaseEventsTitle: 'Eventos de Compra y Conversión',
    revenueTrackingTitle: 'Seguimiento de Ingresos',

    implementationTitle: 'Implementación Técnica',
    // Purchase Events
    purchaseEvent: 'Evento de Compra',
    purchaseEventCode: 'purchasedObjectIDs',
    purchaseTrigger: 'Activador',
    purchaseTriggerText: 'Cuando se completa el checkout/pago',
    purchaseData: 'Datos',
    purchaseDataText: 'objectIDs[], revenue, currency, eventName: "Purchase Completed"',
    purchaseLocation: 'Ubicación',
    purchaseLocationText: 'CartPage.tsx - handleCheckout() función',
    // Revenue Tracking
    revenueCalculation: 'Cálculo de Ingresos',
    revenueCalculationText: 'Suma total de (precio × cantidad) por cada producto',
    currencyFormat: 'Formato de Moneda',
    currencyFormatText: 'USD (Dólares estadounidenses)',
    orderValue: 'Valor del Pedido',
    orderValueText: 'Incluye subtotal, impuestos, envío',

    // Implementation
    insightsLibrary: 'Librería de Insights',
    insightsLibraryText: 'search-insights para envío de eventos',
    eventTiming: 'Momento del Evento',
    eventTimingText: 'Eventos síncronos en tiempo real',
    dataStructure: 'Estructura de Datos',
    dataStructureText: 'objectID, queryID (si aplica), revenue, currency',
    analyticsIntegration: 'Integración de Analytics',
    analyticsIntegrationText: 'Datos enviados a Algolia Analytics Dashboard',
    currentPage: 'Página actual',
    currentPageText: 'Carrito de Compras',
    functionality: 'Funcionalidad',
    functionalityText: 'Eventos de conversión y seguimiento de ingresos',
    // Links
    purchaseDocsLink: 'Ver documentación de eventos de compra',
    revenueDocsLink: 'Ver documentación de seguimiento de ingresos',
    technicalDocsLink: 'Ver documentación técnica completa',
    // Code comments
    revenueCalculationComment: '// Cálculo de ingresos totales'
  },
  en: {
    title: 'Purchase Events - Algolia',
    purchaseEventsTitle: 'Purchase and Conversion Events',
    revenueTrackingTitle: 'Revenue Tracking',

    implementationTitle: 'Technical Implementation',
    // Purchase Events
    purchaseEvent: 'Purchase Event',
    purchaseEventCode: 'purchasedObjectIDs',
    purchaseTrigger: 'Trigger',
    purchaseTriggerText: 'When checkout/payment is completed',
    purchaseData: 'Data',
    purchaseDataText: 'objectIDs[], revenue, currency, eventName: "Purchase Completed"',
    purchaseLocation: 'Location',
    purchaseLocationText: 'CartPage.tsx - handleCheckout() function',
    // Revenue Tracking
    revenueCalculation: 'Revenue Calculation',
    revenueCalculationText: 'Total sum of (price × quantity) for each product',
    currencyFormat: 'Currency Format',
    currencyFormatText: 'USD (US Dollars)',
    orderValue: 'Order Value',
    orderValueText: 'Includes subtotal, taxes, shipping',

    // Implementation
    insightsLibrary: 'Insights Library',
    insightsLibraryText: 'search-insights for event sending',
    eventTiming: 'Event Timing',
    eventTimingText: 'Real-time synchronous events',
    dataStructure: 'Data Structure',
    dataStructureText: 'objectID, queryID (if applicable), revenue, currency',
    analyticsIntegration: 'Analytics Integration',
    analyticsIntegrationText: 'Data sent to Algolia Analytics Dashboard',
    currentPage: 'Current Page',
    currentPageText: 'Shopping Cart',
    functionality: 'Functionality',
    functionalityText: 'Conversion events and revenue tracking',
    // Links
    purchaseDocsLink: 'View purchase events documentation',
    revenueDocsLink: 'View revenue tracking documentation',
    technicalDocsLink: 'View complete technical documentation',
    // Code comments
    revenueCalculationComment: '// Total revenue calculation'
  },
  fr: {
    title: 'Événements d\'Achat - Algolia',
    purchaseEventsTitle: 'Événements d\'Achat et de Conversion',
    revenueTrackingTitle: 'Suivi des Revenus',

    implementationTitle: 'Implémentation Technique',
    // Purchase Events
    purchaseEvent: 'Événement d\'Achat',
    purchaseEventCode: 'purchasedObjectIDs',
    purchaseTrigger: 'Déclencheur',
    purchaseTriggerText: 'Quand le checkout/paiement est complété',
    purchaseData: 'Données',
    purchaseDataText: 'objectIDs[], revenue, currency, eventName: "Purchase Completed"',
    purchaseLocation: 'Emplacement',
    purchaseLocationText: 'CartPage.tsx - fonction handleCheckout()',
    // Revenue Tracking
    revenueCalculation: 'Calcul des Revenus',
    revenueCalculationText: 'Somme totale de (prix × quantité) pour chaque produit',
    currencyFormat: 'Format de Devise',
    currencyFormatText: 'USD (Dollars américains)',
    orderValue: 'Valeur de Commande',
    orderValueText: 'Inclut sous-total, taxes, livraison',

    // Implementation
    insightsLibrary: 'Bibliothèque Insights',
    insightsLibraryText: 'search-insights pour l\'envoi d\'événements',
    eventTiming: 'Timing des Événements',
    eventTimingText: 'Événements synchrones en temps réel',
    dataStructure: 'Structure de Données',
    dataStructureText: 'objectID, queryID (si applicable), revenue, currency',
    analyticsIntegration: 'Intégration Analytics',
    analyticsIntegrationText: 'Données envoyées au Dashboard Algolia Analytics',
    currentPage: 'Page Actuelle',
    currentPageText: 'Panier d\'Achat',
    functionality: 'Fonctionnalité',
    functionalityText: 'Événements de conversion et suivi des revenus',
    // Links
    purchaseDocsLink: 'Voir la documentation des événements d\'achat',
    revenueDocsLink: 'Voir la documentation du suivi des revenus',
    technicalDocsLink: 'Voir la documentation technique complète',
    // Code comments
    revenueCalculationComment: '// Calcul du chiffre d\'affaires total'
  },
  pt: {
    title: 'Eventos de Compra - Algolia',
    purchaseEventsTitle: 'Eventos de Compra e Conversão',
    revenueTrackingTitle: 'Rastreamento de Receita',

    implementationTitle: 'Implementação Técnica',
    // Purchase Events
    purchaseEvent: 'Evento de Compra',
    purchaseEventCode: 'purchasedObjectIDs',
    purchaseTrigger: 'Gatilho',
    purchaseTriggerText: 'Quando checkout/pagamento é completado',
    purchaseData: 'Dados',
    purchaseDataText: 'objectIDs[], revenue, currency, eventName: "Purchase Completed"',
    purchaseLocation: 'Localização',
    purchaseLocationText: 'CartPage.tsx - função handleCheckout()',
    // Revenue Tracking
    revenueCalculation: 'Cálculo de Receita',
    revenueCalculationText: 'Soma total de (preço × quantidade) para cada produto',
    currencyFormat: 'Formato de Moeda',
    currencyFormatText: 'USD (Dólares americanos)',
    orderValue: 'Valor do Pedido',
    orderValueText: 'Inclui subtotal, impostos, envio',

    // Implementation
    insightsLibrary: 'Biblioteca Insights',
    insightsLibraryText: 'search-insights para envio de eventos',
    eventTiming: 'Timing de Eventos',
    eventTimingText: 'Eventos síncronos em tempo real',
    dataStructure: 'Estrutura de Dados',
    dataStructureText: 'objectID, queryID (se aplicável), revenue, currency',
    analyticsIntegration: 'Integração Analytics',
    analyticsIntegrationText: 'Dados enviados para o Dashboard Algolia Analytics',
    currentPage: 'Página Atual',
    currentPageText: 'Carrinho de Compras',
    functionality: 'Funcionalidade',
    functionalityText: 'Eventos de conversão e rastreamento de receita',
    // Links
    purchaseDocsLink: 'Ver documentação de eventos de compra',
    revenueDocsLink: 'Ver documentação de rastreamento de receita',
    technicalDocsLink: 'Ver documentação técnica completa',
    // Code comments
    revenueCalculationComment: '// Cálculo de receita total'
  }
};

const CartPage: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { items: cart } = state;
  const navigate = useNavigate();
  const [showAlgoliaInfo, setShowAlgoliaInfo] = useState(false);
  const [algoliaLang, setAlgoliaLang] = useState<AlgoliaLanguage>('es');

  const handleCheckout = () => {
    // Filter items that have queryID (came from search/autocomplete)
    const searchOriginatedItems = cart.filter(item => item.queryID);
    
    if (searchOriginatedItems.length > 0) {
      try {
        // Send complete purchase event with all required parameters
        insights('purchasedObjectIDsAfterSearch', {
          userToken: 'anonymous-user-1',
          eventName: 'Products Purchased',
          authenticatedUserToken: 'user-1',
          index: 'auto_productos',
          objectIDs: searchOriginatedItems.map(item => item.objectID),
          objectData: searchOriginatedItems.map(item => ({
            price: item.price,
            discount: item.discount || 0,
            quantity: item.quantity,
            queryID: item.queryID
          })),
          value: searchOriginatedItems.reduce((total, item) => total + (item.price * item.quantity), 0),
          currency: 'USD'
        });
        
        console.log('Complete purchase event sent from CartPage:', {
          totalItems: searchOriginatedItems.length,
          totalValue: searchOriginatedItems.reduce((total, item) => total + (item.price * item.quantity), 0),
          objectIDs: searchOriginatedItems.map(item => item.objectID),
          searchOriginatedItems: searchOriginatedItems.map(item => ({
            objectID: item.objectID,
            name: item.name,
            queryID: item.queryID,
            searchQuery: item.searchQuery,
            addedFrom: item.addedFrom,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        });
      } catch (error) {
        console.error('Failed to send purchase event from CartPage:', error);
      }
    }
    
    // TODO: Implement actual checkout functionality
    alert(`Purchase completed!\n\nTotal Items: ${getTotalItems()}\nTotal Value: $${getTotalPrice().toFixed(2)}\nSearch-originated items: ${searchOriginatedItems.length}`);
  };

  const handleContinueShopping = () => {
    // Go back to the previous page in browser history
    navigate(-1);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page-container">
          <div className="cart-page-header">
            <h1>Mi Carrito</h1>
          </div>
          <div className="cart-empty-page">
            <i className="fas fa-shopping-cart"></i>
            <h2>Tu carrito está vacío</h2>
            <p>No tienes productos en tu carrito de compras.</p>
            <button 
              className="btn-continue-shopping"
              onClick={handleContinueShopping}
            >
              <i className="fas fa-arrow-left"></i>
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page-container">
        <div className="cart-page-header">
          <div className="cart-header-left">
            <h1>Mi Carrito ({getTotalItems()} productos)</h1>
          </div>
          <div className="cart-header-actions">
            <button 
              className="algolia-info-btn"
              onClick={() => setShowAlgoliaInfo(true)}
              title="Información sobre eventos de compra de Algolia"
            >
              <svg width="18" height="18" viewBox="0 0 500 500" fill="currentColor">
                <path d="M250 25C127.031 25 25 127.031 25 250s102.031 225 225 225 225-102.031 225-225S372.969 25 250 25zm0 25c110.457 0 200 89.543 200 200s-89.543 200-200 200S50 360.457 50 250 139.543 50 250 50z"/>
                <path d="M250 100c-82.843 0-150 67.157-150 150s67.157 150 150 150 150-67.157 150-150-67.157-150-150-150zm0 25c68.629 0 125 56.371 125 125s-56.371 125-125 125-125-56.371-125-125 56.371-125 125-125z"/>
                <path d="M250 150c-55.228 0-100 44.772-100 100s44.772 100 100 100 100-44.772 100-100-44.772-100-100-100zm0 25c41.421 0 75 33.579 75 75s-33.579 75-75 75-75-33.579-75-75 33.579-75 75-75z"/>
              </svg>
              <span>Algolia</span>
              <i className="fas fa-shopping-cart"></i>
            </button>
            <button 
              className="btn-clear-all"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              <i className="fas fa-trash"></i>
              Vaciar Carrito
            </button>
          </div>
        </div>

        <div className="cart-page-content">
          <div className="cart-items-section">
            <div className="cart-items">
              {cart.map((item: CartItem) => (
                <div key={item.objectID} className="cart-page-item">
                  <div className="cart-page-item-image">
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="cart-page-item-details">
                    <h3 className="cart-page-item-name">{item.name}</h3>
                    <p className="cart-page-item-brand">{item.brand}</p>
                    <p className="cart-page-item-category">{item.category}</p>
                    <div className="cart-page-item-price">
                      ${item.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div className="cart-page-item-quantity">
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

                  <div className="cart-page-item-total">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </div>

                  <div className="cart-page-item-actions">
                    <button
                      className="cart-page-item-remove"
                      onClick={() => removeItem(item.objectID)}
                      title="Eliminar del carrito"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-page-summary">
            <div className="cart-page-summary-content">
              <h3>Resumen del Pedido</h3>
              
              <div className="summary-row">
                <span>Subtotal ({getTotalItems()} productos):</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              
              <div className="summary-row total">
                <span>Total:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="cart-page-actions">
                <button 
                  className="btn-continue-shopping"
                  onClick={handleContinueShopping}
                >
                  <i className="fas fa-arrow-left"></i>
                  Continuar Comprando
                </button>
                <button 
                  className="btn-checkout-page"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <i className="fas fa-credit-card"></i>
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Algolia Info Slider */}
      <div className={`algolia-info-slider ${showAlgoliaInfo ? 'open' : ''}`}>
        <div className="algolia-info-overlay" onClick={() => setShowAlgoliaInfo(false)}></div>
        <div className="algolia-info-content">
          <div className="algolia-info-header">
            <div className="algolia-logo-section">
              <svg width="32" height="32" viewBox="0 0 500 500" fill="#003dff">
                <path d="M250 25C127.031 25 25 127.031 25 250s102.031 225 225 225 225-102.031 225-225S372.969 25 250 25zm0 25c110.457 0 200 89.543 200 200s-89.543 200-200 200S50 360.457 50 250 139.543 50 250 50z"/>
                <path d="M250 100c-82.843 0-150 67.157-150 150s67.157 150 150 150 150-67.157 150-150-67.157-150-150-150zm0 25c68.629 0 125 56.371 125 125s-56.371 125-125 125-125-56.371-125-125 56.371-125 125-125z"/>
                <path d="M250 150c-55.228 0-100 44.772-100 100s44.772 100 100 100 100-44.772 100-100-44.772-100-100-100zm0 25c41.421 0 75 33.579 75 75s-33.579 75-75 75-75-33.579-75-75 33.579-75 75-75z"/>
              </svg>
              <h3>{algoliaTranslations[algoliaLang].title}</h3>
            </div>
            
            <div className="algolia-header-controls">
              <div className="algolia-language-selector">
                <button 
                  className={`lang-btn ${algoliaLang === 'es' ? 'active' : ''}`}
                  onClick={() => setAlgoliaLang('es')}
                >
                  🇪🇸 ES
                </button>
                <button 
                  className={`lang-btn ${algoliaLang === 'en' ? 'active' : ''}`}
                  onClick={() => setAlgoliaLang('en')}
                >
                  🇺🇸 EN
                </button>
                <button 
                  className={`lang-btn ${algoliaLang === 'fr' ? 'active' : ''}`}
                  onClick={() => setAlgoliaLang('fr')}
                >
                  🇫🇷 FR
                </button>
                <button 
                  className={`lang-btn ${algoliaLang === 'pt' ? 'active' : ''}`}
                  onClick={() => setAlgoliaLang('pt')}
                >
                  🇵🇹 PT
                </button>
              </div>
              
              <button 
                className="close-algolia-info"
                onClick={() => setShowAlgoliaInfo(false)}
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="algolia-info-body">
            <div className="algolia-section">
              <h4><i className="fas fa-credit-card"></i> {algoliaTranslations[algoliaLang].purchaseEventsTitle}</h4>
              <div className="event-details">
                <div className="event-item">
                  <h5><i className="fas fa-shopping-bag"></i> {algoliaTranslations[algoliaLang].purchaseEvent}</h5>
                  <p><strong>{algoliaTranslations[algoliaLang].purchaseTrigger}:</strong> {algoliaTranslations[algoliaLang].purchaseTriggerText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].purchaseData}:</strong> {algoliaTranslations[algoliaLang].purchaseDataText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].purchaseLocation}:</strong> {algoliaTranslations[algoliaLang].purchaseLocationText}</p>
                  
                  <h6><i className="fas fa-code"></i> Estructura del Evento JSON (Algolia Insights API)</h6>
                  <div className="code-block">
                    <code>{`// Función para enviar evento de compra usando Algolia Insights API
const sendPurchaseEvent = () => {
        aa('purchasedObjectIDsAfterSearch', {
    eventName: 'Products Purchased',
    eventType: 'conversion',
    eventSubtype: 'purchase',
    index: 'auto_productos',
    userToken: 'anonymous-user-1',
    authenticatedUserToken: 'user-1',
    objectIDs: [${cart.map(item => `'${item.objectID}'`).join(', ')}],
    objectData: [${cart.map(item => `{
      price: ${item.price || 0},
      discount: ${item.discount || 0},
      quantity: ${item.quantity},
      queryID: ${item.queryID ? `'${item.queryID}'` : 'undefined'}
    }`).join(',\n      ')}],
    value: ${getTotalPrice()},
    currency: 'USD'
  });
};`}</code>
                  </div>

                  <h6><i className="fas fa-database"></i> JSON Completo del Evento Actual (Formato Algolia Insights API)</h6>
                  {cart.length > 0 ? (
                    <div className="code-block">
                      <code>{JSON.stringify({
                        events: [
                          {
                            eventName: 'Products Purchased',
                            eventType: 'conversion',
                            eventSubtype: 'purchase',
                            index: 'auto_productos',
                            userToken: 'anonymous-user-1',
                            authenticatedUserToken: 'user-1',
                            objectIDs: cart.map(item => item.objectID),
                            objectData: cart.map(item => ({
                              price: item.price || 0,
                              discount: item.discount || 0,
                              quantity: item.quantity,
                              queryID: item.queryID || undefined
                            })),
                            value: getTotalPrice(),
                            currency: 'USD'
                          }
                        ]
                      }, null, 2)}</code>
                    </div>
                  ) : (
                    <div className="empty-cart-message">
                      <p><i className="fas fa-info-circle"></i> <strong>Carrito vacío:</strong> Agrega productos al carrito para ver el JSON del evento de compra generado dinámicamente.</p>
                    </div>
                  )}

                                    <h6><i className="fas fa-info-circle"></i> Datos Internos vs. Datos Enviados a Algolia</h6>
                  
                  {/* Critical Requirements */}
                  <div className="critical-requirements">
                    <div className="requirement-item critical">
                      <p className="requirement-title critical"><i className="fas fa-exclamation-triangle"></i> <strong>CRÍTICO: Orden de Arrays</strong></p>
                      <p>El orden de <code>objectIDs</code> DEBE coincidir exactamente con el orden de <code>objectData</code>. Cada <code>objectIDs[i]</code> corresponde a <code>objectData[i]</code>.</p>
                      <div className="code-example">
                        <code>{`// ✅ CORRECTO - Orden coincidente
objectIDs: ['prod-1', 'prod-2', 'prod-3']
objectData: [
  { price: 10.99, quantity: 1 }, // prod-1
  { price: 5.50, quantity: 2 },  // prod-2  
  { price: 15.00, quantity: 1 }  // prod-3
]

// ❌ INCORRECTO - Orden no coincidente
objectIDs: ['prod-1', 'prod-2', 'prod-3']
objectData: [
  { price: 15.00, quantity: 1 }, // prod-3 ❌
  { price: 10.99, quantity: 1 }, // prod-1 ❌
  { price: 5.50, quantity: 2 }   // prod-2 ❌
]`}</code>
                      </div>
                    </div>
                    
                    <div className="requirement-item important">
                      <p className="requirement-title important"><i className="fas fa-search"></i> <strong>IMPORTANTE: QueryID Obligatorio</strong></p>
                      <p>Si un producto fue agregado al carrito después de una búsqueda, el <code>queryID</code> es <strong>OBLIGATORIO</strong> en <code>objectData</code> para tracking de conversión.</p>
                      <div className="code-example">
                        <code>{`// ✅ CORRECTO - Con queryID para productos de búsqueda
{
  price: 10.99,
  quantity: 1,
  queryID: "7dfe2ada7bca48bdd0629649df0bee07" // OBLIGATORIO
}

// ❌ INCORRECTO - Sin queryID para producto de búsqueda
{
  price: 10.99,
  quantity: 1
  // queryID faltante ❌
}`}</code>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <p className="data-section-title"><strong>📊 Datos enviados a Algolia:</strong></p>
                    <ul className="sent-data-list">
                      <li><code>objectIDs</code> - IDs de productos comprados</li>
                      <li><code>objectData[].price</code> - Precio de cada producto</li>
                      <li><code>objectData[].quantity</code> - Cantidad de cada producto</li>
                      <li><code>objectData[].discount</code> - Descuento aplicado</li>
                      <li><code>objectData[].queryID</code> - ID de búsqueda (si aplica)</li>
                      <li><code>value</code> - Valor total de la compra</li>
                      <li><code>currency</code> - Moneda de la transacción</li>
                    </ul>
                  </div>

                  <h6><i className="fas fa-chart-line"></i> Detalles del Carrito Actual (Datos Internos)</h6>
                  {cart.length > 0 ? (
                    <div className="product-events-table">
                      <table className="events-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>ObjectID</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                            <th>Origen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr key={item.objectID}>
                              <td className="product-name">{item.name}</td>
                              <td className="object-id"><code>{item.objectID}</code></td>
                              <td className="price">${(item.price || 0).toFixed(2)}</td>
                              <td className="quantity">{item.quantity}</td>
                              <td className="subtotal">${((item.price || 0) * item.quantity).toFixed(2)}</td>
                              <td className="source">
                                <span className={`source-badge ${item.addedFrom || 'unknown'}`}>
                                  {item.addedFrom === 'search' ? '🔍 Búsqueda' : 
                                   item.addedFrom === 'autocomplete' ? '🔎 Autocompletado' : 
                                   item.addedFrom === 'product_detail' ? '📄 Detalle de Producto' : '❓ Desconocido'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="table-note">
                        <p><i className="fas fa-exclamation-triangle"></i> <strong>Nota:</strong> Esta tabla muestra datos internos para referencia. Solo los campos especificados en la sección "Datos que SE ENVÍAN a Algolia" se incluyen en el evento real.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-cart-message">
                      <p><i className="fas fa-shopping-cart"></i> No hay productos en el carrito para mostrar detalles de eventos.</p>
                    </div>
                  )}
                </div>
              </div>
              <a 
                href="https://www.algolia.com/doc/guides/sending-events/implementing-events/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaTranslations[algoliaLang].purchaseDocsLink}
              </a>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-dollar-sign"></i> {algoliaTranslations[algoliaLang].revenueTrackingTitle}</h4>
              <div className="event-details">
                <div className="event-item">
                  <h5><i className="fas fa-calculator"></i> {algoliaTranslations[algoliaLang].revenueCalculation}</h5>
                  <p>{algoliaTranslations[algoliaLang].revenueCalculationText}</p>
                  <div className="code-block">
                    <code>{`${algoliaTranslations[algoliaLang].revenueCalculationComment}
const totalRevenue = cartItems.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);

// Valor actual del carrito: $${getTotalPrice().toFixed(2)}
// Productos en carrito: ${getTotalItems()} items`}</code>
                  </div>
                </div>
                
                <div className="event-item">
                  <h5><i className="fas fa-coins"></i> {algoliaTranslations[algoliaLang].currencyFormat}</h5>
                  <p><strong>Moneda:</strong> {algoliaTranslations[algoliaLang].currencyFormatText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].orderValue}:</strong> {algoliaTranslations[algoliaLang].orderValueText}</p>
                </div>
              </div>
              <a 
                href="https://www.algolia.com/doc/guides/sending-events/getting-started/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaTranslations[algoliaLang].revenueDocsLink}
              </a>
            </div>



            <div className="algolia-section">
              <h4><i className="fas fa-cogs"></i> {algoliaTranslations[algoliaLang].implementationTitle}</h4>
              <ul>
                <li><strong>{algoliaTranslations[algoliaLang].insightsLibrary}:</strong> {algoliaTranslations[algoliaLang].insightsLibraryText}</li>
                <li><strong>{algoliaTranslations[algoliaLang].eventTiming}:</strong> {algoliaTranslations[algoliaLang].eventTimingText}</li>
                <li><strong>{algoliaTranslations[algoliaLang].dataStructure}:</strong> {algoliaTranslations[algoliaLang].dataStructureText}</li>
                <li><strong>{algoliaTranslations[algoliaLang].analyticsIntegration}:</strong> {algoliaTranslations[algoliaLang].analyticsIntegrationText}</li>
                <li><strong>{algoliaTranslations[algoliaLang].currentPage}:</strong> {algoliaTranslations[algoliaLang].currentPageText}</li>
                <li><strong>{algoliaTranslations[algoliaLang].functionality}:</strong> {algoliaTranslations[algoliaLang].functionalityText}</li>
              </ul>
              <a 
                href="https://www.algolia.com/doc/guides/sending-events/getting-started/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaTranslations[algoliaLang].technicalDocsLink}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 