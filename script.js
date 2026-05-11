// הגדרות Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWEEu96d981XApU6iQYb2p0qZL8yifP5o",
  authDomain: "://firebaseapp.com",         
  projectId: "eliran-6cb4f",
  storageBucket: "://appspot.com",           
  messagingSenderId: "1033772822280",
  appId: "1:1033772822280:web:1020118cb8ea1c185046bd",
  databaseURL: "https://firebaseio.com"  
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

function db() {
    return firebase.database();
}

// --- הוספה חדשה: תצוגה מקדימה לתמונה ברגע הבחירה ---
document.addEventListener('DOMContentLoaded', () => {
    const imgInput = document.getElementById('imageInput');
    if (imgInput) {
        imgInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // מחפש אלמנט תצוגה, אם לא קיים - יוצר אחד
                    let preview = document.getElementById('imagePreview');
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.id = 'imagePreview';
                        preview.style.width = '100px';
                        preview.style.marginTop = '10px';
                        preview.style.borderRadius = '8px';
                        imgInput.parentNode.appendChild(preview);
                    }
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
// ------------------------------------------------

function checkPass() {
    if (document.getElementById('pass').value === "1234") {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
        loadAdminAds();
    } else {
        alert("סיסמה שגויה");
    }
}

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

// שאר הפונקציות (displayAds, renderAds, searchAds וכו') נשארות ללא שינוי...
