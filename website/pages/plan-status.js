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

const esimStatusLabels = {
  0: "Unknown",
  1: "Active",
  2: "Invalid",
};

const simStatusLabels = {
  0: "Inactive",
  1: "Active",
  5: "Voided",
  6: "Expired",
};

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
  const { rcode } = router.query;

  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rcode) return;

    const fetchStatus = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/plan-status/${rcode}`);
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
  }, [rcode]);

  return (
    <SuccessContainer>
      <SEO title="eSIM Plan Status" path="/plan-status" noindex />
      <SuccessBox>
        <h1 style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#112B3C",
          marginBottom: "0.5rem",
          fontFamily: "Kanit"
        }}>
          eSIM Plan Status
        </h1>

        {!rcode && status === "idle" && (
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
            <StatusBadgeSuccess>
              {simStatusLabels[data.simStatus] || "Unknown"} - {esimStatusLabels[data.esimStatus] || "Unknown"}
            </StatusBadgeSuccess>

            <DetailCard>
              <DetailRow>
                <DetailLabel>eSIM ID</DetailLabel>
                <DetailValue>{data.cid}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Valid From</DetailLabel>
                <DetailValue>{formatDate(data.useSDate)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Valid Until</DetailLabel>
                <DetailValue>{formatDate(data.useEDate)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Total Usage</DetailLabel>
                <DetailValue>{formatBytes(data.totalUsage)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>eSIM Status</DetailLabel>
                <DetailValue>{esimStatusLabels[data.esimStatus] || "Unknown"}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>SIM Status</DetailLabel>
                <DetailValue>{simStatusLabels[data.simStatus] || "Unknown"}</DetailValue>
              </DetailRow>
            </DetailCard>

            {data.itemList && data.itemList.length > 0 && (
              <>
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#112B3C",
                  marginBottom: "1rem",
                  textAlign: "left",
                  fontFamily: "Kanit"
                }}>
                  Daily Usage
                </h2>
                <DetailCard>
                  {data.itemList.map((item, index) => (
                    <DetailRow key={index}>
                      <DetailLabel>
                        {item.usageDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")} ({item.enus})
                      </DetailLabel>
                      <DetailValue>{formatBytes(item.usage)}</DetailValue>
                    </DetailRow>
                  ))}
                </DetailCard>
              </>
            )}

            {(!data.itemList || data.itemList.length === 0) && (
              <SuccessSubtitle style={{ marginTop: "1rem" }}>
                No usage recorded yet.
              </SuccessSubtitle>
            )}
          </>
        )}

        <PrimaryButton onClick={() => router.push("/")} style={{ marginTop: "1.5rem" }}>
          Back to Home
        </PrimaryButton>
      </SuccessBox>
    </SuccessContainer>
  );
}
