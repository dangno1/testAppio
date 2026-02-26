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

    setTimeout(function () {
        const btn = document.querySelector('#writeReviewButton') ||
            document.querySelector('[data-hook="write-review-button"]') ||
            document.querySelector('a[href*="/review/create-review"]');

        if (btn) {
            console.log("Tìm thấy nút Write a review:", btn);
            const link = btn.tagName === 'A' ? btn : btn.querySelector('a');

            if (link && link.href) {
                console.log("Thực hiện chuyển hướng đến:", link.href);
                window.location.href = link.href;
            } else {
                console.log("Không tìm thấy thẻ link, thử dispatch MouseEvent trên nút");
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                btn.dispatchEvent(clickEvent);
            }
        } else {
            console.log("Không tìm thấy nút Write a review. Hãy kiểm tra lại selector.");
        }
    }, 5000);

})();