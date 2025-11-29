import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Helper function untuk menentukan URL gambar yang aman
function getSafeImageUrl(fotoUrl: string | null | undefined): string {
  if (!fotoUrl) return '/images/placeholder-maker.jpg';
  
  // Jika sudah full URL, return langsung
  if (fotoUrl.startsWith('http')) return fotoUrl;
  
  // Jika path relatif, pastikan diawali dengan slash
  if (fotoUrl.startsWith('/')) return fotoUrl;
  
  // Jika tidak ada slash, tambahkan
  return `/${fotoUrl}`;
}

export async function GET() {
  try {
    const makers = await prisma.maker.findMany({
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id_maker: true,
        nama_maker: true,
        profil: true,
        lokasi: true,
        kontak: true,
        foto_url: true,
        created_at: true,
        updated_at: true,
        // Tambahkan count produk untuk info
        _count: {
          select: {
            produk: {
              where: {
                status_tampil: true
              }
            }
          }
        }
      }
    });

    // Transformasi data untuk memastikan gambar placeholder digunakan jika perlu
    const transformedMakers = makers.map(maker => ({
      ...maker,
      foto_url: getSafeImageUrl(maker.foto_url),
      produk_count: maker._count.produk
    }));

    return NextResponse.json({
      success: true,
      data: transformedMakers,
      total: makers.length
    });
  } catch (error) {
    console.error('Error fetching makers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch makers' },
      { status: 500 }
    );
  }
}