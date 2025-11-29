import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.kategori.findMany({
      include: {
        _count: {
          select: {
            produk: true
          }
        },
        produk: {
          take: 1, // Ambil 1 produk pertama untuk gambar
          select: {
            gambar_produk: {
              take: 1, // Ambil 1 gambar pertama dari produk
              select: {
                url_gambar: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nama_kategori, deskripsi, slug } = body

    // Validasi
    if (!nama_kategori?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama kategori wajib diisi'
        },
        { status: 400 }
      )
    }

    // Cek apakah kategori sudah ada
    const existingCategory = await prisma.kategori.findFirst({
      where: {
        OR: [
          { nama_kategori: nama_kategori.trim() },
          { slug: slug }
        ]
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kategori dengan nama atau slug tersebut sudah ada'
        },
        { status: 400 }
      )
    }

    // Buat kategori baru
    const newCategory = await prisma.kategori.create({
      data: {
        nama_kategori: nama_kategori.trim(),
        deskripsi: deskripsi?.trim() || null,
        slug: slug,
        created_at: new Date(),
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
      data: newCategory
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category'
      },
      { status: 500 }
    )
  }
}