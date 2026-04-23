import { db, storage } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Mobile menu init
const mobileTrigger = document.querySelector('.mobile-menu-trigger');
if (mobileTrigger) {
    mobileTrigger.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });
}

// Initialize Quill
const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write a comprehensive case study...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    }
});

// File Inputs
const imagesUpload = document.getElementById('imagesUpload');
const pdfUpload = document.getElementById('pdfUpload');
const imagesList = document.getElementById('imagesList');
const pdfList = document.getElementById('pdfList');

let selectedImages = [];
let selectedPdf = null;

imagesUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
        alert("You can only upload a maximum of 10 images.");
        imagesUpload.value = '';
        selectedImages = [];
        imagesList.textContent = "No images selected";
        return;
    }
    selectedImages = files;
    imagesList.innerHTML = files.map(f => `<div>📄 ${f.name}</div>`).join('');
});

pdfUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedPdf = e.target.files[0];
        pdfList.innerHTML = `<div>📄 ${selectedPdf.name}</div>`;
    } else {
        selectedPdf = null;
        pdfList.textContent = "No PDF selected";
    }
});

// Submit Form
const form = document.getElementById('newProjectForm');
const saveBtn = document.getElementById('saveBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.textContent = 'Saving & Uploading...';
    saveBtn.disabled = true;

    try {
        const projectName = document.getElementById('projectName').value;
        const clientName = document.getElementById('clientName').value;
        const category = document.getElementById('category').value;
        const status = document.getElementById('status').value;
        const description = quill.root.innerHTML;

        let uploadedImages = [];
        let pdfUrl = null;

        // Upload Images
        if (selectedImages.length > 0) {
            saveBtn.textContent = 'Uploading Images...';
            for (let i = 0; i < selectedImages.length; i++) {
                const file = selectedImages[i];
                const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                uploadedImages.push(url);
            }
        }

        // Upload PDF
        if (selectedPdf) {
            saveBtn.textContent = 'Uploading PDF...';
            const storageRef = ref(storage, `projects/pdf/${Date.now()}_${selectedPdf.name}`);
            const snapshot = await uploadBytes(storageRef, selectedPdf);
            pdfUrl = await getDownloadURL(snapshot.ref);
        }

        saveBtn.textContent = 'Saving details...';

        // Save to Firestore
        await addDoc(collection(db, "projects"), {
            projectName,
            clientName,
            category,
            status,
            description,
            images: uploadedImages,
            brandGuidelinesPdf: pdfUrl,
            createdAt: serverTimestamp()
        });

        window.location.href = '/dashboard';

    } catch (error) {
        console.error("Error saving project:", error);
        alert("Failed to save project. Ensure Firebase rules allow write access.");
        saveBtn.textContent = 'Save Project';
        saveBtn.disabled = false;
    }
});
