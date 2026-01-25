/* =================================================================
   FILE MAGIC: CHỨA HIỆU ỨNG VÀ XỬ LÝ ẢNH NỀN
   ================================================================= */

function updateVisuals(percent) {
    const display = document.getElementById('display-area');
    const effectContainer = document.getElementById('visual-effect');
    
    // Kiểm tra nếu phần tử tồn tại mới chạy (tránh lỗi khi ở trang khác)
    if (!display || !effectContainer) return; 

    effectContainer.innerHTML = ''; // Xóa hiệu ứng cũ

    // LƯU Ý: CÁC LINK ẢNH NẰM Ở ĐÂY - MUỐN ĐỔI ẢNH THÌ SỬA Ở ĐÂY
    if (percent >= 75) {
        display.style.backgroundImage = "url('sakura.jpg')";
        createParticles('petal', 30);
    } else if (percent >= 50) {
        display.style.backgroundImage = "url('summer.jpg')";
        createParticles('sun', 1);
    } else if (percent >= 25) {
        display.style.backgroundImage = "url('fall.jpg')";
        createParticles('rain-drop', 100);
    } else if (percent >= 0) {
        display.style.backgroundImage = "url('winter.jpg')";
        createParticles('snow-flake', 50);
    } else {
        display.style.backgroundImage = "url('zero.jpg')";
        createParticles('bubble', 40);
    }
}

function createParticles(type, count) {
    const container = document.getElementById('visual-effect');
    if (!container) return; // An toàn
    
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
    // 1. Ẩn nút Start, Hiện thanh Loading
    document.getElementById('intro-ui').style.display = 'none';
    document.getElementById('loading-container').style.display = 'flex';
    
    let percent = 0; 
    const text = document.getElementById('load-percent');
    
    // 2. Chạy giả lập Loading
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 12) + 3;
        if (percent > 100) percent = 100; 
        text.innerText = percent + "%";
        
        // 3. Khi đạt 100% -> CHUYỂN HƯỚNG SANG SẢNH HOLOGRAM
        if (percent === 100) {
            clearInterval(interval);
            setTimeout(() => {
                // Thay vì ẩn Splash, ta bay thẳng sang file sảnh
                window.location.href = './hologram0.html'; 
            }, 500);
        }
    }, 120);
}
