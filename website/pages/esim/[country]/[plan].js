// One route, two page types under /esim/{country}/{segment}:
//   - intent landing page  e.g. /esim/morocco/from-uk      (LandingPage)
//   - canonical product page e.g. /esim/morocco/10gb-30-days (Plan)
// Landing pages are resolved FIRST so a "from-uk" segment is never mistaken for a
// plan slug. They never collide in practice (plan slugs are {data}-{duration}).
import PlanPage from "@/components/PlanPage";
import LandingPageView from "@/components/LandingPageView";
import {
  getPlanBySlug,
  getPrimaryPlans,
  getPrimaryByBucketKey,
  getPlansByCountrySlug,
} from "@/lib/db/plans";
import { getLandingPageBySlug, getAllLandingPages } from "@/lib/db/landing";
import { MAX_STATIC_PATHS } from "@/config";

export async function getStaticPaths() {
  const [primaries, landings] = await Promise.all([getPrimaryPlans(), getAllLandingPages()]);
  const planPaths = primaries
    .filter((p) => p.slug?.startsWith("esim/"))
    .slice(0, MAX_STATIC_PATHS)
    .map((p) => {
      const [, country, plan] = p.slug.split("/");
      return { params: { country, plan } };
    });
  const landingPaths = landings
    .filter((l) => l.slug?.startsWith("esim/"))
    .map((l) => {
      const [, country, plan] = l.slug.split("/");
      return { params: { country, plan } };
    });
  return { paths: [...landingPaths, ...planPaths], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { country, plan } = params;
  const slug = `esim/${country}/${plan}`;

  // 1) intent landing page?
  const landing = await getLandingPageBySlug(slug);
  if (landing) {
    const plans = await getPlansByCountrySlug(landing.destination);
    return { props: { type: "landing", page: landing, plans }, revalidate: 2 * 3600 };
  }

  // 2) product page
  const found = await getPlanBySlug(slug);
  if (!found) return { notFound: true, revalidate: 3600 };
  let canonicalPath = `/${found.slug}`;
  if (!found.isPrimary) {
    const primary = await getPrimaryByBucketKey(found.bucketKey);
    if (primary?.slug) canonicalPath = `/${primary.slug}`;
  }
  return { props: { type: "plan", plan: found, slug, canonicalPath }, revalidate: 2 * 3600 };
}

export default function EsimPage(props) {
  if (props.type === "landing") {
    return <LandingPageView page={props.page} plans={props.plans} />;
  }
  return <PlanPage plan={props.plan} slug={props.slug} canonicalPath={props.canonicalPath} />;
}
