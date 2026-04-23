// Firebase will be dynamically imported on submit to allow UI testing locally without CORS errors.
const form = document.getElementById('briefForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const currentStepNum = document.getElementById('currentStepNum');

let currentStep = 1;
const totalSteps = 10; // Step 10 is confirmation

function updateUI() {
    // Hide all steps
    document.querySelectorAll('.step-card').forEach(card => card.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Progress Bar (out of 9 real form steps)
    const progressObj = Math.min(currentStep, 9) / 9 * 100;
    progressBar.style.width = `${progressObj}%`;
    currentStepNum.textContent = Math.min(currentStep, 9);

    // Buttons
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    } else if (currentStep === 10) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        generateSummary();
    } else if (currentStep === 11) {
        document.getElementById('briefActions').style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

function validateStep() {
    const activeStep = document.getElementById(`step-${currentStep}`);
    const inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.reportValidity();
            isValid = false;
        }
    });
    return isValid;
}

nextBtn.addEventListener('click', () => {
    if (validateStep()) {
        currentStep++;
        updateUI();
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    updateUI();
});

// Brand Tone selector
const toneTags = document.querySelectorAll('#toneSelector .tag');
const brandToneInput = document.getElementById('brandToneInput');
toneTags.forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
        const selectedTones = Array.from(document.querySelectorAll('#toneSelector .tag.selected')).map(t => t.textContent);
        brandToneInput.value = selectedTones.join(', ');
    });
});

// Color Pickers
function setupColorPicker(btnId, containerId, inputId, addBtnId) {
    const btn = document.getElementById(addBtnId);
    const picker = document.getElementById(btnId);
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    let colors = [];

    btn.addEventListener('click', () => {
        const color = picker.value;
        if (!colors.includes(color)) {
            colors.push(color);
            renderColors();
        }
    });

    function renderColors() {
        container.innerHTML = '';
        colors.forEach((col, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = col;
            swatch.addEventListener('click', () => {
                colors.splice(index, 1);
                renderColors();
            });
            container.appendChild(swatch);
        });
        input.value = colors.join(', ');
    }
}
setupColorPicker('preferredColorBtn', 'preferredColorsContainer', 'preferredColorsData', 'addPreferredColor');
setupColorPicker('avoidColorBtn', 'avoidColorsContainer', 'avoidColorsData', 'addAvoidColor');

// Repeater for Links
document.getElementById('addLinkBtn').addEventListener('click', () => {
    const container = document.getElementById('referenceLinksContainer');
    const input = document.createElement('input');
    input.type = 'url';
    input.name = 'referenceLinks[]';
    input.placeholder = 'https://...';
    input.className = 'repeater-input';
    container.appendChild(input);
});

// Summary Generation
function generateSummary() {
    const summaryContainer = document.getElementById('summaryContainer');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Arrays for multi-selects like checkboxes
    data.ageGroup = formData.getAll('ageGroup').join(', ');
    data.scope = formData.getAll('scope').join(', ');
    data.referenceLinks = formData.getAll('referenceLinks[]').filter(v=>v).join(', ');

    const visualSlider = (left, val, right) => `
        <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 0.8rem; font-size: 0.85rem; font-weight: 500;">
            <div style="width: 80px; text-align: right; color: #888;">${left}</div>
            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; max-width: 300px;">
                <div style="position: absolute; top: 50%; left: ${val}%; transform: translate(-50%, -50%); width: 18px; height: 18px; border-radius: 50%; background: var(--blue-line); border: 3px solid #111; box-shadow: 0 0 0 1px var(--blue-line);"></div>
            </div>
            <div style="width: 80px; text-align: left; color: #888;">${right}</div>
        </div>
    `;

    const html = `
        <div id="pdfExportArea" style="padding-top: 1rem;">
            <div class="summary-item"><div class="summary-label">Client Details</div><div class="summary-value">${data.clientName} <br> ${data.clientEmail} <br> ${data.clientWhatsapp}</div></div>
            <div class="summary-item"><div class="summary-label">Brand Name</div><div class="summary-value">${data.brandName}</div></div>
            <div class="summary-item"><div class="summary-label">Business Type</div><div class="summary-value">${data.businessType}</div></div>
            <div class="summary-item"><div class="summary-label">Description</div><div class="summary-value">${data.description}</div></div>
            <div class="summary-item"><div class="summary-label">Target Audience (Age)</div><div class="summary-value">${data.ageGroup || 'None selected'}</div></div>
            <div class="summary-item"><div class="summary-label">Brand Goals</div><div class="summary-value">${data.mainGoal}</div></div>
            <div class="summary-item"><div class="summary-label">Budget</div><div class="summary-value">${data.budget}</div></div>
            <div class="summary-item"><div class="summary-label">Deadline</div><div class="summary-value">${data.deadline}</div></div>
            <div class="summary-item"><div class="summary-label">Scope</div><div class="summary-value">${data.scope || 'None selected'}</div></div>
            <div class="summary-item" style="border-bottom: none;">
                <div class="summary-label" style="margin-bottom: 1.5rem;">Brand Archetype Profile</div>
                ${visualSlider('Modern', data.slider1, 'Classic')}
                ${visualSlider('Youthful', data.slider2, 'Mature')}
                ${visualSlider('Masculine', data.slider3, 'Feminine')}
                ${visualSlider('Playful', data.slider4, 'Formal')}
                ${visualSlider('Economical', data.slider5, 'Premium')}
                ${visualSlider('Organic', data.slider6, 'Geometric')}
                ${visualSlider('Symbolic', data.slider7, 'Textual')}
            </div>
        </div>
    `;
    summaryContainer.innerHTML = html;
}

// Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(currentStep !== 10) return;
    
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.ageGroup = formData.getAll('ageGroup');
    payload.scope = formData.getAll('scope');
    payload.referenceLinks = formData.getAll('referenceLinks[]').filter(v=>v);
    
    // Add additional uncaptured data
    payload.brandTone = document.getElementById('brandToneInput').value;
    payload.preferredColors = document.getElementById('preferredColorsData').value;
    payload.avoidColors = document.getElementById('avoidColorsData').value;
    payload.status = 'New'; 
    payload.submissionDate = new Date().toISOString();

    try {
        // 1. Submit to Formspree for email notification
        fetch('https://formspree.io/f/maqawzbd', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: `New Brief: ${payload.brandName}`,
                message: JSON.stringify(payload, null, 2),
                email: 'kh.sqary@gmail.com'
            })
        }).catch(err => console.error("Email notification failed", err));

        // 2. Submit to Firebase Firestore
        try {
            const { db } = await import("./firebase-config.js");
            const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            
            await addDoc(collection(db, "briefs"), {
                ...payload,
                createdAt: serverTimestamp()
            });
        } catch (fbError) {
            console.error("Firebase module failed to load. This is expected if running locally via file://", fbError);
            // Proceed to Thank You step anyway so the client gets an email via Formspree.
        }

        // 3. Generate PDF and Send to WhatsApp
        const pdfElement = document.getElementById('pdfExportArea');
        const pdfOpt = {
            margin:       0.5,
            filename:     `${payload.brandName || 'Project'}-Brief.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#111' },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        try {
            if (window.html2pdf) {
                await html2pdf().set(pdfOpt).from(pdfElement).save();
            } else {
                console.warn("html2pdf library not loaded");
            }
        } catch (e) {
            console.error("PDF generation failed", e);
        }

        const waNumber = "201xxxxxxxxx"; // REPLACE WITH YOUR NUMBER
        let waText = `*مرحباً خالد،*\n\n`;
        waText += `لقد قمت للتو بتعبئة البريف الخاص بمشروعي (*${payload.brandName}*).\n`;
        waText += `سأقوم الآن بإرفاق ملف الـ PDF الذي يحتوي على كافة التفاصيل!\n\n`;
        waText += `*الاسم:* ${payload.clientName}\n`;
        waText += `*الإيميل:* ${payload.clientEmail}\n`;
        
        const encodedText = encodeURIComponent(waText);
        
        // Delay WhatsApp slightly to allow PDF to start downloading
        setTimeout(() => {
            window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
        }, 1500);

        // 4. Show Thank You step
        currentStep = 11;
        updateUI();

    } catch (error) {
        console.error("Error submitting brief:", error);
        alert("Failed to submit brief. Have you added your Firebase config?");
        submitBtn.textContent = 'Submit Brief';
        submitBtn.disabled = false;
    }
});
