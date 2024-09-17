const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  serialNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  hsnNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  productName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
});

module.exports = Product;
