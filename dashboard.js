import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Mobile Menu Toggle
const mobileTrigger = document.querySelector('.mobile-menu-trigger');
const sidebar = document.querySelector('.sidebar');
if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// State
let allProjects = [];
let currentFilter = 'all';
let currentSearch = '';

// Elements
const projectsGrid = document.getElementById('projectsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('projectSearch');

// Fetch Projects from Firestore Realtime
if (projectsGrid) {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProjects();
    }, (error) => {
        console.error("Error fetching projects", error);
        projectsGrid.innerHTML = '<div class="loading-state">Error loading projects. Check Firebase config.</div>';
    });
}

// Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProjects();
    });
});

// Searching
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderProjects();
    });
}

function renderProjects() {
    let filtered = allProjects;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.status === currentFilter);
    }
    if (currentSearch) {
        filtered = filtered.filter(p => 
            p.projectName?.toLowerCase().includes(currentSearch) || 
            p.clientName?.toLowerCase().includes(currentSearch)
        );
    }

    if (filtered.length === 0) {
        projectsGrid.innerHTML = '<div class="loading-state" style="grid-column: 1/-1;">No projects found.</div>';
        return;
    }

    projectsGrid.innerHTML = filtered.map(p => {
        const badgeClass = p.status === 'New' ? 'status-new' : 
                           p.status === 'In Progress' ? 'status-in-progress' : 'status-completed';
        
        // Image logic: show first image uploaded, else placeholder
        const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/600x400?text=No+Image';

        return `
        <a href="/dashboard/projects/${p.id}" class="project-card-ui">
            <img src="${imgUrl}" alt="${p.projectName}" class="card-img" />
            <div class="card-body">
                <span class="card-tag">${p.category}</span>
                <h3 class="card-title">${p.projectName}</h3>
                <div class="card-client">${p.clientName}</div>
                <div class="badge ${badgeClass}">${p.status}</div>
            </div>
        </a>
        `;
    }).join('');
}
