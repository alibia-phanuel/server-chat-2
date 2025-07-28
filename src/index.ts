import express from "express";
import http from "http";
import { Server } from "socket.io";
import adsRouter from "./routes/adsRouter";
import cors from "cors";
import dotenv from "dotenv";
import homeRoutes from "./routes/homeRoutes.routes";
import AuthRoute from "./routes/AuthRoute.routes";
import newProductRoute from "./routes/NewProductRoute.routes";
import FaqRoutes from "./routes/Faq.routes"; // Renommé pour clarté
import UserRoute from "./routes/UserRoute.routes";
import errorHandler from "./middleware/errorHandler";
import path from "path";
import facebookRoutes from "./routes/facebookRoutes";
import sequelize from "./config/db";
import whatsappRoutes from "./routes/whatsappRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = ["http://localhost:4000", "http://localhost:3001"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const trimmedOrigin = origin.trim();
      const isAllowed = allowedOrigins.includes(trimmedOrigin);
      if (isAllowed) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); // Ajusté selon l'emplacement probable
app.use(
  "/images/products",
  express.static(path.join(__dirname, "../public/images/products"))
);

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.JWT_SECRET) {
  console.error(
    "❌ Variables d'environnement manquantes (DB_HOST, DB_USER, JWT_SECRET)."
  );
  process.exit(1);
}

io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

app.use("/api", homeRoutes);
app.use("/api", AuthRoute);
app.use("/api", UserRoute);
app.use("/api", FaqRoutes);
app.use("/api", newProductRoute);
app.use("/api", facebookRoutes);
app.use("/api", adsRouter);
app.use("/api/whatsapp", whatsappRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données réussie !");
    await sequelize.sync({ alter: true });
    console.log("✅ Base de données synchronisée");
    const PORT = 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur + Socket.IO lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur, erreur DB :", error);
    process.exit(1);
  }
};

startServer();
export { io };
