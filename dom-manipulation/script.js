// Step 1: Quotes array with text and category properties
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Step 2: displayRandomQuote function (name matters!)
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');

  quoteDisplay.innerText = `"${randomQuote.text}" - ${randomQuote.category}`;
}

// Step 3: addQuote function
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    textInput.value = '';
    categoryInput.value = '';

    // Optional: Show the newly added quote
    displayRandomQuote();
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Step 4: Event listener for the “Show New Quote” button
document.addEventListener('DOMContentLoaded', () => {
  const showQuoteBtn = document.getElementById('showQuoteBtn');
  if (showQuoteBtn) {
    showQuoteBtn.addEventListener('click', displayRandomQuote);
  }

  const addQuoteBtn = document.getElementById('addQuoteBtn');
  if (addQuoteBtn) {
    addQuoteBtn.addEventListener('click', addQuote);
  }
});
