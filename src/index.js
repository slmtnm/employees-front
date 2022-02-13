const employees = [
  { id: 1, name: "Makar", surname: "Solomatin", role: "Software Engineer", birthday: "2000-27-04", salary: 228 },
  { id: 2, name: "Petr", surname: "Petrov", role: "Senior Software Engineer", birthday: "1990-27-04", salary: 420 },
  { id: 3, name: "Ivan", surname: "Ivanov", role: "Junior Software Engineer", birthday: "2002-31-01", salary: 1337 },
]

function onEmployeeClick(event) {
  const getField = className => event.getElementsByClassName(className)[0].innerHTML;
  const employee = {
    id: getField("employee-id"),
    name: getField("employee-name"),
    surname: getField("employee-surname"),
    role: getField("employee-role"),
    birthday: getField("employee-birthday"),
    salary: getField("employee-salary"),
  };

  alert(Object.values(employee).toString());
}

function restoreTable(employees) {
  let table = document.getElementById("employees-table");

  for (let employee of employees) {
      table.innerHTML += `
        <tr onclick="onEmployeeClick(this)">
          <td class="employee-id">${employee.id}</td>
          <td class="employee-name">${employee.name}</td>
          <td class="employee-surname">${employee.surname}</td>
          <td class="employee-role">${employee.role}</td>
          <td class="employee-birthday">${employee.birthday}</td>
          <td class="employee-salary">${employee.salary}</td>
        </tr>
      `;
  }
}

// Add Ctrl+/ handler for focusing search input
document.addEventListener('keydown', event => {
  if (event.ctrlKey && event.code === 'Slash') {
    document.getElementById("employees-search").focus();
  }
});

restoreTable(employees);