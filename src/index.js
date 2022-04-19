import { config } from "./config";
import { loginEventListener } from "./login";

// Add listener for login button
const loginButton = document.getElementById("login-form-submit");
loginButton.addEventListener("click", loginEventListener);

// Global state
let currentPage = 1;
let totalPages = Infinity;
let filter = "";

// Clear styles from page buttons
function restorePageButtons() {
    const previousPageButton = document.getElementById("page-previous");
    previousPageButton.style.pointerEvents = "";
    previousPageButton.style.color = "";

    const nextPageButton = document.getElementById("page-next");
    nextPageButton.style.pointerEvents = "";
    nextPageButton.style.color = "";
}

function updatePagination() {
    // TODO: update total pages
    restorePageButtons();
    if (currentPage === 1) {
        const previousPageButton = document.getElementById("page-previous");
        previousPageButton.style.pointerEvents = "none";
        previousPageButton.style.color = "black";
    } else if (currentPage === totalPages) {
        const nextPageButton = document.getElementById("page-next");
        nextPageButton.style.pointerEvents = "none";
        nextPageButton.style.color = "black";
    }
    const currentPageText = document.getElementById("page-current");
    currentPageText.textContent = currentPage;
}

const nextPageButton = document.getElementById("page-next");
nextPageButton.addEventListener("click", () => {
    currentPage++;
    updatePagination();
    fillTable();
});

const previousPageButton = document.getElementById("page-previous");
previousPageButton.addEventListener("click", () => {
    currentPage--;
    updatePagination();
    fillTable();
});

const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("employees-search");
searchInput.addEventListener("keyup", ({ key }) => {
    // uncomment to disable incremental search
    // if (key !== "Enter") {
    //     return;
    // }

    filter = searchInput.value;
    currentPage = 1;

    updatePagination();
    fillTable();
});

function fillTable() {
    const token = localStorage.getItem('token');

    fetch(`${config.serverAddr}/api/employees?` + new URLSearchParams({
        page: currentPage,
        filter: filter,
    }), {
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
            let table = document.getElementById("employees-table");
            table.innerHTML = `
                    <tr class="table-secondary">
                        <th>Id</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Role</th>
                        <th>Birthday</th>
                        <th>Salary</th>
                    </tr>
                `;
            for (let employee of employees) {
                table.innerHTML += `
						<tr>
							<td>${employee.id}</td>
							<td>${employee.name}</td>
							<td>${employee.surname}</td>
							<td>${employee.role}</td>
							<td>${employee.birthdate}</td>
							<td>${employee.salary}</td>
						</tr>
					`;
            }
        })
        .catch(alert);
}

window.onload = () => {
    const loginButton = document.getElementById("employees-login-button");
    const token = localStorage.getItem('token');

    // Unauthorized
    if (token === null) {
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

