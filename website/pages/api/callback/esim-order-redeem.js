
export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Body:", req.body);
    res.status(200).send("1");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}





/*
// add - Verify signature (encStr)
//add - db writes

export default async function handler(req, res) {
  if (req.method === "POST") {
    let body = req.body;

    // ✅ In case body wasn’t parsed automatically
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        console.error("Failed to parse body:", err);
        return res.status(400).send("Invalid JSON");
      }
    }

    console.log("eSIM Order & Redeem Callback:", body);

    // Must return plain string "1"
    return res.status(200).send("1");
  }

  res.status(405).send("Method Not Allowed");
}

*/