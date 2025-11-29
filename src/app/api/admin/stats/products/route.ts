import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma' // Import dari lib/prisma

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching product stats...')

    const totalProducts = await prisma.produk.count()
    const visibleProducts = await prisma.produk.count({
      where: { status_tampil: true }
    })
    
    console.log('✅ Product stats fetched:', { totalProducts, visibleProducts })

    return NextResponse.json({
      success: true,
      data: {
        total: totalProducts,
        visible: visibleProducts
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch product stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product stats',
        data: {
          total: 0,
          visible: 0
        }
      },
      { status: 500 }
    )
  }
}
// HAPUS finally block karena kita menggunakan single instance