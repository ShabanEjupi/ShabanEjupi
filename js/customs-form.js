document.addEventListener('DOMContentLoaded', function() {
    // Initialize form elements
    initializeForm();
    
    // Add event listeners to toggle conditional fields
    setupConditionalFields();
    
    // Set up form submission handling
    setupFormSubmission();
});

/**
 * Initialize form with defaults and translations
 */
function initializeForm() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('currentDate').value = today;
    
    // Generate a random reference number (for demonstration purposes)
    const referenceElement = document.getElementById('referenceNumber');
    if (referenceElement) {
        const randomRef = 'KS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                         Math.random().toString(36).substring(2, 6).toUpperCase();
        referenceElement.textContent = randomRef;
    }
    
    // Apply translations if user has a language preference
    if (typeof updateContent === 'function' && typeof currentLanguage !== 'undefined') {
        updateContent();
    }
}

/**
 * Setup conditional form fields that toggle based on user responses
 */
function setupConditionalFields() {
    // Currency declaration conditional fields
    const currencyRadios = document.querySelectorAll('input[name="currency"]');
    const currencyDetails = document.getElementById('currencyDetails');
    
    currencyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                currencyDetails.classList.remove('hidden');
                document.getElementById('currencyAmount').setAttribute('required', 'required');
                document.getElementById('currencyOrigin').setAttribute('required', 'required');
            } else {
                currencyDetails.classList.add('hidden');
                document.getElementById('currencyAmount').removeAttribute('required');
                document.getElementById('currencyOrigin').removeAttribute('required');
            }
        });
    });
    
    // Goods declaration conditional fields
    const goodsRadios = document.querySelectorAll('input[name="goods"]');
    const goodsDetails = document.getElementById('goodsDetails');
    
    goodsRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                goodsDetails.classList.remove('hidden');
                document.getElementById('goodsDescription').setAttribute('required', 'required');
                document.getElementById('goodsValue').setAttribute('required', 'required');
            } else {
                goodsDetails.classList.add('hidden');
                document.getElementById('goodsDescription').removeAttribute('required');
                document.getElementById('goodsValue').removeAttribute('required');
            }
        });
    });
}

/**
 * Setup form submission handling with validation
 */
function setupFormSubmission() {
    const form = document.getElementById('customsForm');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        // For local testing (will be handled by Netlify in production)
        if (!window.location.hostname.includes('netlify')) {
            e.preventDefault();
            
            // Basic validation
            if (!validateForm(form)) {
                return;
            }
            
            // Simulate form submission
            simulateFormSubmission(form, successMessage);
        }
    });
    
    // Set up print functionality
    const printButton = document.getElementById('printDeclaration');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
}

/**
 * Validate the form before submission
 */
function validateForm(form) {
    // Check if all required fields are filled
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    // Specific validation for currency and goods
    if (form.querySelector('input[name="currency"]:checked').value === 'yes') {
        const amount = document.getElementById('currencyAmount').value.trim();
        const origin = document.getElementById('currencyOrigin').value.trim();
        
        if (!amount || !origin) {
            isValid = false;
            if (!amount) document.getElementById('currencyAmount').classList.add('error');
            if (!origin) document.getElementById('currencyOrigin').classList.add('error');
        }
    }
    
    if (form.querySelector('input[name="goods"]:checked').value === 'yes') {
        const description = document.getElementById('goodsDescription').value.trim();
        const value = document.getElementById('goodsValue').value.trim();
        
        if (!description || !value) {
            isValid = false;
            if (!description) document.getElementById('goodsDescription').classList.add('error');
            if (!value) document.getElementById('goodsValue').classList.add('error');
        }
    }
    
    // Check if all consent checkboxes are checked
    const consentBoxes = form.querySelectorAll('.checkbox-group.required input[type="checkbox"]');
    consentBoxes.forEach(box => {
        if (!box.checked) {
            box.parentElement.classList.add('error');
            isValid = false;
        } else {
            box.parentElement.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showNotification('error', 'Please complete all required fields and consents');
    }
    
    return isValid;
}

/**
 * Simulate form submission (for local testing)
 */
function simulateFormSubmission(form, successMessage) {
    // Create loading effect
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    // Simulate server processing
    setTimeout(() => {
        // Hide form and show success message
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Restore button state (though it's hidden now)
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('success', 'Declaration submitted successfully!');
        }
        
        // Scroll to top of success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

/**
 * Show notification if the main notification function isn't available
 */
function showNotification(type, message) {
    // Use the global notification function if it exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(type, message);
        return;
    }
    
    // Create a basic notification as fallback
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 5000);
}