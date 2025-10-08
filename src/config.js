// config.js 파일 생성

// ⚠️ 여기에 [컴퓨터의 실제 로컬 IP 주소]를 넣어야 합니다. (예: 192.168.0.5)
//    localhost나 127.0.0.1은 에뮬레이터/실제 기기에서 접근할 수 없습니다.
//    3000은 server.js에서 설정한 포트입니다.
const YOUR_LOCAL_IP = '192.168.45.233'; 

// API의 기본 경로를 정의합니다.
const API_BASE_URL = `http://${YOUR_LOCAL_IP}:3000/api/v1/inquiries`; 

export default API_BASE_URL;