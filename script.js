const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');

function saveLocally(data) {
    try {
        const key = 'secureFundsApplications';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
        console.warn('Could not save locally:', err);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalText = submitBtn.textContent;

    const firstName = (form.querySelector('#firstName') || {}).value?.trim() || '';
    const lastName = (form.querySelector('#lastName') || {}).value?.trim() || '';
    const phone = (form.querySelector('#phone') || {}).value?.trim() || '';
    const email = (form.querySelector('#email') || {}).value?.trim() || '';
    const totalLost = (form.querySelector('#totalLost') || {}).value?.trim() || '';
    const pastLosses = (form.querySelector('#pastLosses') || {}).value?.trim() || '';
    const lastLossDate = (form.querySelector('#lastLossDate') || {}).value || '';
    const lastLossHow = (form.querySelector('#lastLossHow') || {}).value?.trim() || '';
    const consent = !!(form.querySelector('input[name="consent"]') || {}).checked;

    if (!firstName || !lastName || !phone || !email || !totalLost || !pastLosses || !consent) {
        alert('Please complete all required fields and confirm consent.');
        return;
    }

    const payloadSummary = {
        submittedAt: new Date().toISOString(),
        firstName,
        lastName,
        phone,
        email,
        totalLost,
        pastLosses,
        lastLossDate,
        lastLossHow
    };

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    // ensure access_key present (hidden input is in the form, but append defensively)
    if (!formData.get('access_key')) {
        formData.append('access_key', 'f5cf7cbe-1462-4766-988c-0eb839ed6fa8');
    }

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        let ok = response.ok;
        let message = 'Submission saved locally.';

        try {
            const data = await response.json();
            if (ok) {
                message = data.message || 'Request submitted successfully.';
            } else {
                message = data.message || 'Submission failed to external endpoint.';
            }
        } catch (err) {
            // ignore JSON parse errors
        }

        // Save a local copy regardless of remote result
        saveLocally(payloadSummary);

        if (ok) {
            alert('Success — your recovery request has been submitted.');
            form.reset();
        } else {
            alert('Saved locally. Remote submission failed.');
        }

    } catch (error) {
        // network error: save locally and inform user
        saveLocally(payloadSummary);
        alert('Network error — your request was saved locally and can be retried later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});