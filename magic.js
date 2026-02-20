/* =================================================================
   FILE MAGIC: CHỨA HIỆU ỨNG VÀ XỬ LÝ ẢNH NỀN (FIXED JITTER)
   ================================================================= */

// Biến toàn cục để theo dõi trạng thái ảnh hiện tại, tránh nạp lại thừa gây giật
let lastVisualState = null;

function updateVisuals(percent) {
    const display = document.getElementById('display-area');
    const effectContainer = document.getElementById('visual-effect');
    
    if (!display || !effectContainer) return; 

    // 1. XÁC ĐỊNH TRẠNG THÁI MỚI DỰA TRÊN PERCENT
    let newState = "";
    let imgUrl = "";
    let pType = "";
    let pCount = 0;

    if (percent >= 75) {
        newState = "sakura";
        imgUrl = "url('sakura.jpg')";
        pType = 'petal'; pCount = 30;
    } else if (percent >= 50) {
        newState = "summer";
        imgUrl = "url('summer.jpg')";
        pType = 'sun'; pCount = 1;
    } else if (percent >= 25) {
        newState = "fall";
        imgUrl = "url('fall.jpg')";
        pType = 'rain-drop'; pCount = 100;
    } else if (percent >= 0) {
        newState = "winter";
        imgUrl = "url('winter.jpg')";
        pType = 'snow-flake'; pCount = 50;
    } else {
        newState = "zero";
        imgUrl = "url('zero.jpg')";
        pType = 'bubble'; pCount = 40;
    }

    // 2. CHỐT CHẶN: CHỈ CẬP NHẬT NẾU TRẠNG THÁI THAY ĐỔI
    // Nếu trạng thái giống hệt lần trước, thoát hàm ngay để ảnh không bị giật
    if (lastVisualState === newState) return;

    // Ghi nhận trạng thái mới
    lastVisualState = newState;

    // Cập nhật ảnh nền (Lúc này Transition 1s trong design.css sẽ chạy mượt mà)
    display.style.backgroundImage = imgUrl;

    // Làm sạch và tạo lại hiệu ứng hạt (Chỉ chạy 1 lần khi đổi trạng thái)
    effectContainer.innerHTML = ''; 
    if (pType) {
        createParticles(pType, pCount);
    }
}

// --- CÁC PHẦN DƯỚI ĐÂY GIỮ NGUYÊN TUYỆT ĐỐI THEO FILE CŨ ---

function createParticles(type, count) {
    const container = document.getElementById('visual-effect');
    if (!container) return; 
    
    if (type === 'sun') {
        const beam = document.createElement('div');
        beam.className = 'sun-beam';
        beam.style.animationDelay = '-' + (Math.random() * 20) + 's';
        container.appendChild(beam);

        for(let i=0; i<20; i++) {
            const dust = document.createElement('div');
            dust.className = 'sun-dust';
            dust.style.left = Math.random() * 100 + 'vw';
            dust.style.width = (Math.random() * 4 + 2) + 'px';
            dust.style.height = dust.style.width;
            dust.style.animationDuration = (Math.random() * 5 + 3) + 's';
            dust.style.animationDelay = '-' + (Math.random() * 10) + 's';
            container.appendChild(dust);
        }
        return;
    }

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = type;
        div.style.left = Math.random() * 100 + 'vw';
        div.style.animationDuration = (Math.random() * 3 + 2) + 's';
        div.style.animationDelay = '-' + (Math.random() * 10) + 's'; 
        
        if (type === 'bubble' || type === 'petal' || type === 'snow-flake') {
            const size = Math.random() * 15 + 5 + 'px';
            div.style.width = size;
            div.style.height = size;
        }
        container.appendChild(div);
    }
}

function startLoading() {
    document.getElementById('intro-ui').style.display = 'none';
    document.getElementById('loading-container').style.display = 'flex';
    
    let percent = 0; 
    const text = document.getElementById('load-percent');
    
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 12) + 3;
        if (percent > 100) percent = 100; 
        text.innerText = percent + "%";
        
        if (percent === 100) {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = './hologram0.html'; 
            }, 500);
        }
    }, 120);
}
