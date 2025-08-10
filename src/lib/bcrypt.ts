import { compare, hash } from 'bcrypt';

const SALT = new TextEncoder().encode(process.env.PEPPER);
const SALT_ROUND = Number(process.env.PEPPER_ROUND);

export const hashWithSalt = async (token: string) => {
  const hashedToken = await hash(token + SALT, SALT_ROUND);
  return hashedToken;
};

export const compareWithSalt = async (token: string, hashedToken: string) => {
  const isMatch = await compare(token + SALT, hashedToken);
  return isMatch;
};

export default {
  hash,
  compare,
};
