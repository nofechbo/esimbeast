import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { fetchPlanByUniqueName } from '@/utils/fetchPlans';

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
  const [plan, setPlan] = useState(null);
  const [intent, setIntent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
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
          setMetadata(data.metadata || null);
        } else console.error('API returned error:', data);

      } catch (err) {
        console.error('Failed to load payment intent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [intentId]);

    useEffect (() => {
    if (!metadata?.uniqueName) return;

    const fetchPlan = async () => {
      setPlanLoading(true);
      try {
        const plan = await fetchPlanByUniqueName(intent.metadata.uniqueName);
        setPlan(plan);
      } catch (err) {
        console.error('Failed to load plan data:', err);
        setPlan(null)
      } finally {
        setPlanLoading(false);
      }
    }

    fetchPlan();
  }, [metadata?.uniqueName])

  useEffect(() => {
    if (!intent || intent.status !== 'succeeded') return;
    if (!intent.metadata?.uniqueName || !intent.metadata?.qty) return;

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
            metadata,
          }),
        });
        const data = await res.json();

        if (res.ok && !data.error) {
          sessionStorage.setItem(key, '1');
          setOrderStatus('ok');
        } else {
          console.error(`order-and-redeem failed: code: ${res.status},\nerror: ${data.error || data}`);
          setOrderStatus('error');
        }
      } catch (e) {
        console.error('order-and-redeem error:', e);
        setOrderStatus('error');
      }
    };
    orderPlan();
  }, [intent, metadata]);

  if (loading) return <p>Loading...</p>;
  if (!intent) return <p>Could not load payment info.</p>;
  if (planLoading) return <p>Loading plan details...</p>;
  if (!plan) return <p>Could not load plan details.</p>;

  return (
    <SuccessBox>
      <h1 style={{ fontSize: '24px', marginBottom: '1rem', color: 'green' }}>
        ✅ Payment {intent.status === 'succeeded' ? 'Completed' : 'Received'}!
      </h1>
      {/* save confirmation # in db to send in email later? */}
      <p>Confirmation #: <strong>{intent.id}</strong></p> 
      <p>Plan: <strong>{plan.name || 'Your Plan'}</strong></p>
      <p>Amount Paid: <strong>${(intent.amount / 100).toFixed(2)} {(intent.currency || 'usd').toUpperCase()}</strong></p>
      <p>Receipt sent to: <strong>{intent.receipt_email || 'Not provided'}</strong></p>

       {intent.status === 'succeeded' && (
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
