// Utility function to create SEO-friendly product slugs
export const createProductSlug = (productName: string, objectID: string): string => {
  const slug = productName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
  
  // Add objectID suffix to ensure uniqueness
  return `${slug}-${objectID.substring(0, 8)}`;
};

// Utility function to extract objectID from slug
export const extractObjectIDFromSlug = (slug: string): string | null => {
  const parts = slug.split('-');
  if (parts.length >= 2) {
    // The last part should be the objectID suffix
    const objectIDSuffix = parts[parts.length - 1];
    return objectIDSuffix;
  }
  return null;
};

// Utility function to find product by slug or objectID
export const findProductByIdentifier = (identifier: string, products: any[]): any => {
  // First, try to find by exact objectID match
  let product = products.find((hit: any) => hit.objectID === identifier);
  
  // If not found by objectID, try to find by slug
  if (!product) {
    const objectIDSuffix = extractObjectIDFromSlug(identifier);
    if (objectIDSuffix) {
      // Find product whose objectID starts with the suffix
      product = products.find((hit: any) => 
        hit.objectID.substring(0, 8) === objectIDSuffix
      );
    }
  }
  
  return product;
}; 