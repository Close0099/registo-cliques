const exportBtn = document.getElementById("exportBtn");
const tableBody = document.getElementById("tableBody");

// Load and display data
async function loadData() {
    try {
        const response = await fetch("/api/all");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar dados");
        }

        // Update stats
        document.getElementById("totalClicks").textContent = data.total;
        document.getElementById("todayClicks").textContent = data.today;
        document.getElementById("uniqueServices").textContent = data.unique;

        // Populate table
        if (data.clicks.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--muted);">Sem registos.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.clicks.map(row => `
            <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
            </tr>
        `).join("");
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--danger);">Erro ao carregar dados.</td></tr>';
    }
}

// Export data
if (exportBtn) {
    exportBtn.addEventListener("click", () => {
        window.location.href = "/api/export";
    });
}

// Load data on page load
loadData();

// Refresh data every 5 seconds
setInterval(loadData, 5000);
