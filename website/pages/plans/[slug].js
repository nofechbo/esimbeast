import { useEffect, useState } from 'react';
import slugify from '@/utils/slugify';
import PaymentFlow from '@/components/PaymentFlow';
import styled from '@emotion/styled';
import { getAllPlans } from '@/lib/db/plans';

const PlanPageWrapper = styled('div')({
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 80,
  paddingLeft: '1rem',
  paddingRight: '1rem',
  textAlign: 'center'
})

const PlanTitle = styled('h2')({
  fontSize: 28, fontWeight: 600, marginBottom: '1rem' 
})

const PlanDetails = styled('p')({
  fontSize: 18, margin: '0.5rem 0'
})

const PurchaseButton = styled('button')({
  marginTop: '1.5rem',
  padding: '10px 20px',
  fontSize: 16,
  borderRadius: 6,
  border: 'none',
  backgroundColor: '#8D2DF2',
  color: 'white',
  cursor: 'pointer'
})

const PaymentFormWrapper = styled('div')({
  marginTop: '2rem', width: '100%' 
})

const QtySelect = styled('select')({
  maxHeight: 150,   // about 5–6 options tall
  overflowY: 'auto',
  fontSize: 16, 
  padding: '5px 10px', 
  borderRadius: 4,
  border: '1px solid #ccc' 
});


export async function getStaticPaths () {
  const plans = await getAllPlans();
  const paths = [];

  for (const plan of plans) {
    const slug = slugify(plan.uniqueName);
    paths.push( { params: { slug } });
  }

  console.log('paths:', paths)
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const plans = await getAllPlans();

  const plan = plans.find(p => {
    const slugified = slugify(p.uniqueName);
    return slugified === slug;
  });

  return {
    props: {
      plan: plan || null,
      slug,
    },

    revalidate: 2 * 3600 //2hr
  };
}

export default function PlanPage({ plan, slug }) {
  const [showPayment, setShowPayment] = useState(false);
  const [qty, setQty] = useState(1);
  const [totalAmount, setTotalAmount] = useState(plan ? plan.price : 0);

  if (!plan) {
    return <PlanTitle>Plan not found.</PlanTitle>;
  }

  useEffect(() => {
    if (plan) {
      setTotalAmount(plan.price * qty)
    }
  }, [qty, plan]);

  return (
    <PlanPageWrapper>
      <PlanTitle>{plan.name}</PlanTitle>
      <PlanDetails>
        <strong>Price:</strong> ${plan.price}
      </PlanDetails>
      <PlanDetails>
        {/* // CHANGE TO ACTUAL COUNTRY NAMES */}
        <strong>Coverage:</strong> {plan.countryCodes.join(", ")}
      </PlanDetails>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Quantity: </label>
        <QtySelect 
          value={qty} 
          onChange={e => setQty(Number(e.target.value))}
        >
        {[...Array(30)].map((_, i) => (
          <option key={i+1} value={i+1}>
            {i+1}
          </option>
        ))}
        </QtySelect>
      </div> 

      <PlanDetails>
        <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
      </PlanDetails>

      {!showPayment ? (
          <PurchaseButton onClick={() => setShowPayment(true)} >
            Purchase Plan
          </PurchaseButton>
      ) : (
        <PaymentFormWrapper>
          <PaymentFlow plan={plan} qty={qty} slug={slug} />
        </PaymentFormWrapper>
      )}
    </PlanPageWrapper>
  );

}
