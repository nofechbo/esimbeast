import "@/styles/output.css";
import Head from "next/head";
import { Kanit, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

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
  return (
    <div className={`${kanit.variable} ${montserrat.variable}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon_no_bg.png" />
      </Head>
      <NavBar />
      <Component {...pageProps} />
      <Footer />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
