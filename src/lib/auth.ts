import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import type { JwtUserData } from '@/types/auth';

/**
 * Extracts and verifies the JWT from the Authorization header.
 * @param request The incoming Request or NextRequest
 * @returns {Promise<{ user?: JwtUserData, error?: NextResponse }>} user or an error response
 */
export async function verifyAuth(request: Request): Promise<{ user?: JwtUserData; error?: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return { error: NextResponse.json({ error: 'Authorization header is required' }, { status: 401 }) };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Invalid authorization format. Expected: Bearer <token>' }, { status: 401 }) };
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      return { error: NextResponse.json({ error: 'Token is required' }, { status: 401 }) };
    }

    const userData = await verifyJwt(token);

    if (!userData) {
      return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
    }

    return { user: userData };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { error: NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 }) };
  }
}
