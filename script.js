const booksDiv = document.getElementById("books");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let allBooks = [];

// Stored data
let savedLists = JSON.parse(localStorage.getItem("bookLists")) || {};
let savedRatings = JSON.parse(localStorage.getItem("bookRatings")) || {};
let savedFavourites = JSON.parse(localStorage.getItem("bookFavourites")) || {};

const listColors = {
  "None": "#ffffff",
  "Want to Read": "#fff3b0",
  "Reading": "#caffbf",
  "Read": "#bdb2ff",
  "Favourites": "#ffd6e8"
};

// Search (button + Enter)
searchBtn.addEventListener("click", searchBooks);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchBooks();
});

function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;

  booksDiv.innerHTML = "";
  allBooks = [];

  fetch(`https://openlibrary.org/search.json?q=${query}`)
    .then(res => res.json())
    .then(data => {
      data.docs.slice(0, 10).forEach(book => {
        createBookCard(book);
      });
    });
}

// Create book card
function createBookCard(book) {
  const bookId = book.key;
  allBooks.push(book);

  const bookDiv = document.createElement("div");
  bookDiv.className = "book-card";

  const title = book.title || "Unknown title";
  const author = book.author_name ? book.author_name[0] : "Unknown author";

  const cover = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : "https://via.placeholder.com/150x220?text=No+Cover";

  const currentList = savedLists[bookId] || "None";
  const currentRating = savedRatings[bookId] || 0;
  const isFav = savedFavourites[bookId] || false;

  bookDiv.style.backgroundColor = listColors[currentList];

  bookDiv.innerHTML = `
    <span class="heart ${isFav ? "fav" : ""}">❤</span>
    <img src="${cover}">
    <h3>${title}</h3>
    <p>${author}</p>

    <div class="stars">
      ${[1,2,3,4,5].map(n =>
        `<span class="star ${currentRating >= n ? "filled" : ""}" data-star="${n}">★</span>`
      ).join("")}
    </div>

    <select class="list-select">
      <option>None</option>
      <option>Want to Read</option>
      <option>Reading</option>
      <option>Read</option>
      <option>Favourites</option>
    </select>
  `;

  booksDiv.appendChild(bookDiv);

  // Dropdown
  const selector = bookDiv.querySelector(".list-select");
  selector.value = currentList;

  selector.addEventListener("change", () => {
    savedLists[bookId] = selector.value;
    localStorage.setItem("bookLists", JSON.stringify(savedLists));

    if (selector.value === "Favourites") {
      savedFavourites[bookId] = true;
    } else {
      savedFavourites[bookId] = false;
    }

    localStorage.setItem("bookFavourites", JSON.stringify(savedFavourites));
    heart.classList.toggle("fav", savedFavourites[bookId]);
    bookDiv.style.backgroundColor = listColors[selector.value];
  });

  // Stars
  bookDiv.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", () => {
      const rating = star.dataset.star;
      savedRatings[bookId] = rating;
      localStorage.setItem("bookRatings", JSON.stringify(savedRatings));
      createBookCardRefresh();
    });
  });

  // Heart
  const heart = bookDiv.querySelector(".heart");
  heart.addEventListener("click", () => {
    savedFavourites[bookId] = !savedFavourites[bookId];
    localStorage.setItem("bookFavourites", JSON.stringify(savedFavourites));

    if (savedFavourites[bookId]) {
      savedLists[bookId] = "Favourites";
      selector.value = "Favourites";
      bookDiv.style.backgroundColor = listColors["Favourites"];
    } else {
      savedLists[bookId] = "None";
      selector.value = "None";
      bookDiv.style.backgroundColor = listColors["None"];
    }

    localStorage.setItem("bookLists", JSON.stringify(savedLists));
    heart.classList.toggle("fav", savedFavourites[bookId]);
  });
}

// Refresh cards (for star updates)
function createBookCardRefresh() {
  booksDiv.innerHTML = "";
  allBooks.forEach(book => createBookCard(book));
}

// List filters
function showList(listName) {
  booksDiv.innerHTML = "";

  allBooks.forEach(book => {
    const id = book.key;
    if (listName === "All" || savedLists[id] === listName) {
      createBookCard(book);
    }
  });
}

