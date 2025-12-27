import Head from "next/head";
import { SITE_NAME, SITE_URL, HEADER_LOGO } from "@/config";

const DEFAULT_DESCRIPTION = "Get the best eSIM data plans for international travel. Compare prices, coverage, and data packages for 190+ countries. Instant activation, no roaming fees.";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}${HEADER_LOGO}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}
