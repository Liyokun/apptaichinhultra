/* =========================================
   LINH KIỆN AVATAR - LOGIC (JS)
   ========================================= */

const AvatarFrameManager = {
    // Định nghĩa cấu trúc HTML của các phụ kiện (để đỡ phải viết vào HTML chính)
    assets: {
        fan: `
            <div class="fan-mount">
                <div class="fan-rotor">
                    <div class="blade"></div>
                    <div class="blade"></div>
                    <div class="fan-hub"></div>
                </div>
            </div>
        `,
        lightning: `
            <svg class="lightning-container" viewBox="0 0 200 200">
                <path class="bolt b1" d="M30 100 L40 80 L35 70 L55 50 L45 40 L70 30" />
                <path class="bolt b2" d="M130 30 L150 45 L145 55 L165 70 L160 80 L170 100" />
                <path class="bolt b3" d="M170 100 L160 120 L165 130 L145 150 L150 160 L130 170" />
                <path class="bolt b4" d="M70 170 L50 155 L55 145 L35 130 L40 120 L30 100" />
            </svg>
        `
    },

    // Hàm chính: Gọi lệnh này ở file giao diện
    render: function(elementId) {
        const frameContainer = document.getElementById(elementId);
        if (!frameContainer) return;

        // 1. Hỏi Người Gác Cổng
        const identity = NguoiGacCong.traLoiDanhTinh(); // Trả về { rankName: "..." }
        
        // 2. Xóa các lớp cũ (reset)
        frameContainer.className = "wireframe-avatar"; // Giữ class gốc
        
        // 3. Xóa các linh kiện cũ bên trong (trừ cái ảnh avatar ra)
        // Chúng ta chỉ xóa các div có class frame-basic, frame-neon, fan-mount, lightning-container
        const oldParts = frameContainer.querySelectorAll('.frame-basic, .frame-neon, .fan-mount, .lightning-container');
        oldParts.forEach(part => part.remove());

        // 4. Lắp ráp theo cấp độ
        let frameHTML = "";

        if (identity.rankName === "[INITIATOR]") {
            // Cấp 1: Khung Basic
            frameContainer.insertAdjacentHTML('beforeend', '<div class="frame-basic"></div>');
        } 
        else {
            // Cấp 2 trở lên: Khung Neon
            let auraClass = "aura-lv2"; // Mặc định Operator
            let extras = "";

            if (identity.rankName === "[ARCHITECT]") {
                auraClass = "aura-lv3";
                extras += this.assets.fan; // Thêm quạt
            } 
            else if (identity.rankName === "[ORCHESTRATOR]") {
                auraClass = "aura-lv4";
                extras += this.assets.fan; // Thêm quạt
                extras += this.assets.lightning; // Thêm sét
            }

            // Chèn khung Neon và hiệu ứng
            const neonHTML = `<div class="frame-neon ${auraClass}"></div>`;
            frameContainer.insertAdjacentHTML('beforeend', neonHTML + extras);
        }
        
        console.log(`[AVATAR_MANAGER]: Đã lắp linh kiện cho cấp ${identity.rankName}`);
    }
};
