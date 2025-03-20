window.onload = function() {
    const userList = getUserList();
    const loggedInUser = userList.find(user => user.status === true);
    
    if (loggedInUser) {
        toggleHomePage(loggedInUser); // Display the home page for the logged-in user
    } else {
        document.getElementById('toggle-login-signup').style.display = 'block'; // Show login/signup page
    }
};

// Function to show the appropriate form and hide others
function showForm(formType) {
    document.getElementById("welcome-message").style.display = "none";
    document.getElementById(formType + "-form").classList.add("active");
    document.getElementById("toggle-login-signup").style.display = "none";
    document.getElementById(formType === "login" ? "signup-form" : "login-form").classList.remove("active");
}

// Function to hide forms and reset the view
function hideForm(formType) {
    document.getElementById(formType + "-form").classList.remove("active");
    document.getElementById("toggle-login-signup").style.display = "block";
    document.getElementById("welcome-message").style.display = "block";
}

// Function to reset form inputs
function resetForm(formId) {
    document.querySelectorAll(`#${formId} input`).forEach(input => input.value = "");
}

// Home page toggle logic
function toggleHomePage(user) {
    const homePage = document.getElementById("homePage");
    homePage.innerHTML = ""; // Clear existing content

    if (!user) {
        homePage.style.display = "none";
        document.getElementById("toggle-login-signup").style.display = "block";
        document.getElementById("welcome-message").style.display = "block";
        return;
    }

    homePage.style.display = "block";
    const welcome = document.createElement("p");
    welcome.innerText = `Hello, ${user.name}!`;

    const todoButton = document.createElement("button");
    todoButton.innerHTML = `<a href="https://shashwat2048.github.io/to-do-list/">To-Do List</a>`;

    const clockButton = document.createElement("button");
    clockButton.innerHTML = `<a href="https://shashwat2048.github.io/SassyClock/">Clock</a>`;

    const logoutButton = document.createElement("button");
    logoutButton.innerText = "Logout";
    logoutButton.onclick = () => logout(user);

    homePage.append(welcome, todoButton, clockButton, logoutButton);
    hideForm("login");

    document.getElementById("toggle-login-signup").style.display = "none";
}

// Login functionality
async function handleLogin() {
    const userList = getUserList();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    resetForm("login-form");

    // Find the user matching the email and password
    const user = userList.find(user => user.email === email);

    if (user) {
        // Compare hashed password
        const hashedPassword = await hashPassword(password);

        if (user.password === hashedPassword) {
            // User authenticated successfully
            user.status = true; // Set the user status to logged in
            updateUserList(userList); // Update the user list with the logged-in status

            // Store the logged-in user's info in localStorage
            localStorage.setItem("loggedInUser", JSON.stringify(user));

            // Toggle to the home page with the user's data
            toggleHomePage(user);
        } else {
            alert("Invalid credentials. Please try again.");
        }
    } else {
        alert("Invalid credentials. Please try again.");
    }
}

// Signup functionality
async function handleSignup() {
    const userList = getUserList();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    // Validate inputs
    if (!validateInput("signup-name", value => value.length > 0 && isNaN(value.charAt(0)), "Name cannot start with a number.") ||
        !validateInput("signup-email", validateEmail, "Invalid email format.") ||
        !validateInput("signup-password", validatePassword, "Password must have at least 8 characters, including uppercase, number, and special character.")) {
        return;
    }

    if (userList.some(user => user.email === email)) {
        alert("This email is already registered.");
        return;
    }

    const hashedPassword = await hashPassword(password);

    // Add the new user to the list
    userList.push({ name, email, password: hashedPassword, status: false });
    updateUserList(userList);

    resetForm("signup-form");
    alert("Signup successful! Please log in.");
    hideForm("signup");
}

// Logout functionality
function logout() {
    // Retrieve the list of users from localStorage
    const userList = getUserList();

    // Find the logged-in user and set their status to false
    const loggedInUser = userList.find(user => user.status === true);
    if (loggedInUser) {
        loggedInUser.status = false; // Log the user out
        updateUserList(userList); // Update the user list in localStorage
    }

    // Clear the logged-in user from localStorage
    localStorage.removeItem("loggedInUser");

    // Hide the home page and show the login/signup form
    const homePage = document.getElementById("homePage");
    homePage.style.display = "none"; // Hide the home page

    // Show the login/signup page and the welcome message
    document.getElementById("toggle-login-signup").style.display = "block"; // Show the login/signup form
    document.getElementById("welcome-message").style.display = "block"; // Show the welcome message

    // Optionally, reset any forms if needed
    // resetForm('login-form');
}


// Input validation function
function validateInput(inputId, validationFn, errorMessage) {
    const input = document.getElementById(inputId);
    let errorElem = input.nextElementSibling;

    if (!validationFn(input.value.trim())) {
        if (!errorElem || !errorElem.classList.contains("error-message")) {
            errorElem = document.createElement("p");
            errorElem.classList.add( "error-message");
            input.after(errorElem);
        }
        errorElem.innerText = errorMessage;
        return false;
    } else if (errorElem && errorElem.classList.contains("error-message")) {
        errorElem.remove();
    }
    return true;
}

// Utility functions
function getUserList() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function updateUserList(userList) {
    localStorage.setItem("users", JSON.stringify(userList));
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validatePassword(password) {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
}
