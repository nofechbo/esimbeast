// Country hub:  /esim/{country}  — the "{country} esim" money page that lists
// every canonical variant for that country/region and links to each. This is the
// topical cluster head for the programmatic-SEO channel. (Styling intentionally
// minimal here — wire it into the site's components when the design lands.)
import Link from "next/link";
import SEO from "@/components/SEO";
import { getPrimaryPlans, getPlansByCountrySlug } from "@/lib/db/plans";
import { formatDataSize, formatDuration } from "@/utils/formaters";

function titleize(countrySlug) {
  return countrySlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function getStaticPaths() {
  const primaries = await getPrimaryPlans();
  const countries = new Set(
    primaries.filter((p) => p.slug?.startsWith("esim/")).map((p) => p.slug.split("/")[1]),
  );
  return {
    paths: [...countries].map((country) => ({ params: { country } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { country } = params;
  const plans = await getPlansByCountrySlug(country);
  if (!plans.length) return { notFound: true, revalidate: 3600 };
  return { props: { country, plans }, revalidate: 2 * 3600 };
}

export default function CountryHub({ country, plans }) {
  const name = titleize(country);
  return (
    <>
      <SEO
        title={`${name} eSIM — data plans & prices`}
        description={`Compare ${name} eSIM data plans. ${plans.length} options, instant activation, no roaming fees. Pick your data and validity.`}
        path={`/esim/${country}`}
      />
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1>{name} eSIM plans</h1>
        <p>{plans.length} plans available — instant delivery, no roaming fees.</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {plans.map((p) => {
            const [, , planSlug] = p.slug.split("/");
            return (
              <li key={p.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                <Link href={`/esim/${country}/${planSlug}`}>
                  {formatDataSize(p.data)} · {formatDuration(p.days)} — ${(p.price / 100).toFixed(2)}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
