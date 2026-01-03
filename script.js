// Helper function: convert rating number to stars
function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Load saved ratings and lists from LocalStorage
let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");
let savedLists = JSON.parse(localStorage.getItem("bookLists") || "{}");

// Mapping list names to colors
const listColors = {
  "None": "#fff8dc",         // default pale cream
  "Want to Read": "#add8e6", // light blue
  "Reading": "#90ee90",      // light green
  "Read": "#dda0dd"          // light purple
};

document.getElementById("searchButton").addEventListener("click", function() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = ""; // clear previous results

      if (!data.items) {
        resultsDiv.innerHTML = "<p>No books found.</p>";
        return;
      }

      data.items.forEach(item => {
        let book = item.volumeInfo;
        let cover = book.imageLinks ? book.imageLinks.thumbnail : "";
        let bookId = item.id; // unique ID for this book
        let rating = savedRatings[bookId] || 0;
        let list = savedLists[bookId] || "None";

        // Create book card
        let bookDiv = document.createElement("div");
        bookDiv.className = "book";
        bookDiv.style.backgroundColor = listColors[list];

        bookDiv.innerHTML = `
          <img src="${cover}" alt="Cover">
          <strong>${book.title}</strong><br>
          by ${book.authors ? book.authors.join(", ") : "Unknown"}<br>
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

        // Clickable stars
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

        // List selector saves and changes color
        let selector = bookDiv.querySelector(".listSelector");
        selector.addEventListener("change", function() {
          savedLists[bookId] = selector.value;
          localStorage.setItem("bookLists", JSON.stringify(savedLists));
          bookDiv.style.backgroundColor = listColors[selector.value];
        });
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error fetching books.</p>";
    });
});

