function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Load saved data
let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");
let savedLists = JSON.parse(localStorage.getItem("bookLists") || "{}");
let savedBooks = JSON.parse(localStorage.getItem("bookData") || "{}");
let savedFavourites = JSON.parse(localStorage.getItem("bookFavourites") || "{}");

const listColors = {
  "None": "#fff8dc",
  "Want to Read": "#add8e6",
  "Reading": "#90ee90",
  "Read": "#dda0dd",
  "Favourites": "#ffe0e0"
};

const resultsDiv = document.getElementById("results");
const suggestionsDiv = document.getElementById("suggestions");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

let currentFilter = null; // null = search results

// Create book card
function createBookCard(book, bookId) {
  if (document.getElementById("book-" + bookId)) return;

  let rating = savedRatings[bookId] || 0;
  let list = savedLists[bookId] || "None";
  let isFav = savedFavourites[bookId] || false;

  let bookDiv = document.createElement("div");
  bookDiv.className = "book";
  bookDiv.id = "book-" + bookId;
  bookDiv.style.backgroundColor = listColors[list];

  bookDiv.innerHTML = `
    <div class="heart ${isFav ? 'fav' : ''}">❤️</div>
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

  // Rate
  bookDiv.querySelector(".stars").addEventListener("click", () => {
    let newRating = parseInt(prompt("Enter your rating (1-5):"));
    if (newRating >= 1 && newRating <= 5) {
      savedRatings[bookId] = newRating;
      localStorage.setItem("bookRatings", JSON.stringify(savedRatings));
      bookDiv.querySelector(".stars").textContent = getStars(newRating);
    }
  });

  // Change list
  let selector = bookDiv.querySelector(".listSelector");
  selector.addEventListener("change", () => {
    savedLists[bookId] = selector.value;
    localStorage.setItem("bookLists", JSON.stringify(savedLists));
    bookDiv.style.backgroundColor = listColors[selector.value];
  });

  // Favourite heart
  let heart = bookDiv.querySelector(".heart");
  heart.addEventListener("click", () => {
    savedFavourites[bookId] = !savedFavourites[bookId];
    localStorage.setItem("bookFavourites", JSON.stringify(savedFavourites));
    heart.classList.toggle("fav", savedFavourites[bookId]);
  });
}

// Search books
function searchBooks() {
  let query = searchInput.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "";
  currentFilter = null;

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

        savedBooks[bookId] = {
          title: book.title,
          authors: book.authors || ["Unknown"],
          cover: book.imageLinks ? book.imageLinks.thumbnail : ""
        };
        localStorage.setItem("bookData", JSON.stringify(savedBooks));

        createBookCard(savedBooks[bookId], bookId);
      });

      suggestionsDiv.innerHTML = "";
    })
    .catch(err => {
      console.error(err);
      resultsDiv.innerHTML = "<p>Error fetching books.</p>";
    });
}

// Show list
function showList(listName) {
  resultsDiv.innerHTML = "";
  currentFilter = listName;

  let booksArray = Object.keys(savedBooks).map(id => ({id, ...savedBooks[id]}));

  if (listName === "Favourites") {
    booksArray = booksArray.filter(b => savedFavourites[b.id]);
  } else {
    booksArray = booksArray.filter(b => savedLists[b.id] === listName);
  }

  // Sort by title
  booksArray.sort((a,b) => a.title.localeCompare(b.title));

  booksArray.forEach(b => createBookCard({title:b.title, authors:b.authors, cover:b.cover}, b.id));
}

// Live suggestions
searchInput.addEventListener("input", () => {
  let val = searchInput.value.toLowerCase();
  suggestionsDiv.innerHTML = "";
  if (!val) return;

  let matches = Object.values(savedBooks).filter(b => b.title.toLowerCase().includes(val));
  matches.slice(0,5).forEach(b => {
    let div = document.createElement("div");
    div.textContent = b.title;
    div.addEventListener("click", () => {
      searchInput.value = b.title;
      suggestionsDiv.innerHTML = "";
      searchBooks();
    });
    suggestionsDiv.appendChild(div);
  });
});

// Events
document.getElementById("searchButton").addEventListener("click", searchBooks);
searchInput.addEventListener("keypress", e => { if(e.key==="Enter") searchBooks(); });
document.querySelectorAll(".filterButton").forEach(btn => {
  btn.addEventListener("click", () => showList(btn.getAttribute("data-list")));
});

