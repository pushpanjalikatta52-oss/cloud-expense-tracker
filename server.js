const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "expenses.json");

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function getExpenses() {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveExpenses(expenses) {
    fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
}

// Get all expenses
app.get("/api/expenses", (req, res) => {
    res.json(getExpenses());
});

// Add expense
app.post("/api/expenses", (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const expenses = getExpenses();

    const newExpense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        date
    };

    expenses.push(newExpense);
    saveExpenses(expenses);

    res.status(201).json(newExpense);
});

// Delete expense
app.delete("/api/expenses/:id", (req, res) => {
    let expenses = getExpenses();

    const id = Number(req.params.id);

    expenses = expenses.filter(expense => expense.id !== id);

    saveExpenses(expenses);

    res.json({
        message: "Expense deleted successfully"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});