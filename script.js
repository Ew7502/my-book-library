document.getElementById("searchButton").addEventListener("click", function() {
  let query = document.getElementById("searchInput").value;
  if (!query) return;

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";

      if (!data.items) {
        resultsDiv.innerHTML = "<p>No books found.</p>";
        return;
      }

      data.items.forEach(item => {
        let book = item.volumeInfo;
        let rating = book.averageRating ? book.averageRating : "N/A";
        let cover = book.imageLinks ? book.imageLinks.thumbnail : "";

        resultsDiv.innerHTML += `
          <div style="margin-bottom:20px;">
            <img src="${cover}" alt="Cover" style="width:100px; display:block;">
            <strong>${book.title}</strong> by ${book.authors ? book.authors.join(", ") : "Unknown"}
            <p>Internet rating: ${rating}</p>
          </div>
        `;
      });
    });
});
