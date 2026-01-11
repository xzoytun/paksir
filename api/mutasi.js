import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Harus POST");
    }

    let body = "";

    await new Promise((resolve, reject) => {
      req.on("data", chunk => body += chunk);
      req.on("end", resolve);
      req.on("error", reject);
    });

    if (!body || !body.includes("username") || !body.includes("token")) {
      return res.status(400).send("Payload tidak valid");
    }

    // Forward ke API Orkut / Paksir
    const response = await fetch("https://paksir.sshgreen.cloud/api/mutasi", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/4.12.0"
      },
      body: body
    });

    const text = await response.text();

    res.status(200).send(text);

  } catch (err) {
    console.error("MUTASI_ERROR:", err);
    res.status(500).send("Server error: " + err.message);
  }
}
