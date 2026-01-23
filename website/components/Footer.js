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

        <div className={styles.linkSections}>
          <div>
            <h4 className={styles.sectionTitle}>ESIM</h4>
            <ul className={styles.sectionList}>
              <li>Popular</li>
              <li>Countries</li>
              <li>Regions</li>
              <li>FAQ</li>
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
      </div>

      {/* divider */}
      <div className={styles.divider}></div>

      <div className={styles.bottomNote}>
        © {new Date().getFullYear()} {SITE_NAME}
        <span className={styles.legalLinks}>
          <Link href="/legal/terms-and-conditions">
            <span className={styles.legalLink}>Terms</span>
          </Link>
          <span> | </span>
          <Link href="/legal/privacy-policy">
            <span className={styles.legalLink}>Privacy</span>
          </Link>
        </span>
      </div>
    </footer>
  );
}
