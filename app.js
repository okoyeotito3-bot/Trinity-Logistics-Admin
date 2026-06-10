import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBvdFAKO1hcC70kTd3BbiuskVJH9XTDtWs",
    authDomain: "trinity-logistics-b076c.firebaseapp.com",
    projectId: "trinity-logistics-b076c",
    storageBucket: "trinity-logistics-b076c.firebasestorage.app",
    messagingSenderId: "700729435351",
    appId: "1:700729435351:web:5cc00ea239cd87259efc92",
    measurementId: "G-20DY9C2Q1N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── DOM ──────────────────────────────────────────────────────────────────────
const authContainer   = document.getElementById('auth-container');
const adminPanel      = document.getElementById('admin-panel');
const loginBtn        = document.getElementById('login-btn');
const logoutBtn       = document.getElementById('logout-btn');
const registerForm    = document.getElementById('register-form');
const authError       = document.getElementById('auth-error');
const successAlert    = document.getElementById('success-alert');
const generatedIdDisplay = document.getElementById('generated-id-display');
const copyIdBtn       = document.getElementById('copy-id-btn');
const searchInput     = document.getElementById('search-input');
const sectionTitle    = document.getElementById('section-title');
const sectionSub      = document.getElementById('section-sub');

// ── MODAL DOM ────────────────────────────────────────────────────────────────
const editModal       = document.getElementById('edit-modal');
const deleteModal     = document.getElementById('delete-modal');
let currentEditId     = null;
let currentDeleteId   = null;
let allShipments      = [];

// ── AUTH STATE ───────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        document.getElementById('user-display').innerText = user.email;
    } else {
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
});

// ── LOGIN ────────────────────────────────────────────────────────────────────
loginBtn.addEventListener('click', async () => {
    const email    = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    authError.classList.add('hidden');
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';
    loginBtn.disabled = true;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch {
        authError.innerText = "Authentication failed. Check your credentials.";
        authError.classList.remove('hidden');
        loginBtn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-arrow-right"></i>';
        loginBtn.disabled = false;
    }
});

// ── LOGOUT ───────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
    signOut(auth);
    successAlert.classList.add('hidden');
    registerForm.reset();
});

// ── NAV SWITCHING (desktop + mobile) ─────────────────────────────────────
const allNavItems = document.querySelectorAll('.nav-item, .mobile-nav-item[data-section]');

function switchSection(section) {
    // Update active state on all nav items
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll(`[data-section="${section}"]`).forEach(n => n.classList.add('active'));

    // Show correct section
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${section}`).classList.remove('hidden');

    if (section === 'register') {
        sectionTitle.textContent = 'Register Shipment';
        sectionSub.textContent   = 'Create a new tracked package';
    } else if (section === 'shipments') {
        sectionTitle.textContent = 'All Shipments';
        sectionSub.textContent   = 'View, update, or delete shipments';
        loadShipments();
    }

    // Scroll to top on mobile
    document.querySelector('.main-area')?.scrollTo(0, 0);
}

allNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(item.dataset.section);
    });
});

// Mobile logout button
document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
    signOut(auth);
    successAlert.classList.add('hidden');
    registerForm.reset();
});

// ── REGISTER PACKAGE ─────────────────────────────────────────────────────────
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    successAlert.classList.add('hidden');

    const btn = document.getElementById('submit-luggage-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
    btn.disabled = true;

    const randomDigits    = Math.floor(100000 + Math.random() * 900000);
    const generatedTrackingID = `TRINITY-${randomDigits}`;

    const payload = {
        description:  document.getElementById('lug-desc').value.trim(),
        weight:       document.getElementById('lug-weight').value.trim(),
        status:       document.getElementById('lug-status').value,
        courierName:  document.getElementById('courier-name').value.trim(),
        courierPhone: document.getElementById('courier-phone').value.trim(),

        // Sender
        senderName:       document.getElementById('sender-name').value.trim(),
        senderPhone:      document.getElementById('sender-phone').value.trim(),
        senderEmail:      document.getElementById('sender-email').value.trim(),
        senderAddress:    document.getElementById('sender-address').value.trim(),
        senderCity:       document.getElementById('sender-city').value.trim(),
        senderCountry:    document.getElementById('sender-country').value.trim(),
        senderOccupation: document.getElementById('sender-occupation').value.trim(),

        // Recipient
        recipientName:         document.getElementById('recipient-name').value.trim(),
        recipientPhone:        document.getElementById('recipient-phone').value.trim(),
        recipientEmail:        document.getElementById('recipient-email').value.trim(),
        recipientAddress:      document.getElementById('recipient-address').value.trim(),
        recipientCity:         document.getElementById('recipient-city').value.trim(),
        recipientCountry:      document.getElementById('recipient-country').value.trim(),
        recipientOccupation:   document.getElementById('recipient-occupation').value.trim(),
        recipientRelationship: document.getElementById('recipient-relationship').value.trim(),

        createdAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "luggage", generatedTrackingID), payload);
        generatedIdDisplay.innerText = generatedTrackingID;
        successAlert.classList.remove('hidden');
        registerForm.reset();
    } catch (error) {
        console.error("Firestore write failed:", error);
        alert("Database write error. Check Firestore security rules.");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Generate Tracking ID & Save';
        btn.disabled  = false;
    }
});

// Copy tracking ID
copyIdBtn?.addEventListener('click', () => {
    const id = generatedIdDisplay.innerText;
    navigator.clipboard.writeText(id).then(() => {
        copyIdBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => { copyIdBtn.innerHTML = '<i class="fa-solid fa-copy"></i>'; }, 2000);
    });
});

// ── LOAD SHIPMENTS ───────────────────────────────────────────────────────────
async function loadShipments() {
    const loading  = document.getElementById('shipments-loading');
    const empty    = document.getElementById('shipments-empty');
    const tableWrap = document.getElementById('shipments-table-wrap');
    const tbody    = document.getElementById('shipments-tbody');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    tableWrap.classList.add('hidden');

    try {
        const q = query(collection(db, "luggage"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        allShipments = [];
        snap.forEach(d => allShipments.push({ id: d.id, ...d.data() }));
        renderTable(allShipments);
    } catch (err) {
        console.error(err);
        loading.innerHTML = '<span style="color:#ef4444">Failed to load shipments.</span>';
    }
}

function renderTable(data) {
    const loading   = document.getElementById('shipments-loading');
    const empty     = document.getElementById('shipments-empty');
    const tableWrap = document.getElementById('shipments-table-wrap');
    const tbody     = document.getElementById('shipments-tbody');

    loading.classList.add('hidden');

    if (!data.length) {
        empty.classList.remove('hidden');
        tableWrap.classList.add('hidden');
        return;
    }

    empty.classList.add('hidden');
    tableWrap.classList.remove('hidden');

    tbody.innerHTML = data.map(s => `
        <tr>
            <td class="mono tracking-cell">${s.id}</td>
            <td>${s.description || '—'}</td>
            <td>${s.courierName || '—'}</td>
            <td><span class="badge badge-${statusClass(s.status)}">${s.status}</span></td>
            <td>${formatDate(s.createdAt)}</td>
            <td class="actions-cell">
                <button class="btn-icon btn-edit" data-id="${s.id}" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon btn-del" data-id="${s.id}" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Attach edit/delete listeners
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    const filtered = allShipments.filter(s =>
        s.id.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.courierName  || '').toLowerCase().includes(q) ||
        (s.recipientName || '').toLowerCase().includes(q)
    );
    renderTable(filtered);
});

// ── EDIT MODAL ───────────────────────────────────────────────────────────────
function openEditModal(id) {
    const s = allShipments.find(x => x.id === id);
    if (!s) return;
    currentEditId = id;
    document.getElementById('modal-tracking-id').textContent = id;
    document.getElementById('modal-desc').value          = s.description || '';
    document.getElementById('modal-weight').value        = s.weight || '';
    document.getElementById('modal-courier-name').value  = s.courierName || '';
    document.getElementById('modal-courier-phone').value = s.courierPhone || '';
    document.getElementById('modal-status').value        = s.status || 'Registered';

    // Sender
    document.getElementById('modal-sender-name').value       = s.senderName || '';
    document.getElementById('modal-sender-phone').value      = s.senderPhone || '';
    document.getElementById('modal-sender-email').value      = s.senderEmail || '';
    document.getElementById('modal-sender-address').value    = s.senderAddress || '';
    document.getElementById('modal-sender-city').value       = s.senderCity || '';
    document.getElementById('modal-sender-country').value    = s.senderCountry || '';
    document.getElementById('modal-sender-occupation').value = s.senderOccupation || '';

    // Recipient
    document.getElementById('modal-recipient-name').value         = s.recipientName || '';
    document.getElementById('modal-recipient-phone').value        = s.recipientPhone || '';
    document.getElementById('modal-recipient-email').value        = s.recipientEmail || '';
    document.getElementById('modal-recipient-address').value      = s.recipientAddress || '';
    document.getElementById('modal-recipient-city').value         = s.recipientCity || '';
    document.getElementById('modal-recipient-country').value      = s.recipientCountry || '';
    document.getElementById('modal-recipient-occupation').value   = s.recipientOccupation || '';
    document.getElementById('modal-recipient-relationship').value = s.recipientRelationship || '';

    editModal.classList.remove('hidden');
}

document.getElementById('modal-close')?.addEventListener('click',  () => editModal.classList.add('hidden'));
document.getElementById('modal-cancel')?.addEventListener('click', () => editModal.classList.add('hidden'));

document.getElementById('modal-save')?.addEventListener('click', async () => {
    if (!currentEditId) return;
    const saveBtn = document.getElementById('modal-save');
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
    saveBtn.disabled = true;

    try {
        await updateDoc(doc(db, "luggage", currentEditId), {
            description:  document.getElementById('modal-desc').value.trim(),
            weight:       document.getElementById('modal-weight').value.trim(),
            courierName:  document.getElementById('modal-courier-name').value.trim(),
            courierPhone: document.getElementById('modal-courier-phone').value.trim(),
            status:       document.getElementById('modal-status').value,

            senderName:       document.getElementById('modal-sender-name').value.trim(),
            senderPhone:      document.getElementById('modal-sender-phone').value.trim(),
            senderEmail:      document.getElementById('modal-sender-email').value.trim(),
            senderAddress:    document.getElementById('modal-sender-address').value.trim(),
            senderCity:       document.getElementById('modal-sender-city').value.trim(),
            senderCountry:    document.getElementById('modal-sender-country').value.trim(),
            senderOccupation: document.getElementById('modal-sender-occupation').value.trim(),

            recipientName:         document.getElementById('modal-recipient-name').value.trim(),
            recipientPhone:        document.getElementById('modal-recipient-phone').value.trim(),
            recipientEmail:        document.getElementById('modal-recipient-email').value.trim(),
            recipientAddress:      document.getElementById('modal-recipient-address').value.trim(),
            recipientCity:         document.getElementById('modal-recipient-city').value.trim(),
            recipientCountry:      document.getElementById('modal-recipient-country').value.trim(),
            recipientOccupation:   document.getElementById('modal-recipient-occupation').value.trim(),
            recipientRelationship: document.getElementById('modal-recipient-relationship').value.trim(),
        });
        editModal.classList.add('hidden');
        loadShipments();
    } catch (err) {
        console.error(err);
        alert("Update failed. Check Firestore rules.");
    } finally {
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        saveBtn.disabled  = false;
    }
});

// ── DELETE MODAL ─────────────────────────────────────────────────────────────
function openDeleteModal(id) {
    currentDeleteId = id;
    document.getElementById('delete-id-label').textContent = id;
    deleteModal.classList.remove('hidden');
}

document.getElementById('delete-modal-close')?.addEventListener('click', () => deleteModal.classList.add('hidden'));
document.getElementById('delete-cancel')?.addEventListener('click',       () => deleteModal.classList.add('hidden'));

document.getElementById('delete-confirm')?.addEventListener('click', async () => {
    if (!currentDeleteId) return;
    const btn = document.getElementById('delete-confirm');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting…';
    btn.disabled  = true;
    try {
        await deleteDoc(doc(db, "luggage", currentDeleteId));
        deleteModal.classList.add('hidden');
        loadShipments();
    } catch (err) {
        console.error(err);
        alert("Delete failed.");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
        btn.disabled  = false;
    }
});

// ── HELPERS ──────────────────────────────────────────────────────────────────
function statusClass(status) {
    if (status === 'Delivered')  return 'green';
    if (status === 'In Transit') return 'blue';
    return 'gray';
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
