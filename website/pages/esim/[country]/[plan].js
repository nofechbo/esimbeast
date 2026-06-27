// Clean programmatic-SEO variant page:  /esim/{country}/{data}-{duration}
// One canonical page per (country, data, duration) bucket. Non-primary SKUs that
// resolve here canonical-point at their bucket's primary (no duplicate content).
import PlanPage from "@/components/PlanPage";
import {
  getPlanBySlug,
  getPrimaryPlans,
  getPrimaryByBucketKey,
} from "@/lib/db/plans";
import { MAX_STATIC_PATHS } from "@/config";

export async function getStaticPaths() {
  const primaries = await getPrimaryPlans();
  const paths = primaries
    .filter((p) => p.slug && p.slug.startsWith("esim/"))
    .slice(0, MAX_STATIC_PATHS)
    .map((p) => {
      const [, country, plan] = p.slug.split("/");
      return { params: { country, plan } };
    });
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { country, plan } = params;
  const slug = `esim/${country}/${plan}`;
  const found = await getPlanBySlug(slug);
  if (!found) return { notFound: true, revalidate: 3600 };

  let canonicalPath = `/${found.slug}`;
  if (!found.isPrimary) {
    const primary = await getPrimaryByBucketKey(found.bucketKey);
    if (primary?.slug) canonicalPath = `/${primary.slug}`;
  }

  return {
    props: { plan: found, slug, canonicalPath },
    revalidate: 2 * 3600,
  };
}

export default function EsimVariantPage({ plan, slug, canonicalPath }) {
  return <PlanPage plan={plan} slug={slug} canonicalPath={canonicalPath} />;
}
