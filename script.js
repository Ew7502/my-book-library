function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");
let savedLists = JSON.parse(localStorage.getItem("bookLists") || "{}");
let savedBooks = JSON.parse(localStorage.getItem("bookData") || "{}");

const listColors = {
  "None": "#fff8dc",
  "Want to Read": "#add8e6",
  "Reading": "#90ee90",
  "Read": "#dda0dd"
};

const resultsDiv = document.getElementById("results");

// Track current view (list filter)
let currentFilter = null; // null = search results

// Create a book card
function createBookCard(book, bookId) {
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

  // List dropdown change
  let selector = bookDiv.querySelector(".listSelector");
  selector.addEventListener("change", () => {
    savedLists[bo]()
