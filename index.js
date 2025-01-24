document.addEventListener("DOMContentLoaded", () => {
  const predefinedActivationCodes = ["ABCD1234EF", "GHIJ5678KL", "MNOP9101QR", "STUV2345WX", "YZAB6789CD", "DivineTheDivine","DRUNE","RexDeVal"]
  let currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const usedActivationCodes = JSON.parse(localStorage.getItem("usedActivationCodes")) || []
  let balance = Number.parseFloat(localStorage.getItem("balance")) || 0
  const expenses = JSON.parse(localStorage.getItem("expenses")) || []

  const activationForm = document.getElementById("activationForm")
  const registerForm = document.getElementById("registerForm")
  const loginForm = document.getElementById("loginForm")
  const loginSection = document.getElementById("loginSection")
  const registerSection = document.getElementById("registerSection")
  const expenseTrackerSection = document.getElementById("expenseTrackerSection")
  const messageElement = document.getElementById("message")
  const expenseTable = document.getElementById("expenseTable")
  const balanceElement = document.getElementById("balance")
  const usernameElement = document.getElementById("username")

  let categoryChart
  let timelineChart

  const showLoginForm = () => {
    loginSection.classList.remove("d-none")
    registerSection.classList.add("d-none")
    expenseTrackerSection.classList.add("d-none")
  }

  const showRegisterForm = () => {
    loginSection.classList.add("d-none")
    registerSection.classList.remove("d-none")
    expenseTrackerSection.classList.add("d-none")
  }

  const showExpenseTracker = () => {
    loginSection.classList.add("d-none")
    registerSection.classList.add("d-none")
    expenseTrackerSection.classList.remove("d-none")
    usernameElement.textContent = currentUser.username
    balanceElement.textContent = balance.toFixed(2)
    renderExpenses()
    updateCharts()
  }

  const renderExpenses = () => {
    expenseTable.innerHTML = ""
    expenses.forEach((expense) => {
      const row = document.createElement("tr")
      row.innerHTML = `<td>${expense.item}</td><td>₦${expense.cost}</td><td>${expense.category}</td><td>${expense.date}</td>`
      expenseTable.appendChild(row)
    })
  }

  const updateCharts = () => {
    updateCategoryChart()
    updateTimelineChart()
  }

  const updateCategoryChart = () => {
    const categoryData = {}
    expenses.forEach((expense) => {
      if (categoryData[expense.category]) {
        categoryData[expense.category] += expense.cost
      } else {
        categoryData[expense.category] = expense.cost
      }
    })

    const data = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384"],
        },
      ],
    }

    if (categoryChart) {
      categoryChart.data = data
      categoryChart.update()
    } else {
      const ctx = document.getElementById("categoryChart").getContext("2d")
      categoryChart = new Chart(ctx, {
        type: "pie",
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Expenses by Category",
            },
          },
        },
      })
    }
  }

  const updateTimelineChart = () => {
    const timelineData = {}
    expenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString()
      if (timelineData[date]) {
        timelineData[date] += expense.cost
      } else {
        timelineData[date] = expense.cost
      }
    })

    const data = {
      labels: Object.keys(timelineData),
      datasets: [
        {
          label: "Daily Expenses",
          data: Object.values(timelineData),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    }

    if (timelineChart) {
      timelineChart.data = data
      timelineChart.update()
    } else {
      const ctx = document.getElementById("timelineChart").getContext("2d")
      timelineChart = new Chart(ctx, {
        type: "line",
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Expenses Over Time",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  }

  // Handle Registration Form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("registerUsername").value
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const activationCode = document.getElementById("activationCodeRegister").value.trim().toUpperCase()

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (!predefinedActivationCodes.includes(activationCode)) {
      alert("Invalid activation code.")
      return
    }

    if (usedActivationCodes.includes(activationCode)) {
      alert("This activation code has already been used.")
      return
    }

    const users = JSON.parse(localStorage.getItem("users")) || []
    if (users.some((u) => u.username === username)) {
      alert("Username already exists")
      return
    }

    users.push({ username, password })
    localStorage.setItem("users", JSON.stringify(users))

    usedActivationCodes.push(activationCode)
    localStorage.setItem("usedActivationCodes", JSON.stringify(usedActivationCodes))

    alert("Registration successful! You can now log in.")
    showLoginForm()
  })

  // Handle Login Form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("loginUsername").value
    const password = document.getElementById("loginPassword").value

    const users = JSON.parse(localStorage.getItem("users")) || []
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      showExpenseTracker()
    } else {
      alert("Invalid username or password")
    }
  })

  // Show registration form
  document.getElementById("showRegister").addEventListener("click", showRegisterForm)
  document.getElementById("showLogin").addEventListener("click", showLoginForm)

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser")
    currentUser = null
    showLoginForm()
  })

  // Handle Add Money Modal submission
  document.getElementById("topUpForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const amount = Number.parseFloat(document.getElementById("amount").value)
    if (amount > 0) {
      balance += amount
      localStorage.setItem("balance", balance)
      alert(`₦${amount} added successfully!`)
      balanceElement.textContent = balance.toFixed(2)
      renderExpenses()
      const topUpModal = bootstrap.Modal.getInstance(document.getElementById("topUpModal"))
      topUpModal.hide()
    }
  })

  // Update the Add Expense Form submission
  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const item = document.getElementById("item").value
    const cost = Number.parseFloat(document.getElementById("cost").value)
    const category = document.getElementById("category").value

    if (item && cost > 0 && category) {
      const newExpense = {
        item,
        cost,
        category,
        date: new Date().toLocaleString(),
      }

      expenses.push(newExpense)
      localStorage.setItem("expenses", JSON.stringify(expenses))

      balance -= cost
      localStorage.setItem("balance", balance)

      alert(`₦${cost} spent on ${item}`)
      balanceElement.textContent = balance.toFixed(2)

      renderExpenses()
      updateCharts()
      document.getElementById("item").value = ""
      document.getElementById("cost").value = ""
      document.getElementById("category").value = ""
    } else {
      alert("Please provide valid item, cost, and category values.")
    }
  })

  // Download Expenses as PDF
  document.getElementById("downloadBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString()

    doc.setFontSize(18)
    doc.text("Expense Report", 14, 20)

    doc.setFontSize(12)
    doc.text(`Date: ${currentDate}`, 14, 30)

    let yPosition = 40
    expenses.forEach((expense) => {
      doc.text(`Item: ${expense.item}`, 14, yPosition)
      doc.text(`Cost: ₦${expense.cost}`, 80, yPosition)
      doc.text(`Category: ${expense.category}`, 130, yPosition)
      doc.text(`Date: ${expense.date}`, 14, yPosition + 7)
      yPosition += 20

      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
    })

    // Add a footer
    doc.text(`Total Balance: ₦${balance.toFixed(2)}`, 14, yPosition + 10)

    // Save the PDF
    doc.save("Expense_Report.pdf")
  })

  // Display the expense tracker after loading the page
  if (currentUser) {
    showExpenseTracker()
  } else {
    showLoginForm()
  }
})

