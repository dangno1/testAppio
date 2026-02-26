(function () {
    const isSupportedPage = window.location.href.includes("product-reviews");

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
        border-radius:12px;
        width:500px;
        box-shadow:0 10px 30px rgba(0,0,0,0.2);
        overflow:hidden;
        font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    `;

    if (!isSupportedPage) {
        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <span style="font-weight: 600; font-size: 16px; color: #202223;">Unsupported page</span>
                <button id="closeUnsupported" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                </button>
            </div>
            <div style="padding: 20px;">
                <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; color: #332b00;">
                    <svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-13a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg>
                    <span style="font-size: 14px; line-height: 20px;">This page is not supported. Go to a product or reviews page to use the importer.</span>
                </div>
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.getElementById("closeUnsupported").onclick = () => overlay.remove();
        return;
    }

    const titleEl = document.querySelector(".product-info-title");
    const productTitle = titleEl ? titleEl.innerText.trim() : "Không tìm thấy Product Title";

    popup.style.padding = "20px";
    popup.style.width = "600px";
    popup.style.textAlign = "center";

    popup.innerHTML = `
        <h3>Current URL:</h3>
        <p id="current-url" style="word-break: break-all; font-size: 12px; color: #666;">${window.location.href}</p>
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
        const urlEl = document.getElementById('current-url');
        if (urlEl) urlEl.textContent = window.location.href;

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