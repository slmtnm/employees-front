const employees = [
    { id: 1, name: "Makar", surname: "Solomatin", role: "Software Engineer", birthday: "2000-27-04", salary: 228 },
    { id: 2, name: "Petr", surname: "Petrov", role: "Senior Software Engineer", birthday: "1990-27-04", salary: 420 },
    { id: 3, name: "Ivan", surname: "Ivanov", role: "Junior Software Engineer", birthday: "2002-31-01", salary: 1337 },
]

function restoreTable(employees) {
    let table = document.getElementById("employees-table");

    for (let employee of employees) {
        table.innerHTML += `
          <tr>
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.surname}</td>
            <td>${employee.role}</td>
            <td>${employee.birthday}</td>
            <td>${employee.salary}</td>
          </tr>
        `;
    }
}

restoreTable(employees);