// import Link from "next/link";

// export default function PlanCard({ plan, region, slug }) {

//     return (
//         <div style={{
//             border: '1px solid #ccc',
//             borderRadius: '8px',
//             padding: '1rem',
//             marginBottom: '1rem',
//             maxWidth: '400px'
//         }} >
//             <h2 style={{ marginBottom: '0.5rem' }}>{plan.productName}</h2>
//             {/* <p><strong>Validity:</strong> {plan.validity} days</p> */}
//             <p><strong>Price:</strong> ${plan.productcPrice }</p>

//             <Link href={`/${slug}`} 
//                 style={{
//                     marginTop: '1rem',
//                     display: 'inline-block',
//                     padding: '0.5rem 1rem',
//                     backgroundColor: '#0070f3',
//                     color: 'white',
//                     textDecoration: 'none',
//                     borderRadius: '4px'
//                 }}
//             >
//                     View Plan
//             </Link>
//         </div>
//     )
// }