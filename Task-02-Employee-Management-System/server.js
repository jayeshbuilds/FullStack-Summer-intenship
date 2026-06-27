// Employee Management System
// Simple backend using Express and a JSON file as the database

const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const EMPLOYEES_FILE = path.join(__dirname, "data", "employees.json");

// admin login details (kept simple for this project)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// keeping track of logged in sessions in memory
// key = token, value = true
let activeSessions = {};

function makeToken() {
  // just a random string, good enough for this project
  return Math.random().toString(36).substring(2) + Date.now();
}

// middleware to check if user is logged in
function checkLogin(req, res, next) {
  const token = req.cookies.token;
  if (token && activeSessions[token]) {
    next();
  } else {
    res.status(401).json({ error: "You need to login first" });
  }
}

function getEmployees() {
  let data = fs.readFileSync(EMPLOYEES_FILE);
  return JSON.parse(data);
}

function saveEmployees(employees) {
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));
}

// home page -> redirect to login
app.get("/", function (req, res) {
  res.redirect("/login.html");
});

// LOGIN route
app.post("/api/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  if (username == ADMIN_USERNAME && password == ADMIN_PASSWORD) {
    let token = makeToken();
    activeSessions[token] = true;
    res.cookie("token", token);
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, error: "Wrong username or password" });
  }
});

// LOGOUT route
app.post("/api/logout", function (req, res) {
  let token = req.cookies.token;
  delete activeSessions[token];
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// check if logged in (dashboard page calls this)
app.get("/api/check", checkLogin, function (req, res) {
  res.json({ loggedIn: true });
});

// GET all employees
app.get("/api/employees", checkLogin, function (req, res) {
  let employees = getEmployees();
  res.json(employees);
});

// GET single employee (for edit form)
app.get("/api/employees/:id", checkLogin, function (req, res) {
  let employees = getEmployees();
  let emp = employees.find(e => e.id == req.params.id);
  if (emp) {
    res.json(emp);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

// simple validation function, nothing fancy
function checkEmployeeData(data) {
  if (!data.name || data.name.length < 2) {
    return "Name is too short";
  }
  if (!data.email || data.email.indexOf("@") == -1) {
    return "Email looks invalid";
  }
  if (!data.department) {
    return "Department is required";
  }
  if (!data.position) {
    return "Position is required";
  }
  if (!data.salary || isNaN(data.salary) || data.salary <= 0) {
    return "Salary must be a positive number";
  }
  return null; // no errors
}

// ADD new employee
app.post("/api/employees", checkLogin, function (req, res) {
  let error = checkEmployeeData(req.body);
  if (error) {
    return res.status(400).json({ error: error });
  }

  let employees = getEmployees();

  // check for duplicate email
  for (let i = 0; i < employees.length; i++) {
    if (employees[i].email.toLowerCase() == req.body.email.toLowerCase()) {
      return res.status(400).json({ error: "An employee with this email already exists" });
    }
  }

  let newId = 1;
  if (employees.length > 0) {
    newId = employees[employees.length - 1].id + 1;
  }

  let newEmp = {
    id: newId,
    name: req.body.name,
    email: req.body.email,
    department: req.body.department,
    position: req.body.position,
    salary: Number(req.body.salary)
  };

  employees.push(newEmp);
  saveEmployees(employees);
  res.json(newEmp);
});

// UPDATE employee
app.put("/api/employees/:id", checkLogin, function (req, res) {
  let error = checkEmployeeData(req.body);
  if (error) {
    return res.status(400).json({ error: error });
  }

  let employees = getEmployees();
  let index = -1;
  for (let i = 0; i < employees.length; i++) {
    if (employees[i].id == req.params.id) {
      index = i;
      break;
    }
  }

  if (index == -1) {
    return res.status(404).json({ error: "Employee not found" });
  }

  employees[index].name = req.body.name;
  employees[index].email = req.body.email;
  employees[index].department = req.body.department;
  employees[index].position = req.body.position;
  employees[index].salary = Number(req.body.salary);

  saveEmployees(employees);
  res.json(employees[index]);
});

// DELETE employee
app.delete("/api/employees/:id", checkLogin, function (req, res) {
  let employees = getEmployees();
  let newList = employees.filter(e => e.id != req.params.id);

  if (newList.length == employees.length) {
    return res.status(404).json({ error: "Employee not found" });
  }

  saveEmployees(newList);
  res.json({ message: "Deleted successfully" });
});

app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
  console.log("login: admin / admin123");
});
