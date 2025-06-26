// This script fetches all raw_category_hierarchy values from Algolia,
// parses them into a deeply nested tree, and writes them to src/data/categories.generated.ts

const fs = require('fs');
const path = require('path');
const algoliasearch = require('algoliasearch');

const ALGOLIA_APP_ID = 'MWN8IH23ME';
const ALGOLIA_API_KEY = '4e648074863f9356162d9db95a19efe0';
const INDEX_NAME = 'auto_productos';
const OUTPUT_PATH = path.join(__dirname, '../src/data/categories.generated.ts');

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(INDEX_NAME);

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function shouldFilterCategory(categoryName) {
  // Filter out categories containing "Pasillo"
  if (categoryName.toLowerCase().includes('pasillo')) {
    return true;
  }
  
  // Filter out single numbers (0-9)
  if (/^\d$/.test(categoryName.trim())) {
    return true;
  }
  
  // Filter out specific unwanted categories
  const unwantedCategories = [
    'PI', 'MC', 'PT', 'Isla', 'Isla Imp', 'Isla DPV', 
    'Sin Pasill', 'Comidas Pr', 'Cafeteria', 'Rostizado',
    'Panaderia', 'Carnes', 'Pescado', 'Embutidos', 'Verduras',
    'Cajas', 'Cabecera', 'FSF ABA', 'FSF PER', 'Ddc Perec',
    'Temporada', 'INDULGENCIAS', 'AUTO MERCADO', 'Caja 01',
    'Caja 02', 'Caja 03', 'Caja 04', 'Caja 07', 'Caja 08',
    'Caja 09', 'Caja 10', 'Pasillo 01', 'Pasillo 02', 'Pasillo 03',
    'Pasillo 04', 'Pasillo 05', 'Pasillo 06', 'Pasillo 07',
    'Pasillo 08', 'Pasillo 09', 'Pasillo 10', 'Pasillo 11',
    'Pasillo 12', 'Pasillo 13', 'Pasillo 14', 'Pasillo 15'
  ];
  
  if (unwantedCategories.includes(categoryName.trim())) {
    return true;
  }
  
  return false;
}

function addCategory(tree, pathArr, fullPathArr, originalHierarchy) {
  if (pathArr.length === 0) return;
  const [head, ...tail] = pathArr;
  
  // Filter out unwanted categories
  if (shouldFilterCategory(head)) {
    return;
  }
  
  let node = tree.find(cat => cat.name === toTitleCase(head));
  if (!node) {
    // Create the full hierarchy path for this level
    const currentPath = fullPathArr.slice(0, fullPathArr.length - tail.length);
    
    // Use the original Algolia hierarchy value directly
    // For top-level categories, use the first part of the original hierarchy
    let hierarchyValue;
    if (currentPath.length === 1) {
      // Top level category - use the first part of the original hierarchy
      hierarchyValue = originalHierarchy.split(' > ')[0];
    } else {
      // Subcategory - use the parts up to current level from original hierarchy
      const pathParts = originalHierarchy.split(' > ');
      hierarchyValue = pathParts.slice(0, currentPath.length).join(' > ');
    }
    
    node = {
      name: toTitleCase(head), // Convert to title case for display
      slug: slugify(head),
      url: '/categorias/' + currentPath.map(slugify).join('/'),
      hierarchy: hierarchyValue, // Store the exact Algolia hierarchy value
      subcategories: []
    };
    tree.push(node);
  }
  
  // If there are more categories in the path, add them as subcategories
  if (tail.length > 0) {
    addCategory(node.subcategories, tail, fullPathArr, originalHierarchy);
  }
}

function mergeDuplicateCategories(tree) {
  const seen = new Map();
  const result = [];
  
  for (const node of tree) {
    const key = node.name;
    if (seen.has(key)) {
      // Merge subcategories
      const existing = seen.get(key);
      if (node.subcategories) {
        if (!existing.subcategories) {
          existing.subcategories = [];
        }
        // Merge subcategories, avoiding duplicates
        for (const subcat of node.subcategories) {
          const existingSubcat = existing.subcategories.find(s => s.name === subcat.name);
          if (!existingSubcat) {
            existing.subcategories.push(subcat);
          } else if (subcat.subcategories) {
            // Recursively merge nested subcategories
            if (!existingSubcat.subcategories) {
              existingSubcat.subcategories = [];
            }
            for (const nestedSubcat of subcat.subcategories) {
              const existingNested = existingSubcat.subcategories.find(s => s.name === nestedSubcat.name);
              if (!existingNested) {
                existingSubcat.subcategories.push(nestedSubcat);
              }
            }
          }
        }
      }
    } else {
      seen.set(key, node);
      result.push(node);
    }
  }
  
  // Recursively process subcategories
  for (const node of result) {
    if (node.subcategories && node.subcategories.length > 0) {
      node.subcategories = mergeDuplicateCategories(node.subcategories);
    }
  }
  
  return result;
}

function cleanTree(nodes) {
  for (const node of nodes) {
    if (node.subcategories && node.subcategories.length === 0) {
      delete node.subcategories;
    } else if (node.subcategories) {
      cleanTree(node.subcategories);
    }
  }
}

async function main() {
  console.log('Fetching category facets from Algolia...');
  const { facets } = await index.search('', {
    facets: ['raw_category_hierarchy'],
    maxValuesPerFacet: 1000,
    hitsPerPage: 0
  });
  const facetValues = Object.keys(facets.raw_category_hierarchy);

  // Parse into tree
  const tree = [];
  for (const facet of facetValues) {
    const pathArr = facet.split(' > ');
    
    // Check if any part of the path should be filtered
    const shouldFilter = pathArr.some(category => shouldFilterCategory(category));
    if (shouldFilter) {
      continue;
    }
    
    addCategory(tree, pathArr, pathArr, facet);
  }

  // Merge duplicate categories and clean up
  const mergedTree = mergeDuplicateCategories(tree);
  cleanTree(mergedTree);

  // Write to TypeScript file
  const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run scripts/generateCategories.js to update.

export interface CategoryNode {
  name: string;
  slug: string;
  url: string;
  hierarchy: string; // Exact raw_category_hierarchy value from Algolia
  subcategories?: CategoryNode[];
}

export const categories: CategoryNode[] = ${JSON.stringify(mergedTree, null, 2)};
`;
  fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf8');
  console.log('Category tree written to', OUTPUT_PATH);
  console.log('Filtered out unwanted categories, converted to title case, merged duplicates, and stored exact hierarchy values');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 