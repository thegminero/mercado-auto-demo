import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
// Removed InstantSearch hooks - using direct search client instead
import insights from 'search-insights';
import algoliasearch from 'algoliasearch/lite';
import { createProductSlug } from '../utils/productUtils';
import { categories } from '../data/categories.generated';
import './CategoryPage.css';

const searchClient = algoliasearch(
  'MWN8IH23ME',
  '4e648074863f9356162d9db95a19efe0'
);

const productsIndex = searchClient.initIndex('auto_productos');

// Tree-style Category Explorer Component
const HierarchicalCategoryRefinement: React.FC<{ 
  currentPath: string[]; 
}> = ({ currentPath }) => {
  const navigate = useNavigate();

  // Build the navigation state
  const getNavigationState = () => {
    let currentCategories = categories;
    let breadcrumb: any[] = [];

    // Navigate through the path to find current level
    for (let i = 0; i < currentPath.length; i++) {
      const segment = currentPath[i];
      const category = currentCategories.find(cat => 
        cat.slug === segment || slugify(cat.name.toLowerCase()) === segment
      );
      
      if (category) {
        breadcrumb.push(category);
        if (category.subcategories && category.subcategories.length > 0) {
          currentCategories = category.subcategories;
        } else {
          // If no subcategories, we're at a leaf node - show empty
          currentCategories = [];
          break;
        }
      } else {
        break;
      }
    }

    return {
      currentCategories,
      breadcrumb,
      isAtRoot: currentPath.length === 0
    };
  };

  const handleCategoryClick = (category: any) => {
    // Always allow navigation to any category (whether it has subcategories or not)
    const newPath = [...currentPath, category.slug];
    const newUrl = `/categorias/${newPath.join('/')}`;
    navigate(newUrl);
  };

  const handleGoBack = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      if (newPath.length === 0) {
        navigate('/categorias');
      } else {
        const newUrl = `/categorias/${newPath.join('/')}`;
        navigate(newUrl);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      navigate('/categorias');
    } else {
      const newPath = currentPath.slice(0, index + 1);
      const newUrl = `/categorias/${newPath.join('/')}`;
      navigate(newUrl);
    }
  };

  const { currentCategories, breadcrumb, isAtRoot } = getNavigationState();

  return (
    <div className="category-explorer">
      {/* Breadcrumb navigation */}
      <div className="breadcrumb-nav">
        <button 
          className={`breadcrumb-btn ${isAtRoot ? 'active' : ''}`}
          onClick={() => handleBreadcrumbClick(-1)}
        >
          <i className="fas fa-home"></i>
          Categorías
        </button>
        
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <i className="fas fa-chevron-right breadcrumb-separator"></i>
            <button 
              className={`breadcrumb-btn ${index === breadcrumb.length - 1 ? 'active' : ''}`}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Category tree list */}
      <div className="category-tree">
        {!isAtRoot && (
          <button className="tree-item back-item" onClick={handleGoBack}>
            <i className="fas fa-arrow-left tree-icon"></i>
            <span className="tree-label">Volver</span>
          </button>
        )}
        
        {currentCategories.map((category: any) => {
          const hasChildren = category.subcategories && category.subcategories.length > 0;
          
          return (
            <button 
              key={category.slug}
              className={`tree-item ${hasChildren ? 'expandable' : 'leaf'}`}
              onClick={() => handleCategoryClick(category)}
            >
              <i className={`tree-icon ${hasChildren ? 'fas fa-chevron-right' : 'fas fa-circle'}`}></i>
              <span className="tree-label">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {currentCategories.length === 0 && (
        <div className="empty-message">
          <i className="fas fa-folder-open"></i>
          <span>Esta categoría no tiene subcategorías</span>
        </div>
      )}
    </div>
  );
};

// Simple slugify function with accent handling
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

interface CategoryPageProps {
  categoryPath?: string;
}

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
  raw_category_hierarchy: string[];
  hierarchical_categories: {
    lvl0: string[];
    lvl1: string;
    lvl2: string;
  };
  // Additional fields for display
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
  unitPrice?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryPath }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAlgoliaInfo, setShowAlgoliaInfo] = useState(false);
  const [algoliaLang, setAlgoliaLang] = useState<'es' | 'en' | 'fr' | 'pt'>('es');
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ category1?: string; category2?: string; category3?: string }>();

  // Removed useInstantSearch and all custom API calls to prevent duplicate queries

  // Parse category path from URL parameters
  const getCategoryPath = (): string[] => {
    const { category1, category2, category3 } = params;
    const path: string[] = [];
    
    if (category1) path.push(decodeURIComponent(category1));
    if (category2) path.push(decodeURIComponent(category2));
    if (category3) path.push(decodeURIComponent(category3));
    
    return path;
  };

  // Convert category path to Algolia filter format
  const getCategoryFilter = (): string => {
    const path = getCategoryPath();
    if (path.length === 0) return '';
    
    // Convert to title case to match Algolia data (first letter of each word capitalized)
    const titleCasePath = path.map(category => 
      category.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    );
    
    if (path.length === 1) {
      // Level 1: just the category name (title case)
      return `raw_category_hierarchy:"${titleCasePath[0]}"`;
    } else if (path.length === 2) {
      // Level 2: full path from root (title case)
      const fullPath = titleCasePath.join(' > ');
      return `raw_category_hierarchy:"${fullPath}"`;
    } else if (path.length === 3) {
      // Level 3: full path from root (title case)
      const fullPath = titleCasePath.join(' > ');
      return `raw_category_hierarchy:"${fullPath}"`;
    }
    
    return '';
  };

  // Get category breadcrumb
  const getCategoryBreadcrumb = (): { name: string; path: string }[] => {
    const path = getCategoryPath();
    const breadcrumb: { name: string; path: string }[] = [];
    
    path.forEach((category, index) => {
      const categoryPath = path.slice(0, index + 1)
        .map(cat => encodeURIComponent(cat))
        .join('/');
      breadcrumb.push({
        name: category,
        path: `/category/${categoryPath}`
      });
    });
    
    return breadcrumb;
  };

  const getProductPrice = (product: Product) => {
    // Get the first available store price
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
    
    // Check if this product is in the cart
    const cartItem = state.items.find(item => item.objectID === hit.objectID);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    const handleProductClick = () => {
      // Send click event using insights directly
      try {
        insights('clickedObjectIDs', {
          eventName: 'Hit Clicked',
          index: 'auto_productos',
          objectIDs: [hit.objectID],
        } as any);
      } catch (error) {
        console.error('Error sending click event:', error);
      }
      
      // Create SEO-friendly URL
      const productSlug = createProductSlug(hit.ecomDescription, hit.objectID);
      navigate(`/product/${productSlug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigation to product detail
      
      // Add product to cart
      addItem({
        objectID: hit.objectID,
        productID: hit.productID,
        name: hit.ecomDescription,
        price: priceInfo.price,
        image: hit.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center',
        category: hit.catecom,
        brand: hit.marca,
        quantity: 1,
        addedFrom: 'search',
        discount: priceInfo.hasDiscount ? (priceInfo.originalPrice - priceInfo.price) : 0
      });
      
      console.log(`Added product ${hit.objectID} to cart from category page`);
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
        {/* Like button at top left */}
        <button 
          className="btn-wishlist-top"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Handle wishlist functionality
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
          
          {/* Product badges */}
          <div className="product-badges">
            {hit.isNewProduct && (
              <span className="badge badge-new">Nuevo</span>
            )}
            {priceInfo.hasDiscount && (
              <span className="badge badge-discount">
                -{priceInfo.discountPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{hit.ecomDescription}</h3>
          <p className="product-brand">{hit.marca}</p>
          
          <div className="product-price-container">
            {priceInfo.hasDiscount ? (
              <>
                <span className="product-price current">₡{priceInfo.price.toLocaleString()}</span>
                <span className="product-price original">₡{priceInfo.originalPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="product-price">₡{priceInfo.price.toLocaleString()}</span>
            )}
            {priceInfo.unitPrice && (
              <span className="unit-price">{priceInfo.unitPrice}</span>
            )}
          </div>
          
          {/* Cart controls */}
          <div className="cart-controls">
            {quantity === 0 ? (
              <button 
                className="btn-add-to-cart"
                onClick={handleAddToCart}
              >
                <i className="fas fa-plus"></i>
                Agregar
              </button>
            ) : (
              <div className="quantity-controls">
                <button 
                  className="quantity-btn decrease"
                  onClick={handleDecreaseQuantity}
                  title="Disminuir cantidad"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn increase"
                  onClick={handleIncreaseQuantity}
                  title="Aumentar cantidad"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button 
                  className="quantity-btn remove"
                  onClick={handleRemoveItem}
                  title="Eliminar del carrito"
                >
                  <i className="far fa-trash-alt"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  // Direct search client approach - bypasses InstantSearch for category filtering
  const CustomHits = () => {
    const [filteredHits, setFilteredHits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalHits, setTotalHits] = useState(0);
    
    // Memoize the path to prevent infinite re-renders
    const path = useMemo(() => getCategoryPath(), [params.category1, params.category2, params.category3]);
    
    useEffect(() => {
      if (path.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      // Find the matching category in our generated tree to get the exact hierarchy
      const findCategoryByPath = (categories: any[], pathSegments: string[]): any => {
        if (pathSegments.length === 0) return null;
        
        const currentSegment = pathSegments[0];
        const category = categories.find(cat => 
          cat.slug === currentSegment || 
          slugify(cat.name.toLowerCase()) === currentSegment
        );
        
        if (!category) return null;
        
        if (pathSegments.length === 1) {
          return category;
        } else {
          return findCategoryByPath(category.subcategories || [], pathSegments.slice(1));
        }
      };
      
      const matchedCategory = findCategoryByPath(categories, path);
      
      if (matchedCategory) {
        console.log('CustomHits: Found category:', matchedCategory.name);
        console.log('CustomHits: Using hierarchy:', matchedCategory.hierarchy);
        
        const filterValue = `raw_category_hierarchy:${matchedCategory.hierarchy}`;
        console.log('CustomHits: Setting facetFilter:', filterValue);
        
        // Use the search client directly with proper facetFilters
        searchClient.search([
          {
            indexName: 'auto_productos',
            params: {
              facetFilters: [filterValue],
              facets: ['marca'],
              maxValuesPerFacet: 20,
              hitsPerPage: 20
            }
          }
        ]).then(({ results }) => {
          console.log('CustomHits: Direct search results:', results);
          if (results[0] && 'hits' in results[0]) {
            setFilteredHits(results[0].hits);
            setTotalHits(results[0].nbHits);
            
            // Send view events for products displayed
            if (results[0].hits.length > 0) {
              try {
                const objectIDs = results[0].hits.map((hit: any) => hit.objectID);
                console.log('Sending view events for products:', objectIDs);
                
                insights('viewedObjectIDs', {
                  eventName: 'Hits Viewed',
                  index: 'auto_productos',
                  objectIDs: objectIDs,
                  queryID: results[0].queryID,
                } as any);
                
                console.log('View events sent successfully');
              } catch (error) {
                console.error('Error sending view events:', error);
              }
            }
          }
          setIsLoading(false);
        }).catch(error => {
          console.error('CustomHits: Search error:', error);
          setIsLoading(false);
        });
      } else {
        console.warn('CustomHits: No category found for path:', path);
        setIsLoading(false);
      }
    }, [path]);
    
    if (isLoading) {
      return (
        <div className="category-loading">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      );
    }
    
    if (filteredHits.length === 0) {
      return (
        <div className="no-results">
          <h3>No hay productos disponibles en esta categoría</h3>
          <p>La categoría "{path[path.length - 1]?.replace(/-/g, ' ')}" no tiene productos disponibles actualmente.</p>
          <p>Esto puede deberse a que:</p>
          <ul>
            <li>Los productos están temporalmente agotados</li>
            <li>Esta categoría aún no tiene productos asignados</li>
            <li>Los productos se encuentran en una categoría diferente</li>
          </ul>
          <p>Total hits: {totalHits}</p>
          <button onClick={() => navigate('/all-categories')} className="btn-primary">
            Ver todas las categorías
          </button>
        </div>
      );
    }
    
    return (
      <div className="category-results">
        <div className="category-header">
          <div className="search-info">
            <h2>{path[path.length - 1] || 'Categoría'}</h2>
            <p>{filteredHits.length.toLocaleString()} productos encontrados</p>
          </div>
        </div>
        
        <div className="products-grid">
          {filteredHits.map((hit: any) => (
            <Hit key={hit.objectID} hit={hit as Product} sendEvent={() => {}} />
          ))}
        </div>
      </div>
    );
  };

  // OLD CustomHits with custom search - REMOVED to prevent duplicate queries
  const CustomHitsOLD = () => {
    const [filteredHits, setFilteredHits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalHits, setTotalHits] = useState(0);
    
    // Memoize the path to prevent infinite re-renders
    const path = useMemo(() => getCategoryPath(), [params.category1, params.category2, params.category3]);
    
    // Show loading state during search
    const showLoading = isLoading;
    
    // Custom Stats component
    const CustomStats = () => {
      const categoryName = path[path.length - 1] || 'Categoría';
      
      return (
        <div className="search-info">
          <h2>{categoryName}</h2>
          <p>{totalHits.toLocaleString()} productos encontrados</p>
        </div>
      );
    };
    
    useEffect(() => {
      if (path.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      // Find the matching category in our generated tree to get the exact hierarchy
      const findCategoryByPath = (categories: any[], pathSegments: string[]): any => {
        if (pathSegments.length === 0) return null;
        
        const currentSegment = pathSegments[0];
        const category = categories.find(cat => 
          cat.slug === currentSegment || 
          slugify(cat.name.toLowerCase()) === currentSegment
        );
        
        if (!category) return null;
        
        if (pathSegments.length === 1) {
          return category;
        } else {
          return findCategoryByPath(category.subcategories || [], pathSegments.slice(1));
        }
      };
      
      // Search for category anywhere in the tree (not just top level)
      const findCategoryAnywhere = (categories: any[], targetSlug: string): any => {
        for (const category of categories) {
          if (category.slug === targetSlug) {
            return category;
          }
          if (category.subcategories) {
            const found = findCategoryAnywhere(category.subcategories, targetSlug);
            if (found) return found;
          }
        }
        return null;
      };
      
      let matchedCategory = findCategoryByPath(categories, path);
      
      // If not found at the expected path level, search anywhere in the tree
      if (!matchedCategory && path.length === 1) {
        const targetSlug = path[0];
        matchedCategory = findCategoryAnywhere(categories, targetSlug);
        
        if (matchedCategory) {
          console.log('CategoryConfigure: Found category in tree:', matchedCategory.name);
          console.log('CategoryConfigure: Correct URL should be:', matchedCategory.url);
          
          // Redirect to the correct URL
          navigate(matchedCategory.url, { replace: true });
          return;
        }
      }
      
      if (matchedCategory) {
        console.log('CustomHits: Found category:', matchedCategory.name);
        console.log('CustomHits: Using hierarchy:', matchedCategory.hierarchy);
        
        const filterValue = `raw_category_hierarchy:${matchedCategory.hierarchy}`;
        console.log('CustomHits: Setting filter:', filterValue);
        
        // Use the search client directly
        const searchClient = algoliasearch(
          'MWN8IH23ME',
          '4e648074863f9356162d9db95a19efe0'
        );
        
        searchClient.search([
          {
            indexName: 'auto_productos',
            params: {
              facetFilters: [filterValue],
              facets: ['marca'],
              maxValuesPerFacet: 20,
              hitsPerPage: 20
            }
          }
        ]).then(({ results }) => {
          console.log('CustomHits: Direct search results:', results);
          if (results[0] && 'hits' in results[0]) {
            setFilteredHits(results[0].hits);
            setTotalHits(results[0].nbHits);
            
            // Send view events for products displayed
            if (results[0].hits.length > 0) {
              try {
                const objectIDs = results[0].hits.map((hit: any) => hit.objectID);
                console.log('Sending view events for products:', objectIDs);
                
                insights('viewedObjectIDs', {
                  eventName: 'Hits Viewed',
                  index: 'auto_productos',
                  objectIDs: objectIDs,
                  queryID: results[0].queryID,
                } as any);
                
                console.log('View events sent successfully');
              } catch (error) {
                console.error('Error sending view events:', error);
              }
            }
          }
          setIsLoading(false);
        }).catch(error => {
          console.error('CustomHits: Search error:', error);
          setIsLoading(false);
        });
      } else {
        console.warn('CustomHits: No category found for path:', path);
        setIsLoading(false);
      }
    }, [path, navigate]);
    
    if (showLoading) {
      return (
        <div className="loading">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando productos...</p>
        </div>
      );
    }
    
    if (filteredHits.length === 0) {
      return (
        <div className="no-results">
          <p>No se encontraron productos en esta categoría.</p>
          <p>Total hits: {totalHits}</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="category-header">
          <CustomStats />
          <div className="category-actions">
            <button className="btn-view-mode active">
              <i className="fas fa-th"></i>
            </button>
            <button className="btn-view-mode">
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
        
        <div className="products-grid">
          {filteredHits.map((hit: any) => (
            <Hit key={hit.objectID} hit={hit as Product} sendEvent={() => {}} />
          ))}
        </div>
      </>
    );
  };

  const breadcrumb = getCategoryBreadcrumb();

  return (
    <div className="category-page">
      <div className="category-page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <div className="breadcrumb-nav">
            <button 
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left"></i>
              Volver
            </button>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <span className="breadcrumb-separator">/</span>
                <a 
                  href={item.path}
                  className="breadcrumb-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                >
                  {item.name}
                </a>
              </React.Fragment>
            ))}
          </div>
          
          <button 
            className="algolia-info-btn"
            onClick={() => setShowAlgoliaInfo(true)}
            title="Ver información sobre Algolia"
          >
            <i className="fab fa-algolia"></i>
            Algolia
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-toggle">
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="fas fa-filter"></i>
            <span>Filtros</span>
            <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
          </button>
        </div>

        <div className="category-page-content">
          {/* Filters Sidebar */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h4>Filtros</h4>
              <button 
                className="btn-close-filters"
                onClick={() => setShowFilters(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="filter-section">
              <h5>Ordenar por</h5>
              <select className="sort-select">
                <option value="relevance">Más relevantes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name_asc">Nombre A-Z</option>
                <option value="name_desc">Nombre Z-A</option>
              </select>
            </div>

            <div className="filter-section">
              <h5>Categorías</h5>
              <HierarchicalCategoryRefinement 
              currentPath={getCategoryPath()} 
            />
            </div>

            <div className="filter-section">
              <h5>Filtros</h5>
              <div className="filter-placeholder">
                <p>Los filtros de marca y otros filtros se implementarán próximamente.</p>
                <p>Esta sección mostrará filtros dinámicos basados en los productos de la categoría actual.</p>
              </div>
            </div>


          </div>

          {/* Category Results */}
          <div className="category-results">
            <CustomHits />
          </div>
        </div>
      </div>

      {/* Algolia Info Slider */}
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
              <button className="close-algolia-info" onClick={() => setShowAlgoliaInfo(false)}>
                ✕
              </button>
            </div>
          </div>
          
          <div className="algolia-info-body">
            <div className="algolia-section">
              <h4><i className="fas fa-route"></i> {algoliaLang === 'es' ? 'Procesamiento de URL a Filtros' : algoliaLang === 'en' ? 'URL to Filters Processing' : algoliaLang === 'fr' ? 'Traitement URL vers Filtres' : 'Processamento de URL para Filtros'}</h4>
              <div className="code-block">
                <h5>{algoliaLang === 'es' ? 'Ejemplo de URL:' : algoliaLang === 'en' ? 'URL Example:' : algoliaLang === 'fr' ? 'Exemple d\'URL:' : 'Exemplo de URL:'}</h5>
                <code>{`/categorias/abarrotes/horneado-y-complementos`}</code>
              </div>
              
              <div className="code-block">
                <h5>{algoliaLang === 'es' ? 'Procesamiento paso a paso:' : algoliaLang === 'en' ? 'Step-by-step processing:' : algoliaLang === 'fr' ? 'Traitement étape par étape:' : 'Processamento passo a passo:'}</h5>
                <code>{`// 1. Extracción de parámetros URL
const { category1, category2, category3 } = useParams();
// category1: "abarrotes"
// category2: "horneado-y-complementos"
// category3: undefined

// 2. Decodificación y construcción del path
const getCategoryPath = () => {
  const path = [];
  if (category1) path.push(decodeURIComponent(category1));
  if (category2) path.push(decodeURIComponent(category2));
  if (category3) path.push(decodeURIComponent(category3));
  return path; // ["abarrotes", "horneado-y-complementos"]
};

// 3. Conversión a Title Case para Algolia
const titleCasePath = path.map(category => 
  category.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
); // ["Abarrotes", "Horneado Y Complementos"]

// 4. Construcción del filtro Algolia
const filter = \`raw_category_hierarchy:"\${titleCasePath.join(' > ')}"\`;
// Resultado: 'raw_category_hierarchy:"Abarrotes > Horneado Y Complementos"'`}</code>
              </div>
              
              <div className="code-block">
                <h5>{algoliaLang === 'es' ? 'Query Algolia resultante:' : algoliaLang === 'en' ? 'Resulting Algolia query:' : algoliaLang === 'fr' ? 'Requête Algolia résultante:' : 'Query Algolia resultante:'}</h5>
                <code>{`searchClient.multipleQueries([{
  indexName: 'auto_productos',
  query: '', // Búsqueda vacía para categoría
  params: {
    filters: 'raw_category_hierarchy:"Abarrotes > Horneado Y Complementos"',
    facetFilters: [],
    maxValuesPerFacet: 20,
    hitsPerPage: 20
  }
 }])`}</code>
                </div>
                
                <a 
                  href="https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="algolia-link"
                >
                  <i className="fas fa-external-link-alt"></i>
                  {algoliaLang === 'es' ? 'Ver documentación de filtros de Algolia' : algoliaLang === 'en' ? 'View Algolia filtering documentation' : algoliaLang === 'fr' ? 'Voir la documentation de filtrage Algolia' : 'Ver documentação de filtros do Algolia'}
                </a>
              </div>

            <div className="algolia-section">
              <h4><i className="fas fa-cogs"></i> {algoliaLang === 'es' ? 'Configuración de Merchandising Studio' : algoliaLang === 'en' ? 'Merchandising Studio Configuration' : algoliaLang === 'fr' ? 'Configuration Merchandising Studio' : 'Configuração do Merchandising Studio'}</h4>
              
              <div className="feature-subsection">
                <h5><i className="fas fa-lightbulb"></i> {algoliaLang === 'es' ? '¿Por qué un solo atributo?' : algoliaLang === 'en' ? 'Why a single attribute?' : algoliaLang === 'fr' ? 'Pourquoi un seul attribut?' : 'Por que um único atributo?'}</h5>
                <p>{algoliaLang === 'es' ? 
                  'Utilizamos un solo atributo `raw_category_hierarchy` en lugar de atributos separados (category1, category2, category3) para facilitar la gestión de reglas de merchandising:' : 
                  algoliaLang === 'en' ? 
                  'We use a single `raw_category_hierarchy` attribute instead of separate attributes (category1, category2, category3) to make merchandising rule management easier:' : 
                  algoliaLang === 'fr' ? 
                  'Nous utilisons un seul attribut `raw_category_hierarchy` au lieu d\'attributs séparés (category1, category2, category3) pour faciliter la gestion des règles de merchandising:' : 
                  'Usamos um único atributo `raw_category_hierarchy` em vez de atributos separados (category1, category2, category3) para facilitar o gerenciamento de regras de merchandising:'
                }</p>
                
                <div className="benefit-list">
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <strong>{algoliaLang === 'es' ? 'Simplicidad para Merchandisers:' : algoliaLang === 'en' ? 'Simplicity for Merchandisers:' : algoliaLang === 'fr' ? 'Simplicité pour les Merchandisers:' : 'Simplicidade para Merchandisers:'}</strong>
                    <span>{algoliaLang === 'es' ? 
                      'Solo necesitan especificar una condición "Abarrotes > Horneado Y Complementos" en lugar de múltiples condiciones separadas' : 
                      algoliaLang === 'en' ? 
                      'They only need to specify one condition "Abarrotes > Horneado Y Complementos" instead of multiple separate conditions' : 
                      algoliaLang === 'fr' ? 
                      'Ils n\'ont besoin de spécifier qu\'une seule condition "Abarrotes > Horneado Y Complementos" au lieu de plusieurs conditions séparées' : 
                      'Eles só precisam especificar uma condição "Abarrotes > Horneado Y Complementos" em vez de múltiplas condições separadas'
                    }</span>
                  </div>
                  
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <strong>{algoliaLang === 'es' ? 'Menos Errores:' : algoliaLang === 'en' ? 'Fewer Errors:' : algoliaLang === 'fr' ? 'Moins d\'Erreurs:' : 'Menos Erros:'}</strong>
                    <span>{algoliaLang === 'es' ? 
                      'Evita errores de combinación incorrecta de niveles de categoría' : 
                      algoliaLang === 'en' ? 
                      'Avoids errors from incorrect combination of category levels' : 
                      algoliaLang === 'fr' ? 
                      'Évite les erreurs de combinaison incorrecte des niveaux de catégorie' : 
                      'Evita erros de combinação incorreta de níveis de categoria'
                    }</span>
                  </div>
                  
                  <div className="benefit-item">
                    <i className="fas fa-check-circle"></i>
                    <strong>{algoliaLang === 'es' ? 'Escalabilidad:' : algoliaLang === 'en' ? 'Scalability:' : algoliaLang === 'fr' ? 'Évolutivité:' : 'Escalabilidade:'}</strong>
                    <span>{algoliaLang === 'es' ? 
                      'Funciona con cualquier profundidad de categoría sin modificar la estructura' : 
                      algoliaLang === 'en' ? 
                      'Works with any category depth without modifying the structure' : 
                      algoliaLang === 'fr' ? 
                      'Fonctionne avec n\'importe quelle profondeur de catégorie sans modifier la structure' : 
                      'Funciona com qualquer profundidade de categoria sem modificar a estrutura'
                    }</span>
                  </div>
                </div>
              </div>

              <div className="feature-subsection">
                <h5><i className="fas fa-tools"></i> {algoliaLang === 'es' ? 'Ejemplo en Merchandising Studio' : algoliaLang === 'en' ? 'Merchandising Studio Example' : algoliaLang === 'fr' ? 'Exemple Merchandising Studio' : 'Exemplo no Merchandising Studio'}</h5>
                
                <div className="comparison-container">
                  <div className="comparison-bad">
                    <h6><i className="fas fa-times-circle"></i> {algoliaLang === 'es' ? 'Enfoque Complejo (Múltiples Atributos)' : algoliaLang === 'en' ? 'Complex Approach (Multiple Attributes)' : algoliaLang === 'fr' ? 'Approche Complexe (Attributs Multiples)' : 'Abordagem Complexa (Múltiplos Atributos)'}</h6>
                    <div className="code-block">
                      <code>{`// El merchandiser necesitaría crear reglas así:
IF category1 = "Abarrotes" 
AND category2 = "Horneado Y Complementos"
AND category3 IS EMPTY
THEN boost products where marca = "Bimbo"`}</code>
                    </div>
                    <p className="error-note">{algoliaLang === 'es' ? '❌ Propenso a errores, difícil de mantener' : algoliaLang === 'en' ? '❌ Error-prone, difficult to maintain' : algoliaLang === 'fr' ? '❌ Sujet aux erreurs, difficile à maintenir' : '❌ Propenso a erros, difícil de manter'}</p>
                  </div>
                  
                  <div className="comparison-good">
                    <h6><i className="fas fa-check-circle"></i> {algoliaLang === 'es' ? 'Enfoque Simplificado (Un Solo Atributo)' : algoliaLang === 'en' ? 'Simplified Approach (Single Attribute)' : algoliaLang === 'fr' ? 'Approche Simplifiée (Attribut Unique)' : 'Abordagem Simplificada (Atributo Único)'}</h6>
                    <div className="code-block">
                      <code>{`// El merchandiser solo necesita:
IF raw_category_hierarchy = "Abarrotes > Horneado Y Complementos"
THEN boost products where marca = "Bimbo"`}</code>
                    </div>
                    <p className="success-note">{algoliaLang === 'es' ? '✅ Simple, claro, fácil de gestionar' : algoliaLang === 'en' ? '✅ Simple, clear, easy to manage' : algoliaLang === 'fr' ? '✅ Simple, clair, facile à gérer' : '✅ Simples, claro, fácil de gerenciar'}</p>
                  </div>
                </div>
              </div>

              <div className="feature-subsection">
                <h5><i className="fas fa-external-link-alt"></i> {algoliaLang === 'es' ? 'Acceso a Merchandising Studio' : algoliaLang === 'en' ? 'Merchandising Studio Access' : algoliaLang === 'fr' ? 'Accès Merchandising Studio' : 'Acesso ao Merchandising Studio'}</h5>
                <p>{algoliaLang === 'es' ? 
                  'Para gestionar reglas de merchandising basadas en categorías:' : 
                  algoliaLang === 'en' ? 
                  'To manage category-based merchandising rules:' : 
                  algoliaLang === 'fr' ? 
                  'Pour gérer les règles de merchandising basées sur les catégories:' : 
                  'Para gerenciar regras de merchandising baseadas em categorias:'
                }</p>
                
                <a 
                  href="https://www.algolia.com/apps/MWN8IH23ME/rules" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="algolia-link merchandising-link"
                >
                  <i className="fas fa-external-link-alt"></i>
                  {algoliaLang === 'es' ? 'Abrir Merchandising Studio' : algoliaLang === 'en' ? 'Open Merchandising Studio' : algoliaLang === 'fr' ? 'Ouvrir Merchandising Studio' : 'Abrir Merchandising Studio'}
                </a>
                
                <div className="info-note">
                  <p><strong>{algoliaLang === 'es' ? 'Nota:' : algoliaLang === 'en' ? 'Note:' : algoliaLang === 'fr' ? 'Note:' : 'Nota:'}</strong> {algoliaLang === 'es' ? 
                    'En Merchandising Studio, usa el atributo `raw_category_hierarchy` para crear reglas específicas por categoría. Esto permite promocionar productos, ajustar rankings o aplicar filtros automáticos según la categoría que esté visualizando el usuario.' : 
                    algoliaLang === 'en' ? 
                    'In Merchandising Studio, use the `raw_category_hierarchy` attribute to create category-specific rules. This allows you to promote products, adjust rankings, or apply automatic filters based on the category the user is viewing.' : 
                    algoliaLang === 'fr' ? 
                    'Dans Merchandising Studio, utilisez l\'attribut `raw_category_hierarchy` pour créer des règles spécifiques par catégorie. Cela permet de promouvoir des produits, d\'ajuster les classements ou d\'appliquer des filtres automatiques selon la catégorie que l\'utilisateur visualise.' : 
                    'No Merchandising Studio, use o atributo `raw_category_hierarchy` para criar regras específicas por categoria. Isso permite promover produtos, ajustar rankings ou aplicar filtros automáticos baseados na categoria que o usuário está visualizando.'
                  }</p>
                </div>
              </div>

              <div className="feature-subsection">
                <h5><i className="fas fa-info-circle"></i> {algoliaLang === 'es' ? 'Alternativa: Atributo categoryPageID' : algoliaLang === 'en' ? 'Alternative: categoryPageID Attribute' : algoliaLang === 'fr' ? 'Alternative: Attribut categoryPageID' : 'Alternativa: Atributo categoryPageID'}</h5>
                
                <div className="alternative-approach">
                  <p>{algoliaLang === 'es' ? 
                    'Muchas implementaciones de Algolia utilizan el atributo `categoryPageID` en lugar de `raw_category_hierarchy`. Si tu índice contuviera los datos bajo este atributo:' : 
                    algoliaLang === 'en' ? 
                    'Many Algolia implementations use the `categoryPageID` attribute instead of `raw_category_hierarchy`. If your index contained data under this attribute:' : 
                    algoliaLang === 'fr' ? 
                    'De nombreuses implémentations Algolia utilisent l\'attribut `categoryPageID` au lieu de `raw_category_hierarchy`. Si votre index contenait des données sous cet attribut:' : 
                    'Muitas implementações do Algolia usam o atributo `categoryPageID` em vez de `raw_category_hierarchy`. Se seu índice contivesse dados sob este atributo:'
                  }</p>
                  
                  <div className="code-block">
                    <h6>{algoliaLang === 'es' ? 'Estructura alternativa del índice:' : algoliaLang === 'en' ? 'Alternative index structure:' : algoliaLang === 'fr' ? 'Structure d\'index alternative:' : 'Estrutura de índice alternativa:'}</h6>
                    <code>{`// ${algoliaLang === 'es' ? 'Producto con categoryPageID' : algoliaLang === 'en' ? 'Product with categoryPageID' : algoliaLang === 'fr' ? 'Produit avec categoryPageID' : 'Produto com categoryPageID'}
{
  "objectID": "producto-123",
  "ecomDescription": "Pan Integral",
  "categoryPageID": [
    "Abarrotes",
    "Abarrotes > Horneado Y Complementos", 
    "Abarrotes > Horneado Y Complementos > Panes"
  ],
  "categoria_nivel_1": "Abarrotes",
  "categoria_nivel_2": "Horneado Y Complementos",
  "categoria_nivel_3": "Panes"
}`}</code>
                  </div>
                  
                  <h6><i className="fas fa-code"></i> {algoliaLang === 'es' ? 'Cambios requeridos en el código:' : algoliaLang === 'en' ? 'Required code changes:' : algoliaLang === 'fr' ? 'Modifications de code requises:' : 'Mudanças de código necessárias:'}</h6>
                  
                  <div className="code-comparison">
                    <div className="current-code">
                      <h6><i className="fas fa-code"></i> {algoliaLang === 'es' ? 'Actual (raw_category_hierarchy):' : algoliaLang === 'en' ? 'Current (raw_category_hierarchy):' : algoliaLang === 'fr' ? 'Actuel (raw_category_hierarchy):' : 'Atual (raw_category_hierarchy):'}</h6>
                      <div className="code-block">
                        <code>{`// Filtro actual
const filter = \`raw_category_hierarchy:"\${titleCasePath.join(' > ')}"\`;
// ${algoliaLang === 'es' ? 'Resultado' : algoliaLang === 'en' ? 'Result' : algoliaLang === 'fr' ? 'Résultat' : 'Resultado'}: 'raw_category_hierarchy:"Abarrotes > Horneado Y Complementos"'`}</code>
                      </div>
                    </div>
                    
                                          <div className="alternative-code">
                        <h6><i className="fas fa-exchange-alt"></i> {algoliaLang === 'es' ? 'Alternativo (categoryPageID):' : algoliaLang === 'en' ? 'Alternative (categoryPageID):' : algoliaLang === 'fr' ? 'Alternatif (categoryPageID):' : 'Alternativo (categoryPageID):'}</h6>
                        <div className="code-block">
                          <code>{`// Filtro con categoryPageID
const titleCasePath = path.map(category => 
  category.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
);
const fullPath = titleCasePath.join(' > ');
const filter = \`categoryPageID:"\${fullPath}"\`;
// ${algoliaLang === 'es' ? 'Resultado' : algoliaLang === 'en' ? 'Result' : algoliaLang === 'fr' ? 'Résultat' : 'Resultado'}: 
// 'categoryPageID:"Abarrotes > Horneado Y Complementos"'`}</code>
                        </div>
                      </div>
                  </div>
                  
                  <h6><i className="fas fa-cogs"></i> {algoliaLang === 'es' ? 'Merchandising Studio con categoryPageID:' : algoliaLang === 'en' ? 'Merchandising Studio with categoryPageID:' : algoliaLang === 'fr' ? 'Merchandising Studio avec categoryPageID:' : 'Merchandising Studio com categoryPageID:'}</h6>
                  
                  <div className="code-block">
                    <code>{`// ${algoliaLang === 'es' ? 'Regla más simple en Merchandising Studio' : algoliaLang === 'en' ? 'Simpler rule in Merchandising Studio' : algoliaLang === 'fr' ? 'Règle plus simple dans Merchandising Studio' : 'Regra mais simples no Merchandising Studio'}
IF categoryPageID = "Abarrotes > Horneado Y Complementos"
THEN boost products where marca = "Bimbo"

// ${algoliaLang === 'es' ? 'O usar wildcards para categorías padre' : algoliaLang === 'en' ? 'Or use wildcards for parent categories' : algoliaLang === 'fr' ? 'Ou utiliser des wildcards pour les catégories parentes' : 'Ou usar wildcards para categorias pai'}
IF categoryPageID = "Abarrotes"
THEN boost products where isNewProduct = true`}</code>
                  </div>
                  
                  <div className="warning-box">
                    <p><strong>⚠️ {algoliaLang === 'es' ? 'Importante:' : algoliaLang === 'en' ? 'Important:' : algoliaLang === 'fr' ? 'Important:' : 'Importante:'}</strong></p>
                    <ul>
                      <li><strong>{algoliaLang === 'es' ? 'Consistencia de datos:' : algoliaLang === 'en' ? 'Data consistency:' : algoliaLang === 'fr' ? 'Cohérence des données:' : 'Consistência dos dados:'}</strong> {algoliaLang === 'es' ? 'El atributo elegido debe usarse consistentemente en toda la aplicación' : algoliaLang === 'en' ? 'The chosen attribute must be used consistently throughout the application' : algoliaLang === 'fr' ? 'L\'attribut choisi doit être utilisé de manière cohérente dans toute l\'application' : 'O atributo escolhido deve ser usado consistentemente em toda a aplicação'}</li>
                      <li><strong>{algoliaLang === 'es' ? 'Merchandising Studio:' : algoliaLang === 'en' ? 'Merchandising Studio:' : algoliaLang === 'fr' ? 'Merchandising Studio:' : 'Merchandising Studio:'}</strong> {algoliaLang === 'es' ? 'Todas las reglas deben configurarse con el mismo atributo' : algoliaLang === 'en' ? 'All rules must be configured with the same attribute' : algoliaLang === 'fr' ? 'Toutes les règles doivent être configurées avec le même attribut' : 'Todas as regras devem ser configuradas com o mesmo atributo'}</li>
                      <li><strong>{algoliaLang === 'es' ? 'Estructura del índice:' : algoliaLang === 'en' ? 'Index structure:' : algoliaLang === 'fr' ? 'Structure de l\'index:' : 'Estrutura do índice:'}</strong> {algoliaLang === 'es' ? 'Los datos deben indexarse con el formato correcto para el atributo elegido' : algoliaLang === 'en' ? 'Data must be indexed with the correct format for the chosen attribute' : algoliaLang === 'fr' ? 'Les données doivent être indexées avec le format correct pour l\'attribut choisi' : 'Os dados devem ser indexados com o formato correto para o atributo escolhido'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-filter"></i> {algoliaLang === 'es' ? 'Sistema de Filtros Jerárquicos' : algoliaLang === 'en' ? 'Hierarchical Filter System' : algoliaLang === 'fr' ? 'Système de Filtres Hiérarchiques' : 'Sistema de Filtros Hierárquicos'}</h4>
              
              <div className="feature-subsection">
                <h5><i className="fas fa-layer-group"></i> {algoliaLang === 'es' ? 'Estructura de Datos de Categoría' : algoliaLang === 'en' ? 'Category Data Structure' : algoliaLang === 'fr' ? 'Structure de Données de Catégorie' : 'Estrutura de Dados de Categoria'}</h5>
                <div className="code-block">
                  <code>{`// Estructura en el índice Algolia
{
  "objectID": "producto-123",
  "ecomDescription": "Pan Integral",
  "raw_category_hierarchy": [
    "Abarrotes",
    "Abarrotes > Horneado Y Complementos", 
    "Abarrotes > Horneado Y Complementos > Panes"
  ],
  "hierarchical_categories": {
    "lvl0": ["Abarrotes"],
    "lvl1": "Abarrotes > Horneado Y Complementos",
    "lvl2": "Abarrotes > Horneado Y Complementos > Panes"
  }
}`}</code>
                </div>
              </div>

              <div className="feature-subsection">
                <h5><i className="fas fa-search"></i> {algoliaLang === 'es' ? 'Lógica de Filtrado por Nivel' : algoliaLang === 'en' ? 'Level-based Filtering Logic' : algoliaLang === 'fr' ? 'Logique de Filtrage par Niveau' : 'Lógica de Filtragem por Nível'}</h5>
                <ul>
                                     <li><strong>{algoliaLang === 'es' ? 'Nivel 1:' : algoliaLang === 'en' ? 'Level 1:' : algoliaLang === 'fr' ? 'Niveau 1:' : 'Nível 1:'}</strong> {algoliaLang === 'es' ? 'Solo categoría principal' : algoliaLang === 'en' ? 'Main category only' : algoliaLang === 'fr' ? 'Catégorie principale seulement' : 'Apenas categoria principal'} <code>raw_category_hierarchy:"Abarrotes"</code></li>
                   <li><strong>{algoliaLang === 'es' ? 'Nivel 2:' : algoliaLang === 'en' ? 'Level 2:' : algoliaLang === 'fr' ? 'Niveau 2:' : 'Nível 2:'}</strong> {algoliaLang === 'es' ? 'Ruta completa hasta subcategoría' : algoliaLang === 'en' ? 'Full path to subcategory' : algoliaLang === 'fr' ? 'Chemin complet vers sous-catégorie' : 'Caminho completo para subcategoria'} <code>raw_category_hierarchy:"Abarrotes {'>'}  Horneado Y Complementos"</code></li>
                   <li><strong>{algoliaLang === 'es' ? 'Nivel 3:' : algoliaLang === 'en' ? 'Level 3:' : algoliaLang === 'fr' ? 'Niveau 3:' : 'Nível 3:'}</strong> {algoliaLang === 'es' ? 'Ruta completa hasta categoría específica' : algoliaLang === 'en' ? 'Full path to specific category' : algoliaLang === 'fr' ? 'Chemin complet vers catégorie spécifique' : 'Caminho completo para categoria específica'} <code>raw_category_hierarchy:"Abarrotes {'>'} Horneado Y Complementos {'>'} Panes"</code></li>
                </ul>
              </div>

              <div className="feature-subsection">
                <h5><i className="fas fa-tags"></i> {algoliaLang === 'es' ? 'Filtros Adicionales Disponibles' : algoliaLang === 'en' ? 'Additional Available Filters' : algoliaLang === 'fr' ? 'Filtres Supplémentaires Disponibles' : 'Filtros Adicionais Disponíveis'}</h5>
                <ul>
                  <li><strong>marca:</strong> {algoliaLang === 'es' ? 'Filtros por marca de producto' : algoliaLang === 'en' ? 'Product brand filters' : algoliaLang === 'fr' ? 'Filtres par marque de produit' : 'Filtros por marca do produto'}</li>
                  <li><strong>productAvailable:</strong> {algoliaLang === 'es' ? 'Solo productos disponibles' : algoliaLang === 'en' ? 'Available products only' : algoliaLang === 'fr' ? 'Produits disponibles seulement' : 'Apenas produtos disponíveis'}</li>
                  <li><strong>isNewProduct:</strong> {algoliaLang === 'es' ? 'Productos nuevos' : algoliaLang === 'en' ? 'New products' : algoliaLang === 'fr' ? 'Nouveaux produits' : 'Produtos novos'}</li>
                  <li><strong>storeDetail.havedDiscount:</strong> {algoliaLang === 'es' ? 'Productos con descuento' : algoliaLang === 'en' ? 'Discounted products' : algoliaLang === 'fr' ? 'Produits en promotion' : 'Produtos com desconto'}</li>
                </ul>
              </div>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-chart-line"></i> {algoliaLang === 'es' ? 'Eventos de Analytics Detallados' : algoliaLang === 'en' ? 'Detailed Analytics Events' : algoliaLang === 'fr' ? 'Événements Analytics Détaillés' : 'Eventos de Analytics Detalhados'}</h4>
              
              <div className="event-item">
                <h5><i className="fas fa-eye"></i> {algoliaLang === 'es' ? 'Productos Visualizados en Categoría' : algoliaLang === 'en' ? 'Category Products Viewed' : algoliaLang === 'fr' ? 'Produits de Catégorie Vus' : 'Produtos de Categoria Visualizados'}</h5>
                <p><strong>{algoliaLang === 'es' ? 'Evento:' : algoliaLang === 'en' ? 'Event:' : algoliaLang === 'fr' ? 'Événement:' : 'Evento:'}</strong> viewedObjectIDs</p>
                <p><strong>{algoliaLang === 'es' ? 'Implementación:' : algoliaLang === 'en' ? 'Implementation:' : algoliaLang === 'fr' ? 'Implémentation:' : 'Implementação:'}</strong> CustomHits.tsx</p>
                <div className="code-block">
                  <code>{`// Envío automático al cargar resultados
if (results[0].hits.length > 0) {
  const objectIDs = results[0].hits.map(hit => hit.objectID);
  
  insights('viewedObjectIDs', {
    eventName: 'Hits Viewed',
    objectIDs: objectIDs,
    queryID: results[0].queryID, // ID de la query de categoría
  });
}`}</code>
                </div>
              </div>

              <div className="event-item">
                <h5><i className="fas fa-mouse-pointer"></i> {algoliaLang === 'es' ? 'Productos Clickeados desde Categoría' : algoliaLang === 'en' ? 'Products Clicked from Category' : algoliaLang === 'fr' ? 'Produits Cliqués depuis Catégorie' : 'Produtos Clicados da Categoria'}</h5>
                <p><strong>{algoliaLang === 'es' ? 'Evento:' : algoliaLang === 'en' ? 'Event:' : algoliaLang === 'fr' ? 'Événement:' : 'Evento:'}</strong> clickedObjectIDsAfterSearch</p>
                <p><strong>{algoliaLang === 'es' ? 'Implementación:' : algoliaLang === 'en' ? 'Implementation:' : algoliaLang === 'fr' ? 'Implémentation:' : 'Implementação:'}</strong> Hit.tsx - handleProductClick()</p>
                <div className="code-block">
                  <code>{`// Al hacer clic en producto para ir a detalle
const handleProductClick = () => {
  insights('clickedObjectIDsAfterSearch', {
    eventName: 'Hit Clicked',
    objectIDs: [hit.objectID],
    queryID: categoryQueryID, // QueryID de la búsqueda de categoría
    positions: [index + 1] // Posición en los resultados
  });
  
  navigate(\`/product/\${productSlug}\`);
};`}</code>
                </div>
              </div>

              <div className="event-item">
                <h5><i className="fas fa-shopping-cart"></i> {algoliaLang === 'es' ? 'Conversión: Agregar al Carrito' : algoliaLang === 'en' ? 'Conversion: Add to Cart' : algoliaLang === 'fr' ? 'Conversion: Ajouter au Panier' : 'Conversão: Adicionar ao Carrinho'}</h5>
                <p><strong>{algoliaLang === 'es' ? 'Evento:' : algoliaLang === 'en' ? 'Event:' : algoliaLang === 'fr' ? 'Événement:' : 'Evento:'}</strong> purchasedObjectIDsAfterSearch</p>
                <p><strong>{algoliaLang === 'es' ? 'Implementación:' : algoliaLang === 'en' ? 'Implementation:' : algoliaLang === 'fr' ? 'Implémentation:' : 'Implementação:'}</strong> CartContext.tsx - addItem()</p>
                
                <div className="code-block">
                  <h5>{algoliaLang === 'es' ? 'Estructura del Evento (API Oficial):' : algoliaLang === 'en' ? 'Event Structure (Official API):' : algoliaLang === 'fr' ? 'Structure d\'Événement (API Officielle):' : 'Estrutura do Evento (API Oficial):'}</h5>
                  <code>{`// Estructura oficial Algolia Insights API
aa('purchasedObjectIDsAfterSearch', {
  "events": [{
    "eventName": "Products Added To Cart",
    "eventType": "conversion",
    "eventSubtype": "addToCart",
    "objectIDs": ["product-123"],
    "objectData": [{
      "price": 2500,
      "quantity": 1
    }],
    "currency": "CRC",
    "queryID": "7dfe2ada7bca48bdd0629649df0bee07"
  }]
});`}</code>
                </div>

                <div className="code-block">
                  <h5>{algoliaLang === 'es' ? 'Implementación en CategoryPage:' : algoliaLang === 'en' ? 'CategoryPage Implementation:' : algoliaLang === 'fr' ? 'Implémentation CategoryPage:' : 'Implementação CategoryPage:'}</h5>
                  <code>{`// Al agregar producto al carrito desde categoría
const handleAddToCart = () => {
  // 1. Agregar al carrito local (datos internos)
  addItem({
    objectID: hit.objectID,
    name: hit.ecomDescription, // Solo para UI
    price: priceInfo.price,
    addedFrom: 'category', // Tracking interno
    queryID: categoryQueryID
  });
  
  // 2. Enviar evento de conversión (API oficial)
  aa('purchasedObjectIDsAfterSearch', {
    "events": [{
      "eventName": "Products Added To Cart",
      "eventType": "conversion", 
      "eventSubtype": "addToCart",
      "objectIDs": [hit.objectID],
      "objectData": [{
        "price": priceInfo.price,
        "quantity": 1
      }],
      "currency": "CRC",
      "queryID": categoryQueryID
    }]
  });
};`}</code>
                </div>

                <div className="warning-box">
                  <p><strong>⚠️ {algoliaLang === 'es' ? 'Importante:' : algoliaLang === 'en' ? 'Important:' : algoliaLang === 'fr' ? 'Important:' : 'Importante:'}</strong></p>
                  <ul>
                    <li><strong>{algoliaLang === 'es' ? 'Datos enviados a Algolia:' : algoliaLang === 'en' ? 'Data sent to Algolia:' : algoliaLang === 'fr' ? 'Données envoyées à Algolia:' : 'Dados enviados para Algolia:'}</strong> objectIDs, objectData (price, quantity), currency, queryID</li>
                    <li><strong>{algoliaLang === 'es' ? 'Datos internos (NO enviados):' : algoliaLang === 'en' ? 'Internal data (NOT sent):' : algoliaLang === 'fr' ? 'Données internes (NON envoyées):' : 'Dados internos (NÃO enviados):'}</strong> name, addedFrom, image, brand</li>
                  </ul>
                </div>
              </div>

              <div className="event-item">
                <h5><i className="fas fa-filter"></i> {algoliaLang === 'es' ? 'Filtros de Categoría Aplicados' : algoliaLang === 'en' ? 'Category Filters Applied' : algoliaLang === 'fr' ? 'Filtres de Catégorie Appliqués' : 'Filtros de Categoria Aplicados'}</h5>
                <p><strong>{algoliaLang === 'es' ? 'Evento:' : algoliaLang === 'en' ? 'Event:' : algoliaLang === 'fr' ? 'Événement:' : 'Evento:'}</strong> clickedFilters</p>
                <p><strong>{algoliaLang === 'es' ? 'Tipos de filtro:' : algoliaLang === 'en' ? 'Filter types:' : algoliaLang === 'fr' ? 'Types de filtre:' : 'Tipos de filtro:'}</strong></p>
                <ul>
                  <li><strong>Jerárquicos:</strong> <code>hierarchical_categories.lvl0</code>, <code>hierarchical_categories.lvl1</code>, <code>hierarchical_categories.lvl2</code></li>
                  <li><strong>Marca:</strong> <code>marca</code></li>
                  <li><strong>Disponibilidad:</strong> <code>productAvailable</code></li>
                  <li><strong>Descuentos:</strong> <code>storeDetail.havedDiscount</code></li>
                </ul>
                <div className="code-block">
                  <code>{`// Ejemplo de evento de filtro jerárquico
insights('clickedFilters', {
  eventName: 'Hierarchical Filter Applied',
  filters: ['hierarchical_categories.lvl1:Abarrotes > Horneado Y Complementos'],
  queryID: categoryQueryID
});`}</code>
                </div>
              </div>
              
              <a 
                href="https://www.algolia.com/doc/guides/sending-events/implementing-events/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaLang === 'es' ? 'Ver documentación de eventos de categoría' : algoliaLang === 'en' ? 'View category events documentation' : algoliaLang === 'fr' ? 'Voir la documentation des événements de catégorie' : 'Ver documentação de eventos de categoria'}
              </a>
            </div>

            <div className="algolia-section">
              <h4><i className="fas fa-cogs"></i> {algoliaLang === 'es' ? 'Implementación Técnica' : algoliaLang === 'en' ? 'Technical Implementation' : algoliaLang === 'fr' ? 'Implémentation Technique' : 'Implementação Técnica'}</h4>
              <ul>
                <li><strong>{algoliaLang === 'es' ? 'Librería:' : algoliaLang === 'en' ? 'Library:' : algoliaLang === 'fr' ? 'Bibliothèque:' : 'Biblioteca:'}</strong> React InstantSearch v7.13.7</li>
                <li><strong>{algoliaLang === 'es' ? 'Cliente:' : algoliaLang === 'en' ? 'Client:' : algoliaLang === 'fr' ? 'Client:' : 'Cliente:'}</strong> Algoliasearch v5.12.0</li>
                <li><strong>{algoliaLang === 'es' ? 'Página actual:' : algoliaLang === 'en' ? 'Current Page:' : algoliaLang === 'fr' ? 'Page Actuelle:' : 'Página Atual:'}</strong> {algoliaLang === 'es' ? 'Página de Categoría' : algoliaLang === 'en' ? 'Category Page' : algoliaLang === 'fr' ? 'Page de Catégorie' : 'Página de Categoria'}</li>
                <li><strong>{algoliaLang === 'es' ? 'Funcionalidad:' : algoliaLang === 'en' ? 'Functionality:' : algoliaLang === 'fr' ? 'Fonctionnalité:' : 'Funcionalidade:'}</strong> {algoliaLang === 'es' ? 'Navegación por categorías y filtros' : algoliaLang === 'en' ? 'Category navigation and filtering' : algoliaLang === 'fr' ? 'Navigation par catégories et filtrage' : 'Navegação por categorias e filtros'}</li>
              </ul>
              
              <a 
                href="https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/hierarchical-menu/react/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="algolia-link"
              >
                <i className="fas fa-external-link-alt"></i>
                {algoliaLang === 'es' ? 'Ver documentación de menús jerárquicos' : algoliaLang === 'en' ? 'View hierarchical menu documentation' : algoliaLang === 'fr' ? 'Voir la documentation des menus hiérarchiques' : 'Ver documentação de menus hierárquicos'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 