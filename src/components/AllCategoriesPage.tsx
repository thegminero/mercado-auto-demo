import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, CategoryNode } from '../data/categories.generated';
import './AllCategoriesPage.css';

const AllCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const subcategoryCarouselRef = useRef<HTMLDivElement>(null);

  // Category icons mapping for visual appeal
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('bebida') || name.includes('licor')) return '🥤';
    if (name.includes('lácteo') || name.includes('embutido')) return '🥛';
    if (name.includes('abarrote')) return '🥫';
    if (name.includes('panadería') || name.includes('repostería')) return '🍞';
    if (name.includes('snack') || name.includes('golosina')) return '🍿';
    if (name.includes('congelado') || name.includes('refrigerado')) return '🧊';
    if (name.includes('cuidado') || name.includes('belleza')) return '🧴';
    if (name.includes('tienda') || name.includes('hogar')) return '🏠';
    if (name.includes('mascota')) return '🐕';
    return '🛒';
  };

  const handleCategoryClick = (category: CategoryNode) => {
    navigate(category.url);
  };

  const handleCategoryHover = (category: CategoryNode) => {
    setSelectedCategory(category);
  };

  const scrollCarousel = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const scrollAmount = 320;
      const currentScroll = ref.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      ref.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="grocery-categories-page">
      <div className="grocery-container">
        {/* Header */}
        <header className="grocery-header">
          <button 
            className="btn-back-modern"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="header-content">
            <h1>Explorar Categorías</h1>
            <p>Encuentra todo lo que necesitas organizados por categorías</p>
          </div>
        </header>

        {/* Main Categories Carousel */}
        <section className="main-categories-section">
          <div className="section-header">
            <h2>Categorías Principales</h2>
            <div className="carousel-controls">
              <button 
                className="categories-carousel-btn prev"
                onClick={() => scrollCarousel('left', carouselRef)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="categories-carousel-btn next"
                onClick={() => scrollCarousel('right', carouselRef)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="categories-carousel" ref={carouselRef}>
            <div className="categories-track">
              {categories.map((category) => (
                <div 
                  key={category.slug} 
                  className="category-card-modern"
                  onMouseEnter={() => handleCategoryHover(category)}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-icon">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="category-content-modern">
                    <h3 className="category-title">{category.name}</h3>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <p className="category-subtitle">
                        {category.subcategories.length} subcategorías
                      </p>
                    )}
                    <div className="category-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                  <div className="category-hover-effect"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subcategories Preview */}
        {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
          <section className="subcategories-section">
            <div className="section-header">
              <h2>
                <span className="category-icon-small">{getCategoryIcon(selectedCategory.name)}</span>
                {selectedCategory.name}
              </h2>
              <div className="carousel-controls">
                <button 
                  className="categories-carousel-btn prev"
                  onClick={() => scrollCarousel('left', subcategoryCarouselRef)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="categories-carousel-btn next"
                  onClick={() => scrollCarousel('right', subcategoryCarouselRef)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <div className="subcategories-carousel" ref={subcategoryCarouselRef}>
              <div className="subcategories-track">
                {selectedCategory.subcategories.map((subcategory) => (
                  <div 
                    key={subcategory.slug} 
                    className="subcategory-card"
                    onClick={() => handleCategoryClick(subcategory)}
                  >
                    <div className="subcategory-content">
                      <h4 className="subcategory-title">{subcategory.name}</h4>
                      {subcategory.subcategories && subcategory.subcategories.length > 0 && (
                        <p className="subcategory-count">
                          {subcategory.subcategories.length} opciones
                        </p>
                      )}
                    </div>
                    <div className="subcategory-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quick Access Grid */}
        <section className="quick-access-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2>Acceso Rápido</h2>
              <p>Las categorías más populares</p>
            </div>
          </div>
          
          <div className="quick-access-grid">
            {categories.slice(0, 6).map((category) => (
              <div 
                key={`quick-${category.slug}`}
                className="quick-access-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="quick-icon">{getCategoryIcon(category.name)}</div>
                <span className="quick-title">{category.name}</span>
                <i className="fas fa-external-link-alt quick-link-icon"></i>
              </div>
            ))}
          </div>
        </section>

        {/* All Categories Compact List */}
        <section className="all-categories-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2>Todas las Categorías</h2>
              <p>Lista completa de todas nuestras categorías</p>
            </div>
          </div>
          
          <div className="categories-list">
            {categories.map((category) => (
              <div 
                key={`list-${category.slug}`}
                className="category-list-item"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="list-item-content">
                  <span className="list-icon">{getCategoryIcon(category.name)}</span>
                  <div className="list-text">
                    <span className="list-title">{category.name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <span className="list-subtitle">
                        {category.subcategories.length} subcategorías
                      </span>
                    )}
                  </div>
                </div>
                <i className="fas fa-chevron-right list-arrow"></i>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AllCategoriesPage; 