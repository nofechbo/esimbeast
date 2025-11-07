// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  EmailVerification,
  Info,
  PaymentWrapper,
  Success,
  Error,
  VerificationButton,
  VerificationInput,
  PaymentTitle,
} from "@/styles/paymentFlowStyles";

// 🔹 for render email block!!!
const IS_RENDER = process.env.NEXT_PUBLIC_IS_RENDER === "true";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function CheckoutForm({ isVerified }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //make error dissapear after 3 seconds --> change to toast
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000); // Clear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!isVerified) {
      setErrorMessage(
        "Please verify your email address before completing payment."
      );
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
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <PaymentElement />
      <button
        type="submit"
        disabled={isSubmitting || !stripe}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#8D2DF2",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
        onClick={
          !isVerified
            ? (e) => {
                e.preventDefault();
                setErrorMessage(
                  "Please verify your email address before completing payment."
                );
              }
            : undefined
        }
      >
        {isSubmitting ? "Processing..." : "Pay"}
      </button>
      {errorMessage && (
        <p style={{ color: "red", marginTop: "0.5rem" }}>{errorMessage}</p>
      )}
    </form>
  );
}

export default function PaymentFlow({ plan, qty }) {
  const [info, setInfo] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // const [ isVerified, setIsVerified ] = useState(false); //🔹 regular
  const [isVerified, setIsVerified] = useState(IS_RENDER); // 🔹 for render email block!!!
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const codeInputRef = useRef(null);

  if (!plan) {
    return <p>Plan not found.</p>;
  }

  // 🔹 Auto-create PaymentIntent when skipping email (Render mode)
  useEffect(() => {
    if (IS_RENDER) {
      (async () => {
        await createPaymentIntent(email || "test@pingwe.com");
      })();
    }
  }, []);
  // 🔹 end of auto-create Render mode

  const onSendCode = async () => {
    setError("");
    setInfo("");
    setVerificationSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setInfo("Check your email for a 6-digit verification code.");
    setTimeout(() => codeInputRef.current?.focus(), 100); // Focus the code input field

    const response = await fetch("/api/email/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });
    /** @type {any} */
    const data = await response.json();
    if (response.ok) {
      setError("");
    } else {
      setError("Unable to send verification code");
      setVerificationSuccess("");
      setInfo("");
      console.error(`error sending email: ${data.error}`);
    }
  };

  const onVerifyCode = async () => {
    if (isVerified) {
      setError("");
      setVerificationSuccess("✓ Email already verified!");
      return;
    }

    const response = await fetch("/api/email/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });
    /** @type {any} */
    const data = await response.json();
    if (response.ok) {
      setIsVerified(true);
      setError("");
      setInfo("");
      setVerificationSuccess(
        "✓ Email verified successfully! You can now complete your payment."
      );

      await createPaymentIntent(email);
    } else {
      setError(
        `Unable to verify code: ${
          data.error || "Invalid or expired verification code"
        }`
      );
      setVerificationSuccess("");
      setInfo("");
      console.error(data.error);
    }
  };

  const createPaymentIntent = async (emailToUse) => {
    const response = await fetch("/api/payment/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uniqueName: plan.uniqueName,
        qty,
        email: emailToUse || email,
      }),
    });
    /** @type {any} */
    const data = await response.json();
    if (response.ok) {
      setClientSecret(data.clientSecret);
      setError("");
    } else {
      setError("unable to create payment intent");
      console.error(data.error);
    }
  };

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
        },
        defaultValues: {
          billingDetails: {
            email: isVerified ? email : "",
          },
        },
      }
    : null;

  return (
    <PaymentWrapper>
      <h2>Complete your purchase:</h2>
      {/* 🔹 CHANGED: hide email verification UI if IS_RENDER */}
      {!IS_RENDER && (
        <EmailVerification>
    <div>
      <label style={{ 
        display: "block", 
        marginBottom: "0.5rem", 
        fontFamily: "Kanit", 
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151"
      }}>
        Email address
      </label>
      <VerificationInput>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendCode()}
        />
            <VerificationButton onClick={onSendCode}>
          Send verification code
        </VerificationButton>
      </VerificationInput>
    </div>

          {info && !isVerified && <Info>{info}</Info>}

          <div>
      <label style={{ 
        display: "block", 
        marginBottom: "0.5rem", 
        fontFamily: "Kanit", 
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151"
      }}>
        Verification code
      </label>
      <VerificationInput>
            <input
              ref={codeInputRef}
              type="text"
              placeholder="verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && code.trim().length > 0 && onVerifyCode()
              }
            />
            <VerificationButton onClick={onVerifyCode}>
              Verify email
            </VerificationButton>
            </VerificationInput>
            </div>
        </EmailVerification>
      )}{" "}
      {/* end of IS_RENDER check */}
      {verificationSuccess && <Success>{verificationSuccess}</Success>}
      {error && <Error>{error}</Error>}
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={stripeOptions}
          key={clientSecret}
        >
          {isVerified && (
            <PaymentTitle>Select your payment method</PaymentTitle>
          )}
          <div style={{ marginTop: "1rem" }}>
            <CheckoutForm isVerified={isVerified} />
          </div>
        </Elements>
      )}
    </PaymentWrapper>
  );
}
