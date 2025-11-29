// lib/auth.ts
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id_user: number
  username: string
  nama: string
  email: string
  role: string
  avatar?: string | null // TAMBAH | null untuk handle database values
}

export interface TokenPayload {
  id_user: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  avatar?: string;
  iat?: number;
  exp?: number;
}

export function generateToken(user: User): string {
  const payload = {
    id_user: user.id_user,
    username: user.username,
    nama: user.nama,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };

  // PERBAIKAN: Gunakan type assertion untuk options
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    // PERBAIKAN: Tambahkan type assertion untuk return value
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function setAuthCookie(user: User): Promise<void> {
  const token = generateToken(user);
  const cookieStore = await cookies();
  
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}