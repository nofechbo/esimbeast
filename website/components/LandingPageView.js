// Renders a programmatic-SEO intent page (e.g. "eSIM Morocco from the UK").
// Self-canonical, FAQPage JSON-LD, and a funnel of links down to the canonical
// /esim/{destination}/{data}-{duration} product pages.
import Head from "next/head";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import SEO from "./SEO";
import { formatDataSize, formatDuration } from "@/utils/formaters";

export default function LandingPageView({ page, plans = [] }) {
  const faq = Array.isArray(page.faq) ? page.faq : [];
  const faqJsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <SEO title={page.title} description={page.metaDescription} path={`/${page.slug}`} />
      {faqJsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </Head>
      )}

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1>{page.title}</h1>
        {page.intro && <p style={{ fontSize: 18, lineHeight: 1.6 }}>{page.intro}</p>}

        {plans.length > 0 && (
          <section style={{ margin: "1.5rem 0" }}>
            <h2>Choose your plan</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {plans.map((p) => {
                const planSlug = p.slug?.split("/")[2];
                if (!planSlug) return null;
                return (
                  <li key={p.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                    <Link href={`/esim/${page.destination}/${planSlug}`}>
                      {formatDataSize(p.data)} · {formatDuration(p.days)} — ${(p.price / 100).toFixed(2)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {page.body && (
          <section className="landing-body">
            <ReactMarkdown>{page.body}</ReactMarkdown>
          </section>
        )}

        {faq.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <h2>FAQ</h2>
            {faq.map((f, i) => (
              <div key={i} style={{ marginBottom: "1rem" }}>
                <h3 style={{ marginBottom: 4 }}>{f.q}</h3>
                <p style={{ margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
