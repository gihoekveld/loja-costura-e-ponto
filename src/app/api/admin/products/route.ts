import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getProductById } from '@/lib/db/products';


export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar produtos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category, image_url } = body;

    if (!name || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: Nome, Categoria, Preço e Estoque.' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: String(name).trim(),
      description: String(description || '').trim(),
      price: Math.max(0, Number(price)),
      stock: Math.max(0, parseInt(String(stock), 10)),
      category: String(category).trim(),
      image_url: image_url ? String(image_url).trim() : undefined,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar produto.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, price, stock, category, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    const success = await updateProduct(id, {
      name: name !== undefined ? String(name).trim() : undefined,
      description: description !== undefined ? String(description).trim() : undefined,
      price: price !== undefined ? Math.max(0, Number(price)) : undefined,
      stock: stock !== undefined ? Math.max(0, parseInt(String(stock), 10)) : undefined,
      category: category !== undefined ? String(category).trim() : undefined,
      image_url: image_url !== undefined ? String(image_url).trim() : undefined,
    });

    if (!success) {
      return NextResponse.json({ error: 'Falha ao atualizar produto.' }, { status: 400 });
    }

    const updated = await getProductById(id);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita ao administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do produto não informado.' }, { status: 400 });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    const success = await deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir produto.' }, { status: 500 });
  }
}
