import { generateEncStr } from "@/utils/generateEncStr";
import {
  WM_USAGE_QUERY_URL,
  WM_MERCHANT_ID,
  WM_TOKEN,
  ESIMACCESS_ACCESS_CODE,
} from "@/config";

const url = WM_USAGE_QUERY_URL;
const merchantId = WM_MERCHANT_ID;
const token = WM_TOKEN;

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const { supplier, code } = req.query;
  if (typeof code !== "string" || !code) {
    return res.status(400).json({ error: "Missing or invalid code parameter" });
  }
  if (typeof supplier !== "string" || !supplier) {
    return res
      .status(400)
      .json({ error: "Missing or invalid supplier parameter" });
  }

  //WM flow
  if (supplier === "WM") {
    try {
      const encStr = generateEncStr({ merchantId, rcode: code }, token);

      const requestBody = {
        merchantId,
        rcode: code,
        encStr,
      };

      const wmRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await wmRes.json();
      console.log(`WM plan status response for rcode ${code}:`, data);

      if (data.code !== 0) {
        console.error(`Worldmove API error for rcode ${code}: ${data.msg}`);
        return res.status(400).json({
          error:
            "Invalid or expired redemption code. Please check and try again.",
        });
      }

      return res.status(200).json({
        dataUsed: data.totalUsage,
        totalData: null,
        lastUpdated: null,
        status: `${simStatusLabels[data.simStatus]} - ${esimStatusLabels[data.esimStatus]}`,
        validFrom: data.useSDate,
        validUntil: data.useEDate,
        dailyUsage: data.itemList,
      });
    } catch (err) {
      console.error(
        `Failed to fetch WM plan status for rcode ${code}: ${err.message}`,
      );
      return res.status(500).json({ error: "Failed to fetch plan status" });
    }
  }

  // EA flow
  if (supplier === "EA") {
    try {
      const eaRes = await fetch(
        "https://api.esimaccess.com/api/v1/open/esim/usage/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "RT-AccessCode": ESIMACCESS_ACCESS_CODE,
          },
          body: JSON.stringify({ esimTranNoList: [code] }),
        },
      );

      const data = await eaRes.json();
      console.log(`EA plan status response for code ${code}:`, data);

      if (!data.success) {
        console.error(`EA API error for code ${code}:`, data);
        return res.status(400).json({
          error:
            "Invalid or expired redemption code. Please check and try again.",
        });
      }

      const usage = data.obj?.esimUsageList?.[0];
      if (!usage) {
        console.log(`No usage data yet for EA code ${code}`);
        return res.status(200).json({
          dataUsed: 0,
          totalData: null,
          lastUpdated: null,
          status: null,
          validFrom: null,
          validUntil: null,
          dailyUsage: null,
        });
      }

      return res.status(200).json({
        dataUsed: usage.dataUsage,
        totalData: usage.totalData,
        lastUpdated: usage.lastUpdateTime,
        status: null,
        validFrom: null,
        validUntil: null,
        dailyUsage: null,
      });
    } catch (err) {
      console.error(
        `Failed to fetch EA plan status for code ${code}: ${err.message}`,
      );
      return res.status(500).json({ error: "Failed to fetch plan status" });
    }
  }

  return res.status(400).json({ error: `Unsupported supplier: ${supplier}` });
}
