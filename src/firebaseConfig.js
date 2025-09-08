// // 필요한 라이브러리 추가
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth"; // 이메일/비밀번호 인증을 위해 추가
// import { getFirestore } from "firebase/firestore"; // 데이터베이스 저장을 위해 추가

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBdGKkmAyhFpLh9hj8xJlG-81HyOmf8B6Y",
//   authDomain: "sleeptracker-d52d7.firebaseapp.com",
//   projectId: "sleeptracker-d52d7",
//   storageBucket: "sleeptracker-d52d7.firebasestorage.app",
//   messagingSenderId: "263211182083",
//   appId: "1:263211182083:web:1eaee6783460b67b02c636",
//   measurementId: "G-C167TQ85J7"
// };

// // 파이어베이스 앱 초기화
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// // 필요한 서비스를 초기화하고 변수에 할당합니다.
// const auth = getAuth(app);
// const db = getFirestore(app);

// // 다른 파일에서 사용할 수 있도록 내보냅니다.
// export { app, analytics, auth, db };