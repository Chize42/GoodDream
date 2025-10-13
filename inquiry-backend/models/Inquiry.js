// models/Inquiry.js

const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    // 사용자 문의 정보 (프론트엔드에서 넘어오는 데이터)
    title: { type: String, required: true },       // 제목
    content: { type: String, required: true },     // 내용
    email: { type: String, required: true },       // 연락처 (이메일)
    userName: { type: String, required: true },    // 사용자 성함 (name -> userName으로 통일)
    
    // 첨부 파일 정보
    attachments: { 
        type: [String],  // 파일 경로 배열 (예: ['/uploads/1234567890_image.jpg'])
        default: [] 
    },
    
    // 처리 상태 및 관리자 정보 (백엔드/관리자 모드에서 업데이트)
    status: { 
        type: String, 
        required: true, 
        default: '답변 대기', 
        enum: ['답변 대기', '처리 중', '답변 완료'] // 상태는 이 셋 중 하나여야 함
    },
    answerContent: { type: String, default: null }, // 관리자 답변 내용
    
    // 시간 정보 (자동 생성)
    createdAt: { type: Date, default: Date.now },  // 접수 시간
    updatedAt: { type: Date, default: Date.now }   // 마지막 업데이트 시간
});

module.exports = mongoose.model('Inquiry', InquirySchema);