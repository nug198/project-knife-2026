import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const makers = await prisma.maker.findMany({
      include: {
        _count: {
          select: {
            produk: true
          }
        },
        produk: {
          take: 1,
          include: {
            gambar_produk: {
              take: 1
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: makers
    })
  } catch (error) {
    console.error('Error fetching makers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch makers'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama_maker, profil, lokasi, kontak, foto_url } = body

    if (!nama_maker) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama maker is required'
        },
        { status: 400 }
      )
    }

    const maker = await prisma.maker.create({
      data: {
        nama_maker,
        profil: profil || null,
        lokasi: lokasi || null,
        kontak: kontak || null,
        foto_url: foto_url || null
      }
    })

    return NextResponse.json({
      success: true,
      data: maker,
      message: 'Maker created successfully'
    })
  } catch (error) {
    console.error('Error creating maker:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create maker'
      },
      { status: 500 }
    )
  }
}