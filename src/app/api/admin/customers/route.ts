import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAllUsers, findUserByCpfHash } from '@/lib/db/users';
import { hashCpf, normalizeCpf } from '@/lib/auth/crypto';


export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    // Controle de acesso administrativo
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Área restrita à administração da loja.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchCpf = searchParams.get('cpf');

    if (searchCpf && searchCpf.trim()) {
      const cleanCpf = normalizeCpf(searchCpf);
      if (cleanCpf.length !== 11) {
        return NextResponse.json(
          { error: 'O CPF informado deve conter 11 dígitos para efetuar a busca exata por hash.' },
          { status: 400 }
        );
      }

      // 1. Gerar o hash determinístico da busca
      const computedHash = await hashCpf(cleanCpf);

      // 2. Consulta indexada no banco D1 (WHERE cpf_hash = ?)
      const foundUser = await findUserByCpfHash(computedHash);

      return NextResponse.json({
        success: true,
        mode: 'hash_search',
        searchedCpf: searchCpf,
        computedHash: computedHash,
        customer: foundUser ? {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          cpf_hash: foundUser.cpf_hash,
          cpf_encrypted: foundUser.cpf_encrypted,
          phone: foundUser.phone,
          cep: foundUser.cep,
          street: foundUser.street,
          number: foundUser.number,
          complement: foundUser.complement,
          neighborhood: foundUser.neighborhood,
          city: foundUser.city,
          state: foundUser.state,
          role: foundUser.role,
          created_at: foundUser.created_at,
        } : null
      });
    }

    // Listar todos os clientes cadastrados
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      mode: 'list',
      customers: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        cpf_hash: u.cpf_hash,
        cpf_encrypted: u.cpf_encrypted,
        phone: u.phone,
        cep: u.cep,
        street: u.street,
        number: u.number,
        complement: u.complement,
        neighborhood: u.neighborhood,
        city: u.city,
        state: u.state,
        role: u.role,
        created_at: u.created_at,
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao consultar clientes no painel administrativo.' },
      { status: 500 }
    );
  }
}
