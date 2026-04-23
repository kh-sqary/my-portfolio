import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const mobileTrigger = document.querySelector('.mobile-menu-trigger');
if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
}

let allBriefs = [];
let currentFilter = 'all';

const tableBody = document.getElementById('briefsTableBody');
const filterBtns = document.querySelectorAll('.filter-btn');

// Fetch Realtime
const q = query(collection(db, "briefs"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    allBriefs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBriefs();
}, (err) => {
    console.error(err);
    tableBody.innerHTML = '<tr><td colspan="7">Error loading data.</td></tr>';
});

// Filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderBriefs();
    });
});

function renderBriefs() {
    let filtered = allBriefs;
    if (currentFilter !== 'all') {
        filtered = filtered.filter(b => b.status === currentFilter);
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--gray);">No briefs found.</td></tr>';
        return;
    }

    tableBody.innerHTML = filtered.map(b => {
        let sc = 'brief-new';
        if(b.status === 'Under Review') sc = 'brief-review';
        if(b.status === 'Accepted') sc = 'brief-accepted';
        if(b.status === 'Rejected') sc = 'brief-rejected';

        const date = b.submissionDate ? new Date(b.submissionDate).toLocaleDateString() : 'N/A';

        return `
            <tr>
                <td style="font-weight:600;">${b.brandName || 'Untitled'}</td>
                <td style="color:var(--gray);">${b.businessType || '-'}</td>
                <td>${b.budget || '-'}</td>
                <td>${b.deadline || '-'}</td>
                <td style="color:var(--gray);">${date}</td>
                <td><span class="badge ${sc}">${b.status || 'New'}</span></td>
                <td>
                    <a href="/dashboard/briefs/${b.id}" class="table-action">View Full Brief →</a>
                </td>
            </tr>
        `;
    }).join('');
}
