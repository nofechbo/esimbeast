import Link from "next/link";
import styled from "@emotion/styled";
import { HEADER_LOGO } from "@/config";

const Nav = styled("nav")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 24px",
  backgroundColor: "white",
  zIndex: 50,

  "@media (max-width: 768px)": {
    padding: "20px 16px",
  },
});

const LeftSection = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "32px",

  "@media (max-width: 768px)": {
    gap: "16px",
  },
});

const Logo = styled("img")({
  cursor: "pointer",

  "@media (max-width: 768px)": {
    width: "80px",
    height: "auto",
  },
});

const NavLink = styled(Link)({
  textDecoration: "none",
  color: "#112B3C",
  fontFamily: "Kanit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "18px",

  "@media (max-width: 768px)": {
    fontSize: "12px",
    lineHeight: "16px",
  },
});

export default function NavBar() {
  return (
    <Nav>
      <LeftSection>
        <Link href="/">
          <Logo src={HEADER_LOGO} alt="eSIM Logo" width={120} height={30} />
        </Link>
        <NavLink href="/info/what-is-esim">What is an eSIM</NavLink>
      </LeftSection>
    </Nav>
  );
}
