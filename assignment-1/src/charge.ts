export type Invoice = {
  total: number;
};

export type Receipt = {
  total: number;
  deposit: number;
  change: number;
};

export type Payment = {
  type: 'CASH' | 'COUPON';
  percentage?: number;
  amount?: number;
};

export function charge(invoice: Invoice, payments: Payment[]): Receipt {
  const total = invoice.total;
  //商品券から先に処理するために並び替え
  const sortedPayments = [...payments].sort((payment) => (payment.type === 'COUPON' ? -1 : 1));

  // お会計処理
  const deposit = sortedPayments.reduce((acc, payment) => {
    if (payment.type === 'COUPON') {
      const couponValue = payment.percentage
        ? Math.floor(total * (payment.percentage / 100))
        : payment.amount || 0;
      return acc + couponValue;
    }
    if (acc >= total) {
      throw new Error('OverCharge');
    }
    return acc + (payment.amount || 0);
  }, 0);
  if (total > deposit) {
    throw new Error('Shortage');
  }

  if (deposit > total) {
    if (!sortedPayments.some((payment) => payment.type === 'CASH')) {
      throw new Error('OverCharge');
    }
    if (sortedPayments.every((payment) => payment.type === 'CASH')) {
      throw new Error('OverCharge');
    }
  }

  // レシートの生成
  const isOnlyCoupon = sortedPayments.every((payment) => payment.type === 'COUPON');
  const change = isOnlyCoupon ? 0 : deposit - total;

  return { total, deposit, change };
}

// テスト用データを作成
const invoice: Invoice = { total: 1000 };
const payments: Payment[] = [
  { type: 'COUPON', percentage: 10 },
  { type: 'CASH', amount: 1800 },
];

try {
  const receipt = charge(invoice, payments);
  console.log('レシート:', receipt);
} catch (error) {
  console.error('エラーです！', (error as Error).message);
}
