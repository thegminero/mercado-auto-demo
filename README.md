# Auto Mercado React App

A modern React application that replicates the look and feel of Auto Mercado's website with Algolia search integration.

## Features

- **Responsive Design**: Mobile-first approach with Bootstrap 4
- **Algolia Search Integration**: Real-time search with filters and sorting
- **Auto Mercado Branding**: Authentic styling matching the original website
- **Product Catalog**: Display products with images, prices, and descriptions
- **Category Navigation**: Browse products by categories
- **Shopping Cart**: Add products to cart functionality
- **Modern UI/UX**: Smooth animations and hover effects

## Technologies Used

- **React 19** with TypeScript
- **Algolia InstantSearch** for search functionality
- **Bootstrap 4** for responsive layout
- **Font Awesome** for icons
- **Custom CSS** with Auto Mercado branding

## Algolia Configuration

The app is configured with your Algolia credentials:
- **Application ID**: MWN8IH23ME
- **Search API Key**: 4e648074863f9356162d9db95a19efe0
- **Index Name**: automercado_test

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Navigation bar with search
│   ├── Navbar.css          # Navbar styling
│   ├── HomePage.tsx        # Homepage with hero and categories
│   ├── HomePage.css        # Homepage styling
│   ├── SearchPage.tsx      # Search results page
│   └── SearchPage.css      # Search page styling
├── App.tsx                 # Main app component
├── App.css                 # Global styles
└── index.tsx              # App entry point
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd automercado-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Components Overview

### Navbar
- Auto Mercado logo
- Navigation menu
- Search bar with Algolia integration
- User authentication buttons
- Shopping cart icon

### HomePage
- Hero section with search
- Product categories grid
- Featured products section
- Services overview

### SearchPage
- Search results grid
- Filters sidebar (categories, brands)
- Sorting options
- Pagination
- Product cards with add to cart

## Styling

The app uses Auto Mercado's brand colors and typography:
- **Primary Green**: #00a651
- **Dark Green**: #008f47
- **Gray Text**: #4f4f4f
- **Font Family**: BryantPro (Bold, Semibold, Regular)

## Algolia Search Features

- **Real-time Search**: Instant results as you type
- **Faceted Search**: Filter by categories and brands
- **Sorting**: Sort by relevance, price, or name
- **Pagination**: Navigate through search results
- **Highlighting**: Search terms are highlighted in results

## Responsive Design

The app is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (up to 767px)

## Customization

### Adding New Categories
Edit the `categories` array in `HomePage.tsx`:

```typescript
const categories = [
  { name: 'New Category', icon: '🆕', color: '#your-color' },
  // ... existing categories
];
```

### Modifying Search Filters
Update the `RefinementList` components in `SearchPage.tsx` to match your Algolia index attributes.

### Styling Changes
Modify the CSS files to adjust colors, fonts, or layout to match your brand requirements.

## Deployment

The app can be deployed to any static hosting service:

1. Build the app: `npm run build`
2. Upload the `build` folder to your hosting service

Recommended hosting platforms:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
