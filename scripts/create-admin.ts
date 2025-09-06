import 'dotenv/config'
import { db } from '../lib/db'
import { users } from '../drizzle/schema'
import { hashPassword } from '../lib/auth'

async function createDefaultUser() {
  try {
    const hashedPassword = await hashPassword('admin123')
    
    const result = await db.insert(users).values({
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'admin'
    }).returning()

    console.log('✅ Default admin user created:', result[0])
    console.log('📝 Login credentials:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
  } catch (error) {
    console.error('❌ Error creating user:', error)
  }
  
  process.exit(0)
}

createDefaultUser()
