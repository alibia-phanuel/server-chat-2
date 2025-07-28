import axios from "axios";
async function processFacebookLink(
  shortLink: string
): Promise<{ longLink: string; formattedId: string } | null> {
  console.log("📎 Lien extrait :", shortLink);

  if (!shortLink) {
    console.error("❌ Aucun lien n’a pu être extrait du message.");
    return null;
  }

  try {
    const response = await axios.get(shortLink, {
      maxRedirects: 10,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const longLink = response.request.res.responseUrl;
    console.log("🔗 Lien long récupéré :", longLink);

    // Exemple : https://www.facebook.com/61561441996256/videos/671735108573931/
    const regex = /facebook\.com\/(\d+)\/videos\/(\d+)/;
    const match = longLink.match(regex);
    console.log("🔎 Identifiants extracts  match:", match);
    if (match) {
      const pageId = match[1];
      const videoId = match[2];
      const formattedId = `${pageId}_${videoId}`;
      return { longLink, formattedId };
    }

    throw new Error(
      "Les identifiants n'ont pas pu être extraits du lien long."
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de la résolution du lien :", error.message);
    return null;
  }
}

export default processFacebookLink;
