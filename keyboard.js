/* --- AURA KEYPAD LOGIC (CLEAN VERSION) --- */

const AuraKeypad = {
    currentCode: "",
    maxLen: 8, 
    callback: null,

    // Khởi tạo
    init: function(submitCallback) {
        this.currentCode = ""; 
        this.callback = submitCallback;
        this.renderToScreen("");
        
        // Tự động kiểm tra nút Back
        this.checkBackButton();
        
        console.log("🛡️ Keypad System: READY (No Effects)");
    },

    // Kiểm tra hiển thị nút Back
    checkBackButton: function() {
        const backBtn = document.getElementById('kp-back-btn');
        if (backBtn) {
            const path = window.location.pathname;
            if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
                backBtn.style.display = 'none';
            } else {
                backBtn.style.display = 'flex';
            }
        }
    },

    // Xử lý khi bấm số
    press: function(num, event) {
        // Đã xóa triggerExplosion
        if (this.currentCode.length < this.maxLen) {
            this.currentCode += num;
            this.renderToScreen(this.currentCode);
        }
    },

    // Nút Xóa (Backspace)
    clear: function(event) {
        // Đã xóa triggerExplosion
        if (this.currentCode.length > 0) {
            this.currentCode = this.currentCode.slice(0, -1);
        }
        this.renderToScreen(this.currentCode);
        
        const display = document.querySelector('.neon-display');
        if(display) display.classList.remove('display-error');
    },

    // Xử lý nút OK
    submit: function(event) {
        // Đã xóa triggerExplosion
        if (this.callback) {
            this.callback(this.currentCode);
        }
    },

    // Hàm hiển thị lỗi
    showError: function(msg) {
        const display = document.querySelector('.neon-display');
        if (display) {
            display.innerText = msg || "ERROR";
            display.classList.add('display-error');
            
            setTimeout(() => {
                this.currentCode = ""; 
                this.renderToScreen("");
                display.classList.remove('display-error');
            }, 1000);
        }
    },

    // Render lên màn hình
    renderToScreen: function(code) {
        const display = document.querySelector('.neon-display');
        if (display) {
            display.innerText = code;
        }
    }
};
