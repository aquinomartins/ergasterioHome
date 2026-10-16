import { safeWebUrl } from './catalog.mjs';
export function purchaseLink(product) {
  const url = safeWebUrl(product.checkoutUrl);
  return product.status === 'available' &&
    url?.startsWith('https://') &&
    Number.isInteger(product.priceInCents) &&
    product.priceInCents > 0
    ? url
    : null;
}
export function formatPrice(product) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: product.currency ?? 'BRL',
  }).format(product.priceInCents / 100);
}
