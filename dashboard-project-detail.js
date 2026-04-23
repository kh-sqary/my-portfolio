import { db } from "./firebase-config.js";
import { doc, getDoc, deleteDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const mobileTrigger = document.querySelector('.mobile-menu-trigger');
if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
}

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
    });
});

// Logic
const pathParts = window.location.pathname.split('/');
const projectId = pathParts[pathParts.length - 1];
const projectRef = doc(db, "projects", projectId);

async function loadProject() {
    try {
        const snap = await getDoc(projectRef);
        if(!snap.exists()) {
            document.querySelector('.dashboard-content').innerHTML = '<h2>Project not found.</h2>';
            return;
        }
        
        const data = snap.data();
        
        // Header
        document.querySelector('.detail-title').textContent = data.projectName;
        document.querySelector('.meta-tag').textContent = data.category;
        document.querySelector('.detail-meta').innerHTML = `<span class="meta-tag">${data.category}</span><span>Client: ${data.clientName}</span>`;
        document.getElementById('statusDropdown').value = data.status;
        
        // Content
        document.getElementById('projectDescription').innerHTML = data.description || '<p>No description provided.</p>';
        
        // Gallery
        const gallery = document.getElementById('imageGallery');
        if(data.images && data.images.length > 0) {
            gallery.innerHTML = data.images.map(img => `<img src="${img}" class="gallery-item" />`).join('');
            
            // Lightbox logic
            document.querySelectorAll('.gallery-item').forEach(img => {
                img.addEventListener('click', () => {
                    document.getElementById('lightboxImg').src = img.src;
                    document.getElementById('lightbox').classList.add('active');
                });
            });
        }
        
        // Lightbox Close
        document.getElementById('lightboxClose').addEventListener('click', () => document.getElementById('lightbox').classList.remove('active'));
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if(e.target === document.getElementById('lightbox')) document.getElementById('lightbox').classList.remove('active');
        });

        // PDF
        if (data.brandGuidelinesPdf) {
            document.getElementById('pdfWidget').style.display = 'block';
            document.getElementById('pdfLink').href = data.brandGuidelinesPdf;
        }

        // Brief integration - find linked briefs
        const q = query(collection(db, "briefs"), where("linkedProjectId", "==", projectId));
        const briefSnap = await getDocs(q);
        const briefContent = document.getElementById('briefContent');
        if(briefSnap.empty) {
            briefContent.innerHTML = '<p style="color:var(--gray);">No client brief has been linked to this project yet.</p>';
        } else {
            const b = briefSnap.docs[0].data();
            briefContent.innerHTML = `
                <h3>${b.brandName} (${b.businessType})</h3>
                <p><strong>Goal:</strong> ${b.mainGoal}</p>
                <p><strong>Budget:</strong> ${b.budget} | <strong>Deadline:</strong> ${b.deadline}</p>
                <p><strong>Scope:</strong> ${(b.scope || []).join(', ')}</p>
                <p><strong>Tone:</strong> ${b.brandTone}</p>
            `;
        }
        
    } catch (e) {
        console.error(e);
        document.querySelector('.dashboard-content').innerHTML = '<h2>Error loading project.</h2>';
    }
}

loadProject();

// Update Status
document.getElementById('statusDropdown').addEventListener('change', async (e) => {
    try {
        await updateDoc(projectRef, { status: e.target.value });
    } catch(err) {
        alert("Failed to update status");
        console.error(err);
    }
});

// Delete
document.getElementById('deleteBtn').addEventListener('click', async () => {
    if(confirm("Are you sure you want to delete this project? This cannot be undone.")) {
        try {
            await deleteDoc(projectRef);
            window.location.href = '/dashboard';
        } catch(err) {
            alert("Failed to delete project");
            console.error(err);
        }
    }
});

// Edit
document.getElementById('editBtn').addEventListener('click', () => {
    window.location.href = `/dashboard/projects/new?edit=${projectId}`;
});
