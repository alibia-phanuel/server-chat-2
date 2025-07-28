import { create, Whatsapp } from "@wppconnect-team/wppconnect";
import { io } from "../index";
import Contact from "../models/Contact";
import humanSleep from "../utils/humanSleep";
import { handleIncomingMessage } from "../services/messageHandler";
import fs from "fs";
import path from "path";

const SESSION_DIR = path.resolve(".wppconnect");

export class WhatsAppService {
  private static client: Whatsapp | null = null;
  private static connected = false;
  private static currentQR: string | null = null;
  private static isInitializing = false;
  private static sessionName: string | null = null;

  static async initializeWhatsApp(sessionName: string) {
    if (this.client) {
      console.log("✅ Client WhatsApp déjà initialisé");
      return this.client;
    }
    if (this.isInitializing) {
      console.log("⏳ Initialisation déjà en cours...");
      return null;
    }

    try {
      this.isInitializing = true;
      console.log(
        "🔄 Démarrage de l’initialisation du client WhatsApp pour session:",
        sessionName
      );

      if (!fs.existsSync(SESSION_DIR)) {
        console.log("📁 Création du dossier .wppconnect:", SESSION_DIR);
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        console.log("📁 Dossier .wppconnect créé.");
      }

      this.sessionName = sessionName;
      console.log("🚀 Appel à wppconnect.create avec session:", sessionName);
      this.client = await create({
        session: sessionName,
        catchQR: (base64Qr: string) => {
          const cleanBase64 = base64Qr.replace("data:image/png;base64,", "");
          this.currentQR = cleanBase64;
          console.log(
            "📸 QR code généré:",
            cleanBase64.substring(0, 50) + "..."
          );
          io.emit("qrCode-server-2", cleanBase64);
        },
        statusFind: (statusSession: string) => {
          console.log("📶 Statut de la session:", statusSession);
          this.connected = statusSession === "inChat";
          io.emit(
            "status-server-2",
            this.connected ? "CONNECTED" : statusSession
          );
        },
        headless: true,
        useChrome: true,
        disableWelcome: true,
        browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
        puppeteerOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          userDataDir: SESSION_DIR,
        },
      });

      console.log("✅ WPPConnect client créé avec succès");

      this.client.onStateChange((state: string) => {
        try {
          console.log("📱 État du client WhatsApp:", state);
          if (
            ["DISCONNECTED", "UNPAIRED", "CLOSED", "CONFLICT"].includes(state)
          ) {
            console.log(
              "⚠️ Déconnexion détectée - tentative de reconnexion dans 5s..."
            );
            this.client?.close().finally(() => {
              this.client = null;
              setTimeout(
                () =>
                  this.initializeWhatsApp(this.sessionName || "default").catch(
                    (err) =>
                      console.error("❌ Erreur lors de la reconnexion:", err)
                  ),
                5000
              );
            });
          }
        } catch (err) {
          console.error("❌ Erreur dans onStateChange:", err);
        }
      });

      this.client.onMessage(async (message: any) => {
        try {
          console.log(
            "📩 Message brut reçu:",
            JSON.stringify(message, null, 2)
          );
          const senderId = message?.from;
          if (!senderId) {
            console.log("⚠️ Message sans senderId, ignoré");
            return;
          }
          const phoneNumber = senderId.split("@")[0] || "";
          const rawText = message.body || "";

          if (message.isGroupMsg) {
            console.log("📛 Message de groupe ignoré dans le client principal");
            return;
          }

          console.log("📩 Message reçu de", phoneNumber, ":", rawText);
          await humanSleep();

          const existingContact = await Contact.findOne({
            where: { phone: phoneNumber },
          });
          if (!existingContact) {
            await Contact.create({
              phone: phoneNumber,
              name: message.sender?.pushname || "Inconnu",
              firstMessageAt: new Date(),
            });
            console.log("👤 Nouveau contact enregistré:", phoneNumber);
          }

          await handleIncomingMessage(this.client, message);
        } catch (err) {
          console.error("❌ Erreur dans onMessage:", err);
        }
      });

      this.isInitializing = false;
      console.log(
        "✅ Gestionnaires d’événements configurés pour session:",
        sessionName
      );
      console.log("✅ Initialisation WhatsApp terminée");
      return this.client;
    } catch (error: any) {
      this.isInitializing = false;
      console.error("❌ Erreur lors de l’initialisation de WPPConnect:", error);
      io.emit("error-server-2", {
        message: "Erreur lors de l’initialisation",
        error: error.message || "Erreur inconnue",
      });
      throw error;
    }
  }

  static async disconnectWhatsApp(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error("Client non initialisé");
      }
      await this.client.close();
      this.client = null;
      this.connected = false;
      this.currentQR = null;
      this.sessionName = null;
      io.emit("status", "DISCONNECTED");
      io.emit("qrCode", null);
      console.log("✅ Client WhatsApp déconnecté");
    } catch (err) {
      console.error("❌ Erreur lors de la déconnexion:", err);
      throw err;
    }
  }

  static async getStatus(): Promise<string> {
    try {
      if (!this.client) return "NOT_CONNECTED";
      const state = await this.client.getConnectionState();
      console.log("État de la connexion:", state);
      return state === "CONNECTED" ? "CONNECTED" : state;
    } catch (err) {
      console.error("❌ Erreur dans getStatus:", err);
      return "NOT_CONNECTED";
    }
  }
}
