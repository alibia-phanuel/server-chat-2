// src/services/resolveFacebookReel.ts
import axios from "axios";
import puppeteer from "puppeteer";

// 🔎 Extrait la première URL trouvée dans un texte
function extractLink(input: string): string | null {
  const regex = /(https?:\/\/[^\s]+)/;
  const match = input.match(regex);
  return match ? match[0] : null;
}

// 🔄 Résout les liens /reel/... en lien vidéo classique avec Puppeteer
async function resolveFacebookReelWithPuppeteer(
  url: string
): Promise<string | null> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    await new Promise((res) => setTimeout(res, 2000));

    const ogUrl = await page.$eval('meta[property="og:url"]', (el) =>
      el.getAttribute("content")
    );

    await browser.close();

    if (ogUrl && ogUrl.includes("/videos/")) {
      return ogUrl;
    }

    return null;
  } catch (error: any) {
    console.error("❌ Erreur Puppeteer :", error.message);
    return null;
  }
}

// 🧠 Fonction principale exportée
export default async function resolveFacebookReel(
  shortLink: string
): Promise<string | null> {
  const extractedLink = extractLink(shortLink);
  if (!extractedLink) {
    console.log("❌ Aucun lien détecté.");
    return null;
  }

  let longLink: string;

  // Étape 1 : Suivre les redirections (si lien court comme fb.me)
  try {
    const response = await axios.head(extractedLink, { maxRedirects: 10 });
    longLink = response.request.res.responseUrl;
  } catch (error) {
    console.log("⚠️ Axios a échoué, fallback Puppeteer...");
    const fallback = await resolveFacebookReelWithPuppeteer(extractedLink);
    if (!fallback) return null;
    longLink = fallback;
  }

  console.log("🔗 Lien long résolu :", longLink);

  // Étape 2 : Si c’est un reel, le résoudre avec Puppeteer
  if (longLink.includes("/reel/")) {
    console.log("🔁 Lien 'reel' détecté, résolution avec Puppeteer...");
    const resolved = await resolveFacebookReelWithPuppeteer(longLink);
    if (resolved) {
      longLink = resolved;
      console.log("🎯 Vidéo trouvée via Puppeteer :", longLink);
    } else {
      console.log("❌ Résolution reel échouée.");
      return null;
    }
  }

  // Étape 3 : Extraire l’URL de vidéo finale
  const regex = /facebook\.com\/(\d+)\/videos\/(?:[^/]+\/)?(\d+)/;
  const match = longLink.match(regex);

  if (!match) {
    console.log("❌ Impossible d'extraire pageId et videoId.");
    return null;
  }

  const pageId = match[1];
  const videoId = match[2];
  const formattedUrl = `https://www.facebook.com/${pageId}/videos/${videoId}/`;

  return formattedUrl;
}
