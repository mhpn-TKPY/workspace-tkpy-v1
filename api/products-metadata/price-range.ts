import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Calculate price range from the same seeded random logic
function calculatePriceRange(): { min: number; max: number } {
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const prices: number[] = [];
  for (let i = 1; i <= 50; i++) {
    prices.push(Math.round(seededRandom(i * 2) * 500 * 100) / 100 + 10);
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

const priceRange = calculatePriceRange();

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
    const response: ApiResponse<{ min: number; max: number }> = {
      data: priceRange,
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
