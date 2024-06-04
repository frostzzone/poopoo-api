import puppeteer from "puppeteer";

function isValidUrl(string) {
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }

    return true;
  }

export default async function handler(req, res) {
  let url = req.query.url
  if(!isValidUrl(url)) return res.status(400).json({
    status: 400,
    message: "Invalid parameter `url`. Must be a valid URL"
  })

  const browser = await puppeteer.launch({
    headless: true
  })

  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 720 })

  await page.goto(url, {
    waitUntil: "networkidle0"
  })

  const shoot = await page.screenshot({
    type: "png"
  })

  res.setHeader("Content-Type", "image/png")

  res.send(Buffer.from(shoot))

  // clean up
  browser.close()
}