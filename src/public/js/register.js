const params = new URLSearchParams(window.location.search);
const nonce = params.get("nonce");
const sessionId = params.get("session");
const expiresAt = params.get("expiresAt");

document.getElementById("session").textContent =
  sessionId ? `Session: ${sessionId}` : "";

const countdownElement = document.getElementById("countdown");

if (expiresAt && countdownElement) {
  const expiryTime = parseInt(expiresAt, 10);

  const timer = setInterval(() => {
    const now = Date.now();
    const timeLeftSeconds = Math.round((expiryTime - now) / 1000);

    if (timeLeftSeconds <= 0) {
      clearInterval(timer);
      countdownElement.textContent = "This registration link has expired.";
      document.getElementById("btn").disabled = true;
      return;
    }

    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;

    countdownElement.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Make the text more prominent when time is low
    if (timeLeftSeconds < 60) {
      countdownElement.style.color = 'red';
    }
  }, 1000);
}


function validName(name) {
  return /^[a-zA-Z ]{3,}$/.test(name);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Masks an email address for logging purposes.
 * e.g., "test.user@example.com" becomes "te******@example.com"
 * @param {string} email The email to mask.
 * @returns {string} The masked email.
 */
function maskEmail(email) {
  const atIndex = email.indexOf('@');
  if (atIndex < 3) return email; // Don't mask short or invalid local parts
  const localPart = email.substring(0, atIndex);
  return localPart.substring(0, 2) + '*'.repeat(localPart.length - 2) + email.substring(atIndex);
}

async function register() {
  console.log("Registration process started.");
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const error = document.getElementById("error");

  error.textContent = "";

  if (!validName(name)) {
    console.warn("Name validation failed.", { name });
    error.textContent = "Invalid name";
    return;
  }

  if (!validEmail(email)) {
    console.warn("Email validation failed.", { email });
    error.textContent = "Invalid email";
    return;
  }

  try {
    const payload = { name, email };
    console.log("Sending registration request to /identity/register", { name, email: maskEmail(email) });
    const res = await fetch("/identity/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload) 
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Registration request failed.", { status: res.status, error: data.error });
      // Display more detailed error in UI for development
      let errorMessage = data.error || "Registration failed";
      if (data.stack) {
        errorMessage += `<br><pre style="text-align: left; white-space: pre-wrap; word-wrap: break-word;">${data.stack}</pre>`;
      }
      error.innerHTML = errorMessage;
      return;
    }

    if (data.status === 'already_registered') {
      const infoDiv = document.querySelector('.info');
      if (infoDiv) {
        infoDiv.textContent = "This device is already registered. Proceeding...";
        infoDiv.style.color = 'green';
      }
      // Wait 2 seconds before redirecting to allow the user to see the message
      setTimeout(() => {
        window.location.href = `/checkin?nonce=${encodeURIComponent(nonce)}`;
      }, 2000);
    } else {
      window.location.href = `/checkin?nonce=${encodeURIComponent(nonce)}`;
    }

  } catch (e) {
    console.error("An unexpected error occurred during registration.", e);
    let errorMessage = "Registration failed. Please try again.";
    if (e instanceof Error && e.stack) {
      errorMessage += `<br><pre style="text-align: left; white-space: pre-wrap; word-wrap: break-word;">${e.stack}</pre>`;
    }
    error.innerHTML = errorMessage;
  }
}
