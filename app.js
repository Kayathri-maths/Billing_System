const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./util/database");
const Customer = require("./models/Customer");
const Product = require("./models/Product");

const createBillRoutes = require("./routes/createBill");
const customerRoutes = require("./routes/customer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ extended: false }));

// Routes
app.use("/createBill", createBillRoutes);
app.use("/customers", customerRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", req.url));
});

// Associations
Customer.hasMany(Product);
Product.belongsTo(Customer);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => console.log(err));
