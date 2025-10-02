import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import styled from "@emotion/styled";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PaymentWrapper = styled('div')({
  maxWidth: 600,
  margin: '0 auto',
  padding: '2rem 1rem',
  fontFamily: 'system-ui, sans-serif',
  textAlign: 'center',

  'h2': { fontSize: '22px', marginBottom: '1rem' }
});

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?payment_intent={PAYMENT_INTENT_ID}`,
      },
    });

    if (result.error) {
      let message = result.error.message || "Payment failed.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <PaymentElement />
      <button 
        type="submit" 
        disabled={isSubmitting || !stripe}
        style={{ 
          marginTop: '1rem',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#8D2DF2',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {isSubmitting ? "Processing..." : "Pay"}
      </button>
      {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMessage}</p>}
    </form>
  );
}

export default function PaymentFlow({ plan, qty }) {
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  if (!plan) {
    return <p>Plan not found.</p>;
  }

  const createPaymentIntent = async (emailToUse) => {
    const response = await fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueName: plan.uniqueName,
        qty,
        email: emailToUse || email,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setClientSecret(data.clientSecret);
    } else {
      setError(data.error || "Unable to create payment intent");
    }
  };

  useEffect(() => {
    if (email) {
      createPaymentIntent(email);
    }
  }, [email, qty]);

  const stripeOptions = clientSecret ? { 
    clientSecret,
    appearance: { theme: 'stripe' },
    defaultValues: {
      billingDetails: { email }
    }
  } : null;

  return (
    <PaymentWrapper>
      <h2>Complete your purchase:</h2>

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          padding: '12px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginBottom: '1rem',
          width: '100%'
        }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {clientSecret && (
        <Elements stripe={stripePromise} options={stripeOptions} key={clientSecret}>
          <CheckoutForm />
        </Elements>
      )}
    </PaymentWrapper>
  );
}
