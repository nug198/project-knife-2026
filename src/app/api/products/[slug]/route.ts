import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // PERBAIKAN: params sebagai Promise
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { slug } = await params;

    console.log('🔍 Fetching product with slug:', slug);

    const productId = parseInt(slug);
    const isNumericSlug = !isNaN(productId);

    let product;

    if (isNumericSlug) {
      console.log('🔍 Searching by ID:', productId);
      product = await prisma.produk.findFirst({
        where: {
          OR: [
            { id_produk: productId },
            { slug: slug }
          ],
          status_tampil: true,
        },
        include: {
          kategori: {
            select: {
              id_kategori: true,
              nama_kategori: true,
              slug: true,
            }
          },
          maker: {
            select: {
              id_maker: true,
              nama_maker: true,
              foto_url: true,
              lokasi: true,
            }
          },
          gambar_produk: {
            orderBy: {
              urutan: 'asc',
            },
            select: {
              id_gambar: true,
              gambar: true,
              url_gambar: true,
              urutan: true,
              keterangan: true,
            }
          },
        },
      });
    } else {
      console.log('🔍 Searching by slug:', slug);
      product = await prisma.produk.findFirst({
        where: {
          slug: slug,
          status_tampil: true,
        },
        include: {
          kategori: {
            select: {
              id_kategori: true,
              nama_kategori: true,
              slug: true,
            }
          },
          maker: {
            select: {
              id_maker: true,
              nama_maker: true,
              foto_url: true,
              lokasi: true,
            }
          },
          gambar_produk: {
            orderBy: {
              urutan: 'asc',
            },
            select: {
              id_gambar: true,
              gambar: true,
              url_gambar: true,
              urutan: true,
              keterangan: true,
            }
          },
        },
      });
    }

    if (!product) {
      console.log('❌ Product not found for slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product found:', product.nama_produk);
    console.log('📸 Number of images:', product.gambar_produk.length);

    const transformedProduct = {
      ...product,
      harga: product.harga ? Number(product.harga) : 0,
      panjang_bilah: product.panjang_bilah ? Number(product.panjang_bilah) : null,
      lebar_bilah: product.lebar_bilah ? Number(product.lebar_bilah) : null,
      tebal_bilah: product.tebal_bilah ? Number(product.tebal_bilah) : null,
      berat: product.berat ? Number(product.berat) : null,
      rating: product.rating ? Number(product.rating) : null,
      gambar_produk: product.gambar_produk || []
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}