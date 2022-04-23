const serverAddr = "http://localhost:8081";

// JWT authorization token
let token = null;

// pagination elements
const previousPageButton = document.getElementById("page-previous");
const nextPageButton = document.getElementById("page-next");
const currentPageText = document.getElementById("page-current");

const searchInput = document.getElementById("employees-search");
const table = document.getElementById("employees-table");
const loginSubmitButton = document.getElementById("login-form-submit");
const editSubmitButton = document.getElementById("edit-form-submit");
const deleteSubmitButton = document.getElementById("delete-form-submit");
const loginButton = document.getElementById("employees-login-button");

const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");

// Global state
let currentPage = 1;
let totalPages = Infinity;
let filter = "";
let salarySortOrder = null;

// Add listener for login button
loginSubmitButton.addEventListener("click", event => {
    event.preventDefault();
    const username = document.getElementById("inputLogin").value;
    const password = document.getElementById("inputPassword").value;

    fetch(`${serverAddr}/api/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (response.status === 401) {
                throw new Error("Invalid username or password");
            } else if (response.status === 422) {
                throw new Error("Incorrect username or password format");
            }

            return response.json();
        })
        .then(response => {
            if (!('token' in response)) {
                throw new Error("Invalid answer from server");
            }
            localStorage.setItem("token", response.token);
            location.reload();
        })
        .catch(err => {
            const errorMessage = document.getElementById("login-error-msg");
            errorMessage.textContent = err.message;
            errorMessage.style.opacity = 1;
        });
});

// Clear styles from page buttons
function restorePageButtons() {
    previousPageButton.style.pointerEvents = "";
    previousPageButton.style.color = "";

    nextPageButton.style.pointerEvents = "";
    nextPageButton.style.color = "";
}

function updatePagination() {
    // TODO: update total pages
    restorePageButtons();
    if (currentPage === 1) {
        previousPageButton.style.pointerEvents = "none";
        previousPageButton.style.color = "black";
    } else if (currentPage === totalPages) {
        nextPageButton.style.pointerEvents = "none";
        nextPageButton.style.color = "black";
    }
    currentPageText.textContent = currentPage;
}

nextPageButton.addEventListener("click", () => {
    currentPage++;
    updatePagination();
    fillTable();
});
previousPageButton.addEventListener("click", () => {
    currentPage--;
    updatePagination();
    fillTable();
});

searchInput.addEventListener("keyup", ({ key }) => {
    if (key !== "Enter") {
        return;
    }

    filter = searchInput.value;
    currentPage = 1;

    updatePagination();
    fillTable();
});

editModal.addEventListener("show.bs.modal", e => {
    const trElement = e.relatedTarget.closest('tr');
    const employee = {
        id: trElement.getElementsByClassName("employee-id")[0].textContent,
        name: trElement.getElementsByClassName("employee-name")[0].textContent,
        surname: trElement.getElementsByClassName("employee-surname")[0].textContent,
        role: trElement.getElementsByClassName("employee-role")[0].textContent,
        birthdate: trElement.getElementsByClassName("employee-birthdate")[0].textContent,
        salary: trElement.getElementsByClassName("employee-salary")[0].textContent,
    };

    const inputNameEdit = document.getElementById("inputNameEdit");
    const inputSurnameEdit = document.getElementById("inputSurnameEdit");
    const inputRoleEdit = document.getElementById("inputRoleEdit");
    const inputBirthdateEdit = document.getElementById("inputBirthdateEdit");
    const inputSalaryEdit = document.getElementById("inputSalaryEdit");

    inputNameEdit.value = employee.name;
    inputSurnameEdit.value = employee.surname;
    inputRoleEdit.value = employee.role;
    inputBirthdateEdit.value = employee.birthdate;
    inputSalaryEdit.value = employee.salary;

    editSubmitButton.onclick = () => {
        fetch(`${serverAddr}/api/employees/${employee.id}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: inputNameEdit.value,
                surname: inputSurnameEdit.value,
                role: inputRoleEdit.value,
                birthdate: inputBirthdateEdit.value,
                salary: Number(inputSalaryEdit.value),
            })
        }).then(response => {
            if (response.status === 400) {
                alert("Wrong input (see console)");
                response.json().then(v => console.log(v));
            }
            if (response.status !== 200) {
                alert("Could not update employee #" + employee.id);
            }

            currentPage = 1;
            updatePagination();
            fillTable();

            document.getElementById("editModalCloseButton").click();
        });
    };
});

deleteModal.addEventListener("show.bs.modal", e => {
    const trElement = e.relatedTarget.closest('tr');
    const [idElement] = trElement.getElementsByClassName("employee-id");

    deleteSubmitButton.onclick = () => {
        fetch(`${serverAddr}/api/employees/${idElement.textContent}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }).then(response => {
            if (response.status !== 200) {
                alert("Could not delete employee #" + idElement.textContent);
            }

            currentPage = 1;
            updatePagination();
            fillTable();

            document.getElementById("deleteModalCloseButton").click();
        });
    };
});

function switchSalarySort() {
    switch (salarySortOrder) {
        case null:
            salarySortOrder = "asc";
            break;
        case "asc":
            salarySortOrder = "desc";
            break;
        case "desc":
            salarySortOrder = null;
            break;
    }

    currentPage = 1;

    updatePagination();
    fillTable();
}

function fillTable() {
    let queryParams = {
        page: currentPage,
        filter: filter,
    };
    if (salarySortOrder != null) {
        queryParams.sorted = salarySortOrder;
    };

    fetch(`${serverAddr}/api/employees?` + new URLSearchParams(queryParams), {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(response => {
            if (response.status != 200) {
                throw Error("Could not fetch employees");
            }
            return response.json();
        })
        .then(employees => {
            const salaryHeader = salarySortOrder === null ? "Salary" : salarySortOrder === "asc" ? "Salary (asc)" : "Salary (desc)";
            table.innerHTML = `
                    <tr class="table-secondary">
                        <th>Id</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Role</th>
                        <th>Birthday</th>
                        <th><a href="#" onclick="switchSalarySort();" id="salary-link">${salaryHeader}</a></th>
                        <th>Actions</th>
                    </tr>
                `;
            for (let employee of employees) {
                table.innerHTML += `
						<tr>
							<td class="employee-id">${employee.id}</td>
							<td class="employee-name">${employee.name}</td>
							<td class="employee-surname">${employee.surname}</td>
							<td class="employee-role">${employee.role}</td>
							<td class="employee-birthdate">${employee.birthdate}</td>
							<td class="employee-salary">${employee.salary}</td>
                            <td>
                              <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                              <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                            </td>
						</tr>
					`;
            }
        })
        .catch(alert);
}

window.onload = () => {
    token = localStorage.getItem('token');

    // Unauthorized
    if (!token) {
        return;
    }

    loginButton.textContent = "Logout";
    loginButton.onclick = () => {
        localStorage.removeItem("token");
        location.reload();
    }

    fillTable();
    updatePagination();
};
