const serviceButtons = Array.from(document.querySelectorAll("button.service-btn"));
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", isError);
}

function renderResult(payload) {
    if (!payload) {
        resultEl.innerHTML = '<div class="placeholder">Aguardando clique...</div>';
        return;
    }

    const { button, click_number, date, time } = payload;
    resultEl.innerHTML = `
        <div class="result-metadata">
            <span class="badge">Clique #${click_number}</span>
            <span>${date}</span>
            <span>${time}</span>
            <span class="badge">${button}</span>
        </div>
    `;
}

async function sendClick(buttonLabel) {
    setStatus("A registar clique...");
    toggleButtons(true);
    try {
        const response = await fetch("/api/click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ button: buttonLabel }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Erro ao registar clique");
        }

        renderResult(data);
        setStatus("✓ Clique registado com sucesso!");
    } catch (err) {
        console.error(err);
        setStatus("✗ " + (err.message || "Não foi possível registar o clique."), true);
    } finally {
        toggleButtons(false);
    }
}

function toggleButtons(disabled) {
    serviceButtons.forEach((btn) => {
        btn.disabled = disabled;
    });
}

serviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-label");
        if (label) sendClick(label);
    });
});
