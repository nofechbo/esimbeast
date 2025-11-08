// @ts-nocheck

export default function FlagIcons({
  countryCodes = [],
  Wrapper = "div",
  Flag = "img",
  ...wrapperProps
}) {
  const codes = countryCodes.length ? countryCodes : [null];
  const getFlagSrc = (code) =>
    code ? `/flags/${code.toUpperCase()}.png` : "/icons/pin.svg";

  return (
    <Wrapper {...wrapperProps}>
      {codes.map((code, i) => (
        <Flag
          key={i}
          src={getFlagSrc(code)}
          onError={(e) => {
            e.currentTarget.src = "/icons/pin.svg";
          }}
          alt={`${code || "default"} flag`}
        />
      ))}
    </Wrapper>
  );
}
