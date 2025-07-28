import FAQ from "../models/FAQ";
import removeAccents from "remove-accents";

function normalizeText(text: string): string {
  return removeAccents(text).toLowerCase();
}

function splitWords(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => w.length >= 5);
}

export const handleFaq = async (
  clientInstance: any,
  senderId: string,
  rawText: string
): Promise<boolean> => {
  const normalizedText = normalizeText(rawText);
  const messageWords = splitWords(normalizedText);

  console.log("🧹 Texte FAQ normalisé :", normalizedText);
  console.log("🔍 Mots FAQ extraits :", messageWords);

  const allFaqs = await FAQ.findAll();

  // Trouve les FAQ dont la question contient au moins un mot du message
  const matchedFaqs = allFaqs.filter(faq => {
    const normalizedQuestion = normalizeText(faq.question);
    return messageWords.some(word => normalizedQuestion.includes(word));
  });

  if (matchedFaqs.length === 0) {
    console.log("❌ Aucune FAQ correspondante trouvée.");
    return false;
  }

  const faqMatches = matchedFaqs.slice(0, 3);
  const combinedAnswer = faqMatches
    .map((faq) => `🟢 ${faq.answer}`)
    .join("\n\n");

  await clientInstance.sendText(senderId, combinedAnswer);
  console.log(`🤖 ${faqMatches.length} réponse(s) FAQ envoyée(s)`);

  return true;
};
