document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const nonce = params.get("nonce");
  const sessionId = params.get("session");
  const expiresAt = params.get("expiresAt");

  const sessionDiv = document.getElementById("session");
  const questionEl = document.getElementById("question");
  const errorEl = document.getElementById("error");
  const answerEl = document.getElementById("answer");
  const submitBtn = document.getElementById("submitBtn");
  const countdownElement = document.getElementById("countdown");

  if (sessionId) {
    sessionDiv.textContent = `Session: ${sessionId}`;
  }

  if (expiresAt && countdownElement) {
    const expiryTime = parseInt(expiresAt, 10);

    const timer = setInterval(() => {
      const now = Date.now();
      const timeLeftSeconds = Math.round((expiryTime - now) / 1000);

      if (timeLeftSeconds <= 0) {
        clearInterval(timer);
        countdownElement.textContent = "This verification link has expired.";
        submitBtn.disabled = true;
        answerEl.disabled = true;
        return;
      }

      const minutes = Math.floor(timeLeftSeconds / 60);
      const seconds = timeLeftSeconds % 60;

      countdownElement.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (timeLeftSeconds < 60) {
        countdownElement.style.color = 'red';
      }
    }, 1000);
  }

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
