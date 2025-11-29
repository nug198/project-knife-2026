import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    // Ambil data dari database menggunakan Prisma
    const articles = await prisma.artikel.findMany({
      include: {
        users: {
          select: {
            nama: true,
            avatar: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Format data untuk response dengan handling NULL
    const formattedArticles = articles.map(article => ({
      id_artikel: article.id_artikel,
      judul: article.judul || '',
      slug: article.slug || '',
      isi: article.isi || '',
      gambar: article.gambar || '',
      created_at: article.created_at ? article.created_at.toISOString() : new Date().toISOString(),
      updated_at: article.updated_at ? article.updated_at.toISOString() : new Date().toISOString(),
      id_user: article.id_user || 0,
      url_sumber: article.url_sumber || '',
      user: {
        nama: article.users?.nama || 'Unknown',
        avatar: article.users?.avatar || ''
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      total: formattedArticles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, isi, gambar, id_user, url_sumber } = body;

    // Validasi required fields
    if (!judul || !isi || !id_user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Judul, isi, dan id_user adalah field yang wajib diisi' 
        },
        { status: 400 }
      );
    }

    // Generate slug dari judul
    const slug = judul
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Buat artikel baru
    const newArticle = await prisma.artikel.create({
      data: {
        judul: judul || '',
        slug: slug || '',
        isi: isi || '',
        gambar: gambar || '',
        id_user: parseInt(id_user),
        url_sumber: url_sumber || '',
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        users: {
          select: {
            nama: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id_artikel: newArticle.id_artikel,
        judul: newArticle.judul || '',
        slug: newArticle.slug || '',
        isi: newArticle.isi || '',
        gambar: newArticle.gambar || '',
        created_at: newArticle.created_at ? newArticle.created_at.toISOString() : new Date().toISOString(),
        updated_at: newArticle.updated_at ? newArticle.updated_at.toISOString() : new Date().toISOString(),
        id_user: newArticle.id_user || 0,
        url_sumber: newArticle.url_sumber || '',
        user: {
          nama: newArticle.users?.nama || 'Unknown',
          avatar: newArticle.users?.avatar || ''
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}