import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inline types to avoid monorepo import issues in Vercel Functions
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
}

// Generate mock products
function generateMockProducts(): Product[] {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  const products: Product[] = [];

  // Use seeded random for consistent results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(seededRandom(i) * categories.length)];
    products.push({
      id: `prod-${i}`,
      name: `Product ${i}`,
      description: `This is a high-quality ${category.toLowerCase()} product with excellent features and great value for money.`,
      price: Math.round(seededRandom(i * 2) * 500 * 100) / 100 + 10,
      category,
      imageUrl: `https://placehold.co/300x300?text=Product+${i}`,
      inStock: seededRandom(i * 3) > 0.2,
      rating: Math.round((seededRandom(i * 4) * 2 + 3) * 10) / 10,
      reviewCount: Math.floor(seededRandom(i * 5) * 500),
    });
  }

  return products;
}

const products = generateMockProducts();

function getAllProducts(
  filter?: ProductFilter,
  page = 1,
  pageSize = 12
): PaginatedResponse<Product> {
  let filteredProducts = [...products];

  if (filter) {
    if (filter.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category === filter.category
      );
    }

    if (filter.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        p => p.price >= (filter.minPrice ?? 0)
      );
    }

    if (filter.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        p => p.price <= (filter.maxPrice ?? Infinity)
      );
    }

    if (filter.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(
        p => p.inStock === filter.inStock
      );
    }

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }
  }

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filteredProducts.slice(startIndex, endIndex);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const filter: ProductFilter = {};

    if (req.query.category) {
      filter.category = req.query.category as string;
    }
    if (req.query.minPrice) {
      filter.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.maxPrice = Number(req.query.maxPrice);
    }
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }
    if (req.query.searchTerm) {
      filter.searchTerm = req.query.searchTerm as string;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12;

    const result = getAllProducts(filter, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      data: result,
      success: true,
    };

    return res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(response);
  }
}
