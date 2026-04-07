import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];

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
    const response: ApiResponse<string[]> = {
      data: categories,
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
