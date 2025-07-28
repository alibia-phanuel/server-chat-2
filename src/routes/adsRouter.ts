import express, { Request, Response } from "express";
import { fetchAds } from "../controllers/ads";
import { AdsResponse } from "../controllers/ads";

const router = express.Router();

router.get("/ads", async (req: Request, res: Response) => {
  try {
    const accessToken =
      process.env.FACEBOOK_ACCESS_TOKEN ||
      "EAAQZBjOj8ZBnsBPFjurDcfu36BW4AKm3bnmevnM6VUjg584Ck0RtwhPR097dZB60YO4eTJAtuLfG4pFgun7tnhKBYB1YxJPBFO6FjYSdtxOGw5L98UesqTv24kEYUFLRiojxBdmHYfH7fNShYiFvPtmfaceva36cZCRHIUn4p9whVjJ8X0o6tCQG5CnV";
    if (!accessToken) {
      return res.status(400).json({ error: "Jeton d’accès Facebook manquant" });
    }
    const accountId = "1167635994904528"; // ID du compte publicitaire
    const ads = await fetchAds(accountId, accessToken);
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
