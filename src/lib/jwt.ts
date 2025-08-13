import type { JwtUserData } from '@/types/auth';
import { type JWTPayload, SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
const JWT_REFRESH_EXPIRE_DURATION = process.env.JWT_REFRESH_EXPIRES_IN || '1d';
const JWT_EXPIRE_DURATION = process.env.JWT_REFRESH_EXPIRES_IN || '15m';
const alg = 'HS256';

export const signJwt = async (payload: JwtUserData, expiresIn = JWT_EXPIRE_DURATION) => {
  const jwtPayload: JWTPayload = {
    jti: payload.id,
    sub: payload.username,
    role: payload.role,
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);

  return jwt;
};

export const signRefreshJwt = async (payload: JwtUserData, expiresIn = JWT_REFRESH_EXPIRE_DURATION) => {
  const jwtPayload: JWTPayload = {
    jti: payload.id,
    sub: payload.username,
    role: payload.role,
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(REFRESH_SECRET);

  return jwt;
};

export const verifyJwt = async (token: string): Promise<JwtUserData | null> => {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.jti as string,
      username: payload.sub as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
};

export const verifyRefreshJwt = async (token: string): Promise<JwtUserData | null> => {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return {
      id: payload.jti as string,
      username: payload.sub as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
};
