let feedDatabase = {};
document.addEventListener("DOMContentLoaded", () => {
  fetch("data/feeds.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load feed database.");
      return response.json();
    })
    .then((data) => {
      feedDatabase = data;
      console.log("Feed data loaded:", feedDatabase);
    })
    .catch((error) => {
      document.getElementById(
        "results"
      ).innerHTML = `<p style="color:red;">Error loading feed data: ${error.message}</p>`;
    });

  document
    .getElementById("nutritionForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const weight = parseFloat(document.getElementById("weight").value);
      if (isNaN(weight) || weight <= 0)
        return alert("Please enter a valid weight.");

      const feedSelects = document.querySelectorAll(".feed");
      const amountInputs = document.querySelectorAll(".amount");

      let total = {
        energy: 0,
        protein: 0,
        calcium: 0,
        phosphorus: 0,
        vitaminE: 0,
      };
      let hasValidFeed = false;

      for (let i = 0; i < feedSelects.length; i++) {
        const feedType = feedSelects[i].value;
        const feedAmount = parseFloat(amountInputs[i].value);
        if (!feedType || isNaN(feedAmount) || feedAmount <= 0) continue;
        if (!feedDatabase[feedType]) continue;

        hasValidFeed = true;
        const feed = feedDatabase[feedType];

        total.energy += feedAmount * feed.digestibleEnergy;
        total.protein += feedAmount * (feed.crudeProtein / 100) * 1000;
        total.calcium += feedAmount * feed.calcium;
        total.phosphorus += feedAmount * feed.phosphorus;
        total.vitaminE += feedAmount * feed.vitaminE;
      }

      const resultsDiv = document.getElementById("results");
      resultsDiv.style.display = "block";

      if (!hasValidFeed) {
        resultsDiv.innerHTML =
          '<p style="color:red">Please enter at least one valid feed and amount.</p>';
        return;
      }

      const req = {
        energy: weight * 0.03,
        protein: weight * 0.036 * 1000,
        calcium: weight * 0.04,
        phosphorus: weight * 0.028,
        vitaminE: weight * 1,
      };

      const status = (actual, required) => {
        if (actual < required * 0.95)
          return '<span class="lacking">⚠️ Lacking</span>';
        if (actual > required * 1.05)
          return '<span class="overfed">🔥 Overfed</span>';
        return '<span class="sufficient">✅ Sufficient</span>';
      };

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

      let results = `<h2>Diet Evaluation</h2><table><thead><tr><th>Nutrient</th><th>Requirement</th><th>Intake</th><th>% Met</th><th>Status</th></tr></thead><tbody>`;
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
      resultsDiv.innerHTML = results;
    });
});

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
