export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from raw Node.js function",
    url: req.url,
    method: req.method,
    path: req.path,
  });
}
