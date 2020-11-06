// Memo: Fetch data from https://dex.binance.org/api/v1/${address}
export const dummyLockedTxs = [
  {
    amount: [
      {
        amount: '1000000.00000000',
        symbol: 'BNB',
      },
    ],
    description: 'Test timelock 1',
    id: 1,
    locktime: '2021-01-20T00:00:00Z',
  },
  {
    amount: [
      {
        amount: '1000000.00000000',
        symbol: 'BNB',
      },
    ],
    description: 'Test timelock 2',
    id: 2,
    locktime: '2021-08-22T00:00:00Z',
  },
];
