import { getCountryCode } from "@/utils/homepage/codeToCountry";
import styled from "@emotion/styled";
import { useState } from "react";
import { toast } from "react-toastify";
import { CustomDropdown } from "./CustomDropdown.js";

const SearchBar = styled('div')({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '44px',
    border: '1px solid #E2DFE7',
    background: '#FFF',
    boxShadow: '2px 10px 38px 0 rgba(31, 1, 71, 0.10)',
    width: '100%',
    maxWidth: '800px',
    height: '90px',
    flexShrink: 0,
    paddingRight: '90px',
});

const OptionWrapper = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const SearchOption = styled('select')({
    paddingLeft: 30,
    fill: '#FFF',
    filter: 'drop-shadow(2px 6px 38px rgba(17, 43, 60, 0.12))',
    width: '210px',
    height: '90px',
    flexShrink: 0,
    color: '#3E484E',
    fontFamily: 'Kanit',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '16px',
});

const Divider = styled('div')({
  width: '1px',
  height: '46px',
  backgroundColor: '#E2DFE7',
  marginLeft: 25,
  flexShrink: 0,
  zIndex: 1,
  pointerEvents: 'none',
});

const SearchButton = styled("button")({
    position: 'absolute',
    right: '12px',
    width: 66,
    height: 66,
    flexShrink: 0,
    cursor: "pointer",
});

export default function SearchBox({ searchOptions, onNavigate, formatData, formatDuration }) {
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
        <SearchBar>
            <CustomDropdown
                value={country}
                onChange={setCountry}
                options={searchOptions.countries}
                title='Location'
                placeholder="Select Country"
            />

            <Divider />

            <CustomDropdown
                value={duration}
                onChange={setDuration}
                options={searchOptions.durations}
                title='Duration'
                placeholder="Select Duration"
                formatOption={formatDuration}
            />

            <Divider />

            <CustomDropdown
                value={dataSize}
                onChange={setDataSize}
                options={searchOptions.dataSizes}
                placeholder="Select Data Size"
                title='Plan size'
                formatOption={formatData}
            />

            <SearchButton onClick={handleSearch}>
                <img src="/icons/search.svg" alt="search" />
            </SearchButton>
        </SearchBar>
    );
}
