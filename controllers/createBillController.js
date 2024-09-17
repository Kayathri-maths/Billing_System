const Customer = require("../models/Customer");
const Product = require("../models/Product");
const sequelize = require("../util/database");
const PDFDocument = require("pdfkit");

exports.createBill = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { customerName, customerMobile, customerAddress, products } =
      req.body;

    let customer = await Customer.findOne({
      where: { phonenumber: customerMobile },
      transaction: transaction,
    });
    if (!customer) {
      customer = await Customer.create(
        {
          name: customerName,
          phonenumber: customerMobile,
          address: customerAddress,
          totalPrice: 0,
          gst: 0,
          finalPrice: 0,
        },
        { transaction: transaction }
      );
    }

    const totalPriceFromProducts = products[0].price * products[0].quantity;

    const updatedTotalPrice =
      Number(customer.totalPrice) + totalPriceFromProducts;
    const gst = updatedTotalPrice * 0.18;
    const finalPrice = updatedTotalPrice + gst;

    await Customer.update(
      {
        totalPrice: updatedTotalPrice,
        gst: gst,
        finalPrice: finalPrice,
      },
      {
        where: { id: customer.id },
        transaction: transaction,
      }
    );

    const productPromises = products.map((product) => {
      return Product.create(
        {
          serialNumber: product.serialNumber,
          hsnNumber: product.hsnNumber,
          productName: product.name,
          quantity: product.quantity,
          price: product.price,
          customerId: customer.id,
        },
        { transaction: transaction }
      );
    });

    const createdProducts = await Promise.all(productPromises);

    const allProducts = await Product.findAll({
      where: { customerId: customer.id },
      transaction: transaction,
    });

    await transaction.commit();

    res.status(201).json({
      message: "Bill and products added successfully!",
      customer: {
        id: customer.id,
        name: customer.name,
        phonenumber: customer.phonenumber,
        address: customer.address,
        totalPrice: updatedTotalPrice,
        gst: gst,
        finalPrice: finalPrice,
      },
      products: allProducts,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error while creating bill" });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { rows: customers, count: totalCustomerCount } =
      await Customer.findAndCountAll({
        limit: limit,
        offset: offset,
        include: [
          {
            model: Product,
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("products.id")),
              "productCount",
            ],
          ],
        },
        group: ["customer.id"],
        subQuery: false,
      });

    console.log("totalCustomerCount>>>>>>>>>>", totalCustomerCount.length);
    const totalPages = Math.ceil(totalCustomerCount.length / limit);
    console.log("totalpages>>>>>>>>>>", totalPages);

    const hasPreviousPage = page > 1;
    const hasNextPage = offset + limit < totalCustomerCount.length;

    res.status(200).json({
      customers,
      currentPage: page,
      totalPages,
      hasPreviousPage,
      hasNextPage,
      previousPage: hasPreviousPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers." });
  }
};

exports.downloadCustomerPDF = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const customer = await Customer.findOne({
      where: { id: customerId },
      include: [
        {
          model: Product,
          attributes: ["productName", "quantity", "price"],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="customer_${customerId}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Customer Details", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Customer Name: ${customer.name}`);
    doc.text(`Phone Number: ${customer.phonenumber}`);
    doc.text(`Address: ${customer.address}`);
    doc.text(`Total Price: ${customer.totalPrice}`);
    doc.text(`GST: ${customer.gst}`);
    doc.text(`Final Price: ${customer.finalPrice}`);
    doc.moveDown();

    if (customer.products.length > 0) {
      doc.fontSize(12).text("Products:");
      customer.products.forEach((product) => {
        doc.text(`- Product Name: ${product.productName}`);
        doc.text(`  Quantity: ${product.quantity}`);
        doc.text(`  Price: ${product.price}`);
        doc.moveDown();
      });
    } else {
      doc.text("No products found for this customer.");
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF." });
  }
};
