const express = require("express");
const router = express.Router();
const customerController = require("../controllers/createBillController");

router.get("/all", customerController.getAllCustomers);
router.get("/:customerId/download-pdf", customerController.downloadCustomerPDF);

module.exports = router;
