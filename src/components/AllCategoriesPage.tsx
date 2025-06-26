import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, CategoryNode } from '../data/categories.generated';
import './AllCategoriesPage.css';

const AllCategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: CategoryNode) => {
    navigate(category.url);
  };

  const handleCategoryExpand = (category: CategoryNode) => {
    // Navigate to a drill-down view or show subcategories
    // For now, we'll navigate to the category page and let users drill down from there
    navigate(category.url);
  };

  return (
    <div className="all-categories-page">
      <div className="all-categories-container">
        {/* Header */}
        <div className="categories-header">
          <button 
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
            Volver
          </button>
          <h1>Todas las Categorías</h1>
          <p>Explora todos nuestros productos organizados por categorías</p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.slug} className="category-card">
              <div className="category-content">
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <p className="category-subcount">
                      {category.subcategories.length} subcategoría{category.subcategories.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                <div className="category-actions">
                  <button 
                    className="btn-view-category"
                    onClick={() => handleCategoryClick(category)}
                    title={`Ver productos de ${category.name}`}
                  >
                    <i className="fas fa-eye"></i>
                    <span>Ver productos</span>
                  </button>
                  
                  {category.subcategories && category.subcategories.length > 0 && (
                    <button 
                      className="btn-explore-subcategories"
                      onClick={() => handleCategoryExpand(category)}
                      title={`Explorar subcategorías de ${category.name}`}
                    >
                      <i className="fas fa-chevron-right"></i>
                      <span>Explorar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesPage; 