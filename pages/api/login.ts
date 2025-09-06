import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { eq } from 'drizzle-orm'
import { db } from '../../lib/db'
import { users } from '../../drizzle/schema'
import { verifyPassword, generateToken } from '../../lib/auth'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { username, password } = req.body as {
        username: string
        password: string
    }
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' })
    }

    try {
        const userResult = await db
            .select({
                id: users.id,
                username: users.username,
                passwordHash: users.passwordHash,
                role: users.role,
            })
            .from(users)
            .where(eq(users.username, username))
            .limit(1)

        if (userResult.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const user = userResult[0]
        const valid = await verifyPassword(password, user.passwordHash)
        
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = generateToken(user.id, user.username)
        
        res.setHeader(
            'Set-Cookie',
            serialize('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 3600, // 7 days
                path: '/',
            })
        )

        return res.status(200).json({ 
            success: true, 
            id: user.id, 
            username: user.username,
            role: user.role 
        })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
