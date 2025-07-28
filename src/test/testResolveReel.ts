import resolveFacebookReel from "../services/resolveFacebookReel";

(async () => {
  const url = await resolveFacebookReel("https://www.facebook.com/reel/4084747111781483/");
  console.log("✅ Résultat final :", url);
})();