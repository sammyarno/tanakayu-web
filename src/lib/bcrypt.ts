import { compare, hash } from 'bcrypt';

const SALT = new TextEncoder().encode(process.env.NEXT_PUBLIC_ENCRYPTION_SALT);

export const hashWithSalt = async (token: string) => {
  const hashedToken = await hash(token, SALT.toString());
  return hashedToken;
};

export default {
  hash,
  compare,
};
