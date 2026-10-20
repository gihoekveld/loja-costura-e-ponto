export const runtime = 'edge';

import { getAllProducts } from '@/lib/db/products';
import { CatalogView } from '@/components/CatalogView';

export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; favoritos?: string };
}) {
  const products = await getAllProducts();

  return (
    <CatalogView
      products={products}
      initialCategory={searchParams.category || ''}
      initialSearch={searchParams.q || ''}
      initialFavoritos={searchParams.favoritos === 'true'}
    />
  );
}
