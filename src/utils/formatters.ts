export const formatCurrency = (amount: number, currency: 'USD' | 'BOB'): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};