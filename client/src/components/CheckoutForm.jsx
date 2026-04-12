await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // important
  body: JSON.stringify({ amount, currency: 'usd' }),
});