// import * as wppconnect from "@wppconnect-team/wppconnect";
// import { io } from "../index";
// import Contact from "../models/Contact";
// import FAQ from "../models/FAQ";
// import { NewProduct, ProductElement } from "../models";
// import scheduleReminderMessage from "../utils/scheduleReminderMessage";
// import humanSleep from "../utils/humanSleep";
// import Fuse from "fuse.js";

// let clientInstance: any;
// let isInitializing = false;

// export const initializeWppClient = async () => {
//   if (clientInstance) {
//     console.log("✅ Client WhatsApp déjà initialisé");
//     return clientInstance;
//   }

//   if (isInitializing) {
//     console.log("⏳ Initialisation déjà en cours...");
//     return null;
//   }

//   try {
//     isInitializing = true;
//     console.log("🔄 Démarrage de l'initialisation du client WhatsApp...");

//     const create = (wppconnect as any).create ?? (wppconnect as any).default?.create;

//     clientInstance = await create({
//       session: "default",
//       catchQR: (base64Qr: string) => {
//         const cleanBase64 = base64Qr.replace("data:image/png;base64,", "");
//         io.emit("qrCode", cleanBase64);
//       },
//       statusFind: (statusSession: string) => {
//         console.log("📶 Statut de la session:", statusSession);
//         io.emit("status", statusSession);
//       },
//       headless: true,
//       useChrome: true,
//       browserArgs: ["--no-sandbox"],
//       puppeteerOptions: { args: ["--no-sandbox"] },
//     });

//     isInitializing = false;
//     console.log("✅ WPPConnect client prêt.");

//     clientInstance.onStateChange((state: string) => {
//       console.log("📱 État du client WhatsApp:", state);
//       if (state === "DISCONNECTED") {
//         console.log("🔁 Reconnexion en cours...");
//         setTimeout(() => initializeWppClient().catch(console.error), 5000);
//       }
//     });

//     clientInstance.onMessage(async (message: any) => {
//       const senderId = message.from;
//       const phoneNumber = senderId.split("@")[0];
//       const rawText = message.body || "";

//       // ✅ Ignore les messages de groupe
//       if (message.isGroupMsg) {
//         console.log("📛 Message de groupe ignoré :", rawText);
//         return;
//       }

//       console.log("📩 Message reçu de", phoneNumber, ":", rawText);
//       await humanSleep();

//       try {
//         const existingContact = await Contact.findOne({ where: { phone: phoneNumber } });

//         if (!existingContact) {
//           await Contact.create({
//             phone: phoneNumber,
//             name: message.sender?.pushname || "Inconnu",
//             firstMessageAt: new Date(),
//           });
//           console.log("👤 Nouveau contact enregistré:", phoneNumber);
//           await scheduleReminderMessage(clientInstance, phoneNumber);
//         }
     
//         if (message.body.includes("fb.me")) {
//           console.log(message.body, "📎 Lien Facebook start traitement.");
//           // TODO: Traitement des liens Facebook
//           // return;
//         }

//         // Nettoyage du message
//         const cleanText = rawText.replace(/[^\w\s]/gi, "").toLowerCase();
//         const words = cleanText.split(/\s+/).filter((w: string) => w.length >= 5);

//         // 🔍 Traitement FAQ
//         const allFaqs = await FAQ.findAll();
//         const faqFuse = new Fuse(allFaqs, {
//           keys: ["question"],
//           threshold: 0.2,
//           distance: 80,
//           minMatchCharLength: 5,
//           ignoreLocation: true,
//           isCaseSensitive: false,
//         });

//         const matchedFaqs = new Map();
//         for (const word of words) {
//           const results = faqFuse.search(word);
//           for (const result of results) {
//             if (!matchedFaqs.has(result.item.id)) {
//               matchedFaqs.set(result.item.id, result.item);
//             }
//           }
//         }

//         const faqMatches = Array.from(matchedFaqs.values()).slice(0, 3);
//         if (faqMatches.length > 0) {
//           const combinedAnswer = faqMatches
//             .map((faq) => `🟢 ${faq.answer}`)
//             .join("\n\n");
//           await clientInstance.sendText(senderId, combinedAnswer);
//           console.log(`🤖 ${faqMatches.length} réponse(s) FAQ envoyée(s)`);
//           return;
//         }

//         // 🔍 Traitement Produits
//         const allProducts = await NewProduct.findAll({
//           include: [{ model: ProductElement, as: "elements" }],
//         });

//         const searchableProducts = allProducts.map((p) => ({
//           id: p.id,
//           keyword: p.keyword,
//           synonym: p.synonym?.split(/[,;\s]+/) || [],
//           name: p.name,
//           elements: p.elements || [],
//         }));

//         const productFuse = new Fuse(searchableProducts, {
//           keys: ["keyword", "synonym"],
//           threshold: 0.2,
//           minMatchCharLength: 5,
//           ignoreLocation: true,
//           distance: 80,
//           isCaseSensitive: false,
//         });

//         const foundProducts: typeof searchableProducts = [];
//         for (const word of words) {
//           const results = productFuse.search(word).filter(r => r.score !== undefined && r.score < 0.2);
//           for (const result of results) {
//             if (!foundProducts.find((p) => p.id === result.item.id)) {
//               foundProducts.push(result.item);
//             }
//           }
//         }

//         const selectedProducts = foundProducts.slice(0, 3);

//         for (const product of selectedProducts) {
//           if (Array.isArray(product.elements)) {
//             const sortedElements = product.elements.sort(
//               (a, b) => (a.order ?? 0) - (b.order ?? 0)
//             );

//             for (const element of sortedElements) {
//               await humanSleep();

//               if (element.type === "text" && element.content) {
//                 await clientInstance.sendText(senderId, element.content);
//               }

//               if (
//                 element.type === "image" &&
//                 typeof element.imageUrl === "string" &&
//                 element.imageUrl
//               ) {
//                 const fullImageUrl = element.imageUrl.startsWith("/")
//                   ? `${process.env.BASE_URL}${element.imageUrl}`
//                   : `${process.env.BASE_URL}/${element.imageUrl}`;

//                 await clientInstance.sendImage(
//                   senderId,
//                   fullImageUrl,
//                   "image.jpg",
//                   element.caption || ""
//                 );
//               }
//             }
//           }

//           console.log("📦 Produit envoyé :", product.keyword);
//         }

//         if (selectedProducts.length === 0) {
//           console.log("❌ Aucun produit ni FAQ trouvé.");
//         }

//       } catch (err) {
//         console.error("❌ Erreur traitement du message :", err);
//       }
//     });

//     return clientInstance;
//   } catch (error) {
//     console.error("❌ Erreur d'initialisation de WPPConnect :", error);
//     isInitializing = false;
//     throw error;
//   }
// };
