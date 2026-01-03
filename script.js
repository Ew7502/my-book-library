// Helper function: convert rating number to stars
function getStars(rating) {
  rating = rating || 0;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Load saved ratings from LocalStorage
let savedRatings = JSON.parse(localStorage.getItem("bookRatings") || "{}");

// Event listener for search button
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

        // Create container for each book
        let bookDiv = document.createElement("div");
        bookDiv.style.marginBottom = "20px";
        bookDiv.style.borderBottom = "1px solid #ccc";
        bookDiv.style.paddingBottom = "10px";

        bookDiv.innerHTML = `
          <img src="${cover}" alt="Cover" style="width:100px; display:block; margin-bottom:5px;">
          <strong>${book.title}</strong><br>
          by ${book.authors ? book.authors.join(", ") : "Unknown"}<br>
          Your rating: <span class="stars">${getStars(rating)}</span>
        `;

        resultsDiv.appendChild(bookDiv);

        // Make the stars clickable
        let starsSpan = bookDiv.querySelector(".stars");
        starsSpan.style.cursor = "pointer";
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
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error fetching books.</p>";
    });
});

