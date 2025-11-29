// app/api/auth/change-avatar/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getCurrentUser } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { avatar } = await request.json()

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar harus dipilih' },
        { status: 400 }
      )
    }

    // Update avatar
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { 
        avatar: avatar,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Avatar berhasil diupdate'
    })

  } catch (error) {
    console.error('Update avatar error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}