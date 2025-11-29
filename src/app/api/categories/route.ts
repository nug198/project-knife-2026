import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.kategori.findMany({
      orderBy: { nama_kategori: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// import { NextResponse } from 'next/server';
// // import { prisma } from '../app/lib/prisma'; // Fixed import path
// // import { prisma } from './app/lib/prisma';
// import { Prisma } from '@prisma/client';

// export async function GET() {
//   try {
//     const categories = await Prisma.kategori.findMany({
//       select: {
//         id_kategori: true,
//         nama_kategori: true,
//         slug: true,
//         deskripsi: true,
//       },
//       orderBy: {
//         nama_kategori: 'asc',
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: categories
//     });
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: 'Failed to fetch categories' 
//       },
//       { status: 500 }
//     );
//   }
// }
// // No need for prisma.$disconnect() with the singleton approach