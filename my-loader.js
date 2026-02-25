(function() {
    const titleEl = document.querySelector("#productTitle");
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
        width:350px;
        text-align:center;
        box-shadow:0 5px 15px rgba(0,0,0,0.3);
    `;

    popup.innerHTML = `
        <h3>Product Title:</h3>
        <p>${productTitle}</p>
        <button id="closePopupBtn" style="margin-top:15px;padding:8px 12px;cursor:pointer;">
            Đóng
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("closePopupBtn").onclick = () => overlay.remove();

    setTimeout(function() {
        const btn = document.querySelector('[data-hook="write-review-button"]');
        if (btn) {
            btn.click();
            console.log("Đã click Write a review");
        } else {
            console.log("Không tìm thấy nút Write a review");
        }

    }, 2000);

})();