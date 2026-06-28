import "@/styles/output.css";
import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Kanit, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ChatLauncher from "@/components/ChatLauncher";
import { GA_ID, pageview } from "@/lib/gtag";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-kanit", // optional: to use as CSS variable
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
});

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Track client-side route changes as GA pageviews (the initial load is
  // captured by the gtag config call below).
  useEffect(() => {
    if (!GA_ID) return;
    const handleRouteChange = (url) => pageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
    <div className={`${kanit.variable} ${montserrat.variable}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}
      <NavBar />
      <Component {...pageProps} />
      <Footer />
      {process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <ChatLauncher />}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
