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
    window.location.href = `/searchBooks?page=1&query=${getQueryVariable(
      "query"
    )}&itemsPerPage=3`;
  } else {
    window.location.href = `/searchBooks?page=1&query=${getQueryVariable(
      "query"
    )}&itemsPerPage=${itemsPerPage}`;
  }
}

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i <= vars.length; i++) {
    const pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}
