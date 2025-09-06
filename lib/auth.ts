import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import { parse } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SALT_ROUNDS = 10

export type UserSession = { id: number; username: string; role: string }

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 生成 JWT Token
export function generateToken(id: number, username: string): string {
  return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '24h' })
}

// 验证 JWT Token
export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string }
    return decoded
  } catch {
    return null
  }
}

// 从请求中获取用户信息
export async function requireUser(req: NextApiRequest): Promise<UserSession> {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) throw new Error('No cookie')
  
  const { session: token } = parse(cookieHeader)
  if (!token) throw new Error('No token')

  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
    id: number
    username: string
  }
  if (!decoded.id) throw new Error('Bad token payload')

  // 这里可以根据需要从数据库获取用户信息
  // 现在先返回基本信息
  return { 
    id: decoded.id, 
    username: decoded.username, 
    role: 'admin' // 暂时所有用户都是 admin
  }
}
