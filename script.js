const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const expense = {
        title,
        amount,
        category,
        date
    };

    try {

        const response = await fetch("/api/expenses", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            throw new Error("Failed to add expense");
        }

        expenseForm.reset();

        loadExpenses();

        alert("Expense added successfully!");

    } catch (error) {

        console.error(error);

        alert("Unable to add expense.");
    }
});


async function loadExpenses() {

    try {

        const response = await fetch("/api/expenses");

        const expenses = await response.json();

        displayExpenses(expenses);

        updateDashboard(expenses);

        updateCategorySummary(expenses);

    } catch (error) {

        console.error(error);
    }
}


function displayExpenses(expenses) {

    const table = document.getElementById("expenseTable");
    const emptyMessage = document.getElementById("emptyMessage");

    table.innerHTML = "";

    if (expenses.length === 0) {

        emptyMessage.style.display = "block";

        return;
    }

    emptyMessage.style.display = "none";

    expenses
        .slice()
        .reverse()
        .forEach(expense => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong>${escapeHTML(expense.title)}</strong>
                </td>

                <td>
                    <span class="category">
                        ${escapeHTML(expense.category)}
                    </span>
                </td>

                <td>
                    ${formatDate(expense.date)}
                </td>

                <td class="amount">
                    ₹${Number(expense.amount).toLocaleString("en-IN")}
                </td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            `;

            table.appendChild(row);
        });
}


async function deleteExpense(id) {

    if (!confirm("Delete this expense?")) {
        return;
    }

    try {

        await fetch(`/api/expenses/${id}`, {
            method: "DELETE"
        });

        loadExpenses();

    } catch (error) {

        console.error(error);

        alert("Unable to delete expense.");
    }
}


function updateDashboard(expenses) {

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const count = expenses.length;

    const average = count > 0
        ? total / count
        : 0;

    document.getElementById("totalAmount").textContent =
        `₹${total.toLocaleString("en-IN")}`;

    document.getElementById("totalTransactions").textContent =
        count;

    document.getElementById("averageAmount").textContent =
        `₹${Math.round(average).toLocaleString("en-IN")}`;
}


function updateCategorySummary(expenses) {

    const summary = document.getElementById("categorySummary");

    summary.innerHTML = "";

    if (expenses.length === 0) {

        summary.innerHTML =
            `<p class="empty">No expenses available.</p>`;

        return;
    }

    const categories = {};

    expenses.forEach(expense => {

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] += Number(expense.amount);
    });

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    Object.entries(categories).forEach(
        ([category, amount]) => {

            const percentage = total > 0
                ? (amount / total) * 100
                : 0;

            const item = document.createElement("div");

            item.className = "summary-item";

            item.innerHTML = `
                <div class="summary-top">
                    <span>${escapeHTML(category)}</span>
                    <strong>
                        ₹${amount.toLocaleString("en-IN")}
                    </strong>
                </div>

                <div class="progress">
                    <div
                        class="progress-bar"
                        style="width:${percentage}%">
                    </div>
                </div>
            `;

            summary.appendChild(item);
        }
    );
}


function formatDate(date) {

    const d = new Date(date);

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// Load data when page opens
loadExpenses();