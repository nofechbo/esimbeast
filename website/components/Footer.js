import styles from '../styles/Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
        <div className={styles.footerTop}>
            <div className={styles.logoContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pingwe_logo_white_bg.svg" alt="Pingwe Logo" style={{ height: '30px' }} />
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
                    <li>About us</li>
                    <li>What is eSim</li>
                    <li>Supported devices</li>
                    <li>Affiliate program</li>
                    <li>Blog</li>
                  </ul>
                </div>

                <div>
                  <h4 className={styles.sectionTitle}>LEGAL</h4>
                  <ul className={styles.sectionList}> 
                    <li>Terms & conditions</li>
                    <li>Privacy policy</li>
                    <li>Cookies policy</li>
                    <li>Refunds policy</li>
                  </ul>
                </div>
            </div>
        </div>
        
        {/* divider */}
        <div className={styles.divider}></div>

        <div className={styles.bottomNote}>
          © 2024 Pingwe 
        <span style={{ marginLeft: '750px' }}>
          <span className={styles.legalLink}>Terms</span>
          <span>  | </span>
          <span className={styles.legalLink}>Privacy</span>
        </span>
      </div>
    </footer>
  );
}
