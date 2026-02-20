/* =================================================================
   NGƯỜI GÁC CỔNG (AURA GATEKEEPER) - PARSER V4
   - Nhiệm vụ: Mổ xẻ dữ liệu dạng "ROLE-X" (VD: OPERATOR-30).
   - Logic chuyển đổi:
     + INITIATOR     = 1
     + OPERATOR      = 2
     + ARCHITECT     = 3
     + ORCHESTRATOR  = 4
   - Ngăn kéo X: Trả về số sau dấu gạch ngang.
   ================================================================= */

const NguoiGacCong = {
    KEY: 'AURA_CLEARANCE_LEVEL',

    // --- [CORE] BỘ PHẬN MỔ XẺ DỮ LIỆU (NỘI BỘ) ---
    // Hàm này giúp tách chuỗi "OPERATOR-30" thành 2 phần riêng biệt
    _moXeDuLieu: function() {
        // Lấy dữ liệu thô, nếu không có thì mặc định là INITIATOR-0
        const rawData = localStorage.getItem(this.KEY) || 'INITIATOR-0';
        
        // Nếu dữ liệu dạng chuẩn mới (có dấu -), tiến hành cắt
        if (rawData.includes('-')) {
            const parts = rawData.split('-'); 
            return {
                roleName: parts[0],           // Lấy chữ: OPERATOR
                xValue: parseInt(parts[1] || '0') // Lấy số: 30
            };
        }
        
        // [Hỗ trợ cũ] Nếu lỡ dữ liệu lưu chỉ là số (1, 2...)
        // Vẫn trả về để không lỗi, nhưng X = 0
        return { roleName: 'LEGACY', rawLevel: parseInt(rawData), xValue: 0 };
    },

    // --- NHIỆM VỤ 1: TRẢ LỜI DANH TÍNH (Cho giao diện & file cũ) ---
    traLoiDanhTinh: function() {
        const data = this._moXeDuLieu();
        let finalLevel = 1; // Mặc định Level 1

        // --- BẢNG QUY ĐỔI TỪ CHỮ SANG SỐ ---
        if (data.roleName === 'ORCHESTRATOR') {
            finalLevel = 4;
        } 
        else if (data.roleName === 'ARCHITECT') {
            finalLevel = 3;
        } 
        else if (data.roleName === 'OPERATOR') {
            finalLevel = 2;
        } 
        else if (data.roleName === 'INITIATOR') {
            finalLevel = 1;
        }
        // Trường hợp LEGACY (dữ liệu cũ là số)
        else if (data.roleName === 'LEGACY') {
            finalLevel = data.rawLevel || 1;
        }

        // Trả về định dạng y hệt bản cũ để không lỗi hệ thống
        let identity = {
            level: finalLevel,
            rankName: `[${data.roleName === 'LEGACY' ? 'UNKNOWN' : data.roleName}]`
        };
        
        // Fix lại tên hiển thị cho đẹp nếu lỡ rơi vào Legacy
        if (finalLevel === 4) identity.rankName = "[ORCHESTRATOR]";
        else if (finalLevel === 3) identity.rankName = "[ARCHITECT]";
        else if (finalLevel === 2) identity.rankName = "[OPERATOR]";
        else identity.rankName = "[INITIATOR]";

        return identity;
    },

    // --- NHIỆM VỤ 2: NGĂN KÉO GIÁ TRỊ X (Cho đồng hồ) ---
    layGiaTriX: function() {
        // Chỉ việc gọi bộ mổ xẻ và lấy giá trị xValue
        const data = this._moXeDuLieu();
        return data.xValue;
    },

    // --- NHIỆM VỤ 3: KIỂM TRA QUYỀN (Giữ nguyên logic so sánh số) ---
    coQuyenHan: function(levelYeuCau) {
        // Tự động chuyển đổi Chữ -> Số rồi mới so sánh
        const info = this.traLoiDanhTinh();
        return info.level >= levelYeuCau;
    }
};
