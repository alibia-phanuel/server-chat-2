import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class ProductElement extends Model {
  public id!: string;
  public productId!: string;
  public type!: "text" | "image";
  public content?: string;
  public imageUrl?: string;
  public caption?: string;
  public order!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductElement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products_new",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("text", "image"),
      allowNull: false,
    },
    content: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    caption: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductElement",
    tableName: "product_elements",
    timestamps: true,
  }
);

export default ProductElement;
