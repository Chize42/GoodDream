// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Inquiry = require('./models/Inquiry'); // Inquiry 모델 import

const app = express();
const PORT = 3000;
// MongoDB Atlas 클라우드 주소
const DB_URL = 'mongodb+srv://aprililydbuser:PI0EruiDNtZYrSpH@aprilily.bmmbmax.mongodb.net/inquiryDB?retryWrites=true&w=majority&appName=Aprilily'; 

// uploads 폴더가 없으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정: 파일 저장 방식 및 파일명 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일 저장 경로
    },
    filename: (req, file, cb) => {
        // 파일명: 타임스탬프_원본파일명
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

// 파일 필터: 이미지만 허용
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
};

// Multer 미들웨어 설정
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
    fileFilter: fileFilter
});

// 미들웨어 설정
app.use(cors()); // CORS 활성화
app.use(express.json()); // JSON 요청 본문 파싱
app.use('/uploads', express.static('uploads')); // 업로드된 파일을 정적 파일로 제공

// 데이터베이스 연결
mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB 연결 성공 (포트 27017)'))
    .catch(err => console.error('MongoDB 연결 실패. MongoDB가 실행 중인지 확인하세요:', err.message));

// --- API 엔드포인트 (라우트) ---

// 1. [POST] 문의 접수 (Create) - 파일 업로드 포함
app.post('/api/v1/inquiries', upload.array('files', 5), async (req, res) => {
    try {
        // 업로드된 파일 경로들을 배열로 저장
        const filePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        
        // 문의 데이터 생성
        const inquiryData = {
            title: req.body.title,
            content: req.body.content,
            email: req.body.email,
            userName: req.body.userName,
            status: req.body.status || '답변 대기',
            attachments: filePaths // 파일 경로 배열 추가
        };

        const newInquiry = new Inquiry(inquiryData);
        await newInquiry.save();
        
        console.log('문의 접수 성공:', newInquiry);
        return res.status(201).json({ 
            message: '문의가 성공적으로 접수되었습니다.', 
            inquiry: newInquiry 
        });
    } catch (error) {
        console.error("문의 접수 중 오류:", error); 
        
        // 업로드된 파일이 있다면 삭제 (에러 발생 시)
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('파일 삭제 실패:', err);
                });
            });
        }
        
        return res.status(400).json({ 
            message: '문의 접수 실패', 
            error: error.message 
        });
    }
});

// 2. [GET] 문의 목록 조회 (Read)
app.get('/api/v1/inquiries', async (req, res) => {
    const status = req.query.status; 
    const query = status ? { status } : {}; 

    try {
        const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
        return res.status(200).json(inquiries); 
    } catch (error) {
        console.error("문의 목록 조회 중 오류:", error); 
        return res.status(500).json({ message: '문의 목록 조회 실패' });
    }
});

// 3. [GET] 특정 문의 상세 조회
app.get('/api/v1/inquiries/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
        }
        
        return res.status(200).json(inquiry);
    } catch (error) {
        console.error("문의 조회 중 오류:", error);
        return res.status(500).json({ message: '문의 조회 실패' });
    }
});

// 4. [PATCH] 답변 제출 및 상태 변경 (Update)
app.patch('/api/v1/inquiries/:id', async (req, res) => {
    const { answerContent, newStatus } = req.body;

    try {
        const updatedInquiry = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            { 
                answerContent, 
                status: newStatus,
                updatedAt: Date.now()
            }, 
            { new: true }
        );

        if (!updatedInquiry) {
            return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
        }

        return res.status(200).json({ 
            message: '답변 및 상태 변경 완료', 
            inquiry: updatedInquiry 
        });
    } catch (error) {
        console.error("문의 업데이트 중 오류:", error);
        return res.status(500).json({ message: '업데이트 실패' });
    }
});

// 5. [DELETE] 문의 삭제 (파일도 함께 삭제)
app.delete('/api/v1/inquiries/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
        }

        // 첨부 파일 삭제
        if (inquiry.attachments && inquiry.attachments.length > 0) {
            inquiry.attachments.forEach(filePath => {
                const fullPath = path.join(__dirname, filePath);
                fs.unlink(fullPath, (err) => {
                    if (err) console.error('파일 삭제 실패:', err);
                });
            });
        }

        await Inquiry.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: '문의가 삭제되었습니다.' });
    } catch (error) {
        console.error("문의 삭제 중 오류:", error);
        return res.status(500).json({ message: '문의 삭제 실패' });
    }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '파일 크기는 10MB를 초과할 수 없습니다.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: '최대 5개의 파일만 업로드 가능합니다.' });
        }
    }
    return res.status(500).json({ message: err.message });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`백엔드 서버가 http://localhost:${PORT} 에서 구동 중입니다.`);
});