// add - Verify signature (encStr)
//add - db writes
export default function handler(req, res) {
    if (req.method === "POST") {
        console.log("Body:", req.body);
        res.status(200).send("1");
    } else {
        res.status(405).send("Method Not Allowed");
    }
}