document.addEventListener('DOMContentLoaded', function() {
    // Initialize form elements
    initializeForm();
    
    // Add event listeners to toggle conditional fields
    setupConditionalFields();
    
    // Set up form submission handling
    setupFormSubmission();
    
    // Initialize document scanning functionality
    initializeDocumentScanning();
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

/**
 * Initialize document scanning functionality
 */
function initializeDocumentScanning() {
    // ID Card scanning
    const idCardScan = document.getElementById('idCardScan');
    if (idCardScan) {
        idCardScan.addEventListener('change', async function(event) {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                // Tregojmë një indikator ngarkimi
                showScanningIndicator('Analyzing ID card...');
                
                try {
                    // Në një implementim të vërtetë, këtu do të thirrnim një API OCR
                    // Por për demonstrim, do të simulojmë një përgjigje pas një vonese
                    await simulateDocumentScan(file, 'idCard');
                    
                    // Fshehim indikatorin
                    hideScanningIndicator();
                    
                    // Tregojmë njoftim suksesi
                    showNotification('success', 'ID card scanned successfully! Personal details filled automatically.');
                    
                } catch (error) {
                    hideScanningIndicator();
                    showNotification('error', 'Could not process ID card: ' + error.message);
                }
            }
        });
    }
    
    // Passport scanning
    const passportScan = document.getElementById('passportScan');
    if (passportScan) {
        passportScan.addEventListener('change', async function(event) {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                showScanningIndicator('Analyzing passport...');
                
                try {
                    await simulateDocumentScan(file, 'passport');
                    hideScanningIndicator();
                    showNotification('success', 'Passport scanned successfully! Personal details filled automatically.');
                } catch (error) {
                    hideScanningIndicator();
                    showNotification('error', 'Could not process passport: ' + error.message);
                }
            }
        });
    }
    
    // Vehicle registration scanning
    const vehicleRegScan = document.getElementById('vehicleRegScan');
    if (vehicleRegScan) {
        vehicleRegScan.addEventListener('change', async function(event) {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                showScanningIndicator('Analyzing vehicle registration...');
                
                try {
                    await simulateDocumentScan(file, 'vehicleReg');
                    hideScanningIndicator();
                    showNotification('success', 'Vehicle registration scanned successfully! Vehicle details filled automatically.');
                } catch (error) {
                    hideScanningIndicator();
                    showNotification('error', 'Could not process vehicle registration: ' + error.message);
                }
            }
        });
    }
    
    // License plate scanning
    const licensePlateScan = document.getElementById('licensePlateScan');
    if (licensePlateScan) {
        licensePlateScan.addEventListener('change', async function(event) {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                showScanningIndicator('Reading license plate...');
                
                try {
                    await simulateDocumentScan(file, 'licensePlate');
                    hideScanningIndicator();
                    showNotification('success', 'License plate recognized successfully!');
                } catch (error) {
                    hideScanningIndicator();
                    showNotification('error', 'Could not recognize license plate: ' + error.message);
                }
            }
        });
    }
}

/**
 * Show scanning indicator overlay
 */
function showScanningIndicator(message) {
    // Krijojmë një element overlay për indikatorin
    const overlay = document.createElement('div');
    overlay.className = 'scanning-overlay';
    overlay.innerHTML = `
        <div class="scanning-indicator">
            <div class="scanning-spinner"></div>
            <p>${message || 'Processing...'}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

/**
 * Hide scanning indicator
 */
function hideScanningIndicator() {
    const overlay = document.querySelector('.scanning-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

/**
 * Simulate document scanning process (in a real implementation, this would call an OCR API)
 */
async function simulateDocumentScan(file, documentType) {
    // Simulon një vonesë për procesimin e dokumentit
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Bazuar në llojin e dokumentit, mbushim fusha të ndryshme të formularit
    switch(documentType) {
        case 'idCard':
            // Demo data - në një implementim të vërtetë këto do vinin nga API
            document.getElementById('fullName').value = 'Arben Krasniqi';
            document.getElementById('nationality').value = 'Kosovo';
            document.getElementById('passportNumber').value = 'ID12345678';
            document.getElementById('dateOfBirth').value = '1985-07-15';
            break;
            
        case 'passport':
            document.getElementById('fullName').value = 'Arben Krasniqi';
            document.getElementById('nationality').value = 'Kosovo';
            document.getElementById('passportNumber').value = 'P987654321';
            document.getElementById('dateOfBirth').value = '1985-07-15';
            break;
            
        case 'vehicleReg':
            document.getElementById('vehicleMake').value = 'Volkswagen';
            document.getElementById('vehicleModel').value = 'Golf 8';
            document.getElementById('licensePlate').value = 'KS-123-AB';
            document.getElementById('countryRegistration').value = 'Kosovo';
            break;
            
        case 'licensePlate':
            document.getElementById('licensePlate').value = 'KS-123-AB';
            document.getElementById('countryRegistration').value = 'Kosovo';
            break;
    }
    
    // Në implementim të vërtetë, këtu do të kishim logjikë për të përpunuar imazhin
    // dhe për të nxjerrë informacionin duke përdorur një API OCR
}