import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Charger les variables d'environnement

// Définir les variables avec valeurs par défaut pour XAMPP
const DB_NAME = process.env.DB_NAME || "chat_database";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root"; // Vide pour XAMPP
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306"; // Port MySQL par défaut pour XAMPP
const NODE_ENV = process.env.NODE_ENV || "development";

// Initialiser Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "mysql",
  logging: false, // Désactiver les logs SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Nécessaire pour les certificats auto-signés
    },
  },
});

// Tester la connexion
sequelize
  .authenticate()
  .then(() => console.log("✅ Connexion à MySQL réussie !"))
  .catch((error) => console.error("❌ Erreur de connexion à MySQL :", error));

// Exporter l'instance Sequelize
export default sequelize;
