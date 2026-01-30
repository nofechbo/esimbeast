import Link from "next/link";
import styles from "../styles/Footer.module.css";
import { SITE_NAME, FOOTER_LOGO } from "@/config";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.logoContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FOOTER_LOGO}
            alt="eSIM Logo"
            style={{ height: "30px" }}
          />
        </div>

        <div className={styles.rightSection}>
          <div className={styles.linkSections}>
            <div>
              <h4 className={styles.sectionTitle}>ESIM</h4>
              <ul className={styles.sectionList}>
                <li>
                  <Link href="/info/what-is-esim">FAQ</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.sectionTitle}>ABOUT</h4>
              <ul className={styles.sectionList}>
                <li>
                  <Link href="/info/about-us">About us</Link>
                </li>
                <li>
                  <Link href="/info/what-is-esim">What is eSim</Link>
                </li>
                <li>
                  <Link href="/info/supported-devices">Supported devices</Link>
                </li>
                <li>
                  <Link href="/info/affiliate-program">Affiliate program</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.sectionTitle}>LEGAL</h4>
              <ul className={styles.sectionList}>
                <li>
                  <Link href="/legal/terms-and-conditions">
                    Terms & conditions
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy-policy">Privacy policy</Link>
                </li>
                <li>
                  <Link href="/legal/cookies-policy">Cookies policy</Link>
                </li>
                <li>
                  <Link href="/legal/refunds-policy">Refunds policy</Link>
                </li>
                <li>
                  <Link href="/legal/fair-usage-policy">Fair usage policy</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.addressBlock}>
            <h4 className={styles.addressTitle}>Contact</h4>
            <p className={styles.companyAddress}>
              <a href="mailto:esimsupport@esimbeast.com">esimsupport@esimbeast.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* divider */}
      <div className={styles.divider}></div>

      <div className={styles.bottomNote}>
        © {new Date().getFullYear()} {SITE_NAME}
        <span className={styles.legalLinks}>
          <Link href="/legal/terms-and-conditions" className={styles.legalLink}>
            Terms
          </Link>
          <span> | </span>
          <Link href="/legal/privacy-policy" className={styles.legalLink}>
            Privacy
          </Link>
        </span>
      </div>
    </footer>
  );
}
