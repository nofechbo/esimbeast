import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  // const [intentId, setIntentId] = useState(null);
  const { payment_intent, session_id } = router.query;
  const intentId = payment_intent || session_id;
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!intentId) return;
    
    const fetchIntent = async () => {
      try {
        const res = await fetch(`/api/payment/get-payment-intent?payment_intent=${intentId}`);
        const data = await res.json();

        if (res.ok && data) {
          setIntent(data);
        } else {
          console.error('API returned error:', data);
        }

      } catch (err) {
        console.error('Failed to load payment intent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [intentId]);

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
    <div style={{
      maxWidth: '600px',
      margin: '80px auto',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      border: '1px solid #eee',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '1rem', color: 'green' }}>
        ✅ Payment {status === 'succeeded' ? 'Completed' : 'Received'}!
      </h1>
      <p>Confirmation #: <strong>{id}</strong></p>
      <p>Plan: <strong>{metadata?.planName || metadata?.slug || 'Your Plan'}</strong></p>
      <p>Amount Paid: <strong>${(amount / 100).toFixed(2)} {(currency || 'usd').toUpperCase()}</strong></p>
      <p>Receipt sent to: <strong>{receipt_email || 'Not provided'}</strong></p>
      <br />
       <button
        onClick={() => router.push('/')}
        style={{
          marginTop: '1rem',
          padding: '10px 20px',
          fontSize: '14px',
          backgroundColor: '#8D2DF2',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
