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



  if (!window.PublicKeyCredential) {
    errorEl.textContent = "WebAuthn not supported on this device";
    submitBtn.disabled = true;
    return;
  }

  try {
    // Begin authentication
    const options = await fetch("/webauthn/auth/begin", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json());

    // Ask authenticator to sign challenge
    const assertion = await navigator.credentials.get({
      publicKey: options
    });

    // Finish authentication
    const finishRes = await fetch("/webauthn/auth/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assertion)
    });

    if (!finishRes.ok) {
      throw new Error("WebAuthn authentication failed");
    }

  } catch (err) {
    console.error(err);
    errorEl.textContent =
      "Security verification failed. Please try again.";
    submitBtn.disabled = true;
    return;
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
  });
});
