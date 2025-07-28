import axios from "axios";
import resolveFacebookReel from "./resolveFacebookReel";

function extractLink(input: string): string | null {
  const regex = /(https?:\/\/[^\s]+)/;
  const match = input.match(regex);
  return match ? match[0] : null;
}

async function processFacebookLink(
  input: string
): Promise<{ longLink: string; formattedId: string } | null> {
  const extractedLink = extractLink(input);
  if (!extractedLink) {
    console.log("❌ Aucun lien détecté.");
    return null;
  }

  try {
    // 🔁 Suivre les redirections (fb.me, l.php, login/?next, etc.)
    let longLink = extractedLink;

    const headResponse = await axios.head(extractedLink, {
      maxRedirects: 10,
      timeout: 8000,
    });

    if (headResponse?.request?.res?.responseUrl) {
      longLink = headResponse.request.res.responseUrl;
      console.log("🔗 Lien long résolu :", longLink);
    }

    // 🧼 Extraire lien s’il est encodé dans login/?next ou l.php?u=
    const url = new URL(longLink);
    const encodedNext = url.searchParams.get("next") || url.searchParams.get("u");
    if (encodedNext) {
      longLink = decodeURIComponent(encodedNext);
      console.log("🔁 Lien décodé depuis next/u= :", longLink);
    }

    // 🔍 Si c’est un reel, le résoudre via ta fonction custom
    if (longLink.includes("/reel/")) {
      const resolved = await resolveFacebookReel(longLink);
      if (resolved) {
        longLink = resolved;
        console.log("🎞️ Reel résolu :", longLink);
      }
    }

    // ✅ Regex de matching
    const regexPatterns = [
      /story_fbid=(\d+)&id=(\d+)/,
      /permalink\.php\?story_fbid=(\d+)&id=(\d+)/,
      /facebook\.com\/(?:\w+|\d+)\/posts\/(\d+)/,
      /facebook\.com\/(?:\w+|\d+)\/videos\/(?:\w+\/)?(\d+)/,
      /facebook\.com\/watch\/?\?v=(\d+)/,
      /facebook\.com\/watch\/live\/?\?v=(\d+)/,
      /photo\.php\?fbid=(\d+)&id=(\d+)/,
      /facebook\.com\/(?:\w+|\d+)\/photos\/(\d+)/,
      /facebook\.com\/reel\/(\d+)/,
      /facebook\.com\/[^\/]+\/reels\/(\d+)/,
    ];

    let pageId: string | null = null;
    let postId: string | null = null;

    for (const regex of regexPatterns) {
      const match = longLink.match(regex);
      if (match) {
        if (regex.source.includes("story_fbid") || regex.source.includes("fbid") || regex.source.includes("id=")) {
          postId = match[1];
          pageId = match[2] || "unknown"; // fallback
        } else {
          postId = match[1];
          const possiblePage = longLink.match(/facebook\.com\/([\w\d\.]+)/);
          pageId = possiblePage ? possiblePage[1] : "unknown";
        }
        break;
      }
    }

    if (!pageId || !postId || pageId === "unknown") {
      console.log("❌ Impossible d'extraire un ID de page valide.");
      return null;
    }

    const formattedId = `${pageId}_${postId}`;
    console.log("✅ Identifiant formaté :", formattedId);

    return { longLink, formattedId };
  } catch (error: any) {
    console.error("🚨 Erreur lors du traitement du lien :", error.message);
    return null;
  }
}

export default processFacebookLink;
