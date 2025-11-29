// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/src/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ valid: !!user, user })
  } catch (error) {
    return NextResponse.json({ valid: false })
  }
}