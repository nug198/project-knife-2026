import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'newest';

    console.log('🚀 Fetching products from database...');
    
    // Tentukan sorting berdasarkan parameter
    let orderBy = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { created_at: 'desc' };
        break;
      case 'oldest':
        orderBy = { created_at: 'asc' };
        break;
      case 'price_low':
        orderBy = { harga: 'asc' };
        break;
      case 'price_high':
        orderBy = { harga: 'desc' };
        break;
      case 'name':
        orderBy = { nama_produk: 'asc' };
        break;
      default:
        orderBy = { created_at: 'desc' };
    }

    const products = await prisma.produk.findMany({
      where: {
        status_tampil: true,
      },
      include: {
        kategori: {
          select: {
            id_kategori: true,
            nama_kategori: true,
          }
        },
        maker: {
          select: {
            id_maker: true,
            nama_maker: true,
          }
        },
        gambar_produk: {
          orderBy: {
            urutan: 'asc',
          },
          select: {
            id_gambar: true,
            url_gambar: true,
            urutan: true,
          }
        },
      },
      orderBy: orderBy,
    });

    console.log(`✅ Successfully fetched ${products.length} products`);
    
    // PERBAIKAN: Transform data untuk konsistensi dengan pengecekan null
    const transformedProducts = products.map(product => ({
      ...product,
      // PERBAIKAN: Pastikan kategori dan maker tidak null
      kategori: product.kategori || null,
      maker: product.maker || null,
      harga: product.harga ? Number(product.harga) : 0,
      panjang_bilah: product.panjang_bilah ? Number(product.panjang_bilah) : null,
      lebar_bilah: product.lebar_bilah ? Number(product.lebar_bilah) : null,
      tebal_bilah: product.tebal_bilah ? Number(product.tebal_bilah) : null,
      berat: product.berat ? Number(product.berat) : null,
      // PERBAIKAN: Pastikan gambar_produk selalu array
      gambar_produk: product.gambar_produk || []
    }));
    
    // PERBAIKAN: Log produk yang memiliki masalah data
    const problematicProducts = transformedProducts.filter(p => !p.kategori || !p.maker);
    if (problematicProducts.length > 0) {
      console.warn(`⚠️ Found ${problematicProducts.length} products with missing kategori or maker data`);
      problematicProducts.forEach(p => {
        console.warn(`Product ID ${p.id_produk}: kategori=${!!p.kategori}, maker=${!!p.maker}`);
      });
    }
    
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';