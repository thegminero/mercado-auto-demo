import React, { useState, useEffect } from 'react';
import {
  Hits,
  Pagination,
  RefinementList,
  HierarchicalMenu,
  Stats,
  SearchBox,
  useInstantSearch
} from 'react-instantsearch';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import insights from 'search-insights';
import { createProductSlug } from '../utils/productUtils';
import './SearchPage.css';

interface StoreDetail {
  hasInvontory: number;
  isConsignmentProduct: boolean;
  uomPrice: string;
  basePrice: number;
  commercialMargin: number;
  beginDateDiscount: string;
  beginDateDiscountUnix: number;
  endDateDiscount: string;
  endDateDiscountUnix: number;
  startDateRoyalty: number;
  endDateRoyalty: number;
  productDiscount: number;
  storeid: string;
  productDiscountPercentage: number;
  productAvailable: boolean;
  amount: number;
  havedDiscount: boolean;
  percentDiscount: number;
  isBogo: boolean;
  bogoDiscAmount: number;
  bogoDiscPercent: number;
  bogoFromDate: string;
  bogoFromDateUnix: number;
  bogoToDate: string;
  bogoToDateUnix: number;
  bogoItem2: boolean;
  bogoSalesPrice: number;
  bogoSameItem: boolean;
  isMixMatch: boolean;
  quantityOffert: number;
  totalDiscountOfferAmount: number;
  isAutovolumen: boolean;
  hall: string;
}

interface Product {
  objectID: string;
  productID: string;
  productNumber: string;
  ecomDescription: string;
  marca: string;
  catecom: string;
  parentProductid: string;
  parentProductid2: string;
  productPresentation: string;
  descriptiveParagraph: string;
  imageUrl: string;
  productAvailable: boolean;
  isNewProduct: boolean;
  isDoublePoint: boolean;
  isCollectable: boolean;
  isRaffle: boolean;
  isProgramedDelivery: boolean;
  availableExpress: boolean;
  originatingCountry: string;
  storeDetail: Record<string, StoreDetail>;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
  unitPrice?: string;
}

// Custom Hierarchical Menu Component with proper text formatting
const CustomHierarchicalMenu: React.FC<{ attributes: string[] }> = ({ attributes }) => {
  return (
    <HierarchicalMenu
      attributes={attributes}
      limit={10}
      showMore={true}
      transformItems={(items: any[]) =>
        items.map((item: any) => ({
          ...item,
          label: item.label
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        }))
      }
      classNames={{
        root: 'hierarchical-menu',
        list: 'hierarchical-menu-list',
        item: 'hierarchical-menu-item',
        link: 'hierarchical-menu-link',
        count: 'hierarchical-menu-count',
        showMore: 'hierarchical-menu-show-more'
      }}
    />
  );
};

type AlgoliaLanguage = 'es' | 'en' | 'fr' | 'pt';

const algoliaTranslations = {
  es: {
    title: 'Implementación de Búsqueda - Algolia',
    insightsTitle: 'Eventos de Búsqueda - Seguimiento',
    searchResultsView: 'Vista de Resultados de Búsqueda',
    productClick: 'Clics en Productos',
    addToCart: 'Agregar al Carrito',
    filterClick: 'Filtros de Búsqueda',
    searchImplTitle: 'Implementación InstantSearch',
    techConfigTitle: 'Configuración de Búsqueda',
    // Event details
    viewEvent: 'Evento',
    viewTrigger: 'Activador',
    viewData: 'Datos',
    viewLocation: 'Ubicación',
    // Search Results View
    viewEventCode: 'viewedObjectIDs',
    viewTriggerText: 'Cuando se muestran resultados de búsqueda',
    viewDataText: 'objectIDs[], queryID, eventName: "Hits Viewed"',
    viewLocationText: 'SearchPage.tsx - componente Hit',
    // Product Click
    clickEventCode: 'clickedObjectIDsAfterSearch',
    clickTriggerText: 'Cuando el usuario hace clic en un producto',
    clickDataText: 'objectID, queryID, eventName: "Hit Clicked"',
    clickLocationText: 'SearchPage.tsx - handleProductClick()',
    // Add to Cart
    addToCartEventCode: 'addedToCartObjectIDsAfterSearch',
    addToCartTriggerText: 'Cuando se agrega un producto al carrito desde búsqueda',
    addToCartDataText: 'objectID, queryID, eventName: "Added to Cart After Search"',
    addToCartLocationText: 'SearchPage.tsx - handleAddToCart()',
    // Filter Click
    filterEventCode: 'clickedFilters',
    filterTriggerText: 'Cuando se aplican filtros de categoría/marca',
    filterDataText: 'filterName, filterValue, eventName: "Filter Applied"',
    filterLocationText: 'HierarchicalMenu, RefinementList componentes',
    // Implementation
    instantSearchSetup: 'Configuración InstantSearch',
    wrapperText: 'Envoltorio: Nivel App.tsx con initialUiState',
    stateManagement: 'Gestión de Estado: parámetros URL → estado InstantSearch',
    keyProp: 'Prop Key: Fuerza re-montaje cuando cambia URL',

    // State Sync
    stateSyncTitle: 'Sincronización de Estado',
    navbarSearch: 'Búsqueda Navbar: setIndexUiState() para estado global',
    urlUpdates: 'Actualizaciones URL: navegación React Router',
    queryStorage: 'Almacenamiento Query: localStorage para acceso entre componentes',
    // Tech Config
    indexName: 'Índice',
    appId: 'ID de App',
    searchClient: 'Cliente de Búsqueda',
    uiLibrary: 'Librería UI',
    insights: 'Insights',
    searchableAttrs: 'Atributos Buscables',
    facetAttrs: 'Atributos de Facetas',
    docsLink: 'Documentación InstantSearch React'
  },
  en: {
    title: 'Search Implementation - Algolia',
    insightsTitle: 'Search Events - Tracking',
    searchResultsView: 'Search Results View',
    productClick: 'Product Clicks',
    addToCart: 'Add to Cart',
    filterClick: 'Search Filters',
    searchImplTitle: 'InstantSearch Implementation',
    techConfigTitle: 'Search Configuration',
    // Event details
    viewEvent: 'Event',
    viewTrigger: 'Trigger',
    viewData: 'Data',
    viewLocation: 'Location',
    // Search Results View
    viewEventCode: 'viewedObjectIDs',
    viewTriggerText: 'When search results are displayed',
    viewDataText: 'objectIDs[], queryID, eventName: "Hits Viewed"',
    viewLocationText: 'SearchPage.tsx - Hit component',
    // Product Click
    clickEventCode: 'clickedObjectIDsAfterSearch',
    clickTriggerText: 'When user clicks on a product',
    clickDataText: 'objectID, queryID, eventName: "Hit Clicked"',
    clickLocationText: 'SearchPage.tsx - handleProductClick()',
    // Add to Cart
    addToCartEventCode: 'addedToCartObjectIDsAfterSearch',
    addToCartTriggerText: 'When user adds product to cart from search results',
    addToCartDataText: 'objectID, queryID, eventName: "Added to Cart After Search"',
    addToCartLocationText: 'SearchPage.tsx - handleAddToCart()',
    // Filter Click
    filterEventCode: 'clickedFilters',
    filterTriggerText: 'When category/brand filters are applied',
    filterDataText: 'filterName, filterValue, eventName: "Filter Applied"',
    filterLocationText: 'HierarchicalMenu, RefinementList components',
    // Implementation
    instantSearchSetup: 'InstantSearch Setup',
    wrapperText: 'Wrapper: App.tsx level with initialUiState',
    stateManagement: 'State Management: URL params → InstantSearch state',
    keyProp: 'Key Prop: Forces re-mount when URL changes',

    // State Sync
    stateSyncTitle: 'State Synchronization',
    navbarSearch: 'Navbar Search: setIndexUiState() for global state',
    urlUpdates: 'URL Updates: React Router navigation',
    queryStorage: 'Query Storage: localStorage for cross-component access',
    // Tech Config
    indexName: 'Index',
    appId: 'App ID',
    searchClient: 'Search Client',
    uiLibrary: 'UI Library',
    insights: 'Insights',
    searchableAttrs: 'Searchable Attributes',
    facetAttrs: 'Facet Attributes',
    docsLink: 'InstantSearch React Documentation'
  },
  fr: {
    title: 'Implémentation Recherche - Algolia',
    insightsTitle: 'Événements de Recherche - Suivi',
    searchResultsView: 'Vue des Résultats de Recherche',
    productClick: 'Clics sur Produits',
    addToCart: 'Ajouter au Panier',
    filterClick: 'Filtres de Recherche',
    searchImplTitle: 'Implémentation InstantSearch',
    techConfigTitle: 'Configuration de Recherche',
    // Event details
    viewEvent: 'Événement',
    viewTrigger: 'Déclencheur',
    viewData: 'Données',
    viewLocation: 'Emplacement',
    // Search Results View
    viewEventCode: 'viewedObjectIDs',
    viewTriggerText: 'Quand les résultats de recherche sont affichés',
    viewDataText: 'objectIDs[], queryID, eventName: "Hits Viewed"',
    viewLocationText: 'SearchPage.tsx - composant Hit',
    // Product Click
    clickEventCode: 'clickedObjectIDsAfterSearch',
    clickTriggerText: 'Quand l\'utilisateur clique sur un produit',
    clickDataText: 'objectID, queryID, eventName: "Hit Clicked"',
    clickLocationText: 'SearchPage.tsx - handleProductClick()',
    // Add to Cart
    addToCartEventCode: 'addedToCartObjectIDsAfterSearch',
    addToCartTriggerText: 'Quand l\'utilisateur ajoute un produit au panier depuis la recherche',
    addToCartDataText: 'objectID, queryID, eventName: "Added to Cart After Search"',
    addToCartLocationText: 'SearchPage.tsx - handleAddToCart()',
    // Filter Click
    filterEventCode: 'clickedFilters',
    filterTriggerText: 'Quand les filtres catégorie/marque sont appliqués',
    filterDataText: 'filterName, filterValue, eventName: "Filter Applied"',
    filterLocationText: 'HierarchicalMenu, RefinementList composants',
    // Implementation
    instantSearchSetup: 'Configuration InstantSearch',
    wrapperText: 'Wrapper: niveau App.tsx avec initialUiState',
    stateManagement: 'Gestion d\'État: paramètres URL → état InstantSearch',
    keyProp: 'Prop Key: Force le re-montage quand l\'URL change',
    hiddenSearchBox: 'SearchBox Caché: Maintient l\'état de recherche',
    // State Sync
    stateSyncTitle: 'Synchronisation d\'État',
    navbarSearch: 'Recherche Navbar: setIndexUiState() pour état global',
    urlUpdates: 'Mises à jour URL: navigation React Router',
    queryStorage: 'Stockage Query: localStorage pour accès inter-composants',
    // Tech Config
    indexName: 'Index',
    appId: 'ID App',
    searchClient: 'Client de Recherche',
    uiLibrary: 'Librairie UI',
    insights: 'Insights',
    searchableAttrs: 'Attributs Recherchables',
    facetAttrs: 'Attributs de Facettes',
    docsLink: 'Documentation InstantSearch React'
  },
  pt: {
    title: 'Implementação Busca - Algolia',
    insightsTitle: 'Eventos de Busca - Rastreamento',
    searchResultsView: 'Visualização de Resultados',
    productClick: 'Cliques em Produtos',
    addToCart: 'Adicionar ao Carrinho',
    filterClick: 'Filtros de Busca',
    searchImplTitle: 'Implementação InstantSearch',
    techConfigTitle: 'Configuração de Busca',
    // Event details
    viewEvent: 'Evento',
    viewTrigger: 'Gatilho',
    viewData: 'Dados',
    viewLocation: 'Localização',
    // Search Results View
    viewEventCode: 'viewedObjectIDs',
    viewTriggerText: 'Quando resultados de busca são exibidos',
    viewDataText: 'objectIDs[], queryID, eventName: "Hits Viewed"',
    viewLocationText: 'SearchPage.tsx - componente Hit',
    // Product Click
    clickEventCode: 'clickedObjectIDsAfterSearch',
    clickTriggerText: 'Quando usuário clica em um produto',
    clickDataText: 'objectID, queryID, eventName: "Hit Clicked"',
    clickLocationText: 'SearchPage.tsx - handleProductClick()',
    // Add to Cart
    addToCartEventCode: 'addedToCartObjectIDsAfterSearch',
    addToCartTriggerText: 'Quando usuário adiciona produto ao carrinho da busca',
    addToCartDataText: 'objectID, queryID, eventName: "Added to Cart After Search"',
    addToCartLocationText: 'SearchPage.tsx - handleAddToCart()',
    // Filter Click
    filterEventCode: 'clickedFilters',
    filterTriggerText: 'Quando filtros categoria/marca são aplicados',
    filterDataText: 'filterName, filterValue, eventName: "Filter Applied"',
    filterLocationText: 'HierarchicalMenu, RefinementList componentes',
    // Implementation
    instantSearchSetup: 'Configuração InstantSearch',
    wrapperText: 'Wrapper: nível App.tsx com initialUiState',
    stateManagement: 'Gestão de Estado: parâmetros URL → estado InstantSearch',
    keyProp: 'Prop Key: Força re-montagem quando URL muda',
    hiddenSearchBox: 'SearchBox Oculto: Mantém estado de busca',
    // State Sync
    stateSyncTitle: 'Sincronização de Estado',
    navbarSearch: 'Busca Navbar: setIndexUiState() para estado global',
    urlUpdates: 'Atualizações URL: navegação React Router',
    queryStorage: 'Armazenamento Query: localStorage para acesso entre componentes',
    // Tech Config
    indexName: 'Índice',
    appId: 'ID do App',
    searchClient: 'Cliente de Busca',
    uiLibrary: 'Biblioteca UI',
    insights: 'Insights',
    searchableAttrs: 'Atributos Pesquisáveis',
    facetAttrs: 'Atributos de Facetas',
    docsLink: 'Documentação InstantSearch React'
  }
};

const SearchPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAlgoliaInfo, setShowAlgoliaInfo] = useState(false);
  const [algoliaLang, setAlgoliaLang] = useState<AlgoliaLanguage>('es');
  const navigate = useNavigate();

  const getProductPrice = (product: Product) => {
    const firstStore = Object.values(product.storeDetail)[0];
    if (firstStore) {
      return {
        price: firstStore.amount,
        originalPrice: firstStore.basePrice,
        discountPercentage: firstStore.productDiscountPercentage * 100,
        hasDiscount: firstStore.havedDiscount,
        unitPrice: firstStore.uomPrice
      };
    }
    return {
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      hasDiscount: false,
      unitPrice: ''
    };
  };

  const Hit = React.memo(({ hit, sendEvent }: { hit: Product; sendEvent: any }) => {
    const priceInfo = getProductPrice(hit);
    const { addItem, removeItem, updateQuantity, state } = useCart();
    
    const cartItem = state.items.find(item => item.objectID === hit.objectID);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    const handleProductClick = () => {
      sendEvent('click', hit, 'Hit Clicked in Search');
      const productSlug = createProductSlug(hit.ecomDescription, hit.objectID);
      navigate(`/product/${productSlug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      const storedQueryID = localStorage.getItem('algolia_queryID');
      const storedSearchQuery = localStorage.getItem('algolia_searchQuery');
      
      addItem({
        objectID: hit.objectID,
        productID: hit.productID,
        name: hit.ecomDescription,
        price: priceInfo.price,
        image: hit.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center',
        category: hit.catecom,
        brand: hit.marca,
        quantity: 1,
        queryID: storedQueryID || undefined,
        searchQuery: storedSearchQuery || undefined,
        addedFrom: 'search',
        __autocomplete_indexName: 'auto_productos',
        discount: priceInfo.hasDiscount ? (priceInfo.originalPrice - priceInfo.price) : 0
      });
    };

    const handleIncreaseQuantity = (e: React.MouseEvent) => {
      e.stopPropagation();
      updateQuantity(hit.objectID, quantity + 1);
    };

    const handleDecreaseQuantity = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (quantity > 1) {
        updateQuantity(hit.objectID, quantity - 1);
      } else {
        removeItem(hit.objectID);
      }
    };

    const handleRemoveItem = (e: React.MouseEvent) => {
      e.stopPropagation();
      removeItem(hit.objectID);
    };
    
    return (
      <div className="product-card" onClick={handleProductClick}>
        <button 
          className="btn-wishlist-top"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <i className="far fa-heart"></i>
        </button>
        
        <div className="product-image-container">
          <img 
            src={hit.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&crop=center'} 
            alt={hit.ecomDescription} 
            className="product-image"
          />
          <div className="product-overlay">
            <button className="quick-view-btn">
              <i className="fas fa-eye"></i>
            </button>
          </div>
          
          <div className="product-badges">
            {hit.isNewProduct && (
              <span className="badge badge-new">Nuevo</span>
            )}
            {priceInfo.hasDiscount && (
              <span className="badge badge-discount">-{priceInfo.discountPercentage.toFixed(0)}%</span>
            )}
          </div>
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{hit.ecomDescription}</h3>
          <p className="product-brand">{hit.marca}</p>
          
          <div className="product-price">
            {priceInfo.hasDiscount ? (
              <>
                <span className="current-price">₡{priceInfo.price.toLocaleString()}</span>
                <span className="original-price">₡{priceInfo.originalPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="current-price">₡{priceInfo.price.toLocaleString()}</span>
            )}
            {priceInfo.unitPrice && (
              <span className="unit-price">{priceInfo.unitPrice}</span>
            )}
          </div>
          
          <div className="product-actions">
            {quantity === 0 ? (
              <button 
                className="btn-add-cart"
                onClick={handleAddToCart}
              >
                <i className="fas fa-cart-plus"></i>
                Agregar
              </button>
            ) : (
              <div className="quantity-controls">
                <button 
                  className="btn-quantity"
                  onClick={handleDecreaseQuantity}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="btn-quantity"
                  onClick={handleIncreaseQuantity}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button 
                  className="btn-remove"
                  onClick={handleRemoveItem}
                  title="Eliminar del carrito"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="search-page">
      {/* Hidden SearchBox to maintain InstantSearch state */}
      <div className="hidden-search-box">
        <SearchBox />
      </div>
      
      <div className="search-header">
        <div className="search-header-content">
          <div className="search-info-section">
            <h2 className="search-results-title">Resultados de búsqueda</h2>
            <div className="search-stats-and-actions">
              <Stats 
                translations={{
                  rootElementText: ({ nbHits, processingTimeMS }: { nbHits: number; processingTimeMS: number }) => 
                    `${nbHits.toLocaleString()} resultados encontrados en ${processingTimeMS}ms`
                }}
              />
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter"></i>
                Borrar filtros
              </button>
            </div>
          </div>
          
          <div className="search-header-actions">
            <button 
              className="algolia-info-btn"
              onClick={() => setShowAlgoliaInfo(true)}
              title="¿Qué es Algolia? Haz clic para más información"
            >
              <svg width="18" height="18" viewBox="0 0 500 500" fill="currentColor">
                <path d="M250 25C127.031 25 25 127.031 25 250s102.031 225 225 225 225-102.031 225-225S372.969 25 250 25zm0 25c110.457 0 200 89.543 200 200s-89.543 200-200 200S50 360.457 50 250 139.543 50 250 50z"/>
                <path d="M250 100c-82.843 0-150 67.157-150 150s67.157 150 150 150 150-67.157 150-150-67.157-150-150-150zm0 25c68.629 0 125 56.371 125 125s-56.371 125-125 125-125-56.371-125-125 56.371-125 125-125z"/>
                <path d="M250 150c-55.228 0-100 44.772-100 100s44.772 100 100 100 100-44.772 100-100-44.772-100-100-100zm0 25c41.421 0 75 33.579 75 75s-33.579 75-75 75-75-33.579-75-75 33.579-75 75-75z"/>
              </svg>
              <span>Algolia</span>
              <i className="fas fa-question-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="search-content">
        <div className={`search-filters ${showFilters ? 'show' : ''}`}>
          <div className="filter-section">
            <h4>Categorías</h4>
            <CustomHierarchicalMenu
              attributes={[
                'hierarchical_categories.lvl0',
                'hierarchical_categories.lvl1',
                'hierarchical_categories.lvl2'
              ]}
            />
          </div>
          
          <div className="filter-section">
            <h4>Categoría Simple</h4>
            <RefinementList
              attribute="catecom"
              limit={10}
              showMore={true}
            />
          </div>
          
          <div className="filter-section">
            <h4>Marca</h4>
            <RefinementList
              attribute="marca"
              limit={10}
              showMore={true}
            />
          </div>
        </div>
        
        <div className="search-results">
          <Hits hitComponent={Hit} />
          
          <div className="search-pagination">
            <Pagination
              padding={2}
              showFirst={false}
              showLast={false}
            />
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
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="algolia-info-body">
            <div className="algolia-section">
              <h4><i className="fas fa-chart-line"></i> {algoliaTranslations[algoliaLang].insightsTitle}</h4>
              <div className="event-details">
                <div className="event-item">
                  <h5>🔍 {algoliaTranslations[algoliaLang].searchResultsView}</h5>
                  <p><strong>{algoliaTranslations[algoliaLang].viewEvent}:</strong> <code>{algoliaTranslations[algoliaLang].viewEventCode}</code></p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewTrigger}:</strong> {algoliaTranslations[algoliaLang].viewTriggerText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewData}:</strong> {algoliaTranslations[algoliaLang].viewDataText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewLocation}:</strong> {algoliaTranslations[algoliaLang].viewLocationText}</p>
                </div>
                
                <div className="event-item">
                  <h5>👆 {algoliaTranslations[algoliaLang].productClick}</h5>
                  <p><strong>{algoliaTranslations[algoliaLang].viewEvent}:</strong> <code>{algoliaTranslations[algoliaLang].clickEventCode}</code></p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewTrigger}:</strong> {algoliaTranslations[algoliaLang].clickTriggerText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewData}:</strong> {algoliaTranslations[algoliaLang].clickDataText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewLocation}:</strong> {algoliaTranslations[algoliaLang].clickLocationText}</p>
                </div>
                
                <div className="event-item">
                  <h5>🛒 {algoliaTranslations[algoliaLang].addToCart}</h5>
                  <p><strong>{algoliaTranslations[algoliaLang].viewEvent}:</strong> <code>{algoliaTranslations[algoliaLang].addToCartEventCode}</code></p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewTrigger}:</strong> {algoliaTranslations[algoliaLang].addToCartTriggerText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewData}:</strong> {algoliaTranslations[algoliaLang].addToCartDataText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewLocation}:</strong> {algoliaTranslations[algoliaLang].addToCartLocationText}</p>
                </div>
                
                <div className="event-item">
                  <h5>🏷️ {algoliaTranslations[algoliaLang].filterClick}</h5>
                  <p><strong>{algoliaTranslations[algoliaLang].viewEvent}:</strong> <code>{algoliaTranslations[algoliaLang].filterEventCode}</code></p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewTrigger}:</strong> {algoliaTranslations[algoliaLang].filterTriggerText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewData}:</strong> {algoliaTranslations[algoliaLang].filterDataText}</p>
                  <p><strong>{algoliaTranslations[algoliaLang].viewLocation}:</strong> {algoliaTranslations[algoliaLang].filterLocationText}</p>
                </div>
              </div>
              <a 
                href="https://www.algolia.com/doc/guides/sending-events/implementing/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                Implementing Events Documentation
              </a>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-search"></i> {algoliaTranslations[algoliaLang].searchImplTitle}</h4>
              <div className="event-details">
                <div className="event-item">
                  <h5>⚡ {algoliaTranslations[algoliaLang].instantSearchSetup}</h5>
                  <p><strong>Wrapper:</strong> {algoliaTranslations[algoliaLang].wrapperText}</p>
                  <p><strong>State Management:</strong> {algoliaTranslations[algoliaLang].stateManagement}</p>
                  <p><strong>Key Prop:</strong> {algoliaTranslations[algoliaLang].keyProp}</p>

                </div>
                
                <div className="event-item">
                  <h5>🔄 {algoliaTranslations[algoliaLang].stateSyncTitle}</h5>
                  <p><strong>Navbar Search:</strong> {algoliaTranslations[algoliaLang].navbarSearch}</p>
                  <p><strong>URL Updates:</strong> {algoliaTranslations[algoliaLang].urlUpdates}</p>
                  <p><strong>Query Storage:</strong> {algoliaTranslations[algoliaLang].queryStorage}</p>
                </div>
              </div>
              <a 
                href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaTranslations[algoliaLang].docsLink}
              </a>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-cogs"></i> {algoliaTranslations[algoliaLang].techConfigTitle}</h4>
              <ul>

                <li><strong>{algoliaTranslations[algoliaLang].searchClient}:</strong> Algoliasearch v5.12.0</li>
                <li><strong>{algoliaTranslations[algoliaLang].uiLibrary}:</strong> React InstantSearch v7.13.7</li>
                <li><strong>{algoliaTranslations[algoliaLang].insights}:</strong> search-insights for event tracking</li>
                <li><strong>{algoliaTranslations[algoliaLang].searchableAttrs}:</strong> ecomDescription, marca, catecom</li>
                <li><strong>{algoliaTranslations[algoliaLang].facetAttrs}:</strong> marca, catecom, hierarchical categories</li>
              </ul>
              <a 
                href="https://www.algolia.com/doc/api-reference/search-api-parameters/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                Search API Reference
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 