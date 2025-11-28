import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash un mot de passe avec bcrypt
 * @param password - Le mot de passe en clair
 * @returns Le hash du mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare un mot de passe avec son hash
 * @param password - Le mot de passe en clair
 * @param hash - Le hash à comparer
 * @returns True si le mot de passe correspond, false sinon
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
