// src/app/api/process-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const type = searchParams.get('type') as 'normal' | 'zoom' | 'thumbnail' | 'portrait' || 'normal';

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL gambar diperlukan' }, { status: 400 });
    }

    let imageBuffer: Buffer;

    // Decode URL
    const decodedUrl = decodeURIComponent(imageUrl);

    // Check jika ini local image
    if (decodedUrl.startsWith('/') || !decodedUrl.includes('://')) {
      // Handle local image
      const basePath = process.cwd();
      let imagePath: string;

      if (decodedUrl.startsWith('/images/')) {
        imagePath = path.join(basePath, 'public', decodedUrl);
      } else if (decodedUrl.startsWith('/')) {
        imagePath = path.join(basePath, 'public', decodedUrl);
      } else {
        imagePath = path.join(basePath, 'public', '/images/', decodedUrl);
      }

      try {
        imageBuffer = await fs.readFile(imagePath);
      } catch (error) {
        console.error('❌ Failed to read local image:', imagePath);
        return getPlaceholderImage();
      }
    } else {
      // Handle remote image
      let validatedUrl: string;
      try {
        validatedUrl = new URL(decodedUrl).toString();
      } catch {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        validatedUrl = decodedUrl.startsWith('/') 
          ? `${baseUrl}${decodedUrl}`
          : `${baseUrl}/${decodedUrl}`;
      }

      console.log('🔄 Fetching image from:', validatedUrl);
      
      const response = await fetch(validatedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageProcessor/1.0)',
        },
      });
      
      if (!response.ok) {
        console.error('❌ Failed to fetch image:', response.status, response.statusText);
        return getPlaceholderImage();
      }

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    console.log('📊 Original image size:', imageBuffer.length, 'bytes');

    // Process gambar dengan Sharp
    let sharpInstance = sharp(imageBuffer);

    // Get metadata
    const metadata = await sharpInstance.metadata();
    console.log('📐 Image metadata:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    });

    // Resize berdasarkan type
    switch (type) {
      case 'zoom':
        sharpInstance = sharpInstance.resize(1650, 1200, {
          fit: 'inside',
          withoutEnlargement: false
        });
        break;
      case 'thumbnail':
        sharpInstance = sharpInstance.resize(100, 100, {
          fit: 'cover',
          position: 'center'
        });
        break;
      case 'portrait':
        sharpInstance = sharpInstance.resize(null, 400, {
          fit: 'inside',
          withoutEnlargement: false
        });
        break;
      default:
        sharpInstance = sharpInstance.resize(550, 400, {
          fit: 'inside',
          withoutEnlargement: false
        });
    }

    // Set quality
    let quality = 80;
    if (type === 'thumbnail') quality = 70;
    if (type === 'zoom') quality = 90;

    const processedBuffer = await sharpInstance
      .webp({ quality })
      .toBuffer();

    console.log('✅ Processed image size:', processedBuffer.length, 'bytes');

    // Convert ke Uint8Array untuk response
    const uint8Array = new Uint8Array(processedBuffer);
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': processedBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Error processing image:', error);
    return getPlaceholderImage();
  }
}

// Helper function untuk placeholder
async function getPlaceholderImage() {
  try {
    const basePath = process.cwd();
    const placeholderPath = path.join(basePath, 'public', '/images/placeholder-product.jpg');
    const placeholderBuffer = await fs.readFile(placeholderPath);
    
    const processedPlaceholder = await sharp(placeholderBuffer)
      .resize(550, 400, { fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    const uint8Array = new Uint8Array(processedPlaceholder);
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('❌ Even placeholder failed:', error);
    return NextResponse.json(
      { error: 'Gagal memproses gambar' }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';