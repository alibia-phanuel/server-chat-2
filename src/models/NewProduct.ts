import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";
import ProductElement from "./ProductElement";

interface NewProductAttributes {
  id: string;
  keyword: string;
  name: string;
  createdBy: string;
  idPostFacebook: string;
  synonym: string;
  isActive: boolean;
}

interface NewProductCreationAttributes
  extends Optional<NewProductAttributes, "id" | "isActive"> {}

class NewProduct
  extends Model<NewProductAttributes, NewProductCreationAttributes>
  implements NewProductAttributes
{
  public id!: string;
  public keyword!: string;
  public name!: string;
  public createdBy!: string;
  public idPostFacebook!: string;
  public synonym!: string;
  public isActive!: boolean;

  public elements?: ProductElement[];
}

NewProduct.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idPostFacebook: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    synonym: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "ProductNew",
    tableName: "products_new",
    timestamps: true,
  }
);

export default NewProduct;
