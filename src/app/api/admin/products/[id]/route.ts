import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function untuk menangani params
function getProductId(params: { id: string }): number | null {
  try {
    const productId = parseInt(params.id)
    return isNaN(productId) ? null : productId
  } catch (error) {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    
    console.log('🔄 Fetching product ID:', id)
    
    const productId = getProductId({ id });
    if (!productId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID',
          message: `ID "${id}" is not a valid number`
        },
        { status: 400 }
      )
    }

    const product = await prisma.produk.findUnique({
      where: { id_produk: productId },
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
      }
    })

    if (!product) {
      console.error('❌ Product not found:', productId)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('✅ Product found:', product.nama_produk)
    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('❌ Failed to fetch product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    const productId = getProductId({ id });
    
    if (!productId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID',
          message: `ID "${id}" is not a valid number`
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    const existingProduct = await prisma.produk.findUnique({
      where: { id_produk: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (body.slug && body.slug !== existingProduct.slug) {
      const slugExists = await prisma.produk.findFirst({
        where: {
          slug: body.slug,
          id_produk: { not: productId }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const updatedProduct = await prisma.produk.update({
      where: { id_produk: productId },
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

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    
    console.log('🗑️ DELETE product request for ID:', id)
    
    const productId = getProductId({ id });
    if (!productId) {
      console.error('❌ Invalid product ID:', id)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid product ID',
          message: `ID "${id}" is not a valid number`
        },
        { status: 400 }
      )
    }

    console.log('🔍 Checking if product exists...')
    const existingProduct = await prisma.produk.findUnique({
      where: { id_produk: productId }
    })

    if (!existingProduct) {
      console.error('❌ Product not found:', productId)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found',
          message: `Product with ID ${productId} not found`
        },
        { status: 404 }
      )
    }

    console.log('✅ Product found, deleting with ID:', existingProduct.id_produk)
    
    await prisma.gambar_produk.deleteMany({
      where: { id_produk: productId }
    })

    await prisma.produk.delete({
      where: { id_produk: productId }
    })

    console.log('✅ Product deleted successfully')
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('❌ Failed to delete product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}