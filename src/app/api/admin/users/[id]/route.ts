import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await prisma.users.findUnique({
      where: {
        id_user: parseInt(id)
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { username, password, nama, email, role } = body

    // Validasi
    if (!nama?.trim() || !email?.trim() || !username?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama, username, dan email wajib diisi'
        },
        { status: 400 }
      )
    }

    // Cek apakah user ada
    const existingUser = await prisma.users.findUnique({
      where: {
        id_user: parseInt(id)
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    // Cek duplikat username/email
    const duplicateUser = await prisma.users.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: username.trim() },
              { email: email.trim() }
            ]
          },
          {
            NOT: {
              id_user: parseInt(id)
            }
          }
        ]
      }
    })

    if (duplicateUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User dengan username atau email tersebut sudah ada'
        },
        { status: 400 }
      )
    }

    // Siapkan data update
    const updateData: any = {
      username: username.trim(),
      nama: nama.trim(),
      email: email.trim(),
      role: role || 'admin',
      updated_at: new Date()
    }

    // Jika ada password baru, hash password
    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: {
        id_user: parseInt(id)
      },
      data: updateData,
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
      data: updatedUser,
      message: 'User berhasil diupdate'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cek apakah user ada
    const existingUser = await prisma.users.findUnique({
      where: {
        id_user: parseInt(id)
      },
      include: {
        _count: {
          select: {
            artikel: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    // Cek apakah user memiliki artikel
    if (existingUser._count.artikel > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat menghapus user yang memiliki artikel'
        },
        { status: 400 }
      )
    }

    // Hapus user
    await prisma.users.delete({
      where: {
        id_user: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user'
      },
      { status: 500 }
    )
  }
}