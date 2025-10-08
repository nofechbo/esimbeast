import { useRouter } from "next/router";

export default function PlanStatus() {
    const router = useRouter()
    const { rcode } = router.query

}

/*
data returned from WM:
code – result code (0 = success)
msg – message or error description
cid – ICCID of the eSIM
useSDate – usage start timestamp (ms)
useEDate – usage end timestamp (ms)
totalUsage – total data used (bytes)
esimStatus – eSIM activation status
simStatus – SIM network connection status
productType – plan type indicator
itemList – array of daily/network usage records
    usageDate – date of usage
    mcc – mobile country code
    code – country code (e.g. “CN”)
    zhtw – country name (in Traditional Chinese)
    enus – country name (English)
    usage – bytes used that day
*/