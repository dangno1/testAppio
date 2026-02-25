(function() {
    const titleEl = document.querySelector(".product-title");
    const productTitle = titleEl ? titleEl.innerText : "Không tìm thấy Product Title";

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    const popup = document.createElement("div");
    popup.style.background = "#fff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.width = "300px";
    popup.style.textAlign = "center";
    popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";

    popup.innerHTML = `
        <h3>Product Title:</h3>
        <p>${productTitle}</p>
        <button id="closePopupBtn" style="margin-top:15px;padding:8px 12px;cursor:pointer;">
            Đóng
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.getElementById("closePopupBtn").onclick = function() {
        overlay.remove();
    };

    setTimeout(function() {
        const btn = document.getElementById("writeReviewButton");
        if (btn) {
            btn.click();
        }
    }, 2000);

})();