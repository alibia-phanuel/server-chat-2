import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./User"; // Import du modèle User pour la relation

class FAQ extends Model {
  public id!: string;
  public question!: string;
  public answer!: string;
  public createdBy!: string;
}

FAQ.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
  },
  { sequelize, tableName: "faqs" }
);

// Relation : Une FAQ est ajoutée par un user (admin/employé)
FAQ.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

export default FAQ;
