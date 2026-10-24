

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { findUserById } from '@/lib/db/users';
import { decryptCpf } from '@/lib/auth/crypto';
import { getOrdersByUserId } from '@/lib/db/orders';


export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem solicitar a descriptografia de dados sensíveis.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, encryptedCpf } = body;

    let cipherToDecrypt = encryptedCpf;
    let customer = null;

    if (userId) {
      customer = await findUserById(userId);
      if (customer && customer.cpf_encrypted) {
        cipherToDecrypt = customer.cpf_encrypted;
      }
    }

    if (!cipherToDecrypt) {
      return NextResponse.json(
        { error: 'Cifra de CPF não fornecida para descriptografia.' },
        { status: 400 }
      );
    }

    // Executa a descriptografia AES-256-GCM no servidor
    const decryptedCpf = await decryptCpf(cipherToDecrypt);

    // Buscar pedidos para enriquecer emissão de Nota Fiscal (DANFE)
    const orders = customer ? await getOrdersByUserId(customer.id) : [];

    // Gerar dados fiscais estruturados simulados para DANFE / NF-e
    const accessKey = `352610${'45678912000134'}${Math.floor(100000000 + Math.random() * 900000000)}1${Math.floor(100000000 + Math.random() * 900000000)}`;

    return NextResponse.json({
      success: true,
      decryptedCpf,
      auditLog: {
        timestamp: new Date().toISOString(),
        operatorId: sessionUser.id,
        operatorEmail: sessionUser.email,
        algorithm: 'AES-256-GCM',
        purpose: 'Emissão Fiscal / Gestão Administrativa'
      },
      nfePreview: customer ? {
        accessKey,
        naturezaOperacao: 'Venda de mercadoria adquirida de terceiros',
        emitente: {
          razaoSocial: 'Costura & Ponto Armarinhos e Acessórios EIRELI',
          cnpj: '45.678.912/0001-34',
          inscricaoEstadual: '148.921.844.110',
          endereco: 'Rua da Mooca, 1540 - Brás - São Paulo/SP - CEP 03104-002',
          telefone: '(11) 3222-1000'
        },
        destinatario: {
          nome: customer.name,
          cpfDescriptografado: decryptedCpf,
          endereco: `${customer.street || 'Rua'}, ${customer.number || 'S/N'}${customer.complement ? ' - ' + customer.complement : ''}`,
          bairro: customer.neighborhood || 'Centro',
          cidade: customer.city || 'São Paulo',
          uf: customer.state || 'SP',
          cep: customer.cep || '00000-000',
          telefone: customer.phone || ''
        },
        pedidos: orders
      } : null
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao descriptografar dado sensível.' },
      { status: 500 }
    );
  }
}
