const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Knowledge is power.", category: "Education" }
];

// ✅ showRandomQuote with innerHTML
function showRandomQuote(category = "all") {
  let filteredQuotes = category === "all"
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

// ✅ addQuote
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

// ✅ createAddQuoteForm
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

// ✅ populateCategories
function populateCategories() {
  const dropdown = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const saved = localStorage.getItem('selectedCategory');
  if (saved) {
    dropdown.value = saved;
    filterQuotes(saved);
  }
}

// ✅ filterQuotes
function filterQuotes(category) {
  localStorage.setItem('selectedCategory', category);
  showRandomQuote(category);
}

// ✅ exportQuotes with required elements
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2); // ✅ JSON.stringify
  const blob = new Blob([dataStr], { type: "application/json" }); // ✅ Blob + application/json
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ✅ Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('showQuoteBtn').addEventListener('click', () => {
    const category = document.getElementById('categoryFilter').value;
    showRandomQuote(category);
  });

  document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes); // ✅

  createAddQuoteForm();
  populateCategories();
});
