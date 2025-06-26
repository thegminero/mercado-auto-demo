import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { categories, CategoryNode } from '../data/categories.generated';
import { useInstantSearch } from 'react-instantsearch';
import algoliasearch from 'algoliasearch/lite';
import insights from 'search-insights';
import { createProductSlug } from '../utils/productUtils';
import CartIcon from './CartIcon';
import './Navbar.css';
import './SearchPage.css';

const searchClient = algoliasearch(
  'MWN8IH23ME',
  '4e648074863f9356162d9db95a19efe0'
);

interface Product {
  objectID: string;
  ecomDescription: string;
  marca: string;
  imageUrl: string;
  catecom: string;
  storeDetail: Record<string, any>;
}



const Navbar: React.FC = () => {
  const { state: cartState } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { setIndexUiState, indexUiState } = useInstantSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [megaMenuPath, setMegaMenuPath] = useState<CategoryNode[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStore, setSelectedStore] = useState('store-1');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('San José, Costa Rica');
  const [hasClickedSearch, setHasClickedSearch] = useState(false);
  const [showAlgoliaInfo, setShowAlgoliaInfo] = useState(false);
  const [algoliaLanguage, setAlgoliaLanguage] = useState<'es' | 'en' | 'fr' | 'pt'>('es');


  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  console.log('Navbar component rendered, searchQuery:', searchQuery);

  // Check if we're on HomePage
  const isHomePage = location.pathname === '/';

  const algoliaTranslations = {
    es: {
      searchFeatures: 'Funcionalidades de Búsqueda',
      analyticsEvents: 'Analíticas y Eventos', 
      implementationDetails: 'Detalles de Implementación',
      performanceBenefits: 'Beneficios de Rendimiento',
      instantSearch: 'Búsqueda en tiempo real mientras escribes',
      autocomplete: 'Sugerencias inteligentes de búsqueda',
      typoTolerance: 'Encuentra productos incluso con errores de escritura',
      synonyms: 'Búsqueda por términos relacionados',
      facetedNavigation: 'Filtros por categorías, marcas, precios',
      productViewed: 'Eventos de Vista de Productos',
      productClicked: 'Eventos de Clic en Producto',
      cartConversion: 'Eventos de Conversión',
      whenViewed: 'Al mostrar productos en la página de inicio',
      whenClicked: 'Al hacer clic en un producto',
      whenAddedToCart: 'Al agregar productos al carrito',
      currentPage: 'HomePage - Página de inicio con productos personalizados',
      functionality: 'Productos recomendados y carrusel personalizado',
      speed: 'Resultados en menos de 50ms',
      scalability: 'Maneja millones de consultas',
      availability: '99.99% uptime garantizado',
      globalCDN: 'Servidores en todo el mundo',
      realTime: 'Actualizaciones instantáneas',
      mobileOptimized: 'Experiencia perfecta en dispositivos móviles'
    },
    en: {
      searchFeatures: 'Search Features',
      analyticsEvents: 'Analytics & Events',
      implementationDetails: 'Implementation Details', 
      performanceBenefits: 'Performance Benefits',
      instantSearch: 'Real-time search as you type',
      autocomplete: 'Intelligent search suggestions',
      typoTolerance: 'Find products even with typing errors',
      synonyms: 'Search by related terms',
      facetedNavigation: 'Filters by categories, brands, prices',
      productViewed: 'Product View Events',
      productClicked: 'Product Click Events',
      cartConversion: 'Conversion Events',
      whenViewed: 'When displaying products on homepage',
      whenClicked: 'When clicking on a product',
      whenAddedToCart: 'When adding products to cart',
      currentPage: 'HomePage - Home page with personalized products',
      functionality: 'Recommended products and personalized carousel',
      speed: 'Results in less than 50ms',
      scalability: 'Handles millions of queries',
      availability: '99.99% uptime guaranteed',
      globalCDN: 'Servers worldwide',
      realTime: 'Instant updates',
      mobileOptimized: 'Perfect experience on mobile devices'
    },
    fr: {
      searchFeatures: 'Fonctionnalités de Recherche',
      analyticsEvents: 'Analyses et Événements',
      implementationDetails: 'Détails d\'Implémentation',
      performanceBenefits: 'Avantages de Performance',
      instantSearch: 'Recherche en temps réel pendant la saisie',
      autocomplete: 'Suggestions de recherche intelligentes',
      typoTolerance: 'Trouve des produits même avec des erreurs de frappe',
      synonyms: 'Recherche par termes connexes',
      facetedNavigation: 'Filtres par catégories, marques, prix',
      productViewed: 'Événements de Vue de Produits',
      productClicked: 'Événements de Clic sur Produit',
      cartConversion: 'Événements de Conversion',
      whenViewed: 'Lors de l\'affichage des produits sur la page d\'accueil',
      whenClicked: 'Lors du clic sur un produit',
      whenAddedToCart: 'Lors de l\'ajout de produits au panier',
      currentPage: 'HomePage - Page d\'accueil avec produits personnalisés',
      functionality: 'Produits recommandés et carrousel personnalisé',
      speed: 'Résultats en moins de 50ms',
      scalability: 'Gère des millions de requêtes',
      availability: '99,99% de disponibilité garantie',
      globalCDN: 'Serveurs dans le monde entier',
      realTime: 'Mises à jour instantanées',
      mobileOptimized: 'Expérience parfaite sur appareils mobiles'
    },
    pt: {
      searchFeatures: 'Recursos de Pesquisa',
      analyticsEvents: 'Análises e Eventos',
      implementationDetails: 'Detalhes de Implementação',
      performanceBenefits: 'Benefícios de Performance',
      instantSearch: 'Pesquisa em tempo real enquanto digita',
      autocomplete: 'Sugestões inteligentes de pesquisa',
      typoTolerance: 'Encontra produtos mesmo com erros de digitação',
      synonyms: 'Pesquisa por termos relacionados',
      facetedNavigation: 'Filtros por categorias, marcas, preços',
      productViewed: 'Eventos de Visualização de Produtos',
      productClicked: 'Eventos de Clique em Produto',
      cartConversion: 'Eventos de Conversão',
      whenViewed: 'Ao exibir produtos na página inicial',
      whenClicked: 'Ao clicar em um produto',
      whenAddedToCart: 'Ao adicionar produtos ao carrinho',
      currentPage: 'HomePage - Página inicial com produtos personalizados',
      functionality: 'Produtos recomendados e carrossel personalizado',
      speed: 'Resultados em menos de 50ms',
      scalability: 'Lida com milhões de consultas',
      availability: '99,99% de uptime garantido',
      globalCDN: 'Servidores em todo o mundo',
      realTime: 'Atualizações instantâneas',
      mobileOptimized: 'Experiência perfeita em dispositivos móveis'
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    console.log('Navbar component mounted');
    console.log('Initial searchQuery:', searchQuery);
    console.log('Initial hasClickedSearch:', hasClickedSearch);
    const saved = localStorage.getItem('automercado_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        setRecentSearches([]);
      }
    }
    
    // Mark as initialized after a short delay
    setTimeout(() => {
      isInitializedRef.current = true;
      console.log('Navbar initialized, search queries enabled');
    }, 100);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setShowMegaMenu(false);
        setMegaMenuPath([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Send view events when autocomplete results are displayed
  useEffect(() => {
    if (searchResults.length > 0) {
      try {
        const objectIDs = searchResults.map(product => product.objectID);
        console.log('Sending autocomplete view events for products:', objectIDs);
        
        insights('viewedObjectIDs', {
          eventName: 'Products Viewed in AutoComplete',
          index: 'auto_productos',
          objectIDs: objectIDs,
        } as any);
        
        console.log('Autocomplete view events sent successfully');
      } catch (error) {
        console.error('Error sending autocomplete view events:', error);
      }
    }
  }, [searchResults]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log('Search input changed:', query, 'Length:', query.length, 'hasClickedSearch:', hasClickedSearch, 'isInitialized:', isInitializedRef.current);
    setSearchQuery(query);
    setShowSearchDropdown(true);

    // Only search if component is initialized and user has clicked on the search input
    if (!isInitializedRef.current || !hasClickedSearch) {
      console.log('Search not ready - initialized:', isInitializedRef.current, 'clicked:', hasClickedSearch);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't send empty queries
    if (!query.trim()) {
      console.log('Empty query, clearing results without sending to Algolia');
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    console.log('Sending search query:', query);
    // Simulate search delay
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('About to call searchClient.search with query:', query);
        console.log('Stack trace:', new Error().stack);
        
        // Use Algolia search to get real results
        const { results } = await searchClient.search([
          {
            indexName: 'auto_productos',
            query,
            params: {
              hitsPerPage: 4,
              attributesToRetrieve: ['objectID', 'ecomDescription', 'marca', 'imageUrl', 'catecom', 'storeDetail'],
            }
          }
        ]);
        
        console.log('Search results received:', results);
        
        if (results[0] && 'hits' in results[0] && results[0].hits) {
          const transformedResults: Product[] = results[0].hits.map((hit: any) => ({
            objectID: hit.objectID,
            ecomDescription: hit.ecomDescription || 'Producto sin nombre',
            marca: hit.marca || 'Sin marca',
            imageUrl: hit.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center',
            catecom: hit.catecom || 'Sin categoría',
            storeDetail: hit.storeDetail || {}
          }));
          setSearchResults(transformedResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Handle search input click
  const handleSearchInputClick = () => {
    console.log('Search input clicked/focused, enabling search queries');
    console.log('Previous hasClickedSearch:', hasClickedSearch);
    console.log('Current searchQuery:', searchQuery);
    setHasClickedSearch(true);
    setShowSearchDropdown(true);
    
    // If no query, load popular products to show suggestions
    if (!searchQuery.trim() && isInitializedRef.current) {
      console.log('Loading popular products for empty search');
      setIsSearching(true);
      
      // Load popular/featured products
      searchClient.search([
        {
          indexName: 'auto_productos',
          query: '', // Empty query to get all products
          params: {
            hitsPerPage: 4,
            attributesToRetrieve: ['objectID', 'ecomDescription', 'marca', 'imageUrl', 'catecom', 'storeDetail'],
            // You can add filters here for popular products if you have that data
            // filters: 'isPopular:true OR isFeatured:true'
          }
        }
      ]).then(({ results }) => {
        console.log('Popular products loaded:', results);
        
        if (results[0] && 'hits' in results[0] && results[0].hits) {
          const transformedResults: Product[] = results[0].hits.map((hit: any) => ({
            objectID: hit.objectID,
            ecomDescription: hit.ecomDescription || 'Producto sin nombre',
            marca: hit.marca || 'Sin marca',
            imageUrl: hit.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center',
            catecom: hit.catecom || 'Sin categoría',
            storeDetail: hit.storeDetail || {}
          }));
          setSearchResults(transformedResults);
        } else {
          setSearchResults([]);
        }
      }).catch(error => {
        console.error('Error loading popular products:', error);
        setSearchResults([]);
      }).finally(() => {
        setIsSearching(false);
      });
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('automercado_recent_searches', JSON.stringify(newRecentSearches));
      
      // Set the query in InstantSearch global state
      setIndexUiState((prevState: any) => ({
        ...prevState,
        query: searchQuery
      }));
      
      // Navigate to search page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result: Product) => {
    // Send click event for autocomplete
    try {
      insights('clickedObjectIDs', {
        eventName: 'Hit Clicked in AutoComplete',
        index: 'auto_productos',
        objectIDs: [result.objectID],
      } as any);
      
      console.log('Autocomplete click event sent for product:', result.objectID);
    } catch (error) {
      console.error('Error sending autocomplete click event:', error);
    }
    
    // Create SEO-friendly URL
    const productSlug = createProductSlug(result.ecomDescription, result.objectID);
    navigate(`/product/${productSlug}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    
    // Set the query in InstantSearch global state
    setIndexUiState((prevState: any) => ({
      ...prevState,
      query: search
    }));
    
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setShowSearchDropdown(false);
  };

  // Remove recent search
  const handleRemoveRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecentSearches = recentSearches.filter(s => s !== search);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('automercado_recent_searches', JSON.stringify(newRecentSearches));
  };

  // Clear all recent searches
  const handleClearAllSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('automercado_recent_searches');
  };

  // Get product price
  const getProductPrice = (product: Product) => {
    const firstStore = Object.values(product.storeDetail)[0];
    if (firstStore) {
      return firstStore.amount || 0;
    }
    return 0;
  };

  // Mega menu functions
  const handleCategoriesClick = () => {
    setShowMegaMenu(!showMegaMenu);
    setMegaMenuPath([]);
  };

  const handleCategoryClick = (category: CategoryNode) => {
    navigate(`/categorias/${category.slug}`);
    setShowMegaMenu(false);
    setMegaMenuPath([]);
  };

  const handleCategoryExpand = (category: CategoryNode) => {
    setMegaMenuPath([...megaMenuPath, category]);
  };

  const handleMegaMenuBack = () => {
    if (megaMenuPath.length > 0) {
      setMegaMenuPath(megaMenuPath.slice(0, -1));
    } else {
      setShowMegaMenu(false);
    }
  };

  const handleMegaMenuClose = () => {
    setShowMegaMenu(false);
    setMegaMenuPath([]);
  };

  // Get current categories to display
  const getCurrentCategories = () => {
    if (megaMenuPath.length === 0) {
      return categories;
    }
    return megaMenuPath[megaMenuPath.length - 1].subcategories || [];
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    return megaMenuPath.map(cat => cat.name);
  };



  return (
    <nav className="navbar-am">
      {/* Main Navbar - Single Row */}
      <div className="navbar-main">
        <div className="navbar-main-content">
          {/* Logo - Far Left */}
          <Link to="/" className="navbar-brand">
            <img 
              src="https://automercado.cr/content/images/logoAM.svg" 
              alt="AutoMercado" 
              className="logo-image"
            />
          </Link>

          {/* Search Bar - Center */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchInputClick}
                onClick={handleSearchInputClick}
                autoFocus={false}
              />
              <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </form>
            
            {/* Algolia Info Button - Only show on HomePage */}
            {isHomePage && (
              <button 
                className="algolia-info-btn-navbar"
                onClick={() => setShowAlgoliaInfo(true)}
                title="Información sobre Algolia"
              >
                <i className="fab fa-algolia"></i>
              </button>
            )}

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="search-dropdown">
                <div className="search-dropdown-content">
                  <div className="search-dropdown-left">
                    {/* Recent Searches */}
                    <div className="search-section">
                      <div className="search-section-header">
                        <h4 className="search-section-title">Búsquedas Recientes</h4>
                        {recentSearches.length > 0 && (
                          <button 
                            className="clear-all-btn"
                            onClick={handleClearAllSearches}
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      {recentSearches.length > 0 ? (
                        <div className="recent-searches">
                          {recentSearches.map((search, index) => (
                            <div 
                              key={index} 
                              className="recent-search-item"
                              onClick={() => handleRecentSearchClick(search)}
                            >
                              <i className="fas fa-history"></i>
                              <span>{search}</span>
                              <button 
                                className="remove-search-btn"
                                onClick={(e) => handleRemoveRecentSearch(search, e)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-recent-searches">
                          <p>No hay búsquedas recientes</p>
                        </div>
                      )}
                    </div>

                    {/* Query Suggestions */}
                    {searchQuery.trim() ? (
                      <div className="search-section">
                        <div className="search-section-header">
                          <h4 className="search-section-title">Sugerencias</h4>
                        </div>
                        <div className="query-suggestions">
                          <div className="query-suggestion-item">
                            <i className="fas fa-search"></i>
                            <span>"{searchQuery}" en Abarrotes</span>
                            <span className="suggestion-count">(45)</span>
                          </div>
                          <div className="query-suggestion-item">
                            <i className="fas fa-search"></i>
                            <span>"{searchQuery}" en Lácteos</span>
                            <span className="suggestion-count">(23)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="search-section">
                        <div className="search-section-header">
                          <h4 className="search-section-title">Búsquedas Populares</h4>
                        </div>
                        <div className="query-suggestions">
                          <div 
                            className="query-suggestion-item"
                            onClick={() => handleRecentSearchClick('leche')}
                          >
                            <i className="fas fa-fire"></i>
                            <span>Leche</span>
                          </div>
                          <div 
                            className="query-suggestion-item"
                            onClick={() => handleRecentSearchClick('pan')}
                          >
                            <i className="fas fa-fire"></i>
                            <span>Pan</span>
                          </div>
                          <div 
                            className="query-suggestion-item"
                            onClick={() => handleRecentSearchClick('arroz')}
                          >
                            <i className="fas fa-fire"></i>
                            <span>Arroz</span>
                          </div>
                          <div 
                            className="query-suggestion-item"
                            onClick={() => handleRecentSearchClick('café')}
                          >
                            <i className="fas fa-fire"></i>
                            <span>Café</span>
                          </div>
                          <div 
                            className="query-suggestion-item"
                            onClick={() => handleRecentSearchClick('aceite')}
                          >
                            <i className="fas fa-fire"></i>
                            <span>Aceite</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="search-dropdown-right">
                    {/* Search Results */}
                    {isSearching ? (
                      <div className="searching-state">
                        <div className="searching-spinner">
                          <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <p>{searchQuery.trim() ? 'Buscando productos...' : 'Cargando productos populares...'}</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="suggested-products">
                        <div className="suggested-products-header">
                          <h4>{searchQuery.trim() ? 'Productos Encontrados' : 'Productos Populares'}</h4>
                        </div>
                        {searchResults.map((result) => (
                          <div 
                            key={result.objectID} 
                            className="suggested-product-item"
                            onClick={() => handleSearchResultClick(result)}
                          >
                            <div className="product-image">
                              <img src={result.imageUrl} alt={result.ecomDescription} />
                            </div>
                            <div className="product-info">
                              <div className="product-name">{result.ecomDescription}</div>
                              <div className="product-brand">{result.marca}</div>
                              <div className="product-price">₡{getProductPrice(result).toLocaleString()}</div>
                            </div>
                            <button className="add-to-cart-btn">
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="no-results">
                        <p>No se encontraron productos para "{searchQuery}"</p>
                        <button 
                          className="btn-search-all"
                          onClick={() => {
                            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                            setShowSearchDropdown(false);
                          }}
                        >
                          Buscar todos los productos
                        </button>
                      </div>
                    ) : (
                      <div className="no-results">
                        <p>Haz clic en una búsqueda popular o escribe para buscar productos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Navigation Actions */}
          <div className="nav-actions">
            {/* Cart Icon */}
            <CartIcon />

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Mega Menu Section */}
      <div className="navbar-categories">
        <div className="navbar-categories-content">
          <button 
            className={`categories-mega-button ${showMegaMenu ? 'active' : ''}`}
            onClick={handleCategoriesClick}
          >
            <i className="fas fa-bars"></i>
            <span>Todas las Categorías</span>
          </button>
          
          {/* Store Selector */}
          <div className="store-selector">
            <i className="fas fa-store"></i>
            <select 
              value={selectedStore} 
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="store-1">Tienda San José Centro</option>
              <option value="store-2">Tienda Heredia</option>
              <option value="store-3">Tienda Cartago</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      {showMegaMenu && (
        <div className="mega-menu-dropdown" ref={megaMenuRef}>
          <div className="mega-menu-header">
            <div className="mega-menu-breadcrumb">
              {megaMenuPath.length > 0 ? (
                <>
                  <button 
                    className="mega-menu-back-btn"
                    onClick={handleMegaMenuBack}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Volver
                  </button>
                  <div className="mega-menu-path">
                    {getBreadcrumbPath().join(' > ')}
                  </div>
                </>
              ) : (
                <div className="mega-menu-title">
                  <i className="fas fa-th-large"></i>
                  Todas las Categorías
                  <Link to="/categorias" className="mega-menu-all-link">
                    Ver todas las categorías
                  </Link>
                </div>
              )}
            </div>
            <button 
              className="mega-menu-close-btn"
              onClick={handleMegaMenuClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mega-menu-content">
            <div className="mega-menu-grid">
              {getCurrentCategories().map((category) => (
                <div key={category.slug} className="mega-menu-item">
                  <div className="mega-menu-item-content">
                    <div className="mega-menu-item-main">
                      <button 
                        className="mega-menu-item-button"
                        onClick={() => handleCategoryClick(category)}
                        title={`Ver productos de ${category.name}`}
                      >
                        <i className="fas fa-chevron-right"></i>
                        <span>{category.name}</span>
                      </button>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <button 
                          className="mega-menu-expand-btn"
                          onClick={() => handleCategoryExpand(category)}
                          title={`Explorar subcategorías de ${category.name}`}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Algolia Info Slider - Only show when on HomePage */}
      {isHomePage && (
        <div className={`algolia-info-slider ${showAlgoliaInfo ? 'open' : ''}`}>
          <div className="algolia-info-overlay" onClick={() => setShowAlgoliaInfo(false)}></div>
          <div className="algolia-info-content">
            <div className="algolia-info-header">
              <div className="algolia-logo-section">
                <i className="fab fa-algolia" style={{ fontSize: '2rem', color: '#003dff' }}></i>
                <h3>Algolia</h3>
              </div>
              <div className="algolia-header-controls">
                <div className="algolia-language-selector">
                  <button 
                    className={`lang-btn ${algoliaLanguage === 'es' ? 'active' : ''}`}
                    onClick={() => setAlgoliaLanguage('es')}
                  >
                    🇪🇸 ES
                  </button>
                  <button 
                    className={`lang-btn ${algoliaLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => setAlgoliaLanguage('en')}
                  >
                    🇺🇸 EN
                  </button>
                  <button 
                    className={`lang-btn ${algoliaLanguage === 'fr' ? 'active' : ''}`}
                    onClick={() => setAlgoliaLanguage('fr')}
                  >
                    🇫🇷 FR
                  </button>
                  <button 
                    className={`lang-btn ${algoliaLanguage === 'pt' ? 'active' : ''}`}
                    onClick={() => setAlgoliaLanguage('pt')}
                  >
                    🇵🇹 PT
                  </button>
                </div>
                <button className="close-algolia-info" onClick={() => setShowAlgoliaInfo(false)}>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="algolia-info-body">
              <div className="algolia-section">
                <h4><i className="fas fa-search"></i> {algoliaTranslations[algoliaLanguage].searchFeatures}</h4>
                
                <div className="feature-subsection">
                  <h5><i className="fas fa-magic"></i> Multi-Index Autocomplete System</h5>
                  <p><strong>Implementación:</strong> Navbar.tsx utiliza múltiples fuentes de datos para autocomplete:</p>
                  <div className="code-block">
                    <code>{`// Multi-index query para suggestions + productos
const multiSearch = searchClient.multipleQueries([
  {
    indexName: 'auto_productos',
    query: searchQuery,
    params: {
      hitsPerPage: 4,
      attributesToRetrieve: ['objectID', 'ecomDescription', 'marca', 'precio', 'imagen']
    }
  },
  {
    indexName: 'auto_productos_query_suggestions', 
    query: searchQuery,
    params: { hitsPerPage: 5 }
  }
]);`}</code>
                  </div>
                  
                  <h5><i className="fas fa-clock"></i> Recent Searches (localStorage)</h5>
                  <p><strong>Almacenamiento:</strong> Las búsquedas recientes se guardan localmente:</p>
                  <div className="code-block">
                    <code>{`// Guardar búsqueda reciente
const saveRecentSearch = (query) => {
  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
  localStorage.setItem('recentSearches', JSON.stringify(updated));
};`}</code>
                  </div>

                  <h5><i className="fas fa-fire"></i> Popular Search Terms</h5>
                  <p><strong>Términos populares:</strong> "Leche", "Pan", "Arroz", "Café", "Aceite" con íconos 🔥</p>
                  <p><strong>Funcionalidad:</strong> Se muestran cuando el campo está vacío para inspirar búsquedas</p>

                  <h5><i className="fas fa-image"></i> Product Suggestions</h5>
                  <p><strong>Visualización:</strong> Productos con imágenes 60x60px, nombre, marca y precio</p>
                  <p><strong>Límite:</strong> Máximo 4 productos para mantener UI limpia</p>
                  <p><strong>Interacción:</strong> Click navega a página de producto individual</p>
                </div>

                <ul>
                  <li><strong>InstantSearch:</strong> {algoliaTranslations[algoliaLanguage].instantSearch}</li>
                  <li><strong>Tolerancia a errores:</strong> {algoliaTranslations[algoliaLanguage].typoTolerance}</li>
                  <li><strong>Sinónimos:</strong> {algoliaTranslations[algoliaLanguage].synonyms}</li>
                  <li><strong>Navegación facetada:</strong> {algoliaTranslations[algoliaLanguage].facetedNavigation}</li>
                </ul>
                <a href="https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/autocomplete/react/" 
                   target="_blank" rel="noopener noreferrer" className="algolia-link">
                  Ver documentación de Autocomplete <i className="fas fa-external-link-alt"></i>
                </a>
              </div>

              <div className="algolia-section">
                <h4><i className="fas fa-chart-line"></i> {algoliaTranslations[algoliaLanguage].analyticsEvents}</h4>
                <div className="event-details">
                  <div className="event-item">
                    <h5>{algoliaTranslations[algoliaLanguage].productViewed}</h5>
                    <p><strong>Evento:</strong> viewedObjectIDs</p>
                    <p><strong>Cuándo:</strong> {algoliaTranslations[algoliaLanguage].whenViewed}</p>
                    <p><code>aa('viewedObjectIDs', {'{'} eventName: 'Product Viewed', objectIDs: [...] {'}'})</code></p>
                  </div>
                  <div className="event-item">
                    <h5>{algoliaTranslations[algoliaLanguage].productClicked}</h5>
                    <p><strong>Evento:</strong> clickedObjectIDs</p>
                    <p><strong>Cuándo:</strong> {algoliaTranslations[algoliaLanguage].whenClicked}</p>
                    <p><code>aa('clickedObjectIDs', {'{'} eventName: 'Product Clicked', objectIDs: [...] {'}'})</code></p>
                  </div>
                  <div className="event-item">
                    <h5>{algoliaTranslations[algoliaLanguage].cartConversion}</h5>
                    <p><strong>Evento:</strong> purchasedObjectIDsAfterSearch</p>
                    <p><strong>Cuándo:</strong> {algoliaTranslations[algoliaLanguage].whenAddedToCart}</p>
                    <p><code>aa('purchasedObjectIDsAfterSearch', {'{'} eventName: 'Product Added to Cart', objectIDs: [...] {'}'})</code></p>
                  </div>
                </div>
                <a href="https://www.algolia.com/doc/guides/sending-events/getting-started/" 
                   target="_blank" rel="noopener noreferrer" className="algolia-link">
                  Ver documentación de eventos <i className="fas fa-external-link-alt"></i>
                </a>
              </div>

              <div className="algolia-section">
                <h4><i className="fas fa-cog"></i> {algoliaTranslations[algoliaLanguage].implementationDetails}</h4>
                <ul>
                  <li><strong>Librería:</strong> React InstantSearch v7.13.7</li>
                  <li><strong>Cliente:</strong> Algoliasearch v5.12.0</li>
                  <li><strong>Página actual:</strong> {algoliaTranslations[algoliaLanguage].currentPage}</li>
                  <li><strong>Funcionalidad:</strong> {algoliaTranslations[algoliaLanguage].functionality}</li>
                </ul>
                <a href="https://www.algolia.com/doc/api-reference/api-methods/browse/" 
                   target="_blank" rel="noopener noreferrer" className="algolia-link">
                  Ver documentación de API <i className="fas fa-external-link-alt"></i>
                </a>
              </div>

              <div className="algolia-section">
                <h4><i className="fas fa-rocket"></i> {algoliaTranslations[algoliaLanguage].performanceBenefits}</h4>
                <ul>
                  <li><strong>Velocidad:</strong> {algoliaTranslations[algoliaLanguage].speed}</li>
                  <li><strong>Escalabilidad:</strong> {algoliaTranslations[algoliaLanguage].scalability}</li>
                  <li><strong>Disponibilidad:</strong> {algoliaTranslations[algoliaLanguage].availability}</li>
                  <li><strong>CDN Global:</strong> {algoliaTranslations[algoliaLanguage].globalCDN}</li>
                  <li><strong>Tiempo real:</strong> {algoliaTranslations[algoliaLanguage].realTime}</li>
                  <li><strong>Móvil optimizado:</strong> {algoliaTranslations[algoliaLanguage].mobileOptimized}</li>
                </ul>
                <a href="https://www.algolia.com/doc/guides/scaling/servers-clusters/" 
                   target="_blank" rel="noopener noreferrer" className="algolia-link">
                  Ver documentación de rendimiento <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </nav>
  );
};

export default Navbar; 