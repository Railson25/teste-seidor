const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatMoney = (cents: number) => moneyFormatter.format(cents / 100);
export const formatCpf = (cpf: string) =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

// Parse decimal text directly; never multiply a floating-point monetary input.
export function parseMoney(value: string): number {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) return NaN;
  const [whole = '', fraction = ''] = value.trim().replace(',', '.').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export const moneyToInput = (cents: number) =>
  `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;
