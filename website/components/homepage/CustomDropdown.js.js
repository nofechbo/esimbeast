// @ts-nocheck
import styled from "@emotion/styled";
import { useState, useRef, useEffect } from "react";
import FlagIcons from "../common/FlagIcons";
import { getCountryCode } from "@/utils/homepage/codeToCountry";

const OptionWrapper = styled("div")({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

const CustomSelect = styled("div")({
  paddingLeft: 30,
  width: "210px",
  height: "90px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  userSelect: "none",
});

const SelectTitle = styled("div")({
  fontSize: "16px",
  color: "#3E484E",
  marginBottom: "4px",
  fontFamily: "Kanit",
  fontWeight: 500,
});

const SelectValue = styled("div")(({ hasValue }) => ({
  color: hasValue ? "#3E484E" : "#A2A8AD",
  fontFamily: "Kanit",
  fontSize: "18px",
  fontWeight: 400,
}));

const DropdownMenu = styled("div")(({ isOpen }) => ({
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  width: "328px",
  maxHeight: "408px",
  background: "#FFF",
  border: "1px solid #E8EFF4",
  borderRadius: "28px",
  boxShadow: "2px 6px 38px 0 rgba(17, 43, 60, 0.12)",
  display: isOpen ? "block" : "none",
  zIndex: 1000,
  overflow: "hidden",
}));

const DropdownList = styled("div")({
  maxHeight: "408px",
  overflowY: "auto",
  padding: "16px 0",

  // Custom scrollbar styling
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
    marginTop: "16px",
    marginBottom: "16px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#D1D5DB",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#9CA3AF",
  },
});

const DropdownItem = styled("div")({
  padding: "12px 24px",
  cursor: "pointer",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 400,
  color: "#3E484E",
  transition: "background-color 0.2s",
  letterSpacing: 0.5,

  "&:hover": {
    backgroundColor: "#F9FAFB",
  },
});

const DropdownFlag = styled("img")({
  width: 24,
  height: 24,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
});

export function CustomDropdown({
  value,
  onChange,
  options,
  title,
  placeholder,
  formatOption = (x) => x,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const showFlag = title === "Location";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value ? formatOption(value) : placeholder;

  return (
    <OptionWrapper ref={dropdownRef}>
      <CustomSelect onClick={() => setIsOpen(!isOpen)}>
        <div>
          <SelectTitle>{title}</SelectTitle>
          <SelectValue hasValue={value !== ""}>{displayValue}</SelectValue>
        </div>
      </CustomSelect>
      <DropdownMenu isOpen={isOpen}>
        <DropdownList>
          {options.map((option) => {
            const code = getCountryCode(option);
            return (
              <DropdownItem
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: showFlag ? "10px" : "0",
                }}
              >
                {showFlag && (
                  <FlagIcons
                    countryCodes={code ? [code] : []}
                    Flag={DropdownFlag}
                  />
                )}
                {formatOption(option)}
              </DropdownItem>
            );
          })}
        </DropdownList>
      </DropdownMenu>
    </OptionWrapper>
  );
}
