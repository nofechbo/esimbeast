import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import {
  DetailCard,
  DetailLabel,
  DetailRow,
  DetailValue,
  StatusBadgeError,
  StatusBadgeSuccess,
  SuccessBox,
  SuccessContainer,
  SuccessSubtitle,
  PrimaryButton,
} from "@/styles/successPageStyles";

function formatBytes(bytes) {
  const num = parseInt(bytes, 10);
  if (num === 0) return "0 B";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(timestampMs) {
  const date = new Date(parseInt(timestampMs, 10));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PlanStatus() {
  const router = useRouter();
  const { supplier, code } = router.query;

  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchStatus = async () => {
      setStatus("loading");
      try {
        const res = await fetch(
          `/api/plan-status/?supplier=${supplier}&code=${code}`,
        );
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to fetch plan status");
          setStatus("error");
          return;
        }

        setData(json);
        setStatus("ok");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    };

    fetchStatus();
  }, [code]);

  return (
    <SuccessContainer>
      <SEO title="eSIM Plan Status" path="/plan-status" image={null} noindex />
      <SuccessBox>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#112B3C",
            marginBottom: "0.5rem",
            fontFamily: "Kanit",
          }}
        >
          eSIM Plan Status
        </h1>

        {!code && status === "idle" && (
          <SuccessSubtitle>
            No redemption code provided. Please check your URL.
          </SuccessSubtitle>
        )}

        {status === "loading" && (
          <SuccessSubtitle>Loading plan status...</SuccessSubtitle>
        )}

        {status === "error" && (
          <>
            <StatusBadgeError>{error}</StatusBadgeError>
            <SuccessSubtitle>
              Please check your redemption code and try again.
            </SuccessSubtitle>
          </>
        )}

        {status === "ok" && data && (
          <>
            {data.status && (
              <StatusBadgeSuccess>{data.status}</StatusBadgeSuccess>
            )}

            <DetailCard>
              <DetailRow>
                <DetailLabel>Data Used</DetailLabel>
                <DetailValue>{formatBytes(data.dataUsed)}</DetailValue>
              </DetailRow>
              {data.totalData && (
                <DetailRow>
                  <DetailLabel>Total Data</DetailLabel>
                  <DetailValue>{formatBytes(data.totalData)}</DetailValue>
                </DetailRow>
              )}
              {data.validFrom && (
                <DetailRow>
                  <DetailLabel>Valid From</DetailLabel>
                  <DetailValue>{formatDate(data.validFrom)}</DetailValue>
                </DetailRow>
              )}
              {data.validUntil && (
                <DetailRow>
                  <DetailLabel>Valid Until</DetailLabel>
                  <DetailValue>{formatDate(data.validUntil)}</DetailValue>
                </DetailRow>
              )}
              {data.lastUpdated && (
                <DetailRow>
                  <DetailLabel>Last Updated</DetailLabel>
                  <DetailValue>
                    {new Date(data.lastUpdated).toLocaleString()}
                  </DetailValue>
                </DetailRow>
              )}
            </DetailCard>

            {data.dailyUsage && data.dailyUsage.length > 0 && (
              <>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#112B3C",
                    marginBottom: "1rem",
                    textAlign: "left",
                    fontFamily: "Kanit",
                  }}
                >
                  Daily Usage
                </h2>
                <DetailCard>
                  {data.dailyUsage.map((item, index) => (
                    <DetailRow key={index}>
                      <DetailLabel>
                        {item.usageDate.replace(
                          /(\d{4})(\d{2})(\d{2})/,
                          "$1-$2-$3",
                        )}{" "}
                        ({item.enus})
                      </DetailLabel>
                      <DetailValue>{formatBytes(item.usage)}</DetailValue>
                    </DetailRow>
                  ))}
                </DetailCard>
              </>
            )}

            {(!data.dailyUsage || data.dailyUsage.length === 0) && (
              <SuccessSubtitle style={{ marginTop: "1rem" }}>
                No usage data available yet. If you've recently activated your
                eSIM, please check back in a few hours.
              </SuccessSubtitle>
            )}
          </>
        )}

        <PrimaryButton
          onClick={() => router.push("/")}
          style={{ marginTop: "1.5rem" }}
        >
          Back to Home
        </PrimaryButton>
      </SuccessBox>
    </SuccessContainer>
  );
}
