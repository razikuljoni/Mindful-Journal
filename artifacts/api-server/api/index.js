export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from minimal function",
    url: req.url,
    method: req.method,
  });
}
