import React, { useState, useEffect } from 'react';
import { Hits } from 'react-instantsearch';
import './HomePage.css';

interface Product {
  objectID: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
}

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const categories = [
    { name: 'Frutas y Verduras', icon: '🥬', color: '#00a651' },
    { name: 'Carnes y Pescados', icon: '🥩', color: '#dc3545' },
    { name: 'Lácteos', icon: '🥛', color: '#17a2b8' },
    { name: 'Panadería', icon: '🍞', color: '#fd7e14' },
    { name: 'Bebidas', icon: '🥤', color: '#6f42c1' },
    { name: 'Limpieza', icon: '🧽', color: '#20c997' },
  ];

  // Mock personalized products for the carousel
  const personalizedProducts = [
    {
      objectID: '1',
      name: 'Leche 2% 1L',
      price: 850,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&crop=center',
      category: 'Lácteos',
      brand: 'Dos Pinos',
      discount: 15
    },
    {
      objectID: '2',
      name: 'Pan Integral',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&crop=center',
      category: 'Panadería',
      brand: 'Bimbo',
      discount: 0
    },
    {
      objectID: '3',
      name: 'Manzanas Rojas',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&crop=center',
      category: 'Frutas',
      brand: 'Fresco',
      discount: 20
    },
    {
      objectID: '4',
      name: 'Yogurt Natural',
      price: 650,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&crop=center',
      category: 'Lácteos',
      brand: 'Dos Pinos',
      discount: 10
    },
    {
      objectID: '5',
      name: 'Aceite de Oliva',
      price: 3200,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop&crop=center',
      category: 'Aceites',
      brand: 'Bertolli',
      discount: 25
    },
    {
      objectID: '6',
      name: 'Cereal Integral',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=300&h=300&fit=crop&crop=center',
      category: 'Cereales',
      brand: 'Kellogg\'s',
      discount: 0
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(personalizedProducts.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, personalizedProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(personalizedProducts.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(personalizedProducts.length / 3) - 1 : prev - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getCurrentProducts = () => {
    const startIndex = currentSlide * 3;
    return personalizedProducts.slice(startIndex, startIndex + 3);
  };

  const PersonalizedProductCard = ({ product }: { product: any }) => (
    <div className="personalized-product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
        <div className="product-overlay">
          <button className="quick-view-btn">
            <i className="fas fa-eye"></i>
          </button>
          <button className="add-to-cart-btn">
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h5 className="product-name">{product.name}</h5>
        <p className="product-brand">{product.brand}</p>
        
        <div className="product-price">
          <span className="current-price">₡{product.price.toLocaleString()}</span>
          {product.discount > 0 && (
            <span className="original-price">
              ₡{(product.price / (1 - product.discount / 100)).toFixed(0)}
            </span>
          )}
        </div>
        
        <button className="add-to-cart-button">
          <i className="fas fa-shopping-cart"></i>
          <span>Agregar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      {/* Banner Section */}
      <section className="banner-section">
        <div className="container">
          <div className="banner-content">
            <h1>Bienvenido a Auto Mercado</h1>
            <p>Tu supermercado de confianza con la mejor calidad y servicio</p>
            <div className="banner-cta">
              <button className="btn-primary">Ver productos</button>
              <button className="btn-secondary">Conocer más</button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Categorías</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card" style={{ borderColor: category.color }}>
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  <span>{category.icon}</span>
                </div>
                <h3 className="category-name">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos para mi Carousel Section */}
      <section className="personalized-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-heart"></i>
              Productos para mí
            </h2>
            <p className="section-subtitle">Recomendaciones personalizadas basadas en tus compras</p>
          </div>
          
          <div className="carousel-container">
            <button 
              className="carousel-btn carousel-btn-prev"
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="carousel-track">
              <div 
                className="carousel-slide"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {getCurrentProducts().map((product) => (
                  <PersonalizedProductCard key={product.objectID} product={product} />
                ))}
              </div>
            </div>
            
            <button 
              className="carousel-btn carousel-btn-next"
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="carousel-dots">
            {Array.from({ length: Math.ceil(personalizedProducts.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-truck"></i>
              </div>
              <h3>Entrega a Domicilio</h3>
              <p>Recibí tus productos en la comodidad de tu hogar</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Pick Up</h3>
              <p>Retirá tus productos en el parqueo de tu Auto Mercado preferido</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Plan A</h3>
              <p>Disfrutá de envíos gratis con nuestra membresía premium</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage; 