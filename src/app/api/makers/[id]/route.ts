import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Helper function konsisten
function getSafeImageUrl(fotoUrl: string | null | undefined): string {
  if (!fotoUrl) return '/images/placeholder-maker.jpg';
  if (fotoUrl.startsWith('http')) return fotoUrl;
  if (fotoUrl.startsWith('/')) return fotoUrl;
  return `/${fotoUrl}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // PERBAIKAN: Await params karena sekarang Promise
    const { id } = await params;
    const makerId = parseInt(id);

    console.log('🔍 Fetching maker with ID:', makerId);

    if (isNaN(makerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid maker ID' },
        { status: 400 }
      );
    }

    const maker = await prisma.maker.findUnique({
      where: {
        id_maker: makerId
      },
      include: {
        produk: {
          where: {
            status_tampil: true
          },
          include: {
            gambar_produk: {
              orderBy: {
                urutan: 'asc'
              }
            },
            kategori: {
              select: {
                nama_kategori: true,
                slug: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!maker) {
      console.log('❌ Maker not found:', makerId);
      return NextResponse.json(
        { success: false, error: 'Maker not found' },
        { status: 404 }
      );
    }

    console.log('✅ Maker found:', maker.nama_maker);
    console.log('📸 Maker foto_url from DB:', maker.foto_url);
    console.log('📦 Products count:', maker.produk.length);

    // Transformasi data dengan konsistensi gambar
    const transformedMaker = {
      ...maker,
      foto_url: getSafeImageUrl(maker.foto_url),
      produk: maker.produk.map(product => {
        const gambarUtama = product.gambar_produk.length > 0 
          ? product.gambar_produk[0] 
          : null;
        
        console.log(`🖼️ Product: ${product.nama_produk}`);
        console.log(`   - Gambar utama exists: ${!!gambarUtama}`);
        
        // Tentukan foto_url produk dengan logika yang konsisten
        let fotoUrlProduk = '/images/placeholder-product.jpg';
        
        if (gambarUtama) {
          if (gambarUtama.url_gambar) {
            fotoUrlProduk = gambarUtama.url_gambar;
          } else if (gambarUtama.gambar) {
            // Jika ada nama file gambar, buat path relatif
            fotoUrlProduk = `/images/products/${gambarUtama.gambar}`;
          }
        }
        
        console.log(`   - Final photo URL: ${fotoUrlProduk}`);

        return {
          id_produk: product.id_produk,
          nama_produk: product.nama_produk,
          slug: product.slug,
          harga: product.harga ? Number(product.harga) : null,
          id_kategori: product.id_kategori,
          id_maker: product.id_maker,
          deskripsi_singkat: product.deskripsi_singkat,
          deskripsi_lengkap: product.deskripsi_lengkap,
          bahan_bilah: product.bahan_bilah,
          bahan_gagang: product.bahan_gagang,
          bahan_sarung: product.bahan_sarung,
          panjang_bilah: product.panjang_bilah ? Number(product.panjang_bilah) : null,
          lebar_bilah: product.lebar_bilah ? Number(product.lebar_bilah) : null,
          tebal_bilah: product.tebal_bilah ? Number(product.tebal_bilah) : null,
          berat: product.berat ? Number(product.berat) : null,
          status_tampil: product.status_tampil,
          rating: product.rating ? Number(product.rating) : null,
          created_at: product.created_at?.toISOString() || new Date().toISOString(),
          updated_at: product.updated_at?.toISOString() || new Date().toISOString(),
          foto_url: fotoUrlProduk,
          kategori: product.kategori ? {
            nama_kategori: product.kategori.nama_kategori,
            slug: product.kategori.slug
          } : null
        };
      })
    };

    console.log('🎯 Final transformed maker photo:', transformedMaker.foto_url);
    if (transformedMaker.produk.length > 0) {
      console.log('🎯 First product photo:', transformedMaker.produk[0]?.foto_url);
    }

    return NextResponse.json({
      success: true,
      data: transformedMaker
    });
  } catch (error) {
    console.error('❌ Error fetching maker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maker' },
      { status: 500 }
    );
  }
}