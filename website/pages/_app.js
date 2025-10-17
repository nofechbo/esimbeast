import "@/styles/output.css";
import Head from 'next/head';
import { Kanit, Montserrat } from 'next/font/google';
import { ToastContainer } from "react-toastify";

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['400', '600', '800'], // only include what you use
  variable: '--font-kanit',       // optional: to use as CSS variable
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
})


export default function MyApp({ Component, pageProps }) {
  return (
    <div className={`${kanit.variable} ${montserrat.variable}`}>
      <Head>
        <link rel="icon" href="/favicon_no_bg.png" />
      </Head>
      <Component {...pageProps} />

       <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}