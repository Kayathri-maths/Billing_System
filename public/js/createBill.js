let products = [];

function addItems() {
  const serialNumber = document.getElementById("serialNumber").value;
  const hsnNumber = document.getElementById("hsnNumber").value;
  const productName = document.getElementById("productName").value;
  const productPrice = parseFloat(
    document.getElementById("productPrice").value
  );
  const productQuantity = parseInt(
    document.getElementById("productQuantity").value
  );

  if (productName && productQuantity && !isNaN(productPrice)) {
    products.push({
      serialNumber,
      hsnNumber,
      name: productName,
      price: productPrice,
      quantity: productQuantity,
    });

    const customerName = document.getElementById("customerName").value;
    const customerMobile = document.getElementById("customerMobile").value;
    const customerAddress = document.getElementById("customerAddress").value;

    if (!customerName || !customerMobile || !customerAddress) {
      alert("Please provide customer details.");
      return;
    }
    console.log("products>>>>>>>>>>>>>", products);
    axios
      .post("http://localhost:3000/createBill/create", {
        customerName,
        customerMobile,
        customerAddress,
        products,
      })
      .then((response) => {
        console.log("response>>>>>>>>>>>>>>>>>>>>>>>.<<<<<<<<<<<<<<", response);
        alert("Bill created successfully!");
        showItems(response);
        products = [];
        clearItem();
      })
      .catch((error) => {
        console.error("Error creating bill:", error);
        alert("Failed to create bill.");
      });
  } else {
    alert("Please provide valid item details.");
  }
}

function showItems(response) {
  const tbody = document.querySelector("#billing-table tbody");
  tbody.innerHTML = "";
  response.data.products.forEach((product, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${product.serialNumber}</td>
      <td>${product.hsnNumber}</td>
      <td>${product.productName}</td>
      <td>${product.quantity}</td>
      <td>${parseFloat(product.price).toFixed(2)}</td>
      <td>${(parseFloat(product.price) * product.quantity).toFixed(2)}</td>

    `;
    tbody.appendChild(tr);
  });
  document.getElementById("billing-amount").innerText = parseFloat(
    response.data.customer.totalPrice
  ).toFixed(2);
  document.getElementById("gst-amount").innerText = parseFloat(
    response.data.customer.gst
  ).toFixed(2);
  document.getElementById("total-price").innerText = parseFloat(
    response.data.customer.finalPrice
  ).toFixed(2);
}

function clearItem() {
  document.getElementById("serialNumber").value = "";
  document.getElementById("hsnNumber").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("productQuantity").value = "";
  document.getElementById("productPrice").value = "";
}
