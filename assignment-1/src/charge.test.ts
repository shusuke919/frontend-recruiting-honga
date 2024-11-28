import { charge, Invoice, Payment } from './charge';

describe('charge', () => {
  test('正常: 商品券と現金を組み合わせた支払い', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [
      { type: 'COUPON', percentage: 10 },
      { type: 'CASH', amount: 900 },
    ];

    const receipt = charge(invoice, payments);

    expect(receipt).toEqual({
      total: 1000,
      deposit: 1000,
      change: 0,
    });
  });

  test('正常: 複数人で現金での支払い', () => {
    const invoice: Invoice = { total: 1500 };
    const payments: Payment[] = [
      { type: 'CASH', amount: 800 }, // 1人目が800円
      { type: 'CASH', amount: 700 }, // 2人目が700円
    ];

    const receipt = charge(invoice, payments);

    expect(receipt).toEqual({
      total: 1500,
      deposit: 1500,
      change: 0,
    });
  });

  test('異常: 支払い不足', () => {
    const invoice: Invoice = { total: 2000 };
    const payments: Payment[] = [{ type: 'CASH', amount: 1000 }];

    expect(() => charge(invoice, payments)).toThrow('Shortage');
  });

  test('異常: 払い過ぎ（現金のみの場合）', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [{ type: 'CASH', amount: 1500 }];

    expect(() => charge(invoice, payments)).toThrow('OverCharge');
  });

  test('異常: 払い過ぎ（商品券のみの場合）', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [{ type: 'COUPON', amount: 1500 }];

    expect(() => charge(invoice, payments)).toThrow('OverCharge');
  });

  test('正常: 商品券のみで支払い', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [{ type: 'COUPON', amount: 1000 }];

    const receipt = charge(invoice, payments);

    expect(receipt).toEqual({
      total: 1000,
      deposit: 1000,
      change: 0,
    });
  });

  test('正常: 商品券と現金の混合支払い（お釣あり）', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [
      { type: 'COUPON', amount: 500 },
      { type: 'CASH', amount: 800 },
    ];

    const receipt = charge(invoice, payments);

    expect(receipt).toEqual({
      total: 1000,
      deposit: 1300,
      change: 300,
    });
  });

  test('異常: 商品券と現金の混合支払い（支払い不足）', () => {
    const invoice: Invoice = { total: 1000 };
    const payments: Payment[] = [
      { type: 'COUPON', amount: 300 },
      { type: 'CASH', amount: 500 },
    ];

    expect(() => charge(invoice, payments)).toThrow('Shortage');
  });
});
