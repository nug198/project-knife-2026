import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all products
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching all products...')
    
    const products = await prisma.produk.findMany({
      include: {
        kategori: {
          select: {
            id_kategori: true,
            nama_kategori: true,
            slug: true
          }
        },
        maker: {
          select: {
            id_maker: true,
            nama_maker: true
          }
        },
        gambar_produk: {
          select: {
            id_gambar: true,
            gambar: true,
            url_gambar: true,
            keterangan: true,
            urutan: true
          },
          orderBy: {
            urutan: 'asc'
          }
        }
      },
      orderBy: {
        id_produk: 'desc'
      }
    })

    console.log(`✅ Found ${products.length} products`)

    return NextResponse.json({
      success: true,
      data: products
    })

  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// CREATE new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔄 Creating new product:', body.nama_produk)

    // Check if slug already exists
    if (body.slug) {
      const slugExists = await prisma.produk.findFirst({
        where: { slug: body.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Create product
    const newProduct = await prisma.produk.create({
      data: {
        nama_produk: body.nama_produk,
        slug: body.slug,
        harga: body.harga,
        id_kategori: body.id_kategori || null,
        id_maker: body.id_maker || null,
        deskripsi_singkat: body.deskripsi_singkat,
        deskripsi_lengkap: body.deskripsi_lengkap,
        bahan_bilah: body.bahan_bilah,
        bahan_gagang: body.bahan_gagang,
        bahan_sarung: body.bahan_sarung,
        panjang_bilah: body.panjang_bilah,
        lebar_bilah: body.lebar_bilah,
        tebal_bilah: body.tebal_bilah,
        berat: body.berat,
        video_demo: body.video_demo,
        status_tampil: body.status_tampil,
        rating: body.rating,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        kategori: {
          select: {
            id_kategori: true,
            nama_kategori: true
          }
        },
        maker: {
          select: {
            id_maker: true,
            nama_maker: true
          }
        },
        gambar_produk: true
      }
    })

    console.log('✅ Product created successfully:', newProduct.id_produk)

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('❌ Failed to create product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}