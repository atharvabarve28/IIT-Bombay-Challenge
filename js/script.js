//Due to static website hosting, the API URL is not working. So, I have used a local JSON file to fetch data.

// const API = "http://localhost:3000/supplies";

const API = "data/data.json";

let data = [];

const selectAll = (checkbox) => {
  const tableBody = document.getElementById("data_from_json");
  const checkboxes = tableBody.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((cb) => {
    cb.checked = checkbox.checked;
  });
};

const displayData = async () => {
  const loadingSpinner = document.getElementById("loading-spinner");
  loadingSpinner.style.display = "block";
  await new Promise((resolve) => setTimeout(resolve, 400));
  const res = await fetch(API).then((res) => res.json());
  data = res;
  renderTable(data);
  loadingSpinner.style.display = "none";

  const selectAllCheckbox = document.getElementById("select-all");
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
  }
};

const renderTable = (dataToRender) => {
  const tableBody = document.getElementById("data_from_json");

  // const tableData = dataToRender.map(
  const tableData = dataToRender.supplies.map(
    (
      {
        chemical_name,
        vendor,
        density,
        viscosity,
        packaging,
        pack_size,
        unit,
        quantity,
      },
      index
    ) =>
      `
      <tr>
          <td>
            <label class="custom-checkbox">
              <input type="checkbox" id="${
                index + 1
              }" onchange="updateSelectAllCheckbox()" />
              <i class="bi bi-check2"></i>
            </label>
          </td>
          <td>${index + 1}</td>
          <td>${chemical_name}</td>
          <td>${vendor}</td>
          <td><input type="number" value="${density}" onchange="updateData(${index}, 'density', this.value)" style="width: 100px;"/></td>
          <td><input type="number" value="${viscosity}" onchange="updateData(${index}, 'viscosity', this.value)" style="width: 100px;"/></td>
          <td>${packaging === null ? "N/A" : packaging}</td>
          <td>${pack_size === null ? "N/A" : pack_size}</td>
          <td>${unit}</td>
          <td><input type="number" value="${quantity}" onchange="updateData(${index}, 'quantity', this.value)" style="width: 100px;"/></td>  
        </tr>
      `
  );

  tableBody.innerHTML = tableData.join("");
};

const updateSerialNumbers = () => {
  const tableBody = document.getElementById("data_from_json");
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    const serialCell = row.cells[1];
    serialCell.textContent = index + 1;
  });
};

const newData = () => {
  const toast = new bootstrap.Toast(document.getElementById("addToast"));
  toast.show();

  const form = document.getElementById("addRecordForm");
  form.onsubmit = async (event) => {
    event.preventDefault();

    const newRecord = {
      chemical_name: document.getElementById("chemicalName").value,
      vendor: document.getElementById("vendor").value,
      density: parseFloat(document.getElementById("density").value),
      viscosity: parseFloat(document.getElementById("viscosity").value),
      packaging: document.getElementById("packaging").value || null,
      pack_size: parseFloat(document.getElementById("packSize").value) || null,
      unit: document.getElementById("unit").value,
      quantity: parseFloat(document.getElementById("quantity").value),
    };

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecord),
    });

    if (response.ok) {
      const addedRecord = await response.json();
      data.push(addedRecord);
      renderTable(data);
    }

    form.reset();
    toast.hide();
  };
};

const deleteData = async () => {
  const tableBody = document.getElementById("data_from_json");
  const checkboxes = tableBody.querySelectorAll("input[type=checkbox]:checked");
  if (checkboxes.length === 0) {
    alert("No record is selected.");
    return;
  }

  const checkboxesArray = Array.from(checkboxes);
  for (const checkbox of checkboxesArray) {
    const row = checkbox.closest("tr");
    if (row) {
      const index = parseInt(checkbox.id) - 1;
      const itemId = data[index].id;

      await fetch(`${API}/${itemId}`, {
        method: "DELETE",
      });

      data.splice(index, 1);
      tableBody.removeChild(row);
    }
  }
  alert(`${checkboxesArray.length} row(s) deleted successfully.`);
  updateSerialNumbers();
  updateSelectAllCheckbox();
};

const sort_a = () => {
  data.sort((a, b) => a.chemical_name.localeCompare(b.chemical_name));
  renderTable(data);
  document.querySelector(".sort-icon.active")?.classList.remove("active");
  document.querySelector(".bi-arrow-up").classList.add("active");
  document.querySelector(".bi-arrow-down").classList.remove("active");
  updateSelectAllCheckbox();
};

const sort_d = () => {
  data.sort((a, b) => b.chemical_name.localeCompare(a.chemical_name));
  renderTable(data);
  document.querySelector(".sort-icon.active")?.classList.remove("active");
  document.querySelector(".bi-arrow-down").classList.add("active");
  document.querySelector(".bi-arrow-up").classList.remove("active");
  updateSelectAllCheckbox();
};

const refreshData = async () => {
  await displayData();
};

const saveData = async () => {
  const loadingSpinner = document.getElementById("loading-spinner");
  loadingSpinner.style.display = "block";

  try {
    const updatePromises = data.map(async (item) => {
      const response = await fetch(`${API}/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(
          `Error updating item with ID ${item.id}: ${response.statusText}`
        );
      }
    });

    await Promise.all(updatePromises);
    alert("Data saved successfully!");
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    alert("Failed to save data. Please try again.");
  } finally {
    loadingSpinner.style.display = "none";
  }
};

const updateData = (index, field, value) => {
  if (
    field === "density" ||
    field === "viscosity" ||
    field === "pack_size" ||
    field === "quantity"
  ) {
    value = parseFloat(value);
  }

  data[index][field] = value;
};

const updateSelectAllCheckbox = () => {
  const tableBody = document.getElementById("data_from_json");
  const checkboxes = tableBody.querySelectorAll("input[type=checkbox]");
  const selectAllCheckbox = document.getElementById("select-all");
  const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
  selectAllCheckbox.checked = allChecked;
};

window.onload = displayData;
