import { getCountryCode } from "@/utils/homepage/codeToCountry";
import styled from "@emotion/styled";
import { useState } from "react";
import { toast } from "react-toastify";
import { CustomDropdown } from "./CustomDropdown.js";

const SearchBar = styled("div")({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "44px",
  border: "1px solid #E2DFE7",
  background: "#FFF",
  boxShadow: "2px 10px 38px 0 rgba(31, 1, 71, 0.10)",
  width: "100%",
  maxWidth: "800px",
  height: "90px",
  flexShrink: 0,

  "@media (max-width: 768px)": {
    maxWidth: "100%",
    height: "65px",
    borderRadius: "35px",
  },
});

const Divider = styled("div")({
  width: "1px",
  height: "46px",
  backgroundColor: "#E2DFE7",
  marginLeft: -15,
  marginRight: 30,
  flexShrink: 0,
  zIndex: 1,
  pointerEvents: "none",

  "@media (max-width: 768px)": {
    height: "36px",
    marginLeft: -5,
    marginRight: 20,
  },
});

const SearchButton = styled("button")(({ disabled }) => ({
  position: "absolute",
  right: "12px",
  width: 66,
  height: 66,
  flexShrink: 0,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.7 : 1,
  transition: "opacity 0.2s ease",

  "@media (max-width: 768px)": {
    width: 30,
    height: 30,
    right: "10px",
  },
}));

export default function SearchBox({
  searchOptions,
  onNavigate,
  formatData,
  formatDuration,
}) {
  const [country, setCountry] = useState("");
  const [dataSize, setDataSize] = useState("");
  const [duration, setDuration] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (isSearching) return;

    console.log(country, dataSize, duration);
    if (country === "" || dataSize === "" || duration === "") {
      toast.info("Please fill in all search fields");
      return;
    }

    const countryCode = getCountryCode(country);
    if (!countryCode) return;

    setIsSearching(true);

    try {
      const res = await fetch("api/search/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, dataSize, duration }),
      });

      const data = await res.json();
      if (res.status === 404) {
        toast.info("No matching plan found");
        setIsSearching(false);
        return;
      }

      if (!res.ok || !data.planUrl) {
        console.error("Search request failed:", { status: res.status, data });
        toast.error("Something went wrong. Please try again.");
        setIsSearching(false);
        return;
      }

      const params = new URLSearchParams({
        code: countryCode,
        days: duration,
        data: dataSize,
      });

      onNavigate(`${data.planUrl}?${params.toString()}`);
    } catch (err) {
      console.error("Search request failed:", err);
      toast.error("Something went wrong. Please try again.");
      setIsSearching(false);
    }
  };

  return (
    <SearchBar>
      <CustomDropdown
        value={country}
        onChange={setCountry}
        options={searchOptions.countries}
        title="Location"
        placeholder="Select Location"
      />

      <Divider />

      <CustomDropdown
        value={duration}
        onChange={setDuration}
        options={searchOptions.durations}
        title="Duration"
        placeholder="Set Duration"
        formatOption={formatDuration}
      />

      <Divider />

      <CustomDropdown
        value={dataSize}
        onChange={setDataSize}
        options={searchOptions.dataSizes}
        placeholder="Choose Plan Size"
        title="Plan size"
        formatOption={formatData}
      />

      <SearchButton onClick={handleSearch} disabled={isSearching}>
        <img
          src="/icons/search.svg"
          alt="search"
          style={{ width: "100%", height: "100%" }}
        />
      </SearchButton>
    </SearchBar>
  );
}
