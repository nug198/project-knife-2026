import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching maker stats...')
    
    // Cek koneksi database dulu
    await prisma.$connect()
    
    let totalMakers = 0;

    try {
      totalMakers = await prisma.maker.count();
      console.log('✅ Found maker model, count:', totalMakers)
    } catch (modelError) {
      console.log('❌ Model maker tidak ditemukan, menggunakan 0')
      totalMakers = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        total: totalMakers
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch maker stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch maker stats',
        data: {
          total: 0
        }
      },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ Maker stats API disconnected')
    } catch (disconnectError) {
      console.log('⚠️ Already disconnected from maker stats API')
    }
  }
}