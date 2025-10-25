import Link from "next/link";
import styled from "@emotion/styled";
import { useState } from "react";

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
});

const LeftSection = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "32px",
});

const Logo = styled("img")({
  cursor: "pointer",
});

const NavLink = styled(Link)({
  textDecoration: "none",
  color: "#112B3C",
  fontFamily: "var(--font-kanit)",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "18px",
});

export default function NavBar() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Nav>
      <LeftSection>
        <Link href="/">
          <Logo
            src="/pingwe-logo.svg"
            alt="Pingwe Logo"
            width={70}
            height={23}
          />
        </Link>
        <NavLink href="/info/destinations">Destinations</NavLink>
        <NavLink href="/info/what-is-esim">What is an eSIM</NavLink>
      </LeftSection>
    </Nav>
  );
}
