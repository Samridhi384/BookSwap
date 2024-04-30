document.addEventListener("DOMContentLoaded", function () {
  const itemsPerPage = document.getElementById("itemsPerPage");

  const selectedRowsPerPage = localStorage.getItem("selectedRowsPerPage");

  if (selectedRowsPerPage) {
    // Set the selected value
    itemsPerPage.value = selectedRowsPerPage;
  }

  // Add event listener to update the selected value in localStorage
  itemsPerPage.addEventListener("change", function () {
    localStorage.setItem("selectedRowsPerPage", this.value);
  });
});

function changeItemsPerPage(select) {
  let itemsPerPage = select.value;

  if (itemsPerPage === "3") {
    itemsPerPage = 3;
    window.location.href = `/?page=1&itemsPerPage=3`;
  } else {
    window.location.href = `/?page=1&itemsPerPage=${itemsPerPage}`;
  }
}
