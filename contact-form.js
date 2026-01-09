// Common Contact Form Submission Handler
// This file handles form submissions for both the homepage contact form and property details contact form

// Apps Script URL for lead submissions
const APPS_SCRIPT_URL_LEADS = "https://script.google.com/macros/s/AKfycbyMdbabyBxJg3Mm-Hbc-zPFio_hgw-Bu_ZV--iLaXO1VVlnTTnMSFzdlRFpicjzIKAe0Q/exec"; // Do not change

/**
 * Generic function to submit contact form data
 * @param {Object} formData - The form data to submit
 * @param {HTMLElement} statusElement - The element to display status messages
 * @param {HTMLButtonElement} submitButton - The submit button to disable/enable
 * @param {HTMLFormElement} formElement - The form element to reset on success
 * @param {Function} onSuccess - Optional callback function to run on success
 */
function submitContactForm(formData, statusElement, submitButton, formElement, onSuccess) {
    // Show loading state
    showFormLoading(statusElement, submitButton, formElement);

    if (APPS_SCRIPT_URL_LEADS) {
        // Real submission to Apps Script
        fetch(APPS_SCRIPT_URL_LEADS, {
            method: 'POST',
            body: JSON.stringify(formData)
        })
        .then(() => {
            showFormSuccess(statusElement, submitButton, formElement, onSuccess);
        })
        .catch(err => {
            console.error('Error:', err);
            showFormError(statusElement, submitButton, "Error sending message. Please try again.", formElement);
        });
    } else {
        // Mock success for demo
        setTimeout(() => {
            showFormSuccess(statusElement, submitButton, formElement, onSuccess);
        }, 1500);
    }
}

/**
 * Show loading state for the form
 */
function showFormLoading(statusElement, submitButton, formElement) {
    statusElement.className = 'form-status-msg loading';
    statusElement.style.display = 'block'; // Override inline display: none
    statusElement.innerHTML = `
        <div class="form-status-content">
            <div class="loader-bars">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>Sending your message...</span>
        </div>
    `;
    
    // Disable submit button
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
        submitButton.style.cursor = 'not-allowed';
    }

    // Disable all inputs in the form
    if (formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.disabled = true;
        });
    }
}

/**
 * Show success state for the form
 */
function showFormSuccess(statusElement, submitButton, formElement, onSuccess) {
    statusElement.className = 'form-status-msg success';
    statusElement.style.display = 'block'; // Override inline display: none
    statusElement.innerHTML = `
        <div class="form-status-content">
            <ion-icon name="checkmark-circle" style="font-size: 24px;"></ion-icon>
            <span>Message sent successfully! We will contact you soon.</span>
        </div>
    `;
    
    // Re-enable all inputs in the form
    if (formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.disabled = false;
        });
        formElement.reset();
    }
    
    // Re-enable submit button
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
    }
    
    // Call optional success callback
    if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
    }
}

/**
 * Show error state for the form
 */
function showFormError(statusElement, submitButton, message, formElement) {
    statusElement.className = 'form-status-msg error';
    statusElement.style.display = 'block'; // Override inline display: none
    statusElement.innerHTML = `
        <div class="form-status-content">
            <ion-icon name="close-circle" style="font-size: 24px;"></ion-icon>
            <span>${message}</span>
        </div>
    `;
    
    // Re-enable submit button
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
    }

    // Re-enable all inputs in the form
    if (formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }
}
