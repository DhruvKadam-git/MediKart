// js/auth.js
// Requires that firebase-app, firebase-auth-compat, and firebase-firestore-compat
// have already been loaded on the page BEFORE this file.

(function () {
  if (!window.firebase || !firebase.apps.length) {
    // Initialize only if not already done (defensive for multiple includes)
    const firebaseConfig = {
      apiKey: "AIzaSyAzRwr8d3MQykyfVu6KQKRsq91Hdh1wdso",
      authDomain: "login-example-ae44a.firebaseapp.com",
      projectId: "login-example-ae44a",
      storageBucket: "login-example-ae44a.firebasestorage.app",
      messagingSenderId: "985788201459",
      appId: "1:985788201459:web:2bc7b85aeb14896744fa86",
      measurementId: "G-V8LLZCNY22"
    };
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db   = firebase.firestore();

  function defaultAvatar(name, uid, size = 150) {
    const initials = (name || "U").trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
    // Derive a deterministic hue from the user's UID so the colour is the same everywhere
    function hashToHue(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit int
      }
      return Math.abs(hash) % 360;
    }

    const hue = hashToHue(uid || initials);
    const light = 55; // medium lightness
    const sat   = 75; // saturation
    const color1 = `hsl(${hue},${sat}%,${light}% )`;
    const color2 = `hsla(${hue},${sat}%,${light + 10}%,0.7)`;

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\">
        <defs>
          <linearGradient id=\"grad\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\"> 
            <stop offset=\"0%\" stop-color=\"${color1}\" stop-opacity=\"0.85\" />
            <stop offset=\"100%\" stop-color=\"${color2}\" stop-opacity=\"0.95\" />
          </linearGradient>
        </defs>
        <rect width=\"100%\" height=\"100%\" rx=\"${size * 0.1}\" fill=\"url(#grad)\" />
        <text x=\"50%\" y=\"50%\" dy=\"0.35em\" text-anchor=\"middle\" font-family=\"'Inter',sans-serif\" font-size=\"${size * 0.4}\" fill=\"#ffffff\" opacity=\"0.88\">${initials}</text>
      </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const snap = await db.collection('users').doc(user.uid).get();
        const data = snap.data() || {};
        const profile = {
          name: data.name || user.displayName || 'User',
          email: user.email,
          phone: data.phone || user.phoneNumber || '',
          avatar: data.avatar || user.photoURL || defaultAvatar(data.name || user.displayName || 'User', user.uid)
        };
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    } else {
      localStorage.removeItem('user');
    }
  });
})();
