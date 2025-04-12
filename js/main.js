// Create an empty object to hold all feed data once it's loaded
let feedDatabase = {};

// Wait until all the page's HTML has loaded before running the main script
// This ensures we can access all elements like the form, buttons, and divs
// This also kicks off our feed data loading process

// The entire script inside this function will only run after the page is ready
// so we don't get 'undefined element' errors when referencing the form

// Load feed data from a JSON file and set up the form behavior
// This fetches nutritional info for each feed so we can use it later in calculations

// The fetch() function gets the file from the local 'data' folder
// If it's successful, we convert the JSON data into a JavaScript object
// If it fails, we show an error message in the results section

// Once the data is loaded, we can handle the user input and perform calculations

// Main script execution starts here

document.addEventListener("DOMContentLoaded", () => {
  // Fetch the feed nutrient data from the JSON file
  fetch("data/feeds.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load feed database.");
      return response.json(); // Convert JSON text into a usable JS object
    })
    .then((data) => {
      feedDatabase = data; // Save the loaded data to our global variable
      console.log("Feed data loaded:", feedDatabase); // Show it in the browser console for testing
    })
    .catch((error) => {
      // If there's an error, show a message on the screen so the user knows
      document.getElementById(
        "results"
      ).innerHTML = `<p style="color:red;">Error loading feed data: ${error.message}</p>`;
    });

  // Get the form element and wait for the user to click the 'Calculate' button
  // Prevent the form from actually submitting and reloading the page

  document
    .getElementById("nutritionForm")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Stop the form from trying to submit to a server

      // Get the weight entered by the user
      const weight = parseFloat(document.getElementById("weight").value);

      // If the weight is missing or not a valid number, alert the user
      if (isNaN(weight) || weight <= 0)
        return alert("Please enter a valid weight.");

      // Get all the selected feeds and the amounts entered for each
      const feedSelects = document.querySelectorAll(".feed");
      const amountInputs = document.querySelectorAll(".amount");

      // Set up an object to store the total nutrients from all feeds
      let total = {
        energy: 0,
        protein: 0,
        calcium: 0,
        phosphorus: 0,
        vitaminE: 0,
      };

      let hasValidFeed = false; // Track whether the user added at least one valid feed

      // Go through each feed entry and calculate its contribution to the total diet
      for (let i = 0; i < feedSelects.length; i++) {
        const feedType = feedSelects[i].value;
        const feedAmount = parseFloat(amountInputs[i].value);

        // If the feed is blank or amount is invalid, skip it
        if (!feedType || isNaN(feedAmount) || feedAmount <= 0) continue;

        // If the feed type isn't in the database, skip it
        if (!feedDatabase[feedType]) continue;

        hasValidFeed = true; // We have at least one good feed

        const feed = feedDatabase[feedType];

        // Add this feed's contribution to each nutrient total
        total.energy += feedAmount * feed.digestibleEnergy;
        total.protein += feedAmount * (feed.crudeProtein / 100) * 1000;
        total.calcium += feedAmount * feed.calcium;
        total.phosphorus += feedAmount * feed.phosphorus;
        total.vitaminE += feedAmount * feed.vitaminE;
      }

      // Get the div where we'll show the results
      const resultsDiv = document.getElementById("results");
      resultsDiv.style.display = "block";

      // If no valid feed was entered, show a message
      if (!hasValidFeed) {
        resultsDiv.innerHTML =
          '<p style="color:red">Please enter at least one valid feed and amount.</p>';
        return;
      }

      // Calculate the required nutrients based on the horse's weight
      const req = {
        energy: weight * 0.03, // Digestible energy in Mcal
        protein: weight * 0.036 * 1000, // Crude protein in grams
        calcium: weight * 0.04, // Calcium in grams
        phosphorus: weight * 0.028, // Phosphorus in grams
        vitaminE: weight * 1, // Vitamin E in IU
      };

      // Function to determine the status of each nutrient
      const status = (actual, required) => {
        if (actual < required * 0.95)
          return '<span class="lacking">⚠️ Lacking</span>';
        if (actual > required * 1.05)
          return '<span class="overfed">🔥 Overfed</span>';
        return '<span class="sufficient">✅ Sufficient</span>';
      };

      // List of nutrient keys we'll display and their proper labels
      const nutrients = [
        "energy",
        "protein",
        "calcium",
        "phosphorus",
        "vitaminE",
      ];
      const labels = {
        energy: "Digestible Energy (Mcal)",
        protein: "Crude Protein (g)",
        calcium: "Calcium (g)",
        phosphorus: "Phosphorus (g)",
        vitaminE: "Vitamin E (IU)",
      };

      // Start building the HTML for the results table
      let results = `<h2>Diet Evaluation</h2><table><thead><tr><th>Nutrient</th><th>Requirement</th><th>Intake</th><th>% Met</th><th>Status</th></tr></thead><tbody>`;

      // For each nutrient, calculate the percentage met and add a row to the table
      nutrients.forEach((nutrient) => {
        const percent = ((total[nutrient] / req[nutrient]) * 100).toFixed(1);
        results += `<tr>
        <td>${labels[nutrient]}</td>
        <td>${req[nutrient].toFixed(2)}</td>
        <td>${total[nutrient].toFixed(2)}</td>
        <td>${percent}%</td>
        <td>${status(total[nutrient], req[nutrient])}</td>
      </tr>`;
      });

      results += "</tbody></table>";
      resultsDiv.innerHTML = results; // Display the table on the page
    });
});

// This function is called when the user clicks 'Add Another Feed'
// It adds another section of form inputs to let the user enter more feeds
function addFeedEntry() {
  const container = document.getElementById("feedsContainer");
  const newEntry = document.createElement("div");
  newEntry.classList.add("feedEntry");
  newEntry.innerHTML = `
      <label>Select Feed:
        <select class="feed" required>
          <option value="">--Select Feed--</option>
          <option value="timothy">Timothy Hay</option>
          <option value="alfalfa">Alfalfa Hay</option>
          <option value="beetPulp">Beet Pulp</option>
        </select>
      </label>
      <label>Amount (lbs/day):
        <input type="number" step="0.1" class="amount" required />
      </label>
    `;
  container.appendChild(newEntry);
}
