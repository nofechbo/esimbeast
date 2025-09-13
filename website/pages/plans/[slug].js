import { useState } from 'react';
import slugify from '@/utils/slugify';
import PaymentFlow from '@/components/PaymentFlow';
import { fetchAndParseCSV } from '@/lib/plans/fetchAndParseCSV';
import styled from '@emotion/styled';

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

export async function getStaticPaths () {
  const plans = await fetchAndParseCSV();
  const paths = [];

  for (const plan of plans) {
    const slug = slugify(plan);
    paths.push( { params: { slug } });
  }

  console.log('paths:', paths)
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const plans = await fetchAndParseCSV();

  const plan = plans.find(p => {
    const slugified = slugify(p);
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

  if (!plan) {
    return <PlanTitle>Plan not found.</PlanTitle>;
  }

  return (
    <PlanPageWrapper>
      <PlanTitle>{plan.name}</PlanTitle>
      <PlanDetails>
        <strong>Price:</strong> ${plan.price}
      </PlanDetails>
      <PlanDetails>
        <strong>Coverage:</strong> {plan.countryCodes}
      </PlanDetails>

      {!showPayment ? (
        <PurchaseButton onClick={() => setShowPayment(true)} >
          Purchase Plan
        </PurchaseButton>
      ) : (
        <PaymentFormWrapper>
          <PaymentFlow plan={plan} slug={slug} />
        </PaymentFormWrapper>
      )}
    </PlanPageWrapper>
  );

}
