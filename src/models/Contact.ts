import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db"; // ajuste ce chemin si besoin

class Contact extends Model {
  public id!: number;
  public phone!: string;
  public name!: string;
  public firstMessageAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
  {
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstMessageAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Contact",
    tableName: "contacts",
  }
);

export default Contact;
