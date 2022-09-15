var Jimp = require('jimp');

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}

export default async (req, res) => {
  let url = req.query.url
  if (isValidUrl(url) !== true || url.includes("<" || ">" || "<script>" || "</script>") || encodeURIComponent(url).includes("%3C" || "%3E" || "%20")) {
    return res.status(200).setHeader('Content-Type', 'application/json').send(JSON.stringify({
      error: "provide valid url",
      example: "/deepfry?url=https://poopoo-api.vercel.app/images/example.png"
    }, null, 4));
  }
  Jimp.read(url, (err, image) => {
    if (err) return res.setHeader('Content-Type', 'application/json').send(JSON.stringify({ error: "Make sure the url is an image" }, null, 4));
    for (let i = 0; i < 10; i++) {
      image.quality(1)
      image.convolute([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ])
    }
    image.contrast(1)
    image.getBuffer(Jimp.MIME_JPEG, function (err, buffer) {
      res.setHeader("Content-Type", 'image/png');
      res.send(buffer);
    });
  });
}