const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export const formatCurrencyToIDR = (amount: number) => idrFormatter.format(amount);

const numberFormatterID = new Intl.NumberFormat('id-ID');

export const formatNumberID = (amount: number) => numberFormatterID.format(amount);
