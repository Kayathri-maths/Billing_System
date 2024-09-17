const express = require("express");
const router = express.Router();
const billController = require("../controllers/createBillController");

router.post("/create", billController.createBill);

module.exports = router;
