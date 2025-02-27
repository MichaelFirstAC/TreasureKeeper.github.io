// DOM Elements
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById('type');
const category = document.getElementById('category');
const currencySelect = document.getElementById('currency-select');
const datetime = document.getElementById('datetime');

// Currency configuration
const DEFAULT_CURRENCY = '';
const currencySymbols = {
    '':'',
    'USD': '$',
    'AUD': 'A$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'IDR': 'Rp',
};

// Define constant exchange rates
const EXCHANGE_RATES = {
    'USD': {
        'IDR': 15898.30, // 1 USD = 15898.30 IDR
        'AUD': 1.55, // 1 USD = 1.55 AUD
        'EUR': 0.95, // 1 USD = 0.95 EUR
        'GBP': 0.79, // 1 USD = 0.79 GBP
        'JPY': 154.33, // 1 USD = 154.33 JPY
        'USD': 1 // 1 USD = 1 USD
    },
    'AUD': {
        'IDR': 10275.89, // 1 AUD = 10275.89 IDR
        'EUR': 0.61, // 1 AUD = 0.61 EUR
        'GBP': 0.51, // 1 AUD = 0.51 GBP
        'JPY': 99.74, // 1 AUD = 99.74 JPY
        'USD': 0.65, // 1 AUD = 0.65 USD
        'AUD': 1 // 1 AUD = 1 AUD
    },
    'EUR': {
        'IDR': 16819.00, // 1 EUR = 16819.00 IDR
        'GBP': 0.84, // 1 EUR = 0.84 GBP
        'JPY': 162.76, // 1 EUR = 162.76 JPY
        'USD': 1.05, // 1 EUR = 1.05 USD
        'AUD': 1.63, // 1 EUR = 1.63 AUD
        'EUR': 1 // 1 EUR = 1 EUR
    },
    'GBP': {
        'IDR': 20061.83, // 1 EUR = 20061.83 IDR
        'JPY': 194.74,  // 1 GBP = 194.74 JPY
        'USD': 1.26, // 1 EUR = 1.26 USD
        'AUD': 1.95, // 1 EUR = 1.95 AUD
        'EUR': 1.20, // 1 EUR = 1.20 GBP
        'GBP': 1 // 1 GBP = 1 GBP
    },
    'JPY': {
        'IDR': 103.02, // 1 JPY = 103.02 IDR
        'USD': 0.0065, // 1 JPY = 0.0065 USD
        'AUD': 0.010, // 1 JPY = 0.010 AUD
        'EUR': 0.0061, // 1 JPY = 0.0061 EUR
        'GBP': 0.0051, // 1 JPY = 0.0051 GBP
        'JPY': 1   // 1 JPY = 1 JPY
    },
    'IDR': {
        'IDR': 1,   // 1 IDR = 1 IDR
        'USD': 0.000063, // 1 IDR = 0.000063 USD
        'AUD': 0.000097, // 1 IDR = 0.000097 AUD
        'EUR': 0.000059, // 1 IDR = 0.000059 EUR
        'GBP': 0.000050, // 1 IDR = 0.000050 GBP
        'JPY': 0.0097 // 1 IDR = 0.0097 JPY
    }
};


// Set default datetime value to current time when the page loads
document.addEventListener('DOMContentLoaded', () => {
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
init();
});

// Get transactions from localStorage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];
let currentCurrency = localStorage.getItem('currentCurrency') || DEFAULT_CURRENCY;

// If you want to check if currentCurrency is empty and set it to a default
if (!currentCurrency) {
    currencySelect.value = ''; // This will show "Select a currency"
} else {
    currencySelect.value = currentCurrency; // This will set it to the stored currency
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Format number with commas
function formatNumber(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        document.getElementById('edit-id').value = transaction.id;
        document.getElementById('text').value = transaction.text;
        document.getElementById('category').value = transaction.category;
        document.getElementById('amount').value = Math.abs(transaction.amount);
        document.getElementById('type').value = transaction.amount < 0 ? 'expense' : 'income';
        document.getElementById('datetime').value = transaction.datetime.split('T')[0] + 'T' + transaction.datetime.split('T')[1];
    }
}

// Constants for red and green box classes NEW ADDITION TO THE INDEX JS
const RED_BOX_CLASS = 'redbox';
const GREEN_BOX_CLASS = 'greenbox';

// Function to add or update a transaction
function addTransaction(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-id').value;

    // Check if required fields are filled (amount and category only)
    if (amount.value.trim() === '' || category.value.trim() === '') {
        alert('Please add a category and amount');
        return;
    }

    const transactionDate = datetime.value ? new Date(datetime.value) : new Date();
    
    const transaction = {
        id: editId ? parseInt(editId) : generateID(),
        text: text.value,
        category: category.value,
        amount: type.value === 'income' ? +amount.value : -amount.value,
        currency: currentCurrency, // Keep the current currency
        originalCurrency: currentCurrency, // Store original currency
        datetime: transactionDate.toISOString()
    };

    if (editId) {
        transactions = transactions.map(t => (t.id === transaction.id ? transaction : t));
    } else {
        transactions.push(transaction);
    }

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    // Reset form
    text.value = '';
    amount.value = '';
    category.value = '';
    type.value = 'income';
    datetime.value = '';
    document.getElementById('edit-id').value = ''; // Reset edit ID

    assignBoxClassesForDates(); // Update box classes for dates
    
    init(); // This will sort and display the transactions
}

// Format date function
function formatDateTime(dateString) {
const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
};
return new Date(dateString).toLocaleString(undefined, options);
}

// Function to add transaction to DOM
function addTransactionDOM(transaction) {
    const item = document.createElement("li");

    item.classList.add(transaction.amount < 0 ? "minus" : "plus");

    item.innerHTML = `
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})"></button>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})"></button>
        <div class="transaction-details">
            <span class="transaction-text">${transaction.text}</span>
            <span class="category-tag">${transaction.category}</span>
            <span class="transaction-amount">${currencySymbols[transaction.originalCurrency]}${formatNumber(Math.abs(transaction.amount))}</span>
            <span class="transaction-date">${formatDateTime(transaction.datetime)}</span>
        </div>
    `;

    list.appendChild(item);
}

// Update balance, income and expense
function updateValues() {
    const amounts = transactions.map(transaction => {
        // Convert only for balance, income, and expense calculations
        return convertCurrency(transaction.amount, transaction.originalCurrency, currentCurrency);
    });

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts.filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balance.innerHTML = `${currencySymbols[currentCurrency]}${formatNumber(parseFloat(total))}`;
    money_plus.innerHTML = `+${currencySymbols[currentCurrency]}${formatNumber(parseFloat(income))}`;
    money_minus.innerHTML = `-${currencySymbols[currentCurrency]}${formatNumber(parseFloat(expense))}`;
}

// Function to convert currency based on exchange rates
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount; // No conversion needed
    }
    const rate = EXCHANGE_RATES[fromCurrency][toCurrency];
    return amount * rate; // Convert using exchange rate
}

// Remove transaction
function removeTransaction(id) {
    // Ask for confirmation before deleting
    const isConfirmed = confirm("Are you sure you want to delete this transaction?");
    
    if (isConfirmed) {
        // Filter out the transaction with the given ID
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage(); // Update local storage after removal
        init(); // Re-initialize the transaction list to reflect changes
    }
}

// Update localStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('currentCurrency', currentCurrency);
}

// Currency conversion functions
async function getExchangeRate(fromCurrency, toCurrency) {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();
        return data.rates[toCurrency];
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

// Currency conversion functions
async function updateCurrencyDisplay(selectedCurrency) {
    const loadingIndicator = document.querySelector('.currency-loading');
    if (loadingIndicator) loadingIndicator.classList.add('active');

    // Update the current currency
    currentCurrency = selectedCurrency;

    // Update balance and income/expense display
    updateValues(); // This will recalculate and display the updated values based on the new currency

    // Refresh the transaction list to reflect the unchanged history
    updateTransactionsList();

    if (loadingIndicator) loadingIndicator.classList.remove('active');
}

// Refresh button
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
});

// Initialize app
function init() {
    // Sort transactions by datetime in descending order (most recent first)
    transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// Event listeners
form.addEventListener('submit', addTransaction);
currencySelect.addEventListener('change', (e) => updateCurrencyDisplay(e.target.value));

// Function to assign box classes for each unique date and store in local storage
async function assignBoxClassesForDates() {
    const dateAmounts = {};
    const dateClasses = {};

    // Calculate total amount for each date
    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.datetime).toDateString();
        if (!dateAmounts[transactionDate]) {
            dateAmounts[transactionDate] = 0;
        }
        dateAmounts[transactionDate] += transaction.amount;
    });

    // Determine box class for each date based on total amount
    Object.keys(dateAmounts).forEach(date => {
        const totalAmount = dateAmounts[date];
        const boxClass = totalAmount >= 0 ? GREEN_BOX_CLASS : RED_BOX_CLASS;
        dateClasses[date] = boxClass;
    });

    // Store date classes in local storage
    localStorage.setItem('dateClasses', JSON.stringify(dateClasses));
}

// Example usage of assignBoxClassesForDates
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    datetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    init();
    assignBoxClassesForDates();
});
// Initialize the app
document.addEventListener('DOMContentLoaded', init);