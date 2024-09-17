let currentPage = 1;
const limit = 5;
function fetchCustomers(page) {
  axios
    .get(`http://localhost:3000/customers/all?page=${page}&limit=${limit}`)
    .then((response) => {
      const tableBody = document.querySelector("#customer-table tbody");
      tableBody.innerHTML = "";
      response.data.customers.forEach((customer) => {
        const row = document.createElement("tr");
        const d = new Date(`${customer.updatedAt}`);
        console.log("customer>>>>>>>>>>>>>>>>>>>>>>", customer);
        row.innerHTML = `
                <td>${customer.id}</td>
                <td>${d.toDateString()}</td>
                <td>${customer.name}</td>
                <td>${customer.phonenumber}</td>
                <td>${customer.address}</td>
                <td>${customer.productCount}</td>
                <td>${parseFloat(customer.totalPrice).toFixed(2)}</td>
                <td>${parseFloat(customer.gst).toFixed(2)}</td>
                <td>${parseFloat(customer.finalPrice).toFixed(2)}</td>
                <td><button class="btn btn-primary download-pdf" data-customer-id="${
                  customer.id
                }"><i class="fa-solid fa-download"></i></button></td> `;
        tableBody.appendChild(row);
      });
      console.log("response.data", response.data);
      showPagination(response.data);
      document.querySelectorAll(".download-pdf").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const customerId = event.currentTarget.dataset.customerId;
          console.log(customerId);
          try {
            const response = await axios({
              url: `/customers/${customerId}/download-pdf`,
              method: "GET",
              responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `customer_${customerId}.pdf`);
            document.body.appendChild(link);
            link.click();
          } catch (error) {
            console.error("Error downloading PDF:", error);
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching customers:", error);
    });
}

function showPagination({
  currentPage,
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previousPage,
  totalPages,
}) {
  const paginationControls = document.getElementById("pagination-controls");
  paginationControls.innerHTML = "";

  if (hasPreviousPage) {
    const previousBtn = document.createElement("button");
    previousBtn.classList.add("page-link");
    previousBtn.innerHTML = "&laquo; Previous";
    previousBtn.addEventListener("click", () => fetchCustomers(previousPage));
    paginationControls.appendChild(previousBtn);
  }

  const currentBtn = document.createElement("button");
  currentBtn.classList.add("page-link", "current-page");
  currentBtn.innerHTML = `<strong>${currentPage}</strong>`;
  paginationControls.appendChild(currentBtn);

  if (hasNextPage) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("page-link");
    nextBtn.innerHTML = "Next &raquo;";
    nextBtn.addEventListener("click", () => fetchCustomers(nextPage));
    paginationControls.appendChild(nextBtn);
  }
}
window.onload = function () {
  fetchCustomers(currentPage);
};
