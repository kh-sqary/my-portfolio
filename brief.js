// Firebase will be dynamically imported on submit to allow UI testing locally without CORS errors.
const form = document.getElementById('briefForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const currentStepNum = document.getElementById('currentStepNum');

let currentStep = 1;
const totalSteps = 9; // Step 9 is confirmation

function updateUI() {
    // Hide all steps
    document.querySelectorAll('.step-card').forEach(card => card.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Progress Bar (out of 8 real form steps)
    const progressObj = Math.min(currentStep, 8) / 8 * 100;
    progressBar.style.width = `${progressObj}%`;
    currentStepNum.textContent = Math.min(currentStep, 8);

    // Buttons
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    } else if (currentStep === 9) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        generateSummary();
    } else if (currentStep === 10) {
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

    const html = `
        <div class="summary-item"><div class="summary-label">Brand Name</div><div class="summary-value">${data.brandName}</div></div>
        <div class="summary-item"><div class="summary-label">Business Type</div><div class="summary-value">${data.businessType}</div></div>
        <div class="summary-item"><div class="summary-label">Description</div><div class="summary-value">${data.description}</div></div>
        <div class="summary-item"><div class="summary-label">Target Audience (Age)</div><div class="summary-value">${data.ageGroup || 'None selected'}</div></div>
        <div class="summary-item"><div class="summary-label">Brand Goals</div><div class="summary-value">${data.mainGoal}</div></div>
        <div class="summary-item"><div class="summary-label">Budget</div><div class="summary-value">${data.budget}</div></div>
        <div class="summary-item"><div class="summary-label">Deadline</div><div class="summary-value">${data.deadline}</div></div>
        <div class="summary-item"><div class="summary-label">Scope</div><div class="summary-value">${data.scope || 'None selected'}</div></div>
        <div class="summary-item">
            <div class="summary-label">Brand Archetype Profile</div>
            <div class="summary-value" style="font-size:0.9rem;">
                Modern (${data.slider1}%) - Classic<br>
                Youthful (${data.slider2}%) - Mature<br>
                Masculine (${data.slider3}%) - Feminine<br>
                Playful (${data.slider4}%) - Formal<br>
                Economical (${data.slider5}%) - Premium<br>
                Organic (${data.slider6}%) - Geometric<br>
                Symbolic (${data.slider7}%) - Textual
            </div>
        </div>
    `;
    summaryContainer.innerHTML = html;
}

// Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(currentStep !== 9) return;
    
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

        // 3. Show Thank You step
        currentStep = 10;
        updateUI();

    } catch (error) {
        console.error("Error submitting brief:", error);
        alert("Failed to submit brief. Have you added your Firebase config?");
        submitBtn.textContent = 'Submit Brief';
        submitBtn.disabled = false;
    }
});
