import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

const SuccessBox = styled('div')({
  maxWidth: 600,
  margin: '80px auto',
  padding: '1rem',
  fontFamily: 'system-ui, sans-serif',
  textAlign: 'center',
  border: '1px solid #eee',
  borderRadius: 8,
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
})

const HomeButton = styled('button')({
  marginTop: '1rem',
  padding: '10px 20px',
  fontSize: 14,
  backgroundColor: '#8D2DF2',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer'
})

export default function SuccessPage() {
  const router = useRouter();
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null); // 'pending' | 'ok' | 'error'
  const { payment_intent, session_id } = router.query;
  const intentId = payment_intent || session_id;

  useEffect(() => {
    if (!intentId) return;
    
    const fetchIntent = async () => {
      try {
        const res = await fetch(`/api/payment/get-payment-intent?payment_intent=${intentId}`);
        const data = await res.json();

        if (res.ok && data) {
          setIntent(data);
        } else console.error('API returned error:', data);

      } catch (err) {
        console.error('Failed to load payment intent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [intentId]);

  useEffect(() => {
    if (!intent || intent.status !== 'succeeded') return;
    if (!intent.metadata?.productId || !intent.metadata?.qty) return;

    const key = `ordered:${intent.id}`;
    if (sessionStorage.getItem(key)) return; // prevent duplicate redeems!

    const orderPlan = async () => {
      try {
        setOrderStatus('pending');
        const res = await fetch('/api/orderPlan/order-and-redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: intent.receipt_email,
            metadata: {
              productId: intent.metadata.productId,
              qty: Number(intent.metadata.qty),
            },
          }),
        });
        
        if (res.ok) {
          sessionStorage.setItem(key, '1');
          setOrderStatus('ok');
        } else {
          const error = await res.text();
          console.error(`order-and-redeem failed: code: ${res.status},\nerror: ${error}`);
          setOrderStatus('error');
        }
      } catch (e) {
        console.error('order-and-redeem error:', e);
        setOrderStatus('error');
      }
    };
    orderPlan();
  }, [intent]);


  if (loading) return <p>Loading...</p>;
  if (!intent) return <p>Could not load payment info.</p>;

  // Extract data with proper fallbacks
  const { 
    id, 
    amount, 
    currency, 
    receipt_email,
    metadata,
    status
  } = intent;



  return (
    <SuccessBox>
      <h1 style={{ fontSize: '24px', marginBottom: '1rem', color: 'green' }}>
        ✅ Payment {status === 'succeeded' ? 'Completed' : 'Received'}!
      </h1>
      <p>Confirmation #: <strong>{id}</strong></p>
      <p>Plan: <strong>{metadata?.planName || 'Your Plan'}</strong></p>
      <p>Amount Paid: <strong>${(amount / 100).toFixed(2)} {(currency || 'usd').toUpperCase()}</strong></p>
      <p>Receipt sent to: <strong>{receipt_email || 'Not provided'}</strong></p>

       {status === 'succeeded' && (
        <>
          <br />
          {orderStatus === 'pending' && <p>Placing your eSIM order…</p>}
          {orderStatus === 'ok' && <p>🎉 eSIM order placed. Check your email soon.</p>}
          {orderStatus === 'error' && <p>⚠️ We couldn’t place the eSIM order automatically. We’ll retry shortly.</p>}
        </>
      )}

      <br />
       <HomeButton onClick={() => router.push('/')}>
        Back to Home
      </HomeButton>
    </SuccessBox>
  );
}
