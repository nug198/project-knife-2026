import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function untuk menangani params
function getImageId(params: { id: string }): number | null {
  try {
    const imageId = parseInt(params.id);
    return isNaN(imageId) ? null : imageId;
  } catch (error) {
    return null;
  }
}

// GET image by ID
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    const imageId = getImageId({ id });

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const image = await prisma.gambar_produk.findUnique({
      where: { id_gambar: imageId },
      include: {
        produk: {
          select: {
            id_produk: true,
            nama_produk: true
          }
        }
      }
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image
    });

  } catch (error) {
    console.error('Failed to fetch image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE image
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    const imageId = getImageId({ id });

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if image exists
    const existingImage = await prisma.gambar_produk.findUnique({
      where: { id_gambar: imageId }
    });

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const updatedImage = await prisma.gambar_produk.update({
      where: { id_gambar: imageId },
      data: {
        keterangan: body.keterangan,
        urutan: body.urutan
      },
      include: {
        produk: {
          select: {
            id_produk: true,
            nama_produk: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: 'Image updated successfully'
    });

  } catch (error) {
    console.error('Failed to update image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE image
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    const imageId = getImageId({ id });

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    // Get image data first to delete the file
    const image = await prisma.gambar_produk.findUnique({
      where: { id_gambar: imageId }
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the physical file
    if (image.gambar) {
      try {
        const filepath = join(process.cwd(), 'public/uploads/products', image.gambar);
        await unlink(filepath);
      } catch (fileError) {
        console.warn('Failed to delete physical file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.gambar_produk.delete({
      where: { id_gambar: imageId }
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}