import net from "net";

export default async function handler(req, res) {
  const socket = net.createConnection({ host: "smtp.gmail.com", port: 587 }, () => {
    res.status(200).send("✅ Connected to Gmail SMTP port 587");
    socket.end();
  });

  socket.on("error", (err) => {
    res.status(500).send("❌ Could not connect: " + err.message);
  });
}
