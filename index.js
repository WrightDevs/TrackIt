document.addEventListener("DOMContentLoaded", () => {
      const predefinedActivationCodes = ["ABCD1234EF", "GHIJ5678KL", "MNOP9101QR", "STUV2345WX", "YZAB6789CD"];
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let usedActivationCodes = JSON.parse(localStorage.getItem("usedActivationCodes")) || [];
      let balance = parseFloat(localStorage.getItem("balance")) || 0;
      let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

      const activationForm = document.getElementById("activationForm");
      const registerForm = document.getElementById("registerForm");
      const loginForm = document.getElementById("loginForm");
      const loginSection = document.getElementById("loginSection");
      const registerSection = document.getElementById("registerSection");
      const expenseTrackerSection = document.getElementById("expenseTrackerSection");
      const messageElement = document.getElementById("message");
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
          row.innerHTML = `<td>${expense.item}</td><td>₦${expense.cost}</td><td>${expense.date}</td>`;
          expenseTable.appendChild(row);
        });
      };

      // Handle Registration Form submission
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
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

        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some((u) => u.username === username)) {
          alert("Username already exists");
          return;
        }

        users.push({ username, password });
        localStorage.setItem("users", JSON.stringify(users));

        usedActivationCodes.push(activationCode);
        localStorage.setItem("usedActivationCodes", JSON.stringify(usedActivationCodes));

        alert("Registration successful! You can now log in.");
        showLoginForm();
      });

      // Handle Login Form submission
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find((u) => u.username === username && u.password === password);

        if (user) {
          currentUser = user;
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
          alert(`₦${amount} added successfully!`);
          balanceElement.textContent = balance.toFixed(2);
          renderExpenses();
          document.getElementById("topUpModal").modal('hide');
        }
      });

      // Handle Add Expense Form submission
      document.getElementById("expenseForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const item = document.getElementById("item").value;
            const cost = parseFloat(document.getElementById("cost").value);

        if (item && cost > 0) {
            const newExpense = {
                item,
                cost,
                date: new Date().toLocaleString(),
            };

            expenses.push(newExpense);
            localStorage.setItem("expenses", JSON.stringify(expenses));

            // Update the balance after adding the expense
            balance -= cost;
            localStorage.setItem("balance", balance);

            alert(`₦${cost} spent on ${item}`);
            balanceElement.textContent = balance.toFixed(2);

            renderExpenses(); // Re-render the expense table
            document.getElementById("item").value = ''; // Clear the input fields
            document.getElementById("cost").value = '';
        } else {
            alert("Please provide valid item and cost values.");
        }
    });

    // Calculate Area Button Functionality
    document.getElementById("calculateAreaBtn").addEventListener("click", () => {
        const length = parseFloat(document.getElementById("length").value);
        const width = parseFloat(document.getElementById("width").value);

        if (!isNaN(length) && !isNaN(width) && length > 0 && width > 0) {
            const area = length * width;
            document.getElementById("areaResult").textContent = `Area: ${area} square units`;
        } else {
            alert("Please enter valid dimensions for length and width.");
        }
    });

    // Download Expenses as PDF
    document.getElementById("downloadBtn").addEventListener("click", () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        doc.setFontSize(18);
        doc.text("Expense Report", 14, 20);

        doc.setFontSize(12);
        doc.text(`Date: ${currentDate}`, 14, 30);

        let yPosition = 40;
        expenses.forEach((expense) => {
            doc.text(`Item: ${expense.item}`, 14, yPosition);
            doc.text(`Cost: ₦${expense.cost}`, 80, yPosition);
            doc.text(`Date: ${expense.date}`, 150, yPosition);
            yPosition += 10;
        });

        // Add a footer
        doc.text(`Total Balance: ₦${balance.toFixed(2)}`, 14, yPosition + 10);
        
        // Save the PDF
        doc.save("Expense_Report.pdf");
    });

    // Display the expense tracker after loading the page
    if (currentUser) {
        showExpenseTracker();
    } else {
        showLoginForm();
    }
});
