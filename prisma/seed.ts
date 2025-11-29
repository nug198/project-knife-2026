// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Validasi DATABASE_URL
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  try {
    // Hash password
    const password = 'admin1234!'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.users.create({
      data: {
        username: 'fajar',
        password: hashedPassword,
        nama: 'Fajar',
        email: 'nug198@gmail.com',
        avatar: '/images/avatars/avatar1.jpg',
        role: 'admin',
      },
    })

    console.log('✅ User created:', {
      id: user.id_user,
      username: user.username,
      nama: user.nama,
      email: user.email
    })

    console.log('🎉 Seed completed!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })