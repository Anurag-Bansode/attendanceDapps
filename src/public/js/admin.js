document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('session-form');
    const resultDiv = document.getElementById('result');
    const viewLogBtn = document.getElementById('view-log-btn');
    const logContainer = document.getElementById('log-container');
    const downloadCsvBtn = document.getElementById('download-csv-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';

        const formData = new FormData(form);
        const data = {
            workshop: formData.get('workshop'),
            day: formData.get('day'),
            session: formData.get('session'),
            duration_minutes: formData.get('duration_minutes')
        };

        try {
            const response = await fetch('/admin/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create session.');
            }

            const qrUrl = `${window.location.origin}/qr?workshop=${data.workshop}&day=${data.day}&session=${data.session}`;
            resultDiv.innerHTML = `<h4>Session Created Successfully!</h4>
                                   <p>QR Code Page URL:</p>
                                   <a href="${qrUrl}" target="_blank">${qrUrl}</a>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        } finally {
            resultDiv.style.display = 'block';
        }
    });

    viewLogBtn.addEventListener('click', async () => {
        logContainer.style.display = 'none';
        logContainer.innerHTML = '';

        try {
            const response = await fetch('/admin/attendance');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch attendance log.');
            }

            const data = await response.json();
            const formattedJson = JSON.stringify(data, null, 2);
            logContainer.innerHTML = `<pre><code>${formattedJson}</code></pre>`;

        } catch (error) {
            logContainer.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
        } finally {
            logContainer.style.display = 'block';
        }
    });

    downloadCsvBtn.addEventListener('click', () => {
        window.location.href = '/admin/attendance/csv';
    });
});