import crypto from "crypto";

// add - Verify signature (encStr)
//add - db writes (add try-catch)
export async function POST(req) {
    if (req.method === "POST") {
        console.log("eSIM Order & Redeem Callback:", req.body);
        res.status(200).send("1");

    } else {
        res.status(405).send("Method Not Allowed")
    }
}
