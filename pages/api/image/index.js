import Chromium from "chrome-aws-lambda";
import chrome from "@sparticuz/chromium";

function isValidUrl(string) {
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }

    return true;
  }

export default async function handler(req, res) {
  try {
    let url = req.query.url
    if(!isValidUrl(url)) return res.status(400).json({
      status: 400,
      message: "Invalid parameter `url`. Must be a valid URL"
    })

    chrome.setHeadlessMode = true
  
    const executable = process.env.NODE_ENV === "production" ? await chrome.executablePath() : process.env.CHROME_PATH
  
    const browser = await Chromium.puppeteer.launch({
      executablePath: executable ?? await Chromium.executablePath, // fallback if env is not set
      headless: chrome.headless,
      args: [...chrome.args, "--font-render-hinting=none"]
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
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error\n"+error
    })
  }
}