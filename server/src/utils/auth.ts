import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT token
 * @param payload Data to include in the token
 * @returns JWT token
 */
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
