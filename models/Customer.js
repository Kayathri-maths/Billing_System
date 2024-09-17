const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Customer = sequelize.define("customer", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phonenumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  totalPrice: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  gst: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
  finalPrice: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Customer;
