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

const TooltipWrapper = styled("div")({
  position: "relative",
  display: "inline-block",
});

// @ts-ignore
const Tooltip = styled("div")(({ show }) => ({
  position: "absolute",
  top: "calc(100% + 8px)", // Changed from bottom to top
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#112B3C",
  color: "white",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "var(--font-kanit)",
  whiteSpace: "nowrap",
  opacity: show ? 1 : 0,
  visibility: show ? "visible" : "hidden",
  transition: "opacity 0.2s, visibility 0.2s",
  pointerEvents: "none",
  zIndex: 100,

  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "100%", // Changed from top to bottom
    left: "50%",
    transform: "translateX(-50%)",
    borderWidth: "6px",
    borderStyle: "solid",
    borderColor: "transparent transparent #112B3C transparent", // Flipped the arrow
  },
}));

const AuthButton = styled("button")({
  backgroundColor: "#ec4899",
  color: "white",
  fontFamily: "var(--font-montserrat)",
  fontSize: "12px",
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: "9999px",
  border: "none",
  cursor: "pointer",
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
        <NavLink href="/destinations">Destinations</NavLink>
        <NavLink href="/what-is-esim">What is an eSIM</NavLink>
      </LeftSection>

      <TooltipWrapper
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* @ts-ignore */}
        <Tooltip show={showTooltip}>Coming soon</Tooltip>
        <AuthButton>Log in / Sign up</AuthButton>
      </TooltipWrapper>
    </Nav>
  );
}
