import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ isVerified }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //make error dissapear after 3 seconds
  useEffect(() => {
    if (errorMessage) {
        const timer = setTimeout(() => {
        setErrorMessage('');
        }, 3000); // Clear after 3 seconds
        return () => clearTimeout(timer);
    }
    }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!isVerified) {
        setErrorMessage("Please verify your email address before completing payment.");
        return;
    }

    setIsSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?payment_intent={PAYMENT_INTENT_ID}`,
      },
    });

    if (result.error) {
        let message = "Payment failed.";
        switch (result.error.code) {
            case "card_declined":
            message = "Card was declined.";
            break;
            case "insufficient_funds":
            message = "Insufficient funds.";
            break;
            case "expired_card":
            message = "Your card has expired.";
            break;
            default:
            message = result.error.message || message;
        }
        setErrorMessage(message);
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <PaymentElement disabled={!isVerified} />
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
            onClick={!isVerified ? (e) => { 
                e.preventDefault(); setErrorMessage("Please verify your email address before completing payment."); 
            } : undefined}
        >
            {isSubmitting ? "Processing..." : "Pay"}
        </button>
        {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMessage}</p>}
    </form>
  );
}

export default function PaymentFlow({ plan, slug }) {
    const [info, setInfo] = useState('');
    const [ email, setEmail ] = useState('');
    const [ code, setCode ]  = useState('');
    const [ clientSecret, setClientSecret ] = useState('');
    const [ isVerified, setIsVerified ] = useState(false);
    const [ error, setError ] = useState('');
    const [ verificationSuccess, setVerificationSuccess ] = useState('');
    const codeInputRef = useRef(null);

    if (!plan) {
        return <p>Plan not found.</p>;
    }

    const onSendCode = async () => {
        setError('');
        setInfo('');
        setVerificationSuccess('');
        const response = await fetch('/api/email/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            setInfo("Check your email for a 6-digit verification code.");
            setError('');
            // Focus the code input field
            setTimeout(() => codeInputRef.current?.focus(), 100);
        } else {
            setError("Unable to send verification code");
            setVerificationSuccess('');
            setInfo('');
            console.error(`error sending email: ${data.error}`);
        }
    };

    const onVerifyCode = async () => {
        if (isVerified) {
            setError('');
            setVerificationSuccess('✓ Email already verified!');
            return;
        }

        const response = await fetch('/api/email/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email,
               code,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            setIsVerified(true);
            setError('');
            setInfo('');
            setVerificationSuccess('✓ Email verified successfully! You can now complete your payment.');
            
            await createPaymentIntent(email); // Update payment intent with verified email
        } else {
            setError(`Unable to verify code: ${data.error || 'Invalid or expired verification code'}`);
            setVerificationSuccess('');
            setInfo('');
            console.error(data.error);
        }
    };

    const createPaymentIntent = async (emailToUse) => {
        const response = await fetch('/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               productId: plan.productId,
               slug,
               email: emailToUse || email,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            setClientSecret(data.clientSecret);
            setError('');
        } else {
            setError("unable to create payment intent");
            console.error(data.error);
        }
    };

    const stripeOptions = clientSecret ? { 
        clientSecret,
        appearance: {
            theme: 'stripe'
        },
        defaultValues: {
            billingDetails: {
                email: isVerified ? email : ''
            }
        }
    } : null;

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem 1rem',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '22px', marginBottom: '1rem' }}>Complete your purchase:</h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '90%',
                    maxWidth: '600px'
                }}>
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSendCode()}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                    }}
                />
                <button
                    onClick={onSendCode}
                    style={{
                        width: '28%',
                        padding: '10px',
                        fontSize: '12px',
                        backgroundColor: '#8D2DF2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Send verification code
                </button>
                </div>

                {info && !isVerified && <p style={{ color: 'blue', fontWeight: 'bold' }}>{info}</p>}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '90%',
                    maxWidth: '600px'
                }}>
                <input
                    ref={codeInputRef}
                    type="text"
                    placeholder="verification code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && code.trim().length > 0 && onVerifyCode()}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                    }}
                />
                <button
                    onClick={onVerifyCode}
                    style={{
                        width: '28%',
                        padding: '10px',
                        fontSize: '12px',
                        backgroundColor: '#8D2DF2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Verify email
                </button>
                </div>
            </div>

            {verificationSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{verificationSuccess}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            {clientSecret && (
            <Elements stripe={stripePromise} options={stripeOptions} key={clientSecret}>
                <div style={{ marginTop: '2rem' }}>
                <CheckoutForm isVerified={isVerified} />
                </div>
            </Elements>
            )}
        </div>
    );

}
