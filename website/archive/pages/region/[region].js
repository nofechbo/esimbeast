// import slugify from '@/utils/slugify';
// import PlanCard from '@/components/PlanCard';
// import { fetchPlans } from '@/utils/fetchPlans';
// // import 'dotenv/config';

// export async function getStaticPaths() {
//   const plans = await fetchPlans();
//   const regions = new Set();

//   for (const plan of plans) {
//       for (const r of plan.productRegion.split(',')) {
//           regions.add(r.trim().toLowerCase());
//       }
//   }

//   // Generate paths for each region
//   const paths = Array.from(regions).map(region => ({
//       params: { region }
//   }));

//   return {
//       paths,
//       fallback: 'blocking' // Allows new regions to be generated on-demand
//   };
// }

// export async function getStaticProps({ params }) {
//   const { region } = params;
//   const plans = await fetchPlans();

//   const filteredPlans = plans.filter(p =>
//       p.productRegion
//       .split(',')
//       .map(r => r.trim().toLowerCase())
//       .includes(region.toLowerCase())
//   );

//   return {
//       props: {
//         region,
//         plans: filteredPlans
//       },

//       revalidate: 2 * 3600 //2hr
//   };
// }

// export default function RegionPage({ region, plans }) {
//   return (
//     <div style={{ padding: '2rem' }}>
//       <h1>eSIM Plans for {region}</h1>

//       {plans.length === 0 ? (
//         <p>No plans found for this region.</p>
//       ) : (
//         plans.map(plan => (
//           <PlanCard
//             key={plan.wmproductId}
//             plan={plan}
//             region={region}
//             slug={slugify(plan)}
//           />
//         ))
//       )}
//     </div>
//   );
// }
