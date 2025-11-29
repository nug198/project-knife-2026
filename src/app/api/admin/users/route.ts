import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id_user: true,
        username: true,
        nama: true,
        email: true,
        avatar: true,
        role: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            artikel: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, nama, email, role, avatar } = body

    // Validasi
    if (!username?.trim() || !password?.trim() || !nama?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Semua field wajib diisi'
        },
        { status: 400 }
      )
    }

    // Cek apakah username sudah ada
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: email.trim() }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User dengan username atau email tersebut sudah ada'
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Buat user baru
    const newUser = await prisma.users.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        nama: nama.trim(),
        email: email.trim(),
        role: role || 'admin',
        avatar: avatar || '/images/avatars/avatar1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id_user: true,
        username: true,
        nama: true,
        email: true,
        avatar: true,
        role: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            artikel: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user'
      },
      { status: 500 }
    )
  }
}