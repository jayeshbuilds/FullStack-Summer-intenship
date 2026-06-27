// check if logged in, if not go back to login page
fetch("/api/check")
  .then(res => {
    if (!res.ok) {
      window.location.href = "/login.html";
    } else {
      loadEmployees();
    }
  });

function loadEmployees() {
  document.getElementById("loadingMsg").innerText = "Loading...";

  fetch("/api/employees")
    .then(res => res.json())
    .then(data => {
      document.getElementById("loadingMsg").innerText = "";

      let tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";

      for (let i = 0; i < data.length; i++) {
        let emp = data[i];
        let row = "<tr>" +
          "<td>" + emp.id + "</td>" +
          "<td>" + emp.name + "</td>" +
          "<td>" + emp.email + "</td>" +
          "<td>" + emp.department + "</td>" +
          "<td>" + emp.position + "</td>" +
          "<td>" + emp.salary + "</td>" +
          "<td>" +
            "<button onclick='editEmployee(" + emp.id + ")'>Edit</button> " +
            "<button onclick='deleteEmployee(" + emp.id + ")'>Delete</button>" +
          "</td>" +
        "</tr>";
        tableBody.innerHTML += row;
      }
    });
}

function deleteEmployee(id) {
  let sure = confirm("Are you sure you want to delete this employee?");
  if (!sure) {
    return;
  }

  fetch("/api/employees/" + id, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      loadEmployees();
    });
}

function editEmployee(id) {
  fetch("/api/employees/" + id)
    .then(res => res.json())
    .then(emp => {
      document.getElementById("empId").value = emp.id;
      document.getElementById("name").value = emp.name;
      document.getElementById("email").value = emp.email;
      document.getElementById("department").value = emp.department;
      document.getElementById("position").value = emp.position;
      document.getElementById("salary").value = emp.salary;

      document.getElementById("formTitle").innerText = "Edit Employee";
      document.getElementById("submitBtn").innerText = "Save Changes";
      document.getElementById("cancelBtn").style.display = "inline";
    });
}

document.getElementById("cancelBtn").addEventListener("click", function() {
  resetForm();
});

function resetForm() {
  document.getElementById("empId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("department").value = "";
  document.getElementById("position").value = "";
  document.getElementById("salary").value = "";
  document.getElementById("formTitle").innerText = "Add Employee";
  document.getElementById("submitBtn").innerText = "Add Employee";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("formError").innerText = "";
}

// basic check on frontend before sending to server
function validateForm(name, email, department, position, salary) {
  if (name.length < 2) {
    return "Name is too short";
  }
  if (email.indexOf("@") == -1) {
    return "Email looks invalid";
  }
  if (department == "") {
    return "Department is required";
  }
  if (position == "") {
    return "Position is required";
  }
  if (salary == "" || salary <= 0) {
    return "Salary must be a positive number";
  }
  return null;
}

document.getElementById("empForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let id = document.getElementById("empId").value;
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let department = document.getElementById("department").value;
  let position = document.getElementById("position").value;
  let salary = document.getElementById("salary").value;

  let error = validateForm(name, email, department, position, salary);
  if (error) {
    document.getElementById("formError").innerText = error;
    return;
  }

  let empData = {
    name: name,
    email: email,
    department: department,
    position: position,
    salary: salary
  };

  let url = "/api/employees";
  let method = "POST";

  if (id) {
    url = "/api/employees/" + id;
    method = "PUT";
  }

  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      document.getElementById("formError").innerText = data.error;
    } else {
      resetForm();
      loadEmployees();
    }
  });
});

document.getElementById("logoutBtn").addEventListener("click", function() {
  fetch("/api/logout", { method: "POST" })
    .then(() => {
      window.location.href = "/login.html";
    });
});
