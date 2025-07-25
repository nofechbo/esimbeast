import Link from 'next/link';

export default function NavBar() {
  return (
    <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: 'white',
        zIndex: 50
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px',  }}>
            <Link href="/">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/pingwe-logo.svg"
                    alt="Pingwe Logo"
                    width={70}
                    height={23}
                    style={{ cursor: 'pointer' }}
                />
            </Link>
            <Link href="/destinations" style={{ 
                textDecoration: 'none', 
                color: '#112B3C',
                fontFamily: 'var(--font-kanit)',
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '18px'
            }}>
                Destinations
            </Link>
            <Link href="/what-is-esim" style={{ 
                textDecoration: 'none', 
                color: '#112B3C',
                fontFamily: 'var(--font-kanit)',
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '18px'
            }}>
                What is an eSIM
            </Link>
        </div>
        
        <button style={{
            backgroundColor: '#ec4899',
            color: 'white',
            fontFamily: 'var(--font-montserrat)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer'
        }}>
            Log in / Sign up
        </button>
    </nav>
  );
}