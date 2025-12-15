document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const nonce = params.get("nonce");
  const sessionId = params.get("session");

  const sessionDiv = document.getElementById("session");
  const questionEl = document.getElementById("question");
  const errorEl = document.getElementById("error");
  const answerEl = document.getElementById("answer");
  const submitBtn = document.getElementById("submitBtn");

  if (sessionId) {
    sessionDiv.textContent = `Session: ${sessionId}`;
  }

  // No WebAuthn verification needed anymore.
  // Instead, we will get the deviceId using FingerprintJS

  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  questionEl.textContent = `What is ${a} + ${b}?`;


  submitBtn.addEventListener("click", async () => {
    errorEl.textContent = "";

    if (Number(answerEl.value) !== a + b) {
      errorEl.textContent = "Incorrect answer";
      return;
    }

    try {
      const res = await fetch("/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce }) 
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || "Scan failed";
        return;
      }

      window.location.href = "/success.html";
    } catch (e) {
      console.error(e);
      errorEl.textContent =
        "Verification failed. Please try again.";
    }
  });
});
