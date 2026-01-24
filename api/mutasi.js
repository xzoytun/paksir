export default function handler(req, res) {
  // Langsung kirim status 400 (Bad Request) atau 200 (OK)
  res.status(200).json({
    status: "error",
    message: "Missing apikey"
  });
}
