const qrImage = document.getElementById('qr-image');
const sessionIdElement = document.getElementById('sessionId');
const countdownElement = document.getElementById('countdown');
const container = document.querySelector('.container');

let countdownTimer;

async function fetchAndDisplayQR() {
    try {
        container.classList.add('loading');
        // Preserve query params from the original URL
        const response = await fetch(`/qr/api${window.location.search}`);
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const { qr, sessionId, ttl } = await response.json();

        qrImage.src = qr;
        sessionIdElement.textContent = sessionId;
        
        startCountdown(ttl);
    } catch (error) {
        console.error("Failed to fetch QR code:", error);
        sessionIdElement.textContent = "Error loading session";
    } finally {
        container.classList.remove('loading');
    }
}

function startCountdown(seconds) {
    clearInterval(countdownTimer);
    let timeLeft = seconds;
    countdownElement.textContent = timeLeft;
    countdownTimer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = Math.max(0, timeLeft);
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            fetchAndDisplayQR();
        }
    }, 1000);
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayQR);