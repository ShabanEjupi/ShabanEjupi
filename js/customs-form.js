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
 * Simulate document scanning process with image analysis instead of static data
 */
async function simulateDocumentScan(file, documentType) {
    // Create a loading delay that represents actual processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, we would send the image to an OCR API
    // For this simulation, we'll analyze the image properties to vary the returned data
    
    try {
        // Create an object URL to analyze some properties of the image
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        
        // Create a promise to wait for the image to load
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
        });
        
        // Generate data based on image properties (size, name, timestamp)
        // This creates variation in results based on the uploaded file
        const imageId = file.name.length + file.size % 10000; 
        const timestamp = new Date(file.lastModified);
        const month = timestamp.getMonth() + 1;
        const day = timestamp.getDate();
        
        // Calculate values based on the image and file properties
        const nameOptions = ['Arben', 'Fatmir', 'Vjosa', 'Teuta', 'Bekim', 'Valdrin'];
        const surnameOptions = ['Krasniqi', 'Gashi', 'Berisha', 'Hoxha', 'Maloku', 'Rexhepi'];
        const nameIndex = Math.floor(img.width % nameOptions.length);
        const surnameIndex = Math.floor(img.height % surnameOptions.length);
        
        const firstName = nameOptions[nameIndex] || nameOptions[0];
        const lastName = surnameOptions[surnameIndex] || surnameOptions[0];
        
        // Vehicle makes and models
        const vehicleMakes = ['Volkswagen', 'Audi', 'Mercedes', 'BMW', 'Toyota', 'Peugeot'];
        const vehicleModels = {
            'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo'],
            'Audi': ['A3', 'A4', 'Q5', 'A6'],
            'Mercedes': ['C-Class', 'E-Class', 'GLC', 'A-Class'],
            'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
            'Toyota': ['Corolla', 'Yaris', 'RAV4', 'Auris'],
            'Peugeot': ['308', '3008', '208', '508']
        };
        
        // Generate data based on document type
        switch(documentType) {
            case 'idCard':
                const birthYear = 1970 + (imageId % 40); // Between 1970-2010
                const birthMonth = 1 + (imageId % 12);
                const birthDay = 1 + (imageId % 28);
                
                document.getElementById('fullName').value = `${firstName} ${lastName}`;
                document.getElementById('nationality').value = 'Kosovo';
                document.getElementById('passportNumber').value = `ID${String(imageId).padStart(8, '0')}`;
                document.getElementById('dateOfBirth').value = 
                    `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
                break;
                
            case 'passport':
                const passportBirthYear = 1965 + (imageId % 45); // Between 1965-2010
                const passportBirthMonth = 1 + (imageId % 12);
                const passportBirthDay = 1 + (imageId % 28);
                
                document.getElementById('fullName').value = `${firstName} ${lastName}`;
                document.getElementById('nationality').value = 'Kosovo';
                document.getElementById('passportNumber').value = `P${String(imageId).padStart(7, '0')}`;
                document.getElementById('dateOfBirth').value = 
                    `${passportBirthYear}-${String(passportBirthMonth).padStart(2, '0')}-${String(passportBirthDay).padStart(2, '0')}`;
                break;
                
            case 'vehicleReg':
                const makeIndex = imageId % vehicleMakes.length;
                const make = vehicleMakes[makeIndex];
                const modelList = vehicleModels[make];
                const model = modelList[imageId % modelList.length];
                
                document.getElementById('vehicleMake').value = make;
                document.getElementById('vehicleModel').value = model;
                document.getElementById('licensePlate').value = `KS-${String(imageId % 999).padStart(3, '0')}-${String.fromCharCode(65 + (imageId % 26))}${String.fromCharCode(65 + ((imageId + 5) % 26))}`;
                document.getElementById('countryRegistration').value = 'Kosovo';
                break;
                
            case 'licensePlate':
                document.getElementById('licensePlate').value = `KS-${String(imageId % 999).padStart(3, '0')}-${String.fromCharCode(65 + (imageId % 26))}${String.fromCharCode(65 + ((imageId + 5) % 26))}`;
                document.getElementById('countryRegistration').value = 'Kosovo';
                break;
        }
        
        // Clean up the object URL
        URL.revokeObjectURL(objectUrl);
        
    } catch (error) {
        console.error("Error processing image:", error);
        throw new Error("Could not process the document image. Please try again.");
    }
    
    // In a real implementation, we would:
    // 1. Send the image to an OCR service (Google Cloud Vision, Azure Computer Vision, etc.)
    // 2. Process the OCR response to extract relevant text fields
    // 3. Map the extracted text to the appropriate form fields
    // 4. Handle edge cases, validation, and error scenarios
}