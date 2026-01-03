// Helper function: convert rating number to stars
function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Load saved ratings, lists, and book info from LocalStorage
let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");
let savedLists = JSON.parse(localStorage.getItem("bookLists") || "{}");
let savedBooks = JSON.parse(localStorage.getItem("bookData") || "{}"); // store title, author, cover

// Mapping list names to colors
const listColors = {
  "None": "#fff8dc",         // pale cream
  "Want to Read": "#add8e6", // light blue
  "Reading": "#90ee90",      // light green
  "Read": "#dda0dd"          // light purple
};

// Keep track of the current active filter
let currentFilter = "All";

// === Display all saved books on page load ===
window.addEventListener("load", () => {
  const resultsDiv = document.getElementById("results");
  for (let bookId in savedBooks) {
    createBookCard(savedBooks[bookId], bookId, resultsDiv);
  }
});

// === Search books ===
document.getElementById("searchButton").addEventListener("click", function() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (!data.items) return;

      let resultsDiv = document.getElementById("results");

      data.items.forEach(item => {
        let book = item.volumeInfo;
        let bookId = item.id;

        // Save book info for persistence
        savedBooks[bookId] = {
          title: book.title,
          authors: book.authors || ["Unknown"],
          cover: book.imageLinks ? book.imageLinks.thumbnail : ""
        };
        localStorage.setItem("bookData", JSON.stringify(savedBooks));

        createBookCard(savedBooks[bookId], bookId, resultsDiv);
      });

      // Apply current filter after new books are added
      applyFilter(currentFilter);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error fetching books.</p>";
    });
});

// === Create a book card ===
function createBookCard(book, bookId, container) {
  // Prevent duplicate cards
  if (document.getElementById("book-" + bookId)) return;

  let rating = savedRatings[bookId] || 0;
  let list = savedLists[bookId] || "None";

  let bookDiv = document.createElement("div");
  bookDiv.className = "book";
  bookDiv.id = "book-" + bookId;
  bookDiv.style.backgroundColor = listColors[list];

  bookDiv.innerHTML = `
    <img src="${book.cover}" alt="Cover">
    <strong>${book.title}</strong><br>
    by ${book.authors.join(", ")}<br>
    Your rating: <span class="stars">${getStars(rating)}</span><br><br>
    List: 
    <select class="listSelector">
      <option${list === "None" ? " selected" : ""}>None</option>
      <option${list === "Want to Read" ? " selected" : ""}>Want to Read</option>
      <option${list === "Reading" ? " selected" : ""}>Reading</option>
      <option${list === "Read" ? " selected" : ""}>Read</option>
    </select>
  `;

  container.appendChild(bookDiv);

  // === Clickable stars ===
  let starsSpan = bookDiv.querySelector(".stars");
  starsSpan.addEventListener("click", function() {
    let newRating = prompt("Enter your rating (1-5):");
    newRating = parseInt(newRating);
    if (newRating >= 1 && newRating <= 5) {
      savedRatings[bookId] = newRating;
      localStorage.setItem("bookRatings", JSON.stringify(savedRatings));
      starsSpan.textContent = getStars(newRating);
    } else {
      alert("Please enter a number between 1 and 5");
    }
  });

  // === List selector saves, changes color, and applies filter ===
  let selector = bookDiv.querySelector(".listSelector");
  selector.addEventListener("change", function() {
    savedLists[bookId] = selector.value;
    localStorage.setItem("bookLists", JSON.stringify(savedLists));
    bookDiv.style.backgroundColor = listColors[selector.value];

    // Reapply current filter
    applyFilter(currentFilter);
  });
}

// === Filter buttons ===
document.querySelectorAll(".filterButton").forEach(button => {
  button.addEventListener("click", () => {
    const listName = button.getAttribute("data-list");
    currentFilter = listName;

    // Highlight active filter
    document.querySelectorAll(".filterButton").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    applyFilter(listName);
  });
});

// === Apply filter function ===
function applyFilter(listName) {
  document.querySelectorAll(".book").forEach(book => {
    const selector = book.querySelector(".listSelector");
    const bookList = selector.value;
    if (listName === "All" || bookList === listName) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  });
}

