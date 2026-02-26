(function () {
    const titleEl = document.querySelector(".product-info-title");
    const productTitle = titleEl ? titleEl.innerText.trim() : "Không tìm thấy Product Title";

    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.5);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
        background:#fff;
        padding:20px;
        border-radius:8px;
        width:600px;
        text-align:center;
        box-shadow:0 5px 15px rgba(0,0,0,0.3);
    `;

    popup.innerHTML = `
        <h3>Current URL:</h3>
        <p style="word-break: break-all; font-size: 12px; color: #666;">${window.location.href}</p>
        <h3>Product Title:</h3>
        <p>${productTitle}</p>
        <button id="closePopupBtn" style="margin-top:15px;padding:8px 12px;cursor:pointer;">
            Close
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("closePopupBtn").onclick = () => overlay.remove();

    // Auto-click pagination next button
    let clickCount = 0;
    const maxClicks = 10;
    const clickInterval = setInterval(() => {
        const nextLi = document.querySelector('.a-last');
        const nextBtn = nextLi ? nextLi.querySelector('a') : null;

        if (!nextLi || nextLi.classList.contains('a-disabled') || !nextBtn) {
            console.log("Đã đến trang cuối hoặc nút chuyển trang bị vô hiệu hóa.");
            clearInterval(clickInterval);
            return;
        }

        if (clickCount < maxClicks) {
            console.log(`Auto-clicking next page (${clickCount + 1}/${maxClicks})`);
            nextBtn.click();
            clickCount++;
        } else {
            console.log("Đã đạt giới hạn click (10 lần)");
            clearInterval(clickInterval);
        }
    }, 5000);

})();