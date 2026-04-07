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

// Generate mock products (same logic as index.ts for consistency)
function generateMockProducts(): Product[] {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  const products: Product[] = [];

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

function getProductById(id: string): Product | null {
  return products.find(p => p.id === id) || null;
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
    const { id } = req.query;
    const productId = Array.isArray(id) ? id[0] : id;

    if (!productId) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Product ID is required',
      };
      return res.status(400).json(response);
    }

    const product = getProductById(productId);

    if (!product) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Product not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Product> = {
      data: product,
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
