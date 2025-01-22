let currentUser = JSON.parse(localStorage.getItem("currentUser"))
let expenses = []
let balance = 0

const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const calculator = document.getElementById("calculator")
const usernameSpan = document.getElementById("username")
const balanceSpan = document.getElementById("balance")
const expenseTable = document.getElementById("expenseTable")
const filterCategory = document.getElementById("filterCategory")

const showLoginForm = () => {
  loginForm.classList.remove("d-none")
  registerForm.classList.add("d-none")
  calculator.classList.add("d-none")
}

const showRegisterForm = () => {
  loginForm.classList.add("d-none")
  registerForm.classList.remove("d-none")
  calculator.classList.add("d-none")
}

const showCalculator = () => {
  loginForm.classList.add("d-none")
  registerForm.classList.add("d-none")
  calculator.classList.remove("d-none")
  loadUserData()
}

const loadUserData = () => {
  usernameSpan.textContent = currentUser.username
  expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser.username}`)) || []
  balance = Number.parseFloat(localStorage.getItem(`balance_${currentUser.username}`)) || 0
  balanceSpan.textContent = balance.toFixed(2)
  renderExpenses()
}

const saveUserData = () => {
  localStorage.setItem(`expenses_${currentUser.username}`, JSON.stringify(expenses))
  localStorage.setItem(`balance_${currentUser.username}`, balance.toString())
}

const renderExpenses = () => {
  const filteredExpenses = filterCategory.value
    ? expenses.filter((expense) => expense.category === filterCategory.value)
    : expenses

  expenseTable.innerHTML = filteredExpenses
    .map(
      (expense) => `
      <tr>
        <td>${expense.item}</td>
        <td>₦${expense.cost.toFixed(2)}</td>
        <td>${expense.date}</td>
        <td>${expense.category}</td>
      </tr>
    `,
    )
    .join("")
}

const categorizeExpense = (item) => {
  const categories = {
    Food: ["food", "meal", "snack", "drink"],
    Transport: ["bus", "taxi", "train", "transport"],
    Entertainment: ["movie", "concert", "games", "entertainment"],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => item.toLowerCase().includes(keyword))) {
      return category
    }
  }
  return "Others"
}

document.getElementById("loginFormElement").addEventListener("submit", (e) => {
  e.preventDefault()
  const username = document.getElementById("loginUsername").value
  const password = document.getElementById("loginPassword").value
  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.username === username && u.password === password)
  if (user) {
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
    showCalculator()
  } else {
    alert("Invalid username or password")
  }
})

document.getElementById("registerFormElement").addEventListener("submit", (e) => {
  e.preventDefault()
  const username = document.getElementById("registerUsername").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }
  const users = JSON.parse(localStorage.getItem("users")) || []
  if (users.some((u) => u.username === username)) {
    alert("Username already exists")
    return
  }
  users.push({ username, password })
  localStorage.setItem("users", JSON.stringify(users))
  alert("Registration successful! You can now log in.")
  showLoginForm()
})

document.getElementById("showRegister").addEventListener("click", showRegisterForm)
document.getElementById("showLogin").addEventListener("click", showLoginForm)

document.getElementById("forgotPassword").addEventListener("click", () => {
  const username = prompt("Enter your username:")
  if (username) {
    const users = JSON.parse(localStorage.getItem("users")) || []
    const userIndex = users.findIndex((u) => u.username === username)
    if (userIndex !== -1) {
      const newPassword = prompt("Enter your new password:")
      if (newPassword) {
        users[userIndex].password = newPassword
        localStorage.setItem("users", JSON.stringify(users))
        alert("Password updated successfully!")
      }
    } else {
      alert("Username not found!")
    }
  }
})

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser")
  currentUser = null
  showLoginForm()
})

document.getElementById("expenseForm").addEventListener("submit", (e) => {
  e.preventDefault()
  const item = document.getElementById("item").value
  const cost = Number.parseFloat(document.getElementById("cost").value)
  const date = document.getElementById("date").value
  const category = categorizeExpense(item)

  expenses.push({ item, cost, date, category })
  balance -= cost
  saveUserData()
  loadUserData()

  document.getElementById("item").value = ""
  document.getElementById("cost").value = ""
  document.getElementById("date").value = ""
})

const topUpModal = new bootstrap.Modal(document.getElementById("topUpModal"))

document.getElementById("topUpBtn").addEventListener("click", () => {
  topUpModal.show()
})

document.getElementById("confirmTopUp").addEventListener("click", () => {
  const amount = Number.parseFloat(document.getElementById("topUpAmount").value)
  if (!isNaN(amount) && amount > 0) {
    balance += amount
    saveUserData()
    loadUserData()
    topUpModal.hide()
    document.getElementById("topUpAmount").value = ""
  } else {
    alert("Please enter a valid amount")
  }
})

filterCategory.addEventListener("change", renderExpenses)

document.getElementById("downloadCSV").addEventListener("click", () => {
  let csvContent = "Item,Cost (₦),Date,Category\n"
  expenses.forEach((expense) => {
    csvContent += `${expense.item},${expense.cost.toFixed(2)},${expense.date},${expense.category}\n`
  })
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "expenses.pdf")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
})

if (currentUser) {
  showCalculator()
} else {
  showLoginForm()
}

