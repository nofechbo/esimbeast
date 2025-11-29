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
  width: "210px",
  height: "90px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  userSelect: "none",

  "@media (max-width: 768px)": {
    width: "85px",
    height: "70px",
  },
});

const SelectTitle = styled("div")({
  fontSize: "16px",
  color: "#3E484E",
  marginBottom: "4px",
  fontFamily: "Kanit",
  fontWeight: 500,

  "@media (max-width: 768px)": {
    fontSize: "12px",
    marginBottom: "2px",
  },
});

const SelectValue = styled("div")(({ hasValue }) => ({
  color: hasValue ? "#3E484E" : "#A2A8AD",
  fontFamily: "Kanit",
  fontSize: "18px",
  fontWeight: 400,

  "@media (max-width: 768px)": {
    fontSize: "10px",
  },
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

  "@media (max-width: 768px)": {
    width: "150px",
    maxHeight: "300px",
    borderRadius: "20px",
  },
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

  "@media (max-width: 768px)": {
    maxHeight: "300px",
    padding: "12px 0",
  },
});

const DropdownItem = styled("div")(({ isHighlighted }) => ({
  padding: "12px 24px",
  cursor: "pointer",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 400,
  color: "#3E484E",
  transition: "background-color 0.2s",
  letterSpacing: 0.5,
  backgroundColor: isHighlighted ? "#F3E8FF" : "transparent",
  "&:hover": { backgroundColor: "#F9FAFB" },

  "@media (max-width: 768px)": {
    padding: "10px 16px",
    fontSize: "12px",
  },
}));

const DropdownFlag = styled("img")({
  width: 24,
  height: 24,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,

  "@media (max-width: 768px)": {
    width: 20,
    height: 20,
  },
});

const EditableInput = styled("input")({
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "18px",
  fontWeight: 400,
  "&::placeholder": {
    color: "#A2A8AD",
  },

  "@media (max-width: 768px)": {
    fontSize: "11px",
    "&::placeholder": {
      fontSize: "9px",
    }
  },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex] && isOpen) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex, isOpen]);

  const isLocation = title === "Location";

  const filteredOptions =
    searchQuery.trim() === ""
      ? options
      : options.filter((opt) =>
          formatOption(opt).toLowerCase().startsWith(searchQuery.toLowerCase())
        );

  const displayValue =
    isLocation && !value ? "" : value ? formatOption(value) : placeholder;

  const handleKeyDown = (e) => {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const option = filteredOptions[highlightedIndex];
      onChange(String(option));
      setSearchQuery(formatOption(option));
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <OptionWrapper ref={dropdownRef}>
      <CustomSelect onClick={() => setIsOpen((prev) => !prev)}>
        <div>
          <SelectTitle>{title}</SelectTitle>
          <EditableInput
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </CustomSelect>
      <DropdownMenu isOpen={isOpen && filteredOptions.length > 0}>
        <DropdownList>
          {filteredOptions.map((option, index) => {
            const code = getCountryCode(option);
            const isHighlighted = index === highlightedIndex;
            return (
              <DropdownItem
                key={option}
                ref={(el) => (itemRefs.current[index] = el)}
                isHighlighted={isHighlighted}
                onClick={() => {
                  onChange(String(option));
                  setIsOpen(false);
                  setSearchQuery(formatOption(option));
                  setHighlightedIndex(-1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isLocation ? "10px" : "0",
                }}
              >
                {isLocation && (
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
