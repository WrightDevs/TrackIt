// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDu5Fz9meST0xVPgI711QrOqHvQswqYLYY",
  authDomain: "spendscope212.firebaseapp.com",
  databaseURL: "https://spendscope212-default-rtdb.firebaseio.com",
  projectId: "spendscope212",
  storageBucket: "spendscope212.appspot.com",
  messagingSenderId: "145859682350",
  appId: "1:145859682350:web:597295e731d1ca375abfbf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const predefinedActivationCodes = ["ABCD1234EF", "GHIJ5678KL", "MNOP9101QR", "STUV2345WX", "YZAB6789CD"];
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let usedActivationCodes = JSON.parse(localStorage.getItem("usedActivationCodes")) || [];
  let balance = parseFloat(localStorage.getItem("balance")) || 0;
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const activationForm = document.getElementById("activationForm");
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const expenseTrackerSection = document.getElementById("expenseTrackerSection");
  const expenseTable = document.getElementById("expenseTable");
  const balanceElement = document.getElementById("balance");
  const usernameElement = document.getElementById("username");

  const showLoginForm = () => {
    loginSection.classList.remove("d-none");
    registerSection.classList.add("d-none");
    expenseTrackerSection.classList.add("d-none");
  };

  const showRegisterForm = () => {
    loginSection.classList.add("d-none");
    registerSection.classList.remove("d-none");
    expenseTrackerSection.classList.add("d-none");
  };

  const showExpenseTracker = () => {
    loginSection.classList.add("d-none");
    registerSection.classList.add("d-none");
    expenseTrackerSection.classList.remove("d-none");
    usernameElement.textContent = currentUser.username;
    balanceElement.textContent = balance.toFixed(2);
    renderExpenses();
  };

  const renderExpenses = () => {
    expenseTable.innerHTML = "";
    expenses.forEach((expense) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${expense.item}</td><td>₦${expense.cost.toFixed(2)}</td><td>${expense.date}</td>`;
      expenseTable.appendChild(row);
    });
  };

  // Generate a unique device ID and persist it in local storage
  const generateDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = btoa(navigator.userAgent + Math.random().toString(36).substring(2));
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  // Handle Registration Form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const activationCode = document.getElementById("activationCodeRegister").value.trim().toUpperCase();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!predefinedActivationCodes.includes(activationCode)) {
      alert("Invalid activation code.");
      return;
    }

    if (usedActivationCodes.includes(activationCode)) {
      alert("This activation code has already been used.");
      return;
    }

    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.val() || {};

    if (Object.values(users).some((u) => u.username === username)) {
      alert("Username already exists");
      return;
    }

    const deviceId = generateDeviceId();

    const newUser = {
      username,
      password,
      deviceId,
      balance: 0,
      expenses: [],
    };

    const newUserRef = push(usersRef);
    await set(newUserRef, newUser);

    usedActivationCodes.push(activationCode);
    localStorage.setItem("usedActivationCodes", JSON.stringify(usedActivationCodes));

    alert("Registration successful! You can now log in.");
    showLoginForm();
  });

  // Handle Login Form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.val() || {};
    const user = Object.values(users).find((u) => u.username === username && u.password === password);

    if (user) {
      const currentDeviceId = generateDeviceId();

      if (user.deviceId !== currentDeviceId) {
        alert("This account is not authorized to be used on this device.");
        return;
      }

      currentUser = { ...user, id: Object.keys(users).find(key => users[key] === user) };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showExpenseTracker();
    } else {
      alert("Invalid username or password");
    }
  });

  // Show registration form
  document.getElementById("showRegister").addEventListener("click", showRegisterForm);
  document.getElementById("showLogin").addEventListener("click", showLoginForm);

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    currentUser = null;
    showLoginForm();
  });

  // Handle Add Money Modal submission
  document.getElementById("topUpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    if (amount > 0) {
      balance += amount;
      localStorage.setItem("balance", balance);
      alert(`₦${amount.toFixed(2)} added successfully!`);
      balanceElement.textContent = balance.toFixed(2);
      renderExpenses();
      const topUpModal = bootstrap.Modal.getInstance(document.getElementById("topUpModal"));
      topUpModal.hide();
    } else {
      alert("Please enter a valid amount.");
    }
  });

  // Handle Add Expense Form submission
  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const item = document.getElementById("item").value.trim();
    const cost = parseFloat(document.getElementById("cost").value);

    if (item && cost > 0) {
      const newExpense = {
        item,
        cost,
        date: new Date().toLocaleString(),
      };

      expenses.push(newExpense);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      balance -= cost;
      localStorage.setItem("balance", balance);

      alert(`₦${cost.toFixed(2)} spent on ${item}`);
      balanceElement.textContent = balance.toFixed(2);
      renderExpenses();
      document.getElementById("item").value = '';
      document.getElementById("cost").value = '';
    } else {
      alert("Please provide valid item and cost values.");
    }
  });

  // Download Expenses as PDF
  document.getElementById("downloadBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text("Expense Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${currentDate}`, 14, 30);

    let yPosition = 40;
    expenses.forEach((expense) => {
      doc.text(`Item: ${expense.item}`, 14, yPosition);
      doc.text(`Cost: ₦${expense.cost.toFixed(2)}`, 80, yPosition);
      doc.text(`Date: ${expense.date}`, 150, yPosition);
      yPosition += 10;
    });

    doc.text(`Total Balance: ₦${balance.toFixed(2)}`, 14, yPosition + 10);
    doc.save("Expense_Report.pdf");
  });

  if (currentUser) {
    showExpenseTracker();
  } else {
    showLoginForm();
  }
});
