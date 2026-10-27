import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('E-mail em formato inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha muito longa')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número'),
  cpf: z.string().min(11, 'CPF deve ter no mínimo 11 dígitos').max(14, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(20, 'Telefone muito longo'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
  street: z.string().min(2, 'Logradouro/Rua obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional().default(''),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
});


export const loginSchema = z.object({
  email: z.string().email('E-mail em formato inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'ID do produto é obrigatório'),
  quantity: z.number().int().min(1, 'A quantidade deve ser pelo menos 1').max(99, 'Quantidade excessiva'),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'O carrinho não pode estar vazio'),
  name: z.string().min(2, 'Nome completo é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  address: z.string().min(3, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras (ex: SP)'),
  cep: z.string().min(8, 'CEP inválido'),
  paymentMethod: z.enum(['credit_card', 'credit_card_approved', 'credit_card_declined', 'pix'], {
    errorMap: () => ({ message: 'Selecione uma opção de pagamento válida' }),
  }),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  cardExp: z.string().optional(),
  cardCvv: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
});
