// הגדרות Firebase פה אתה מגדיר ידנית את האתר
const firebaseConfig = {
  apiKey: "AIzaSyDWEEu96d981XApU6iQYb2p0qZL8yifP5o",
  authDomain: "eliran-6cb4f.firebaseapp.com",         
  projectId: "eliran-6cb4f",
  storageBucket: "eliran-6cb4f.appspot.com",           
  messagingSenderId: "1033772822280",
  appId: "1:1033772822280:web:1020118cb8ea1c185046bd",
  databaseURL: "https://eliran-6cb4f-default-rtdb.firebaseio.com"  
};

// 
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// פונקציית עזר שתמיד תביא את ה-DB בלי שגיאות אתחול
function db() {
    return firebase.database();
}

// 3. כניסה
function checkPass() {
    if (document.getElementById('pass').value === "1234") {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
        loadAdminAds();
    } else {
        alert("סיסמה שגויה");
    }
}

// 4. שמירה
async function saveAd() {
    console.log("Starting save process...");
    const title = document.getElementById('title').value;
    const summary = document.getElementById('summary').value;
    const guide = document.getElementById('guide').value;
    const phone = document.getElementById('phone').value;
    const isUrgent = document.getElementById('isUrgent').checked;

    if (!title || !summary) return alert("חובה למלא כותרת ותקציר");

    const toBase64 = file => new Promise(resolve => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
    });

    try {
        const adId = Date.now();
        const imgInput = document.getElementById('imageInput').files[0];
        const fileInput = document.getElementById('fileInput').files[0];

        const adData = {
            id: adId,
            title, summary, guide, phone, isUrgent,
            image: await toBase64(imgInput),
            file: await toBase64(fileInput),
            fileName: fileInput ? fileInput.name : null,
            date: new Date().toLocaleDateString('he-IL')
        };

        await db().ref('ads/' + adId).set(adData);
        alert("המודעה עלתה בהצלחה!");
        window.location.href = 'index.html';
    } catch (err) {
        alert("שגיאה סופית: " + err.message);
    }
}

// 5. הצגת מודעות
function displayAds() {
    db().ref('ads').on('value', (snapshot) => {
        const data = snapshot.val();
        const adsList = data ? Object.values(data).reverse() : [];
        renderAds(adsList);
    });
}

function renderAds(adsList) {
    const board = document.getElementById('board');
    if (!board) return;
    board.innerHTML = adsList.map(ad => `
        <div class="ad-card ${ad.isUrgent ? 'urgent-card' : ''}" onclick="location.href='post.html?id=${ad.id}'">
            ${ad.isUrgent ? '<div class="badge-urgent">דחוף</div>' : ''}
            ${ad.image ? `<img src="${ad.image}" loading="lazy">` : ''}
            <div class="ad-content">
                <small>${ad.date}</small>
                <h3>${ad.title}</h3>
                <p>${ad.summary}</p>
                <div class="ad-footer">
                   ${ad.file ? '📎 קובץ מצורף' : ''}
                </div>
            </div>
        </div>
    `).join('');
    setTimeout(() => document.querySelectorAll('.ad-card').forEach(c => c.classList.add('visible')), 100);
}

//
function searchAds() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    db().ref('ads').once('value').then((snapshot) => {
        const ads = Object.values(snapshot.val() || {});
        const filtered = ads.filter(ad =>
            ad.title.toLowerCase().includes(term) ||
            ad.summary.toLowerCase().includes(term)
        );
        renderAds(filtered.reverse());
    });
}

// 
function filterAds(type) {
    db().ref('ads').once('value').then((snapshot) => {
        const ads = Object.values(snapshot.val() || {});
        const filtered = type === 'files' ? ads.filter(ad => ad.file) : ads;
        renderAds(filtered.reverse());
    });
}

// 8. הוספתי לך פונקציה כי היא הישנה לא עבדה לך והיו חסרים פרטים דוד
function loadAdminAds() {
    const list = document.getElementById('admin-ads-list');
    if (!list) return;
    db().ref('ads').on('value', (snapshot) => {
        const ads = Object.values(snapshot.val() || {});
        list.innerHTML = ads.reverse().map(ad => `
            <div class="admin-list-item">
                <span>${ad.title}</span>
                <button onclick="deleteAd(${ad.id})" style="background:red;color:white;border:none;padding:5px;">מחק</button>
            </div>
        `).join('');
    });
}

function deleteAd(id) {
    if (confirm("למחוק?")) {
        db().ref('ads/' + id).remove();
    }
}

// 9. דף מפורט
function loadFullPost() {
    const id = new URLSearchParams(window.location.search).get('id');
    db().ref('ads/' + id).once('value').then((snapshot) => {
        const ad = snapshot.val();
        if (!ad) return;

        document.getElementById('post-content').innerHTML = `
            <div class="post-card">
                <h1>${ad.title}</h1>
                ${ad.image ? `<img src="${ad.image}" class="clickable-image" onclick="openImage('${ad.image}')" style="width:100%; border-radius:15px; margin-bottom:20px;">` : ''}
                <div class="post-section"><h3>מדריך</h3><p style="white-space:pre-wrap">${ad.guide}</p></div>
                ${ad.file ? `<a href="${ad.file}" download="${ad.fileName}" class="download-btn">📥 הורד: ${ad.fileName}</a>` : ''}
                ${ad.phone ? `<br><a href="https://wa.me/${ad.phone.replace(/\D/g,'')}" class="whatsapp-btn">💬 שלח וואטסאפ</a>` : ''}
                <br><button onclick="history.back()" style="margin-top:20px;">← חזרה</button>
            </div>
        `;
    });
}

function openImage(src) {
    document.getElementById('overlayImg').src = src;
    document.getElementById('imageOverlay').style.display = 'flex';
}


function closeImg() {
    document.getElementById('imageOverlay').style.display = 'none';
}
