import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params
    
    const category = await prisma.kategori.findUnique({
      where: {
        id_kategori: parseInt(id)
      },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params
    const body = await request.json()
    const { nama_kategori, deskripsi, slug } = body

    if (!nama_kategori?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama kategori wajib diisi'
        },
        { status: 400 }
      )
    }

    const existingCategory = await prisma.kategori.findUnique({
      where: {
        id_kategori: parseInt(id)
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found'
        },
        { status: 404 }
      )
    }

    const duplicateCategory = await prisma.kategori.findFirst({
      where: {
        AND: [
          {
            OR: [
              { nama_kategori: nama_kategori.trim() },
              { slug: slug }
            ]
          },
          {
            NOT: {
              id_kategori: parseInt(id)
            }
          }
        ]
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kategori dengan nama atau slug tersebut sudah ada'
        },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.kategori.update({
      where: {
        id_kategori: parseInt(id)
      },
      data: {
        nama_kategori: nama_kategori.trim(),
        deskripsi: deskripsi?.trim() || null,
        slug: slug,
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
      data: updatedCategory
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params

    const existingCategory = await prisma.kategori.findUnique({
      where: {
        id_kategori: parseInt(id)
      },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found'
        },
        { status: 404 }
      )
    }

    if (existingCategory._count.produk > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat menghapus kategori yang memiliki produk'
        },
        { status: 400 }
      )
    }

    await prisma.kategori.delete({
      where: {
        id_kategori: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category'
      },
      { status: 500 }
    )
  }
}