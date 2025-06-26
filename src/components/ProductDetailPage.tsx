import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstantSearch } from 'react-instantsearch';
import { useCart } from '../contexts/CartContext';
import insights from 'search-insights';
import { findProductByIdentifier } from '../utils/productUtils';
import { categories } from '../data/categories.generated';
import './ProductDetailPage.css';

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
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { results } = useInstantSearch();
  const { addItem } = useCart();

  const getProductPrice = (product: Product) => {
    const firstStore = Object.values(product.storeDetail)[0];
    if (firstStore) {
      return {
        price: firstStore.amount,
        originalPrice: firstStore.basePrice,
        discountPercentage: firstStore.productDiscountPercentage * 100,
        hasDiscount: firstStore.havedDiscount,
        unitPrice: firstStore.uomPrice,
        inventory: firstStore.hasInvontory
      };
    }
    return {
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      hasDiscount: false,
      unitPrice: '',
      inventory: 0
    };
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Get stored queryID and searchQuery for attribution
    const storedQueryID = localStorage.getItem('algolia_queryID');
    const storedSearchQuery = localStorage.getItem('algolia_searchQuery');
    
    // Add product to cart with attribution data
    if (product) {
      const priceInfo = getProductPrice(product);
      addItem({
        objectID: product.objectID,
        productID: product.productID,
        name: product.ecomDescription,
        price: priceInfo.price,
        image: product.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center',
        category: product.catecom,
        brand: product.marca,
        quantity: quantity,
        queryID: storedQueryID || undefined,
        searchQuery: storedSearchQuery || undefined,
        addedFrom: 'product_detail',
        __autocomplete_indexName: 'auto_productos',
        discount: priceInfo.hasDiscount ? (priceInfo.originalPrice - priceInfo.price) : 0
      });
      
      console.log(`Added ${quantity} of product ${productId} to cart with queryID: ${storedQueryID}`);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (categoryName: string) => {
    // Find the category in our generated categories to get the correct slug
    const findCategoryByCatecom = (cats: any[], targetCatecom: string): any => {
      for (const cat of cats) {
        if (cat.name.toLowerCase() === targetCatecom.toLowerCase()) {
          return cat;
        }
        if (cat.subcategories) {
          const found = findCategoryByCatecom(cat.subcategories, targetCatecom);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategoryByCatecom(categories, categoryName);
    
    if (category) {
      // Use the pre-generated URL from the category data
      navigate(category.url);
    } else {
      // Fallback to manual slug generation
      const fallbackSlug = categoryName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/categorias/${fallbackSlug}`);
    }
  };

  if (!results || !productId) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  // Find product by objectID or slug using the utility function
  const product = findProductByIdentifier(productId, results.hits) as unknown as Product;

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido removido.</p>
        <button 
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  const priceInfo = getProductPrice(product);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button 
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
            Volver
          </button>
          <span className="breadcrumb-separator">/</span>
          <button 
            className="breadcrumb-category"
            onClick={() => handleBreadcrumbClick(product.catecom)}
          >
            {product.catecom}
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-product">{product.ecomDescription}</span>
        </div>

        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.imageUrl || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center'} 
                alt={product.ecomDescription} 
              />
              {/* Product badges */}
              <div className="product-badges">
                {product.isNewProduct && (
                  <span className="badge badge-new">Nuevo</span>
                )}
                {priceInfo.hasDiscount && (
                  <span className="badge badge-discount">-{priceInfo.discountPercentage.toFixed(0)}%</span>
                )}
                {product.isDoublePoint && (
                  <span className="badge badge-points">2x Puntos</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <div className="product-header">
              <div className="product-category">{product.catecom}</div>
              <h1 className="product-title">{product.ecomDescription}</h1>
              <p className="product-brand">{product.marca}</p>
              <p className="product-presentation">{product.productPresentation}</p>
            </div>

            {/* Product Price */}
            <div className="product-price-section">
              {priceInfo.hasDiscount && (
                <div className="original-price">
                  <span className="price-label">Precio original:</span>
                  <span className="price-value">₡{priceInfo.originalPrice?.toLocaleString()}</span>
                </div>
              )}
              <div className="current-price">
                <span className="price-label">Precio:</span>
                <span className="price-value">₡{priceInfo.price?.toLocaleString()}</span>
              </div>
              {priceInfo.unitPrice && (
                <div className="unit-price">
                  <span className="price-label">Precio por unidad:</span>
                  <span className="price-value">{priceInfo.unitPrice}</span>
                </div>
              )}
              {priceInfo.hasDiscount && (
                <div className="discount-info">
                  <span className="discount-label">Ahorras:</span>
                  <span className="discount-value">₡{(priceInfo.originalPrice - priceInfo.price)?.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Product Description */}
            {product.descriptiveParagraph && (
              <div className="product-description">
                <h3>Descripción</h3>
                <p>{product.descriptiveParagraph}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="product-details">
              <h3>Detalles del producto</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Código:</span>
                  <span className="detail-value">{product.productNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">País de origen:</span>
                  <span className="detail-value">{product.originatingCountry}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Disponibilidad:</span>
                  <span className="detail-value">
                    {product.productAvailable ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                {priceInfo.inventory > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Inventario:</span>
                    <span className="detail-value">{priceInfo.inventory} unidades</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="add-to-cart-section">
              <div className="quantity-controls">
                <label htmlFor="quantity">Cantidad:</label>
                <div className="quantity-input">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max={priceInfo.inventory || 99}
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={priceInfo.inventory > 0 && quantity >= priceInfo.inventory}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  className="btn-add-to-cart-large"
                  onClick={handleAddToCart}
                  disabled={!product.productAvailable}
                >
                  <i className="fas fa-shopping-cart"></i>
                  <span>Agregar al carrito</span>
                </button>
                <button className="btn-wishlist-large">
                  <i className="far fa-heart"></i>
                  <span>Agregar a favoritos</span>
                </button>
              </div>

              <div className="total-price">
                <span className="total-label">Total:</span>
                <span className="total-value">₡{(priceInfo.price * quantity)?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 