// --- AURA SENTINEL SYSTEM V4.2 (FIXED POPUP LOGIC) ---
const AuraSentinel = {
    lobbyPage: 'hologram0.html',
    blacklist: [
        'admin.html', 'lenhAI.html', 'operatorverify.html', 
        'architectverify.html', 'orchestratorverify.html',
        'reserved_file_1.html', 'reserved_file_2.html'
    ],

    init: function() {
        this.injectHtml();
        this.securityCheck(); 
        this.interceptNavigation();
        console.log("🛡️ Sentinel V4.2: Active");
    },

    injectHtml: function() {
        if (!document.getElementById('sentinelOverlay')) {
            const popupHtml = `
                <div id="sentinelOverlay">
                    <div class="sentinel-box">
                        <div class="sentinel-icon">⚠️</div>
                        <div class="sentinel-title" id="sentinelTitle">MẤT KẾT NỐI</div>
                        <div class="sentinel-msg" id="sentinelText">Hệ thống yêu cầu Internet.</div>
                        <button class="sentinel-btn" id="sentinelBtn">ĐÃ HIỂU</button>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', popupHtml);
        }
    },

    // --- 1. LOGIC TRỤC XUẤT (KHI ĐANG Ở SAI CHỖ) ---
    securityCheck: function() {
        const currentPath = window.location.pathname.toLowerCase();
        const isAtLobby = currentPath.includes(this.lobbyPage.toLowerCase());

        // Nếu ở sảnh và có cờ báo vừa bị đá về -> Hiện thông báo chào đón
        if (isAtLobby && sessionStorage.getItem('AURA_KICK_REASON') === 'lost_connection') {
            this.triggerPopup("HỆ THỐNG TRỤC XUẤT", "Bạn đã được đưa về Sảnh an toàn.", "BLOCK"); 
            sessionStorage.removeItem('AURA_KICK_REASON');
            return;
        }

        // --- TEST MODE (IF TRUE) ---
        if (!navigator.onLine)
            if (!isAtLobby) {
                const isBanned = this.blacklist.some(file => currentPath.includes(file.toLowerCase()));
                if (isBanned) {
                    // Đây là KICK: Bấm nút xong mới bị đá
                    this.triggerPopup("CẢNH BÁO BẢO MẬT", "Mất kết nối Internet. Nhấn xác nhận để về sảnh.", "KICK");
                }
            }
        }
    },

    // --- 2. LOGIC CHẶN (KHI BẤM LINK TỪ SẢNH) ---
    interceptNavigation: function() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, [onclick]');
            if (!target) return;

            // --- TEST MODE (IF TRUE) ---
            
                let targetUrl = target.tagName === 'A' ? target.getAttribute('href') : target.getAttribute('onclick');
                if (!targetUrl) return;

                const isBanned = this.blacklist.some(file => targetUrl.toLowerCase().includes(file.toLowerCase()));
                
                if (isBanned) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Đây là BLOCK: Bấm nút chỉ để tắt popup
                    this.triggerPopup("KHÔNG THỂ TRUY CẬP", "Module này yêu cầu kết nối Internet.", "BLOCK");
                }
            }
        }, true);
    },

    // --- HÀM XỬ LÝ POPUP TRUNG TÂM ---
    triggerPopup: function(title, msg, mode) {
        const overlay = document.getElementById('sentinelOverlay');
        const txtTitle = document.getElementById('sentinelTitle');
        const txtMsg = document.getElementById('sentinelText');
        const btn = document.getElementById('sentinelBtn');

        if (overlay && txtTitle && txtMsg && btn) {
            // Cập nhật nội dung
            txtTitle.innerHTML = title;
            txtMsg.innerHTML = msg;
            overlay.style.display = 'flex';

            // --- QUAN TRỌNG: RESET NÚT BẤM ---
            // Thay thế nút bằng bản sao để xóa sạch các sự kiện cũ
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            // Gán hành động mới dựa trên MODE
            newBtn.onclick = () => {
                if (mode === "KICK") {
                    // Nếu là KICK: Đá về sảnh
                    sessionStorage.setItem('AURA_KICK_REASON', 'lost_connection');
                    window.location.href = this.lobbyPage;
                } else {
                    // Nếu là BLOCK: Chỉ tắt Popup, tuyệt đối không làm gì khác
                    overlay.style.display = 'none';
                }
            };
        }
    }
};

// Khởi chạy
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AuraSentinel.init());
} else {
    AuraSentinel.init();
}
