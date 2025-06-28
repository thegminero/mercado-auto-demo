import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SearchPage from './components/SearchPage';
import HomePage from './components/HomePage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CartModal from './components/CartModal';
import CategoryPage from './components/CategoryPage';
import AllCategoriesPage from './components/AllCategoriesPage';
import { CartProvider } from './contexts/CartContext';
import { InstantSearch } from 'react-instantsearch';
import algoliasearch from 'algoliasearch/lite';
import insights from 'search-insights';

const searchClient = algoliasearch(
  'MWN8IH23ME',
  '4e648074863f9356162d9db95a19efe0'
);

// Initialize insights client once for the entire app
insights('init', {
  appId: 'MWN8IH23ME',
  apiKey: '4e648074863f9356162d9db95a19efe0',
  useCookie: false,
  region: 'us'
});

// Main AppContent component
const AppContent: React.FC = () => {
  const location = useLocation();
  const isCategoryPage = location.pathname.startsWith('/category') || location.pathname.startsWith('/categorias');
  
  return (
    <>
      <Navbar />
      <CartModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/all-categories" element={<AllCategoriesPage />} />
        <Route path="/categorias" element={<AllCategoriesPage />} />
        {/* Category routes - support up to 3 levels */}
        <Route path="/category/:category1" element={<CategoryPage />} />
        <Route path="/category/:category1/:category2" element={<CategoryPage />} />
        <Route path="/category/:category1/:category2/:category3" element={<CategoryPage />} />
        {/* Categorias routes - Spanish version */}
        <Route path="/categorias/:category1" element={<CategoryPage />} />
        <Route path="/categorias/:category1/:category2" element={<CategoryPage />} />
        <Route path="/categorias/:category1/:category2/:category3" element={<CategoryPage />} />
      </Routes>
    </>
  );
};

// Component to get location for InstantSearch key
const AppWithLocation: React.FC = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const query = urlParams.get('q') || '';
  
  // Create initial UI state based on URL
  const initialUiState = query ? {
    auto_productos: {
      query: query
    }
  } : undefined;
  
  console.log('AppWithLocation - URL query:', query, 'initialUiState:', initialUiState);
  
  return (
    <div className="App">
      <CartProvider>
        <InstantSearch 
          searchClient={searchClient} 
          indexName="auto_productos" 
          insights={true}
          {...(initialUiState && { initialUiState } as any)}
          key={`app-${query}-${location.pathname}`}
        >
          <AppContent />
        </InstantSearch>
      </CartProvider>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppWithLocation />
    </Router>
  );
}

export default App;
