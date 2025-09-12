import { useState } from 'react';
import slugify from '@/utils/slugify';
import PaymentFlow from '@/components/PaymentFlow';
import { fetchAndParseCSV } from '@/lib/plans/fetchAndParseCSV';

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
    return <p>Plan not found.</p>;
  }

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '80px',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '1rem' }}>{plan.name}</h1>
      <p style={{ fontSize: '18px', margin: '0.5rem 0' }}>
        <strong>Price:</strong> ${plan.price}
      </p>
      <p style={{ fontSize: '18px', margin: '0.5rem 0' }}>
        <strong>Coverage:</strong> {plan.countryCodes}
      </p>

      {!showPayment ? (
        <button
          onClick={() => setShowPayment(true)}
          style={{
            marginTop: '1.5rem',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#8D2DF2',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Purchase Plan
        </button>
      ) : (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <PaymentFlow plan={plan} slug={slug} />
        </div>
      )}
    </div>
  );

}
