const serviceButtons = Array.from(document.querySelectorAll("button.service-btn-full"));
const resultOverlay = document.getElementById("resultOverlay");
const resultContent = document.getElementById("resultContent");

// Manual Logic
const manualIcon = document.getElementById("manualIcon");
const manualModal = document.getElementById("manualModal");
const closeManual = document.getElementById("closeManual");
const manualOk = document.getElementById("manualOk");

function openManual() {
    manualModal.classList.add("show");
}

function closeManualModal() {
    manualModal.classList.remove("show");
}

manualIcon.addEventListener("click", openManual);
closeManual.addEventListener("click", closeManualModal);
manualOk.addEventListener("click", closeManualModal);

// Close on outside click
manualModal.addEventListener("click", (e) => {
    if (e.target === manualModal) closeManualModal();
});

async function sendClick(buttonLabel) {
    try {
        const response = await fetch("/api/click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ button: buttonLabel }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Erro ao registar");
        }

        showResult(data);
    } catch (err) {
        console.error(err);
        showResult({ error: err.message });
    }
}

function showResult(data) {
    if (data.error) {
        resultContent.innerHTML = `
            <div style="color: var(--danger); font-size: 18px;">✗ Erro</div>
            <div style="color: var(--muted); margin-top: 10px;">${data.error}</div>
        `;
    } else {
        resultContent.innerHTML = `
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-2); margin-bottom: 16px;">✓ Registado!</div>
            <div class="badge">Clique #${data.click_number}</div>
            <div style="margin-top: 16px; color: var(--text); font-size: 16px;">
                <div>${data.date}</div>
                <div>${data.time}</div>
                <div style="font-weight: 600; margin-top: 8px;">${data.button}</div>
            </div>
        `;
    }
    resultOverlay.classList.add("show");
    resultOverlay.style.display = "flex";
    
    // Auto-close após 3 segundos
    setTimeout(() => {
        resultOverlay.classList.remove("show");
        resultOverlay.style.display = "none";
    }, 3000);
}

serviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-label");
        btn.disabled = true;
        sendClick(label).finally(() => {
            btn.disabled = false;
        });
    });
});

// Fechar overlay ao clicar fora
resultOverlay.addEventListener("click", (e) => {
    if (e.target === resultOverlay) {
        resultOverlay.classList.remove("show");
        resultOverlay.style.display = "none";
    }
});
