export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/db/products';


export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao listar produtos' },
      { status: 500 }
    );
  }
}
