import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("DB_NAME"),
  getEnv("DB_USER"),
  getEnv("DB_PASSWORD", true),
  {
    host: getEnv("DB_HOST"),
    port: parseInt(getEnv("DB_PORT"), 10),
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
