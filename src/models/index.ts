import sequelize from "../config/db";
import User from "./User";
import NewProduct from "./NewProduct";
import ProductElement from "./ProductElement";
import Contact from "./Contact";
// Associations entre NewProduct et ProductElement
ProductElement.belongsTo(NewProduct, {
  foreignKey: "productId",
  as: "product",
});

NewProduct.hasMany(ProductElement, {
  foreignKey: "productId",
  as: "elements",
});

export { sequelize, User, NewProduct, ProductElement,Contact };
