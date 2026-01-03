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

        resultsDiv.innerHTML += `
          <div style="margin-bottom:20px; border-bottom:1px solid #ccc; padding-bottom:10px;">
            <img src="${cover}" alt="Cover" style="width:100px; display:block; margin-bottom:5px;">
            <strong>${book.title}</strong><br>
            by ${book.authors ? book.authors.join(", ") : "Unknown"}<br>
            Your rating: ☆☆☆☆☆
          </div>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error fetching books.</p>";
    });
});

      document.getElementById("results").innerHTML = "<p>Error fetching books.</p>";
    });
});
