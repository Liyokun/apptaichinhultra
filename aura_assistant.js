/* =================================================================
   AURA TUTORIAL ENGINE V1.0 (DYNAMIC INJECTION)
   Thiết kế: Lớp phủ trong suốt, Robot lơ lửng, Typewriter Effect
   ================================================================= */

// 1. NGĂN KÉO DỮ LIỆU (THE DATA SHELL) - THÊM DẦN TẠI ĐÂY
const AURA_SCRIPTS = {
    // Kịch bản cho sảnh chính (hologram0.html)
    "lobby_core": [
        "Chào mừng Chỉ huy đến với Trạm Điều Hành Trung Tâm AURA.",
        "Sáu cổng dữ liệu trước mặt là các Module quản lý tài chính cốt lõi. Ghi chép chi tiêu, phân bổ ngân sách hay lịch sử đều nằm tại đây.",
        "Nhấp vào hình đại diện góc trái phía trên để truy cập Hồ sơ Năng lượng cá nhân.",
        "Hai phím điều hướng bên dưới dùng để thay đổi không gian sảnh hoặc tiến vào vùng dữ liệu chuyên sâu.",
        "Hệ thống đã sẵn sàng. Hãy nhấp để mở khóa màn hình và chọn một cổng dữ liệu để bắt đầu!"
    ]
    // Các ID khác sẽ được dán nối tiếp xuống dưới này trong tương lai...
        // --- CÁC MODULE CỦA FINANCE DASHBOARD (INDEX.HTML) ---
    "task_daily": [
        "Khởi động Module Chi tiêu hàng ngày.",
        "Tại đây, Chỉ huy có thể ghi nhận nhanh chóng các giao dịch phát sinh vào từng Ví con tương ứng.",
        "Mọi dữ liệu nhập vào sẽ tự động đồng bộ lên Hệ thống Trung tâm."
    ],
    "task_budget": [
        "Truy cập Trung tâm Kiểm soát Dòng tiền và Biến động.",
        "Hệ thống đang đối chiếu Ngân sách gốc với Số dư thực tế.",
        "Chỉ số màu Xanh biểu thị an toàn. Hãy cảnh giác với các cảnh báo màu Đỏ."
    ],
    "task_status": [
        "Kích hoạt Hệ thống AI phân tích tình trạng tài chính.",
        "Chỉ số phần trăm (%) tại đây phản ánh mức độ sinh tồn của ngân sách hiện tại.",
        "Hãy duy trì thanh trạng thái ở mức Ổn định để đảm bảo an toàn năng lượng."
    ],
    "task_history": [
        "Mở khóa Kho lưu trữ Dữ liệu Lịch sử.",
        "Toàn bộ các chu kỳ kết toán trước đây đều được lưu trữ bảo mật tại phân khu này.",
        "Chỉ huy có thể xem lại chi tiết hoặc thực hiện xóa các bản ghi cũ."
    ],
    "task_alloc": [
        "Khởi động Module Phân bổ Ngân sách Gốc.",
        "Bước đầu tiên của mỗi chu kỳ: Hãy nhập Tổng ngân sách và chia nhỏ năng lượng vào các Ví con.",
        "Nhấn 'LƯU PHÂN BỔ' để chốt dữ liệu và kích hoạt kỳ mới."
    ],
    "task_settings": [
        "Truy cập Phân khu Cài đặt Hệ thống.",
        "Chỉ huy có thể định danh lại (Đổi tên) cho chu kỳ kế toán hiện tại.",
        "Tài liệu vận hành chi tiết cũng được lưu trữ tại đây."
    ]

};

// 2. BIẾN TOÀN CỤC CHO ENGINE
let aura_currentStep = 0;
let aura_isTyping = false;
let aura_typeInterval;
let aura_currentId = "";
const aura_typeSpeed = 35; // Tốc độ gõ chữ (ms)

// 3. HÀM KHỞI TẠO TRỢ LÝ
function initAuraAssistant(pageId) {
    // Nếu đã xem rồi và KHÔNG có lệnh ép buộc chạy lại thì mới thoát
    if (localStorage.getItem(`aura_tut_${pageId}`) && !localStorage.getItem('AURA_FIRST_TIME_SIGNAL')) {
        return;
    }
    const scriptData = AURA_SCRIPTS[pageId];
    if (!scriptData) {
        console.warn(`AURA Assistant: Không tìm thấy kịch bản cho ID '${pageId}'`);
        return;
    }

    aura_currentId = pageId;
    aura_currentStep = 0;

    // Tự động chèn CSS nếu chưa có
    if (!document.getElementById('aura-assistant-style')) {
        const style = document.createElement('style');
        style.id = 'aura-assistant-style';
        style.innerHTML = `
            #aura-tut-blocker { position: fixed; inset: 0; z-index: 9000; background: transparent; pointer-events: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.5s ease; }
            #aura-tut-char { width: 140px; filter: drop-shadow(0 0 20px #00f2ff); margin-bottom: -10px; z-index: 9002; pointer-events: none; animation: tutFloat 4s ease-in-out infinite; }
            #aura-tut-card { width: 85%; max-width: 400px; min-height: 110px; background: rgba(0, 15, 30, 0.8); backdrop-filter: blur(10px); border: 2px solid #00f2ff; border-radius: 12px; padding: 18px 22px; box-shadow: 0 0 30px rgba(0, 242, 255, 0.2), inset 0 0 15px rgba(0, 242, 255, 0.1); position: relative; cursor: pointer; z-index: 9001; display: flex; flex-direction: column; justify-content: flex-start; -webkit-tap-highlight-color: transparent; }
            #aura-tut-card:active { transform: scale(0.98); transition: 0.1s; }
            #aura-tut-text { color: #fff; font-size: 13px; line-height: 1.6; margin: 0; font-family: 'Courier New', monospace; text-align: left; text-shadow: 0 0 5px rgba(255,255,255,0.5); min-height: 42px; }
            #aura-tut-cursor { display: inline-block; width: 7px; height: 13px; background: #00f2ff; margin-left: 5px; animation: tutBlink 0.8s infinite step-end; }
            #aura-tut-tip { position: absolute; bottom: 8px; right: 15px; color: #00f2ff; font-size: 10px; letter-spacing: 2px; font-weight: bold; opacity: 0; transition: opacity 0.3s; animation: tutPulse 1.5s infinite; }
            @keyframes tutFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
            @keyframes tutBlink { 50% { opacity: 0; } }
            @keyframes tutPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; text-shadow: 0 0 10px #00f2ff; } }
        `;
        document.head.appendChild(style);
    }

    // Tạo mã HTML giao diện
    const html = `
        <div id="aura-tut-blocker">
            <img id="aura-tut-char" src="./robot.png" alt="AURA">
            <div id="aura-tut-card" onclick="handleAuraClick()">
                <div id="aura-tut-text"></div>
                <div id="aura-tut-tip">[ NHẤP ĐỂ TIẾP TỤC ]</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // Bắt đầu chạy câu thoại đầu tiên
    startAuraTyping(AURA_SCRIPTS[aura_currentId][aura_currentStep]);
}

// 4. LOGIC GÕ CHỮ (TYPEWRITER)
function startAuraTyping(text) {
    aura_isTyping = true;
    const textContainer = document.getElementById('aura-tut-text');
    const tip = document.getElementById('aura-tut-tip');
    
    textContainer.innerHTML = ''; 
    tip.style.opacity = 0; 

    let i = 0;
    clearInterval(aura_typeInterval);

    aura_typeInterval = setInterval(() => {
        if (i < text.length) {
            textContainer.innerHTML = text.substring(0, i + 1) + '<span id="aura-tut-cursor"></span>';
            i++;
        } else {
            clearInterval(aura_typeInterval);
            aura_isTyping = false;
            tip.style.opacity = 1; 
        }
    }, aura_typeSpeed);
}

// 5. XỬ LÝ KHI NGƯỜI DÙNG NHẤP VÀO CARD
function handleAuraClick() {
    // Trường hợp 1: Đang gõ chữ -> Nhấp để hiện full chữ lập tức (Skip)
    if (aura_isTyping) {
        clearInterval(aura_typeInterval);
        document.getElementById('aura-tut-text').innerHTML = AURA_SCRIPTS[aura_currentId][aura_currentStep] + '<span id="aura-tut-cursor"></span>';
        document.getElementById('aura-tut-tip').style.opacity = 1;
        aura_isTyping = false;
        return;
    }

    // Trường hợp 2: Đã gõ xong -> Sang câu tiếp theo
    aura_currentStep++;
    const scriptData = AURA_SCRIPTS[aura_currentId];

    if (aura_currentStep < scriptData.length) {
        startAuraTyping(scriptData[aura_currentStep]);
    } else {
        // Hết kịch bản -> Dọn dẹp & Lưu trạng thái
        const blocker = document.getElementById('aura-tut-blocker');
        blocker.style.opacity = 0;
        localStorage.setItem(`aura_tut_${aura_currentId}`, "true"); // Đánh dấu đã xem
        setTimeout(() => { blocker.remove(); }, 500);
    }
}
