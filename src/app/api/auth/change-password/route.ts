// app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/src//lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validasi input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Ambil user dari database
    const dbUser = await prisma.users.findUnique({
      where: { id_user: user.id_user }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verifikasi password saat ini
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      )
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { 
        password: hashedNewPassword,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}