import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
        position: 'relative',
        bottom: 0,
        width: '100%',
        color: '#F3F4F6',
        padding: '48px 32px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto 0 auto',
        backgroundColor: 'transparent',
        zIndex: 10,
        pointerEvents: 'auto',
        marginTop: '40px'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            marginBottom: '30px',
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '24px', marginRight: '64px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pingwe_logo_white_bg.svg" alt="Pingwe Logo" style={{ height: '30px' }} />
            </div>

            <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
                <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#FFF',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  lineHeight: '18px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  width: '200px',
                  height: '18px'
                }}>
                  ESIM
                </h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0, 
                  lineHeight: '32px',
                  color: '#74828B',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  fontWeight: '400',
                  letterSpacing: '0.4px',
                  width: '200px'
                }}>
                    <li>Popular</li>
                    <li>Countries</li>
                    <li>Regions</li>
                    <li>FAQ</li>
                </ul>
                </div>

                <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#FFF',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  lineHeight: '18px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  width: '200px',
                  height: '18px'
                }}>
                  ABOUT
                </h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0, 
                  lineHeight: '32px',
                  color: '#74828B',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  fontWeight: '400',
                  letterSpacing: '0.4px',
                  width: '200px'
                }}>   
                    <li>About us</li>
                    <li>What is eSim</li>
                    <li>Supported devices</li>
                    <li>Affiliate program</li>
                    <li>Blog</li>
                </ul>
                </div>

                <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#FFF',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  lineHeight: '18px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  width: '200px',
                  height: '18px'
                }}>
                  LEGAL
                </h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0, 
                  lineHeight: '32px',
                  color: '#74828B',
                  fontFamily: 'var(--font-kanit)',
                  fontSize: '16px',
                  fontWeight: '400',
                  letterSpacing: '0.4px',
                  width: '200px'
                }}> 
                    <li>Terms & conditions</li>
                    <li>Privacy policy</li>
                    <li>Cookies policy</li>
                    <li>Refunds policy</li>
                </ul>
                </div>
            </div>
        </div>
        
        {/* divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#3E484E', margin: '0px 0 16px 0' }}></div>

        <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            fontSize: '16px', 
            color: '#74828B',
            fontFamily: 'var(--font-montserrat)',
            fontWeight: '600',
            lineHeight: '20px',
            maxWidth: '1200px', 
            margin: '0 auto'
        }}>
          © 2024 Pingwe 
        <span style={{ marginLeft: '750px' }}>
          <span style={{ 
            textDecoration: 'underline',
            fontFamily: 'var(--font-kanit)',
            fontWeight: '600',
            lineHeight: '20px'
          }}>Terms</span> 
          <span>  | </span>
          <span style={{ 
            textDecoration: 'underline',
            fontFamily: 'var(--font-kanit)',
            fontWeight: '600',
            lineHeight: '20px'
          }}>Privacy</span>
        </span>
      </div>
    </footer>
  );
}
