class AdminPanel {
    constructor() {
        // DOM Elements
        this.form = document.getElementById('session-form');
        this.sessionResultContainer = document.getElementById('session-result-container');
        this.viewLogBtn = document.getElementById('view-log-btn');
        this.logContainer = document.getElementById('log-container');
        this.downloadCsvBtn = document.getElementById('download-csv-btn');
        this.createSessionBtn = this.form.querySelector('button[type="submit"]');
        this.logManagementCard = document.getElementById('log-management-card');
        this.summaryReportResultContainer = document.getElementById('summary-report-result-container');
        this.downloadSummaryBtn = document.getElementById('download-summary-btn');

        // Templates
        this.successTemplate = document.getElementById('session-success-template');
        this.errorTemplate = document.getElementById('error-message-template');

        this._bindEvents();
        this._initialize();
    }

    _bindEvents() {
        this.form.addEventListener('submit', (e) => this._handleSessionSubmit(e));
        this.viewLogBtn.addEventListener('click', () => this._handleViewLog());
        this.downloadCsvBtn.addEventListener('click', () => this._handleDownloadCsv());
        this.downloadSummaryBtn.addEventListener('click', () => this._handleSummaryReportDownload());
    }

    async _initialize() {
        try {
            const data = await this._fetchApi('/admin/attendance');
            // Conditionally show the log management card if there's any attendance data.
            if (data && data.summary && Object.keys(data.summary).length > 0) {
                this._show(this.logManagementCard);
            }
        } catch (error) {
            console.error("Could not check for initial attendance data:", error.message);
        }
    }

    async _handleSessionSubmit(e) {
        e.preventDefault();
        this._setLoading(this.createSessionBtn, true);
        this._hide(this.sessionResultContainer);

        const formData = new FormData(this.form);
        const data = {
            workshop: formData.get('workshop'),
            day: formData.get('day'),
            session: formData.get('session'),
            duration_minutes: formData.get('duration_minutes')
        };

        try {
            await this._fetchApi('/admin/session', {
                method: 'POST', body: JSON.stringify(data)
            });
            const qrUrl = `${window.location.origin}/qr?workshop=${data.workshop}&day=${data.day}&session=${data.session}`;
            
            // Use the template to render the success message
            const templateContent = this.successTemplate.content.cloneNode(true);
            const link = templateContent.querySelector('.qr-url-link');
            link.href = qrUrl;
            link.textContent = qrUrl;
            this._render(this.sessionResultContainer, templateContent);

            // After creating a session, always show the log management card.
            this._show(this.logManagementCard);
        } catch (error) {
            this._renderError(this.sessionResultContainer, error.message);
        } finally {
            this._setLoading(this.createSessionBtn, false);
        }
    }

    async _handleViewLog() {
        this._setLoading(this.viewLogBtn, true);
        this._hide(this.logContainer);

        try {
            const data = await this._fetchApi('/admin/attendance');
            const formattedJson = JSON.stringify(data, null, 2);
            this._render(this.logContainer, `<pre><code>${formattedJson}</code></pre>`);
        } catch (error) {
            this._renderError(this.logContainer, error.message);
        } finally {
            this._setLoading(this.viewLogBtn, false);
        }
    }

    _handleDownloadCsv() {
        this._downloadFile(
            this.downloadCsvBtn,
            '/admin/attendance/csv',
            'attendance-log.csv'
        );
    }

    _handleSummaryReportDownload() {
        this._downloadFile(
            this.downloadSummaryBtn,
            '/admin/attendance/summary-csv',
            'attendance-summary.csv',
            this.summaryReportResultContainer
        );
    }

    async _downloadFile(button, url, filename, errorContainer) {
        this._setLoading(button, true);
        if (errorContainer) this._hide(errorContainer);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Download failed with status ' + response.status }));
                throw new Error(errorData.error);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (error) {
            if (errorContainer) this._renderError(errorContainer, error.message);
            else console.error(`Failed to download ${filename}:`, error.message);
        } finally {
            this._setLoading(button, false);
        }
    }

    async _fetchApi(url, options = {}) {
        const defaultOptions = {
            headers: { 'Content-Type': 'application/json' }
        };
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        return data;
    }

    _render(element, content) {
        element.innerHTML = ''; // Clear previous content
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.appendChild(content);
        }
        this._show(element);
    }

    _renderError(element, message) {
        const templateContent = this.errorTemplate.content.cloneNode(true);
        templateContent.querySelector('.error-text').textContent = message;
        this._render(element, templateContent);
    }

    _show(element) {
        if (!element) return;
        element.classList.remove('hidden');
    }
    _hide(element) {
        if (!element) return;
        element.classList.add('hidden');
    }

    _setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});