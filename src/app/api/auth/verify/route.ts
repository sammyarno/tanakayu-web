import { NextRequest, NextResponse } from 'next/server';

import { verifyJwt } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization format. Expected: Bearer <token>' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 401 });
    }

    const userData = await verifyJwt(token);

    if (!userData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
