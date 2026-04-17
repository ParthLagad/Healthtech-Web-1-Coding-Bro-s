// 1. Firebase Configuration (Already verified)
const firebaseConfig = {
  apiKey: "AIzaSyAbftjh6M-4du0P2MyoAxzpaBe9cwOQT64",
  authDomain: "healthtech-web-1-coding-bro-s.firebaseapp.com",
  projectId: "healthtech-web-1-coding-bro-s",
  storageBucket: "healthtech-web-1-coding-bro-s.firebasestorage.app",
  messagingSenderId: "71776637429",
  appId: "1:71776637429:web:3fa0f533a060f31bdd90bc"
};

// 2. Initialize
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const firebaseAuth = firebase.auth();

// 3. Auth Helpers
window.auth = {
  setToken: (token) => localStorage.setItem('patient_token', token),
  setUser: (user) => localStorage.setItem('patient_user', JSON.stringify(user)),
  getUser: () => JSON.parse(localStorage.getItem('patient_user') || '{}'),
  clear: () => { localStorage.clear(); firebaseAuth.signOut(); }
};

// 4. The Logic Fix (AWAIT IS KING HERE)
window.POST = async function(endpoint, body) {
  if (endpoint === '/auth/register') {
    // Create Auth User
    const userCred = await firebaseAuth.createUserWithEmailAndPassword(body.email, body.password);
    
    // Prepare Data
    const userData = {
      name: body.name, email: body.email, phone: body.phone,
      dob: body.dob, gender: body.gender, blood_group: body.blood_group,
      uid: userCred.user.uid,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // THE CRITICAL FIX: We MUST wait for this to finish!
    await db.collection('users').doc(userCred.user.uid).set(userData);
    
    return { token: userCred.user.accessToken, user: userData };
  }

  if (endpoint === '/auth/login') {
    const userCred = await firebaseAuth.signInWithEmailAndPassword(body.email, body.password);
    const userDoc = await db.collection('users').doc(userCred.user.uid).get();
    return { token: userCred.user.accessToken, user: userDoc.data() };
  }
};

// Global UI Fixes
window.switchTab = (id) => {
  document.querySelectorAll('.auth-tab, .auth-form-pane').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-form="${id}"]`).classList.add('active');
  document.getElementById(id).classList.add('active');
};