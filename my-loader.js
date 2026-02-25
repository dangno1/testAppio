(function() {
    alert("dangnd");

    // Log product title (nên kiểm tra tồn tại để tránh lỗi)
    const titleEl = document.querySelector(".product-title");
    if (titleEl) {
        console.log("Product Title:", titleEl.innerText);
    }

    setTimeout(function() {
        const btn = document.getElementById("writeReviewButton");
        if (btn) {
            btn.click();
            console.log("Đã click writeReviewButton");
        } else {
            console.log("Không tìm thấy writeReviewButton");
        }
    }, 2000);

})();