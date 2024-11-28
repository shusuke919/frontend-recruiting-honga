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

  let isCoupon = true;
  for (let i = 0; i < payments.length; i++) {
    if (payments[i].type !== 'COUPON') {
      isCoupon = false;
      continue;
    }
  }
  if (isCoupon) return { total, deposit, change: 0 };
  return { total: total, deposit: deposit, change: deposit - total };
}
