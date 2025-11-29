import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching article stats...')
    
    let totalArticles = 0;
    
    try {
      // Coba model 'artikel' (bahasa Indonesia)
      totalArticles = await prisma.artikel.count();
      console.log('✅ Found artikel model, count:', totalArticles)
    } catch (modelError) {
      console.log('❌ Model artikel tidak ditemukan, mencoba article...')
      try {
        // Coba model 'article' (bahasa Inggris)
        // totalArticles = await prisma.article.count(); // PERBAIKAN: ganti prisma.artikel menjadi prisma.article
        // console.log('✅ Found article model, count:', totalArticles)
      } catch (e) {
        console.log('❌ article models not found, using 0')
        totalArticles = 0;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: totalArticles
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch article stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch article stats',
        data: {
          total: 0
        }
      },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ Article stats API disconnected')
    } catch (disconnectError) {
      console.log('⚠️ Already disconnected from article stats API')
    }
  }
}