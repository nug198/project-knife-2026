import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'

const prisma = new PrismaClient()

// Batasan upload
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MIN_WIDTH = 500;
const MIN_HEIGHT = 500;
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const MAX_IMAGES_PER_PRODUCT = 3;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const image = formData.get('image') as File
    const id_produk = formData.get('id_produk') as string
    const keterangan = formData.get('keterangan') as string
    const urutan = formData.get('urutan') as string

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      )
    }

    if (!id_produk) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const productId = parseInt(id_produk)
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.produk.findUnique({
      where: { id_produk: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate image type
    if (!ALLOWED_FILE_TYPES.includes(image.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 2MB.' 
        },
        { status: 400 }
      )
    }

    // Check current image count for the product
    const currentImageCount = await prisma.gambar_produk.count({
      where: { id_produk: productId }
    })

    if (currentImageCount >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product allowed.` 
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get image dimensions using sharp
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot read image dimensions. File may be corrupted.' 
        },
        { status: 400 }
      )
    }

    if (!metadata || !metadata.width || !metadata.height) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot read image dimensions.' 
        },
        { status: 400 }
      )
    }

    // Validate dimensions
    if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Image dimensions too small. Minimum ${MIN_WIDTH}x${MIN_HEIGHT} pixels.` 
        },
        { status: 400 }
      )
    }

    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Image dimensions too large. Maximum ${MAX_WIDTH}x${MAX_HEIGHT} pixels.` 
        },
        { status: 400 }
      )
    }

    // Create product-specific directory
    const productDir = join(process.cwd(), 'public', 'images', 'products', productId.toString())
    try {
      await mkdir(productDir, { recursive: true })
    } catch (error) {
      // Directory already exists or other error
      console.warn('Could not create directory, might already exist:', error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = image.type.split('/')[1] || 'jpg'
    const filename = `product_${timestamp}.${extension}`
    const filepath = join(productDir, filename)

    // Optimize and save image
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, { // Resize to max 1200px while maintaining aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer()

    await writeFile(filepath, optimizedImage)

    // Save to database
    const imageRecord = await prisma.gambar_produk.create({
      data: {
        id_produk: productId,
        gambar: filename,
        url_gambar: `/images/products/${productId}/${filename}`,
        keterangan: keterangan || '',
        urutan: parseInt(urutan) || (currentImageCount + 1),
      },
    })

    return NextResponse.json({
      success: true,
      data: imageRecord,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Failed to upload image:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}