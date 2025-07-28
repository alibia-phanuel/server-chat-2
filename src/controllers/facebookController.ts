import axios from "axios";
import { Request, Response } from "express";

const pages = [
  {
    name: "Bon Plan 241",
    id: "526659517208373",
    access_token:
      "EAAQZBjOj8ZBnsBPM9tsZA6Ajqs45w40EJWHVb94DFk6fq96rHoHZAZAGieMQZC0DINGSn4Qq6bKEbIniLNL29PvgdVA1v8vUirO7eWE6Bl9rw8J1wtH3Jv7n11nqcduANPIKESwxAFwWqmlZCsk0CWWYMyrRItGMApexdfEfzsDa6jjEzXSKxeZAoseX0pioQQPLB1P3oU2Q",
  },
  {
    name: "Kimtores",
    id: "490851747452582",
    access_token:
      "EAAQZBjOj8ZBnsBPJxOSFqOi5n8hmK67IHFoj1h47W0dMYRYfR3BY2xZAIYgZBMaROXC77hZAzRViwtmpLPSXlzil6tgqQZAdBFtGQi5qA4etRkGJgVwCGmJtaDPDTasC7qW7ZCLcg6useQZAL9z0dZB3tGqOYZASIdItw69vNrSZA0Qpa1klUwca7wWZB9teZCD5qIvaqXQsaj1UR",
  },
  {
    name: "Montre Connecté 241",
    id: "492195277305104",
    access_token:
      "EAAQZBjOj8ZBnsBPOPTqdHXvoRIXcFlwJZAkSNZCpDfMZCgUiTyIV6mDlk3PMH7yASYBaFMGgjO4eKQIs9Rp4mvlCm8Ysen5iDIDbM5nSJygcrGknlHTaKx0gtf0XbR0zhXJdC1Ol4UODsyMdJvzLKfIlSfUSOEaHarVE9cwueNAveZCi6T0X5t2SO9fVM3RI0vFJpZCo7Sd",
  },
  {
    name: "Top Qualités 241",
    id: "389037834288932",
    access_token:
      "EAAQZBjOj8ZBnsBPFAki7u4PAhBwSEt9VLVT53ZABlW4JtZC20ruwXUaZCOAxV2ZBdaWsvqTPCpa1NLQFNwx3Fhq5cHwPZBdZAAklC6uZAtg5pA07VJChoLSvVlnZBa1jKDK51egsutTUOt5RPUPfoFTUsYVCd7w07ZC37uaJbEZBw28y77hWZCfQtyaiQXkJezyzAAJxsR2kcz2ZBW",
  },
  {
    name: "Kiimtore",
    id: "346805015187137",
    access_token:
      "EAAQZBjOj8ZBnsBPJRNzPuOTqZAwSwRMO6kY3FZCM8VKtHwHZBwdPwKlDi1hUZClse9SjGiSQDb6ge544WtJFxRXKQojNbAFdhxo5w9T1soIRFJMZAyQ6Pubq6MLJ4gH7QXs89zI3suGAuapVaMxWVbZAzYgWjCmSO0irKDuL84AqMIVhBoCHnAyTPp51Wxa0enyvWwKxSZCpm",
  },
  {
    name: "Mme Tendance",
    id: "359840413871712",
    access_token:
      "EAAQZBjOj8ZBnsBPLc78FHPcdL1b7LKZBYGttlL04hk7DT1wzaCTtO73cU1ZAZBJPZBnsFIZAkZCfZBKkgSE44ilFNnqGhK8ZAIp2p2ZBPHUVPtI7mmJL4KoD0pilIqZBYpPNE0FYkx7oZBnunUpsZBmNdQehYrnjWZAnVS951m3nFI1vviLTZBjQ2DHPTsnXE13FwYOJTvgSNr292af4",
  },
  {
    name: "Afrikagadget.shop",
    id: "101051433077608",
    access_token:
      "EAAQZBjOj8ZBnsBPAiPkkkoWPsDlaDUkXU1Afd9UQkshILO7TgRoHHPMBRriPnIaxjeDV86OZCc0IeaBAIyN949XlNIY1i9FzeLAtKtlZBOehrwyPWkcm8y6049b7HO2xGMdyZBcUAsNqZCDol1sZCFp7RZC83PpX0NhqPZATtCeiLmkElxcqcomP3P3P9TZAZCjH5pCXiyz5iYZD",
  },
  {
    name: "Gadget Shop +241",
    id: "114307201660109",
    access_token:
      "EAAQZBjOj8ZBnsBPDSVAYrCZC0ZAOH6ZCi67unGiqP55MIDhWJjxirH1Sboo88HvizPVtgmZCF2nnNxZCN633xWnmZCE2eduZCzonYZAutPGkgjZCbqIvw677MIHCCadbyQyTInqPfPgPVUVZAIfm7ZCdbaupWlZAVeZBZBoUbtbkWHxg2HQ6PDs2EfYRSRBamnRGwm0cNfxPtHBTbskZD",
  },
  {
    name: "Nash Market 241",
    id: "100454872357885",
    access_token:
      "EAAQZBjOj8ZBnsBPDAC02Gj2GFjsHNbSp5EVZCwXGMK0SyYRBxeSCtZAZABA5eYU3zMZC70neBV5c7XCD3ZAgCIB3aylpVqG9Xt4TGjHdZBXL8jfXyPJqzbC9KChFKKoIJ9D5ZCCvXWg2h1yKq4HYQSf50z9fY05bKjOYD4KHzA6OUEhlF1QjABzj7VYPxtYU4S8QQkmbOt4wZD",
  },
];

export const fetchAllPagesPosts = async (_req: Request, res: Response) => {
  try {
    const allPosts = await Promise.all(
      pages.map(async (page) => {
        const url = `https://graph.facebook.com/v19.0/${page.id}/posts`;
        const params = {
          fields: "message,created_time,full_picture,permalink_url",
          access_token: page.access_token,
        };

        const response = await axios.get(url, { params });
        return {
          pageName: page.name,
          products: response.data.data || [],
        };
      })
    );

    res.status(200).json(allPosts);
  } catch (error) {
    console.error("Erreur lors de la récupération des posts :", error);
    res.status(500).json({ error: "Impossible de récupérer les posts" });
  }
};
