// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Inquiry = require('./models/Inquiry'); // Inquiry 모델 import

const app = express();
const PORT = 3000;
// MongoDB Atlas 클라우드 주소
const DB_URL = 'mongodb+srv://aprililydbuser:PI0EruiDNtZYrSpH@aprilily.bmmbmax.mongodb.net/inquiryDB?retryWrites=true&w=majority&appName=Aprilily'; 

// 미들웨어 설정
app.use(cors()); // CORS 활성화
app.use(express.json()); // JSON 요청 본문 파싱

// 데이터베이스 연결
mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB 연결 성공 (포트 27017)'))
    .catch(err => console.error('MongoDB 연결 실패. MongoDB가 실행 중인지 확인하세요:', err.message));

// --- API 엔드포인트 (라우트) ---

// 1. [POST] 문의 접수 (Create) - URL: /api/v1/inquiries
app.post('/api/v1/inquiries', async (req, res) => {
    try {
        const newInquiry = new Inquiry(req.body);
        await newInquiry.save();
        // 응답 코드를 201(Created)로 명시하고 JSON 응답
        return res.status(201).json({ message: '문의가 성공적으로 접수되었습니다.', inquiry: newInquiry });
    } catch (error) {
        // 유효성 검사 실패 시 400 Bad Request와 JSON 응답
        console.error("문의 접수 중 오류:", error); 
        return res.status(400).json({ message: '문의 접수 실패', error: error.message });
    }
});

// 2. [GET] 문의 목록 조회 (Read) - URL: /api/v1/inquiries?status=...
app.get('/api/v1/inquiries', async (req, res) => {
    const status = req.query.status; 
    const query = status ? { status } : {}; 

    try {
        const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
        
        // 응답 코드를 200(OK)로 명시하고 JSON 데이터를 보냅니다.
        return res.status(200).json(inquiries); 
        
    } catch (error) {
        // 서버 측 오류 시 500 Internal Server Error와 JSON 에러 메시지를 보냅니다.
        console.error("문의 목록 조회 중 오류:", error); 
        return res.status(500).json({ message: '문의 목록 조회 실패' });
    }
});

// 3. [PATCH] 답변 제출 및 상태 변경 (Update) - URL: /api/v1/inquiries/:id
app.patch('/api/v1/inquiries/:id', async (req, res) => {
    // 실제 운영 시 관리자 인증(토큰 검증) 로직이 여기에 반드시 추가되어야 합니다.
    const { answerContent, newStatus } = req.body;

    try {
        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            { 
                answerContent, 
                status: newStatus,
                updatedAt: Date.now()
            }, 
            { new: true } // 업데이트된 문서를 반환
        );

        if (!updatedInquiry) {
            return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
        }

        return res.status(200).json({ message: '답변 및 상태 변경 완료', inquiry: updatedInquiry });
    } catch (error) {
        console.error("문의 업데이트 중 오류:", error);
        return res.status(500).json({ message: '업데이트 실패' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`백엔드 서버가 http://localhost:${PORT} 에서 구동 중입니다.`);
});