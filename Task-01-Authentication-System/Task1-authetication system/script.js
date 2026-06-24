function showRegister() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("registerPage").style.display = "block";
}

function showLogin() {
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
}

function register() {

    let name = document.getElementById("regName").value.trim();
    let email = document.getElementById("regEmail").value.trim();
    let password = document.getElementById("regPassword").value.trim();

    if(name === "" || email === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    if(password.length < 6){
        alert("Password must be at least 6 characters long");
        return;
    }

    let savedEmail = localStorage.getItem("email");

    if(email === savedEmail){
        alert("Email already registered");
        return;
    }

    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    alert("Registration Successful");

    showLogin();
}

function login() {

    let email = document.getElementById("loginEmail").value.trim();
    let password = document.getElementById("loginPassword").value.trim();

    let savedName = localStorage.getItem("name");
    let savedEmail = localStorage.getItem("email");
    let savedPassword = localStorage.getItem("password");

    if(email === savedEmail && password === savedPassword){

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("successPage").style.display = "block";

        document.getElementById("welcomeUser").innerText =
            "Welcome, " + savedName + " 👋";

    } else {
        alert("Invalid Email or Password");
    }
}

function logout(){

    document.getElementById("successPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
}