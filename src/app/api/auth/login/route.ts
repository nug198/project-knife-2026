// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { setAuthCookie } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Cari user by username - HAPUS status_aktif dari select
    const user = await prisma.users.findUnique({
      where: { username },
      select: {
        id_user: true,
        username: true,
        nama: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        // HAPUS: status_aktif: true, karena tidak ada di schema
      },
    })

    // PERBAIKAN: Ganti pengecekan status_aktif dengan alternatif
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // PERBAIKAN: Transform data untuk menghandle null values
    const userWithoutPassword = {
      id_user: user.id_user,
      username: user.username,
      nama: user.nama,
      email: user.email,
      role: user.role,
      // Handle avatar yang mungkin null
      avatar: user.avatar || undefined
    }

    // Update last login
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { last_login: new Date() }
    })

    // Set auth cookie dengan JWT
    await setAuthCookie(userWithoutPassword)

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}