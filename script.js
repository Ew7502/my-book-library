// Helper: convert rating to stars
function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Load saved ratings and lists
let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");
let savedLists = JSON.parse(localStorage.getItem("bookLists") || "{}");
let savedBooks = JSON.parse(localStorage.getItem("bookData") || "{}"); // store book info

const listColors = {
  "None": "#fff8dc",
  "Want to Read": "#add8e6",
  "Reading": "#90ee90",
  "Read": "#dda0dd"
};

const resultsDiv = document.getElementById("results");

// === Create a book card ===
function createBookCard(book, bookId) {
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

  resultsDiv.appendChild(bookDiv);

  // Click stars to rate
  bookDiv.querySelector(".stars").addEventListener("click", () => {
    let newRating = parseInt(prompt("Enter your rating (1-5):"));
    if (newRating >= 1 && newRating <= 5) {
      savedRatings[bookId] = newRating;
      localStorage.setItem("bookRatings", JSON.stringify(savedRatings));
      bookDiv.querySelector(".stars").textContent = getStars(newRating);
    }
  });

  // Change list dropdown
  let selector = bookDiv.querySelector(".listSelector");
  selector.addEventListener("change", () => {
    savedLists[bookId] = selector.value;
    localStorage.setItem("bookLists", JSON.stringify(savedLists));
    bookDiv.style.backgroundColor = listColors[selector.value];
  });
}

// === Search books ===
function searchBooks() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  resultsDiv.innerHTML = ""; // CLEAR previous search results

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.items) {
        resultsDiv.innerHTML = "<p>No books found.</p>";
        return;
      }

      data.items.forEach(item => {
        let book = item.volumeInfo;
        let bookId = item.id;

        // Save book info in case you want persistence later
        savedBooks[bookId] = {
          title: book.title,
          authors: book.authors || ["Unknown"],
          cover: book.imageLinks ? book.imageLinks.thumbnail : ""
        };
        localStorage.setItem("bookData", JSON.stringify(savedBooks));

        createBookCard(savedBooks[bookId], bookId);
      });
    })
    .catch(err => {
      console.error(err);
      resultsDiv.innerHTML = "<p>Error fetching books.</p>";
    });
}

// === Event listeners ===
document.getElementById("searchButton").addEventListener("click", searchBooks);

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBooks();
});
