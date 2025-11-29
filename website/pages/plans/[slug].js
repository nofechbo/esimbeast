import slugify from "@/utils/formaters";
import { getAllPlans } from "@/lib/db/plans";
import PlanPage from "@/components/PlanPage";

export async function getStaticPaths() {
  const plans = await getAllPlans();
  const paths = [];

  for (const plan of plans) {
    const slug = slugify(plan.uniqueName);
    paths.push({ params: { slug } });
  }

  console.log("paths:", paths);
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const plans = await getAllPlans();

  const plan = plans.find((p) => {
    const slugified = slugify(p.uniqueName);
    return slugified === slug;
  });

  return {
    props: {
      plan: plan || null,
      slug,
    },

    revalidate: 2 * 3600, //2hr
  };
}

export default function PlanPageContainer({ plan, slug }) {
  return <PlanPage plan={plan} slug={slug} />;
}
