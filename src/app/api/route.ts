import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working',
    endpoints: {
      articles: '/api/articles',
      article: '/api/articles/[slug]'
    }
  });
}