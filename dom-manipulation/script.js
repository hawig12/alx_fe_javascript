// Local quotes array
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Knowledge is power.", category: "Education" }
];

// To keep track of last sync state for conflict detection
let lastSyncedQuotes = [];

// === Fetch quotes from a real server (GET) ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Convert posts into quote format
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// === POST a quote to the server (simulated) ===
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    const result = await response.json();
    console.log("Posted to server:", result);
    showNotification("Quote sent to server (simulated).");
  } catch (error) {
    console.error("Failed to post quote:", error);
    showNotification("Failed to send quote to server.");
  }
}

// === Sync local quotes with server with conflict detection and resolution ===
async function syncQuotes() {
  console.log("Syncing with server...");
  const serverData = await fetchQuotesFromServer();

  // Detect conflicts: quotes with same text but different category
  const conflicts = [];

  // Create lookup for local quotes by text
  const localQuotesMap = new Map();
  quotes.forEach(q => localQuotesMap.set(q.text, q));

  // Go through server data and compare to local data
  serverData.forEach(serverQuote => {
    const localQuote = localQuotesMap.get(serverQuote.text);

    if (localQuote) {
      // Conflict: text matches but category differs
      if (localQuote.category !== serverQuote.category) {
        conflicts.push({ local: localQuote, server: serverQuote });
      }
    } else {
      // New quote from server, add it
      quotes.push(serverQuote);
    }
  });

  if (conflicts.length > 0) {
    handleConflicts(conflicts);
  } else {
    populateCategories();
    showNotification("Quotes synced with server!");
  }

  // Save last synced state (deep clone)
  lastSyncedQuotes = JSON.parse(JSON.stringify(quotes));
}

// === Handle conflicts by notifying user and offering manual resolution ===
function handleConflicts(conflicts) {
  const conflictBox = document.getElementById("conflictBox");
  conflictBox.innerHTML = `<h3>Conflicts detected! Please resolve:</h3>`;

  conflicts.forEach(({ local, server }, index) => {
    const conflictDiv = document.createElement("div");
    conflictDiv.className = "conflictItem";

    conflictDiv.innerHTML = `
      <p><strong>Quote:</strong> "${local.text}"</p>
      <p>Local Category: <em>${local.category}</em></p>
      <p>Server Category: <em>${server.category}</em></p>
      <button id="keepLocal${index}">Keep Local</button>
      <button id="keepServer${index}">Keep Server</button>
    `;

    conflictBox.appendChild(conflictDiv);

    // Event listeners for conflict resolution buttons
    document.getElementById(`keepLocal${index}`).onclick = () => {
      resolveConflict(local.text, local.category);
      conflictDiv.remove();
      checkConflictResolved(conflictBox);
    };
    document.getElementById(`keepServer${index}`).onclick = () => {
      resolveConflict(local.text, server.category);
      conflictDiv.remove();
      checkConflictResolved(conflictBox);
    };
  });

  conflictBox.style.display = "block";
}

// === Apply user's conflict resolution choice ===
function resolveConflict(quoteText, chosenCategory) {
  // Find the quote in local quotes and update category
  const quote = quotes.find(q => q.text === quoteText);
  if (quote) {
    quote.category = chosenCategory;
  }

  populateCategories();
  showNotification(`Conflict for quote "${quoteText}" resolved.`);
}

// === Check if all conflicts resolved and hide conflict box ===
function checkConflictResolved(conflictBox) {
  if (conflictBox.children.length === 0) {
    conflictBox.style.display = "none";
  }
}

// === Show a random quote (optionally filtered) ===
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

// === Add a new quote and POST to server ===
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (quoteText && quoteCategory) {
    const newQuote = { text: quoteText, category: quoteCategory };

    // Prevent duplicate quotes
    const exists = quotes.some(q => q.text === newQuote.text);
    if (exists) {
      alert("This quote already exists.");
      return;
    }

    quotes.push(newQuote);
    populateCategories();
    showRandomQuote();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    // Simulate POST to server
    postQuoteToServer(newQuote);
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// === Create the Add Quote form dynamically ===
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

// === Populate dropdown with unique categories ===
function populateCategories() {
  const dropdown = document.getElementById('categoryFilter');
  if (!dropdown) return;

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

// === Filter quotes by selected category ===
function filterQuotes(category) {
  localStorage.setItem('selectedCategory', category);
  showRandomQuote(category);
}

// === Export local quotes to JSON file ===
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

// === Import quotes from a JSON file ===
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
            // Avoid duplicates when importing
            if (!quotes.some(existing => existing.text === q.text)) {
              quotes.push(q);
            }
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

// === Show a user notification ===
function showNotification(message) {
  const box = document.getElementById("notificationBox");
  box.innerText = message;
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 5000);
}

// === Initialize app ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('showQuoteBtn').addEventListener('click', () => {
    const category = document.getElementById('categoryFilter').value;
    showRandomQuote(category);
  });

  document.getElementById('categoryFilter').addEventListener('change', e => {
    filterQuotes(e.target.value);
  });

  document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes);
  document.getElementById('importQuotesInput').addEventListener('change', importQuotes);

  createAddQuoteForm();
  populateCategories();
  showRandomQuote();

  // Periodic sync every 10 seconds
  setInterval(syncQuotes, 10000);
});
