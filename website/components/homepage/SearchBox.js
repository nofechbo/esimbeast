import { getCountryCode } from "@/utils/homepage/codeToCountry";
import styled from "@emotion/styled";
import { useState } from "react";
import { toast } from "react-toastify";

const SearchOption = styled("select")({
  margin: "0 8px",
  padding: 8,
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 16,
  minWidth: 120,
});

const SearchButton = styled("button")({
  margin: "0 8px",
  padding: "8px 16px",
  borderRadius: 4,
  border: "none",
  backgroundColor: "#0070f3",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
});

export default function SearchBox({ searchOptions, onNavigate }) {
    const [country, setCountry] = useState("");
    const [dataSize, setDataSize] = useState("");
    const [duration, setDuration] = useState("");

    const handleSearch = async () => {
        if (!country || !dataSize || !duration) return;
        const countryCode = getCountryCode(country)
        if (!countryCode) return

        const res = await fetch("api/search/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, dataSize, duration }),
        });

        const data = await res.json();
        if (res.status === 404) {
            toast.info("No matching plan found");
            return;
        }

        if (!res.ok || !data.planUrl) {
            console.error('Search request failed:', { status: res.status, data })
            toast.error('Something went wrong. Please try again.');
            return;
        }

        onNavigate(data.planUrl);
    };

    return (
        <div>
            <SearchOption
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            >
            <option value="">Select Country</option>
            {searchOptions.countries.map((c) => (
                <option key={c} value={c}>
                {c}
                </option>
            ))}
            </SearchOption>
            <SearchOption
            value={dataSize}
            onChange={(e) => setDataSize(e.target.value)}
            >
            <option value="">Select Data Size</option>
            {searchOptions.dataSizes.map((d) => (
                <option key={d} value={d}>
                {d === 0 ? "Unlimited" : d < 1 ? `${d * 1000} MB` : `${d} GB`}
                </option>
            ))}
            </SearchOption>
            <SearchOption
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            >
            <option value="">Select Duration</option>
            {searchOptions.durations.map((d) => (
                <option key={d} value={d}>
                {d} {d === 1 ? "day" : "days"}
                </option>
            ))}
            </SearchOption>
            <SearchButton onClick={handleSearch}>Search</SearchButton>
        </div>
    );
}
