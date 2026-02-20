/* =================================================================
   FILE LOGIC: HỆ THỐNG VÍ ĐỘNG (DYNAMIC WALLET SYSTEM) - FIX FULL
   [UPDATED V9.0: AUTO TIME CONTROL SECURITY & NEON POPUPS]
   ================================================================= */

// --- 0. HÀM HỖ TRỢ POPUP NEON (THAY THẾ ALERT/CONFIRM CŨ) ---
// Tự động chèn HTML Popup vào body nếu chưa có
(function initPopupUI() {
    if (!document.getElementById('neon-popup-overlay')) {
        const popupHTML = `
            <div id="neon-popup-overlay" class="neon-popup-overlay" style="display:none;">
                <div class="neon-popup-box">
                    <div id="neon-popup-title" class="neon-popup-title">THÔNG BÁO</div>
                    <div id="neon-popup-msg" class="popup-msg">Nội dung</div>
                    <div id="neon-popup-actions" class="popup-actions" style="margin-top:20px;">
                        <button id="neon-btn-cancel" class="neon-popup-btn" style="border-color:#ff4444; color:#ff4444; margin-right:10px;">HỦY</button>
                        <button id="neon-btn-confirm" class="neon-popup-btn">ĐỒNG Ý</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
})();

function showNeonAlert(msg) {
    const overlay = document.getElementById('neon-popup-overlay');
    document.getElementById('neon-popup-title').innerText = "THÔNG BÁO";
    document.getElementById('neon-popup-msg').innerText = msg;
    document.getElementById('neon-btn-cancel').style.display = 'none'; // Ẩn nút hủy
    const btnConfirm = document.getElementById('neon-btn-confirm');
    
    overlay.style.display = 'flex';
    
    btnConfirm.onclick = function() {
        overlay.style.display = 'none';
    };
}

function showNeonConfirm(msg, callback) {
    const overlay = document.getElementById('neon-popup-overlay');
    document.getElementById('neon-popup-title').innerText = "XÁC NHẬN";
    document.getElementById('neon-popup-msg').innerText = msg;
    
    const btnCancel = document.getElementById('neon-btn-cancel');
    const btnConfirm = document.getElementById('neon-btn-confirm');
    
    btnCancel.style.display = 'inline-block';
    overlay.style.display = 'flex';

    // Xử lý sự kiện
    btnConfirm.onclick = function() {
        overlay.style.display = 'none';
        if (callback) callback();
    };
    
    btnCancel.onclick = function() {
        overlay.style.display = 'none';
    };
}

// --- 1. KHỞI TẠO DỮ LIỆU AN TOÀN ---
let appData = JSON.parse(localStorage.getItem('app_data_v4')) || {
    totalBudget: 0,
    wallets: [] 
};

let mName = localStorage.getItem('mName_v3') || "Vào cài đặt để đặt tên cho kỳ";
let theme = localStorage.getItem('theme_v3') || 'light';

// Hàm tiện ích
const fmt = (n) => (n || 0).toLocaleString('vi-VN');
const saveDB = () => localStorage.setItem('app_data_v4', JSON.stringify(appData));

// --- 2. HÀM ĐIỀU HƯỚNG (TAB) ---
function tab(id) {
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    
    screens.forEach(e => e.classList.remove('active'));
    navItems.forEach(e => e.classList.remove('active'));
    
    const targetScreen = document.getElementById('screen-' + id);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    const navMap = ['daily', 'budget', 'status', 'history', 'alloc', 'settings'];
    const idx = navMap.indexOf(id);
    if (navItems[idx]) {
        navItems[idx].classList.add('active');
    }

    if (id === 'daily') renderDailyInputs();
    if (id === 'budget') renderBudgetLogic();
    if (id === 'status') renderStatusLogic(); 
    if (id === 'history') renderHistory();
    if (id === 'alloc') renderAllocInputs();
    
    window.scrollTo(0,0);
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme_v3', theme);
    document.body.setAttribute('data-theme', theme);
}

// --- 3. PHÂN BỔ (ALLOC) - GỐC RỄ ---

function renderAllocInputs() {
    const totalEl = document.getElementById('base-total-budget');
    if (totalEl) totalEl.value = appData.totalBudget || '';
    
    const container = document.getElementById('alloc-wallets-container');
    if (!container) return;
    
    container.innerHTML = ''; 

    appData.wallets.forEach((w, index) => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.style = "flex-direction: column; align-items: stretch; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px;";
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                <span style="font-weight:bold; font-size: 15px;">${w.name}</span>
                <button class="btn-del-text" onclick="deleteWallet(${index})">XÓA VÍ</button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; color:#666;">Ngân sách:</span>
                <div class="k-input-wrapper">
                    <input type="number" value="${w.alloc || ''}" onchange="updateWalletAlloc(${index}, this.value)" placeholder="0">
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    previewSaving();
}

function addNewWallet() {
    const name = prompt("Nhập tên ví mới (Ví dụ: Trà sữa):");
    if (name) {
        appData.wallets.push({
            id: Date.now(),
            name: name,
            alloc: 0,
            spent: 0,
            lastInput: 0,
            note: ""
        });
        saveDB();
        renderAllocInputs();
    }
}

function deleteWallet(index) {
    const w = appData.wallets[index];
    showNeonConfirm(`CẢNH BÁO: Bạn có chắc muốn xóa ví "${w.name.toUpperCase()}"?\nDữ liệu sẽ mất vĩnh viễn!`, () => {
        appData.wallets.splice(index, 1);
        saveDB();
        renderAllocInputs();
    });
}

function updateWalletAlloc(index, val) {
    appData.wallets[index].alloc = Number(val);
    previewSaving(); 
}

function updateBaseTotal(val) {
    appData.totalBudget = Number(val);
    previewSaving();
}

function previewSaving() {
    const total = appData.totalBudget || 0;
    const allocated = appData.wallets.reduce((sum, w) => sum + (w.alloc || 0), 0);
    const display = document.getElementById('preview-saving-calc');
    if(display) display.innerText = (total - allocated).toLocaleString('vi-VN') + " K";
}

// Hàm Lưu Phân Bổ: Kích hoạt ngày đầu kỳ
function saveAllocConfig() {
    saveDB();
    const now = new Date();
    const d = now.getDate().toString().padStart(2,'0');
    const m = (now.getMonth()+1).toString().padStart(2,'0');
    const y = now.getFullYear();
    const startDateString = `${d}/${m}/${y}`;
    
    localStorage.setItem('AURA_START_DATE', startDateString);
    showNeonAlert("Đã lưu cấu trúc Ví & Đặt mốc ĐẦU KỲ: " + startDateString);
    tab('daily'); 
}

// --- 4. NHẬP LIỆU (DAILY INPUT) ---

function renderStartDate() {
    const mTitle = document.getElementById('display-month-title');
    const startDate = localStorage.getItem('AURA_START_DATE');
    
    const oldEl = document.getElementById('start-date-display');
    if(oldEl) oldEl.remove();

    if(startDate && mTitle) {
        const div = document.createElement('div');
        div.id = 'start-date-display';
        div.className = 'start-date-display';
        div.innerText = `Đầu kỳ: ${startDate}`;
        mTitle.parentNode.insertBefore(div, mTitle.nextSibling);
    }
}

function renderDailyInputs() {
    renderStartDate(); 

    const container = document.getElementById('daily-wallets-list');
    if (!container) return;
    
    container.innerHTML = '';

    if (appData.wallets.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Chưa có ví nào.<br>Hãy sang mục Phân bổ ⚙️ để tạo.</p>';
        return;
    }

    appData.wallets.forEach((w, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="group-title">${w.name}</div>
            
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <input type="number" id="inp-${w.id}" placeholder="Nhập số thêm..." style="flex:1;">
                <button class="btn-mini btn-save" onclick="saveTransaction(${index})">Lưu</button>
                <button class="btn-mini btn-undo" onclick="undoTransaction(${index})">Xóa</button>
            </div>

            <input type="text" id="note-${w.id}" value="${w.note || ''}" onchange="updateNote(${index}, this.value)" 
                   placeholder="Ghi chú cho mục này..." style="font-size:14px; color:#666; font-style:italic; margin-bottom:10px; text-align:left; width: 100%; box-sizing: border-box;">

            <div class="total-row">
                Đã dùng: <span id="display-${w.id}">${fmt(w.spent * 1000)}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function saveTransaction(index) {
    const w = appData.wallets[index];
    const inputEl = document.getElementById(`inp-${w.id}`);
    const val = Number(inputEl.value);

    if (val > 0) {
        w.spent += val;      
        w.lastInput = val;   
        saveDB();
        inputEl.value = '';
        document.getElementById(`display-${w.id}`).innerText = fmt(w.spent * 1000);
    }
}

function undoTransaction(index) {
    const w = appData.wallets[index];
    if (w.lastInput > 0) {
        showNeonConfirm(`Hoàn tác lệnh vừa nhập: trừ lại ${w.lastInput}K?`, () => {
            w.spent -= w.lastInput;
            w.lastInput = 0; 
            saveDB();
            document.getElementById(`display-${w.id}`).innerText = fmt(w.spent * 1000);
        });
    } else {
        showNeonAlert("Không có lệnh nhập mới nào để xóa!");
    }
}

function updateNote(index, val) {
    appData.wallets[index].note = val;
    saveDB();
}

// --- 5. BIẾN ĐỘNG & TÌNH HÌNH ---

function renderBudgetLogic() {
    const totalBudget = appData.totalBudget * 1000;
    const spentTotal = appData.wallets.reduce((s, w) => s + (w.spent || 0), 0) * 1000;
    const allocated = appData.wallets.reduce((s, w) => s + (w.alloc || 0), 0) * 1000;

    const displaySaving = document.getElementById('static-saving-display');
    if (displaySaving) displaySaving.innerText = fmt(totalBudget - allocated) + " VNĐ";

    const container = document.getElementById('budget-details');
    if (container) {
        let html = '';
        appData.wallets.forEach(w => {
            const wAlloc = (w.alloc || 0) * 1000;
            const wSpent = (w.spent || 0) * 1000;
            const remain = wAlloc - wSpent;
            const isNeg = remain < 0;
            
            html += `<div class="budget-row">
                        <span>${w.name}</span>
                        <span class="budget-val ${isNeg ? 'text-red' : 'text-green'}">${fmt(remain)}</span>
                     </div>`;
        });
        container.innerHTML = html;
    }

    const actualBalance = totalBudget - spentTotal;
    const balEl = document.getElementById('actual-balance-display');
    const balBox = document.getElementById('balance-box-ui');
    
    if (balEl && balBox) {
        balEl.innerText = fmt(actualBalance) + " VNĐ";
        if (actualBalance < 0) {
            balEl.className = 'balance-value text-red';
            balBox.className = 'balance-box border-red';
        } else {
            balEl.className = 'balance-value text-green';
            balBox.className = 'balance-box';
        }
    }
}

function renderStatusLogic() {
    const totalBudget = appData.totalBudget * 1000;
    const totalSpent = appData.wallets.reduce((sum, w) => sum + (w.spent || 0), 0) * 1000;
    const balance = totalBudget - totalSpent;

    let percent = 0;
    if (totalBudget > 0) percent = (balance / totalBudget) * 100;
    else percent = balance < 0 ? -1 : 0;

    const percentEl = document.getElementById('hologram-percent');
    if(percentEl) percentEl.innerText = percent.toFixed(1) + "%";
    
    let statusText = "Ổn định";
    if(percent >= 75) statusText = "Rất tốt";
    else if(percent >= 50) statusText = "Tốt";
    else if(percent >= 25) statusText = "Cẩn thận";
    else if(percent >= 0) statusText = "Nguy hiểm";
    else statusText = "Vỡ nợ";
    
    const statusTextEl = document.getElementById('hologram-status-text');
    if(statusTextEl) statusTextEl.innerText = statusText;
    
    if(typeof updateVisuals === "function") updateVisuals(percent);
}

// --- 6. LOGIC LỊCH SỬ & KẾT THÚC THÁNG ---

function endMonth(isAuto = false) {
    const executeSettle = () => {
        const totalSpent = appData.wallets.reduce((sum, w) => sum + (w.spent || 0), 0) * 1000;
        const totalBudget = appData.totalBudget * 1000;
        const finalBalance = totalBudget - totalSpent;

        let snapshotData = appData.wallets.map(w => ({
            name: w.name,
            spent: w.spent * 1000,
            note: w.note
        }));

        const now = new Date();
        const d = now.getDate().toString().padStart(2,'0');
        const m = (now.getMonth()+1).toString().padStart(2,'0');
        const y = now.getFullYear();
        const endDateString = `${d}/${m}/${y}`;
        
        let startDateString = localStorage.getItem('AURA_START_DATE') || "??/??/????";
        
        let daysText = "";
        if (startDateString !== "??/??/????") {
            const parts = startDateString.split('/');
            const startObj = new Date(parts[2], parts[1]-1, parts[0]);
            const endObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = Math.abs(endObj - startObj);
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
            daysText = `(${diffDays} ngày)`;
        }

        const fullDateString = `${startDateString} - ${endDateString} ${daysText}`;

        const record = {
            id: Date.now(),
            name: mName,
            date: fullDateString,
            balance: finalBalance,
            details: snapshotData
        };

        const hist = JSON.parse(localStorage.getItem('hist_v3')) || [];
        hist.unshift(record);
        localStorage.setItem('hist_v3', JSON.stringify(hist));

        appData.totalBudget = 0;
        appData.wallets.forEach(w => {
            w.alloc = 0; 
            w.spent = 0; 
            w.lastInput = 0;
            w.note = "";
        });
        saveDB();
        
        localStorage.removeItem('AURA_START_DATE');

        if(isAuto) {
             localStorage.setItem('AURA_LAST_SYNC', new Date().toISOString());
        }

        if(!isAuto) showNeonAlert("Đã kết toán & Lưu vào lịch sử!");
        tab('history');
    };

    if (isAuto) {
        executeSettle(); 
    } else {
        showNeonConfirm("Xác nhận KẾT THÚC KỲ?\n(Dữ liệu sẽ được lưu và ví sẽ về 0)", executeSettle);
    }
}

function renderHistory() {
    const hist = JSON.parse(localStorage.getItem('hist_v3')) || [];
    const container = document.getElementById('history-list');
    
    if(!container) return;

    if(hist.length === 0) { 
        container.innerHTML = '<p style="text-align:center;color:#999;margin-top:30px;">Chưa có lịch sử</p>'; 
        return; 
    }

    container.innerHTML = hist.map(h => {
        let detailHtml = '';
        if (h.details && Array.isArray(h.details)) {
             detailHtml = h.details.map(d => `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px dashed #eee; padding-bottom:5px;">
                    <div>
                        <div>${d.name}</div>
                        ${d.note ? `<i style="font-size:11px; color:#888;">"${d.note}"</i>` : ''}
                    </div>
                    <b>${fmt(d.spent)}</b>
                </div>
            `).join('');
        } else {
            detailHtml = '<i style="font-size:12px; color:#999;">Dữ liệu cũ</i>';
        }

        return `
            <div class="card history-card" style="padding: 10px !important;">
                <div class="history-header" onclick="this.nextElementSibling.classList.toggle('show')" style="display: block !important; text-align: left;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom: 5px; color: var(--neon);">${h.name}</div>
                    
                    <div style="font-weight:900; font-size:20px; margin-bottom: 8px; ${h.balance < 0 ? 'color:var(--danger)' : 'color:var(--success)'}">
                        ${h.balance < 0 ? '' : 'Dư: '}${fmt(h.balance)}
                    </div>

                    <div class="history-date-range" style="border-top: 1px solid rgba(0, 242, 255, 0.1); padding-top: 8px; opacity: 0.8;">
                        ${h.date}
                    </div> 
                </div>
                <div class="history-details">
                    ${detailHtml}
                    <button onclick="delHist(${h.id})" style="color:var(--danger); background:none; border:1px solid var(--danger); width:100%; margin-top:15px; border-radius:8px; padding:10px; font-weight:bold;">🗑️ Xóa bản ghi này</button>
                </div>
            </div>
        `;
    }).join('');
}

function delHist(id) {
    showNeonConfirm("Xóa bản ghi lịch sử này?", () => {
        let hist = JSON.parse(localStorage.getItem('hist_v3')) || [];
        hist = hist.filter(h => h.id !== id);
        localStorage.setItem('hist_v3', JSON.stringify(hist));
        renderHistory();
    });
}

function updateMonthName() {
    const val = document.getElementById('month-name-inp').value;
    if(val) {
        mName = val;
        localStorage.setItem('mName_v3', mName);
        document.getElementById('display-month-title').innerText = mName;
        showNeonAlert("Đã đổi tên tháng thành công!");
    }
}

// --- 7. KÍCH HOẠT HỆ THỐNG & LỄ TÂN ĐIỀU PHỐI (QUAN TRỌNG) ---

// [UPDATE V9.0] Hàm Kiểm tra Tự động Kết toán - BẢO MẬT CHẶN LỆNH MA
function checkAutoSettle() {
    // 1. KIỂM TRA QUYỀN HẠN
    const clearance = localStorage.getItem('AURA_CLEARANCE_LEVEL') || 'INITIATOR-0';
    const isAuthorized = clearance.includes('ARCHITECT') || clearance.includes('ORCHESTRATOR');

    const status = localStorage.getItem('AURA_TIME_STATUS');

    // 2. CHẶN VÀ HỦY DỮ LIỆU NẾU MẤT QUYỀN HẠN
    if (status === 'ACTIVE' && !isAuthorized) {
        console.warn("BẢO MẬT: Phát hiện chu kỳ tự động của User không đủ quyền hạn. Đang tiến hành hủy...");
        localStorage.removeItem('AURA_TIME_STATUS');
        localStorage.removeItem('AURA_TIME_MODE');
        localStorage.removeItem('AURA_LAST_SYNC');
        return; 
    }

    // 3. NẾU KHÔNG CÓ LỆNH HOẶC CHƯA KÍCH HOẠT THÌ BỎ QUA
    if (status !== 'ACTIVE' || !isAuthorized) return;

    // 4. LOGIC TÍNH TOÁN THỜI GIAN
    const mode = localStorage.getItem('AURA_TIME_MODE');
    const lastSyncStr = localStorage.getItem('AURA_LAST_SYNC');
    
    if (!lastSyncStr) return;
    if (appData.totalBudget === 0 && appData.wallets.length === 0) return;

    const lastSync = new Date(lastSyncStr);
    const now = new Date();
    const d1 = new Date(lastSync.getFullYear(), lastSync.getMonth(), lastSync.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    let shouldSettle = false;
    if (mode === 'day' && now.getDate() !== lastSync.getDate()) shouldSettle = true;
    else if (mode === 'week' && diffDays >= 7) shouldSettle = true;
    else if (mode === 'month' && now.getMonth() !== lastSync.getMonth()) shouldSettle = true;
    else if (mode === 'cycle30' && diffDays >= 30) shouldSettle = true;

    // 5. THỰC THI KẾT TOÁN
    if (shouldSettle) {
        console.log("AUTO SETTLE AUTHORIZED & TRIGGERED!");
        endMonth(true); 
    }
}

// KHỞI ĐỘNG HỆ THỐNG
window.onload = function() {
    const mInput = document.getElementById('month-name-inp');
    if (mInput) mInput.value = mName;
    
    const mTitle = document.getElementById('display-month-title');
    if (mTitle) mTitle.innerText = mName;
    
    document.body.setAttribute('data-theme', theme);
    
    // 1. Chạy Lễ tân tự động
    checkAutoSettle();

    // 2. Xử lý điều hướng từ Sảnh
    const params = new URLSearchParams(window.location.search);
    const targetTask = params.get('task');

    if (targetTask) {
        tab(targetTask);
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.display = 'none'; // Đã thêm lệnh ẩn màn hình chờ!
    } else {
        tab('daily');
    }
    
    console.log("System V9.0 Active - Core Fixed & Security Ready");
};
