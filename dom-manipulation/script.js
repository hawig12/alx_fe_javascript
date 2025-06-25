// Local quotes array
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Knowledge is power.", category: "Education" }
];

// ✅ Fetch quotes from a real API using async/await
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Simulate converting posts to quote format
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// ✅ Sync local quotes with server data
function syncWithServer() {
  console.log("Syncing with server...");

  fetchQuotesFromServer().then(serverData => {
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
    } else {
      console.log("No new quotes from server.");
    }
  });
}

// ✅ Show a random quote
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

// ✅ Dynamically create the add-quote form
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

// ✅ Filter quotes and show one from selected category
function filterQuotes(category) {
  localStorage.setItem('selectedCategory', category);
  showRandomQuote(category);
}

// ✅ Export quotes to JSON file
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

// ✅ Import quotes from JSON file
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

// ✅ Show notification message
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

  // Sync every 10 seconds
  setInterval(syncWithServer, 10000);
});
