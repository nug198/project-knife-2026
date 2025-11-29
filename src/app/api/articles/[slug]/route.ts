import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log('Fetching article with slug:', slug);
    
    // Ambil data dari database menggunakan Prisma
    const article = await prisma.artikel.findFirst({
      where: {
        slug: slug
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

    if (!article) {
      console.log('Article not found for slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Format data untuk response dengan handling NULL
    const formattedArticle = {
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
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { judul, isi, gambar, url_sumber } = body;

    // Cek apakah artikel exists
    const existingArticle = await prisma.artikel.findFirst({
      where: { slug }
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Update artikel
    const updatedArticle = await prisma.artikel.update({
      where: { id_artikel: existingArticle.id_artikel },
      data: {
        judul: judul || existingArticle.judul,
        isi: isi || existingArticle.isi,
        gambar: gambar || existingArticle.gambar,
        url_sumber: url_sumber || existingArticle.url_sumber,
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
        id_artikel: updatedArticle.id_artikel,
        judul: updatedArticle.judul || '',
        slug: updatedArticle.slug || '',
        isi: updatedArticle.isi || '',
        gambar: updatedArticle.gambar || '',
        created_at: updatedArticle.created_at ? updatedArticle.created_at.toISOString() : new Date().toISOString(),
        updated_at: updatedArticle.updated_at ? updatedArticle.updated_at.toISOString() : new Date().toISOString(),
        id_user: updatedArticle.id_user || 0,
        url_sumber: updatedArticle.url_sumber || '',
        user: {
          nama: updatedArticle.users?.nama || 'Unknown',
          avatar: updatedArticle.users?.avatar || ''
        }
      }
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Cek apakah artikel exists
    const existingArticle = await prisma.artikel.findFirst({
      where: { slug }
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Hapus artikel
    await prisma.artikel.delete({
      where: { id_artikel: existingArticle.id_artikel }
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}