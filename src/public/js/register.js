const params = new URLSearchParams(window.location.search);
const nonce = params.get("nonce");
const sessionId = params.get("session");

document.getElementById("session").textContent =
  sessionId ? `Session: ${sessionId}` : "";

function validName(name) {
  return /^[a-zA-Z ]{3,}$/.test(name);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const error = document.getElementById("error");

  error.textContent = "";

  if (!validName(name)) {
    error.textContent = "Invalid name";
    return;
  }

  if (!validEmail(email)) {
    error.textContent = "Invalid email";
    return;
  }


  if (!window.PublicKeyCredential) {
    error.textContent = "WebAuthn not supported on this device";
    return;
  }

  try {

    const options = await fetch("/webauthn/register/begin", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json());


    const credential = await navigator.credentials.create({
      publicKey: options
    });


    const finishRes = await fetch("/webauthn/register/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credential)
    });

    if (!finishRes.ok) {
      throw new Error("WebAuthn registration failed");
    }


    const res = await fetch("/identity/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.error || "Registration failed";
      return;
    }


    window.location.href =
      `/checkin?nonce=${encodeURIComponent(nonce)}`;

  } catch (e) {
    console.error(e);
    error.textContent =
      "Security registration failed. Please try again.";
  }
}
