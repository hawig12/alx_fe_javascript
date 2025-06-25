// Initial local quotes
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Knowledge is power.", category: "Education" }
];

// ✅ Mock server simulation (could be replaced by real API)
let mockServerQuotes = [
  { id: 1, text: "Stay hungry, stay foolish.", category: "Motivation" },
  { id: 2, text: "Do or do not. There is no try.", category: "Inspiration" }
];

// ✅ Show a random quote (optionally filtered)
function showRandomQuote(category = "all") {
  const filteredQuotes = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  const display = document.getElementById('quoteDisplay');

  if (filteredQuotes.length === 0) {
    display.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  display.innerHTML = `<p>"${randomQuote.text}" - <em>${randomQuote.category}</em></p>`;
}

// ✅ Add a new quote
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    populateCategories();
    showRandomQuote();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ✅ Create the add-quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');

  const inputQuote = document.createElement('input');
  inputQuote.type = 'text';
  inputQuote.id = 'newQuoteText';
  inputQuote.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.type = 'text';
  inputCategory.id = 'newQuoteCategory';
  inputCategory.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.id = 'addQuoteBtn';
  addBtn.textContent = 'Add Quote';

  formContainer.appendChild(inputQuote);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);

  addBtn.addEventListener('click', addQuote);
}

// ✅ Populate dropdown from unique categories
function populateCategories() {
  const dropdown = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    dropdown.appendChild(option);
  });

  const saved = localStorage.getItem('selectedCategory');
  if (saved) {
    dropdown.value = saved;
    filterQuotes(saved);
  }
}

// ✅ Filter quotes and save selection
function filterQuotes(category) {
  localStorage.setItem('selectedCategory', category);
  showRandomQuote(category);
}

// ✅ Export quotes as a JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ✅ Import quotes from a JSON file
function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            quotes.push(q);
          }
        });
        populateCategories();
        showNotification("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error parsing file.");
    }
  };
  reader.readAsText(file);
}

// ✅ Simulate syncing with a remote server
function syncWithServer() {
  console.log("Syncing with server...");

  const serverData = mockServerQuotes;

  let newItems = 0;

  serverData.forEach(serverQuote => {
    const exists = quotes.some(localQuote =>
      localQuote.text === serverQuote.text &&
      localQuote.category === serverQuote.category
    );

    if (!exists) {
      quotes.push(serverQuote);
      newItems++;
    }
  });

  if (newItems > 0) {
    populateCategories();
    showNotification(`${newItems} new quote(s) synced from server.`);
  }
}

// ✅ Simple notification UI handler
function showNotification(message) {
  const box = document.getElementById("notificationBox");
  box.innerText = message;
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 5000);
}

// ✅ Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('showQuoteBtn').addEventListener('click', () => {
    const category = document.getElementById('categoryFilter').value;
    showRandomQuote(category);
  });

  document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes);
  document.getElementById('importQuotesInput').addEventListener('change', importQuotes);

  createAddQuoteForm();
  populateCategories();

  // Start periodic sync
  setInterval(syncWithServer, 10000); // every 10 seconds
});

