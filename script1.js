let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingExpenseId = null;

document.addEventListener('DOMContentLoaded', () => {
    displayExpenses();
    displayChart();
    document.getElementById('expense-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('filter-btn').addEventListener('click', filterExpenses);
    document.getElementById('clear-filter-btn').addEventListener('click', clearFilters);
    document.getElementById('sort-expenses').addEventListener('change', sortExpenses);
});

function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];
    const id = document.getElementById('expense-id').value;

    if (validateForm(name, amount, category)) {
        if (id) {
            // Update existing expense
            updateExpense(id, name, amount, category, date);
        } else {
            // Add new expense
            const expense = {
                id: Date.now(),
                name,
                amount: parseFloat(amount),  // Parsing float to ensure correct numeric type
                category,
                date
            };
            expenses.push(expense);
        }

        localStorage.setItem('expenses', JSON.stringify(expenses));
        displayExpenses();
        displayChart();
        resetForm();
    }
}

function validateForm(name, amount, category) {
    if (name === '' || amount === '' || category === '') {
        alert('Please fill in all required fields.');
        return false;
    }
    return true;
}

function displayExpenses(filteredExpenses = expenses) {
    const expenseList = document.getElementById('expense-list');
    const totalAmount = document.getElementById('total-amount');
    expenseList.innerHTML = '';
    let total = 0;

    filteredExpenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${expense.name} - $${expense.amount.toFixed(2)} [${expense.category}] on ${expense.date}
            <span>
                <button class="edit" onclick="editExpense(${expense.id})">Edit</button>
                <button onclick="deleteExpense(${expense.id})">Delete</button>
            </span>
        `;
        expenseList.appendChild(li);
        total += expense.amount;
    });

    totalAmount.textContent = `$${total.toFixed(2)}`;  // Corrected total amount display
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    document.getElementById('expense-name').value = expense.name;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-date').value = expense.date;
    document.getElementById('expense-id').value = expense.id;

    document.getElementById('submit-btn').textContent = "Edit Expense";
}

function updateExpense(id, name, amount, category, date) {
    expenses = expenses.map(expense => {
        if (expense.id === parseInt(id)) {
            return { id: expense.id, name, amount: parseFloat(amount), category, date };  // Parse float here too
        }
        return expense;
    });
    localStorage.setItem('expenses', JSON.stringify(expenses));  // Save updated data to localStorage
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
    displayChart();
}

function resetForm() {
    document.getElementById('expense-form').reset();
    document.getElementById('expense-id').value = '';
    document.getElementById('submit-btn').textContent = "Add Expense";
}

function filterExpenses() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;

    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (!startDate || expenseDate >= new Date(startDate)) &&
               (!endDate || expenseDate <= new Date(endDate));
    });

    displayExpenses(filteredExpenses);
    displayChart(filteredExpenses);
}

function clearFilters() {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    displayExpenses();
    displayChart();
}

function sortExpenses() {
    const sortOrder = document.getElementById('sort-expenses').value;
    let sortedExpenses = [...expenses];

    if (sortOrder === 'asc') {
        sortedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOrder === 'desc') {
        sortedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    displayExpenses(sortedExpenses);
    displayChart(sortedExpenses);
}

function displayChart(filteredExpenses = expenses) {
    const categories = {};
    filteredExpenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');
    const labels = Object.keys(categories);
    const data = Object.values(categories);

    // Check if the chart exists and destroy it before creating a new one
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses by Category',
                data: data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
