import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const mobileTrigger = document.querySelector('.mobile-menu-trigger');
if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
}

const pathParts = window.location.pathname.split('/');
const briefId = pathParts[pathParts.length - 1];
const briefRef = doc(db, "briefs", briefId);

let currentBrief = null;

async function loadBrief() {
    try {
        const snap = await getDoc(briefRef);
        if(!snap.exists()) {
            document.querySelector('.dashboard-content').innerHTML = '<h2>Brief not found.</h2>';
            return;
        }
        
        currentBrief = snap.data();
        
        // Header
        document.querySelector('.detail-title').textContent = currentBrief.brandName || 'Untitled Brand';
        document.getElementById('briefMeta').innerHTML = `
            <span>${currentBrief.businessType}</span> | 
            <span>Budget: ${currentBrief.budget}</span> | 
            <span>Deadline: ${currentBrief.deadline}</span>
        `;
        document.getElementById('briefStatus').value = currentBrief.status || 'New';
        
        // Answers
        document.getElementById('answersContainer').innerHTML = `
            <div class="answer-block">
                <h4>Business Information</h4>
                <p><strong>Description:</strong> ${currentBrief.description || '-'}</p>
            </div>
            
            <div class="answer-block">
                <h4>Target Audience</h4>
                <p><strong>Age Group:</strong> ${(currentBrief.ageGroup || []).join(', ') || '-'}</p>
                <p><strong>Interests:</strong> ${currentBrief.interests || '-'}</p>
                <p><strong>Buying Behavior:</strong> ${currentBrief.buyingBehavior || '-'}</p>
            </div>

            <div class="answer-block">
                <h4>Brand Strategy</h4>
                <p><strong>Main Goal:</strong> ${currentBrief.mainGoal || '-'}</p>
                <p><strong>Tone:</strong> ${currentBrief.brandTone || '-'}</p>
                <p><strong>3 Words:</strong> ${currentBrief.word1}, ${currentBrief.word2}, ${currentBrief.word3}</p>
            </div>

            <div class="answer-block">
                <h4>Competitors</h4>
                <p><strong>Names:</strong> ${currentBrief.competitors || '-'}</p>
                <p><strong>Likes:</strong> ${currentBrief.competitorsLike || '-'}</p>
                <p><strong>Differs:</strong> ${currentBrief.competitorsDiff || '-'}</p>
            </div>

            <div class="answer-block">
                <h4>Scope & Budget</h4>
                <p><strong>Scope:</strong> ${(currentBrief.scope || []).join(', ') || '-'}</p>
                <p><strong>Budget:</strong> ${currentBrief.budget || '-'}</p>
                <p><strong>Deadline:</strong> ${currentBrief.deadline || '-'}</p>
            </div>
            
            <div class="answer-block">
                <h4>Visual Direction</h4>
                <p><strong>Preferred Colors:</strong> ${currentBrief.preferredColors || '-'}</p>
                <p><strong>Avoid Colors:</strong> ${currentBrief.avoidColors || '-'}</p>
                <p><strong>Reference Links:</strong> ${(currentBrief.referenceLinks || []).join('<br>') || '-'}</p>
            </div>
        `;

        // Pre-select linked project if it exists
        if(currentBrief.linkedProjectId) {
            preloadProjects(currentBrief.linkedProjectId);
        } else {
            preloadProjects();
        }

    } catch (e) {
        console.error(e);
        document.querySelector('.dashboard-content').innerHTML = '<h2>Error loading brief.</h2>';
    }
}

loadBrief();

// Projects dropdown
async function preloadProjects(linkedId = '') {
    const pSelect = document.getElementById('projectSelect');
    const snap = await getDocs(collection(db, "projects"));
    let opts = '<option value="">Select a project...</option>';
    snap.docs.forEach(d => {
        const pd = d.data();
        const sel = d.id === linkedId ? 'selected' : '';
        opts += `<option value="${d.id}" ${sel}>${pd.projectName} (${pd.clientName})</option>`;
    });
    pSelect.innerHTML = opts;
}

// Link Project Logic
document.getElementById('linkProjectBtn').addEventListener('click', async () => {
    const selectedProjectId = document.getElementById('projectSelect').value;
    const btn = document.getElementById('linkProjectBtn');
    
    if(!selectedProjectId) {
        // Unlink
        try {
            await updateDoc(briefRef, { linkedProjectId: null });
            document.getElementById('linkSuccess').textContent = "Unlinked successfully!";
            document.getElementById('linkSuccess').style.display = 'block';
        } catch(e) {}
        return;
    }

    try {
        btn.textContent = 'Linking...';
        await updateDoc(briefRef, { linkedProjectId: selectedProjectId });
        document.getElementById('linkSuccess').textContent = "Linked successfully!";
        document.getElementById('linkSuccess').style.display = 'block';
        btn.textContent = 'Link Project';
    } catch(err) {
        console.error(err);
        btn.textContent = 'Link Project';
    }
});

// Status Logic
document.getElementById('briefStatus').addEventListener('change', async (e) => {
    try {
        await updateDoc(briefRef, { status: e.target.value });
    } catch (err) {
        console.error(err);
        alert('Failed to save status');
    }
});

// Delete Logic
document.getElementById('deleteBriefBtn').addEventListener('click', async () => {
    if(confirm("Delete this brief completely? This action cannot be undone.")) {
        try {
            await deleteDoc(briefRef);
            window.location.href = '/dashboard/briefs';
        } catch (err) {
            console.error(err);
            alert("Failed to delete.");
        }
    }
});
