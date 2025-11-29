import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params
    
    const maker = await prisma.maker.findUnique({
      where: {
        id_maker: parseInt(id)
      },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })

    if (!maker) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maker tidak ditemukan'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: maker
    })
  } catch (error) {
    console.error('Error fetching maker:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengambil data maker'
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
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params
    const body = await request.json()
    const { nama_maker, profil, lokasi, kontak, foto_url } = body

    // Validasi
    if (!nama_maker?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama maker wajib diisi'
        },
        { status: 400 }
      )
    }

    // Cek apakah maker ada
    const existingMaker = await prisma.maker.findUnique({
      where: {
        id_maker: parseInt(id)
      }
    })

    if (!existingMaker) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maker tidak ditemukan'
        },
        { status: 404 }
      )
    }

    // Update maker
    const updatedMaker = await prisma.maker.update({
      where: {
        id_maker: parseInt(id)
      },
      data: {
        nama_maker: nama_maker.trim(),
        profil: profil?.trim() || null,
        lokasi: lokasi?.trim() || null,
        kontak: kontak?.trim() || null,
        foto_url: foto_url?.trim() || null,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMaker,
      message: 'Maker berhasil diupdate'
    })

  } catch (error) {
    console.error('Error updating maker:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengupdate maker'
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
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params

    // Cek apakah maker ada
    const existingMaker = await prisma.maker.findUnique({
      where: {
        id_maker: parseInt(id)
      },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })

    if (!existingMaker) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maker tidak ditemukan'
        },
        { status: 404 }
      )
    }

    // Cek apakah maker memiliki produk
    if (existingMaker._count.produk > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat menghapus maker yang memiliki produk'
        },
        { status: 400 }
      )
    }

    // Hapus maker
    await prisma.maker.delete({
      where: {
        id_maker: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Maker berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting maker:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat menghapus maker'
      },
      { status: 500 }
    )
  }
}