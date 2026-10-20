export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  cpf_hash?: string;
  cpf_encrypted?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  role?: 'customer' | 'admin';
  created_at?: string;
}


export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  badge?: 'Mais Vendido' | 'Oferta' | 'Lançamento' | string;
  rating?: number;
  reviews_count?: number;
  stock: number;
  category: string;
  brand?: string;
  color?: string;
  image_url?: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutInput {
  items: {
    productId: string;
    quantity: number;
  }[];
  name: string;
  cpf: string;
  address: string;
  number: string;
  city: string;
  state: string;
  cep: string;
  paymentMethod: 'credit_card_approved' | 'credit_card_declined' | 'pix';
}
