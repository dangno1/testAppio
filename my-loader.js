(function () {
    const isSupportedPage = window.location.href.includes("product-reviews");

    // Data Storage
    const allReviews = [];
    const importToken = window.LAI_IMPORT_TOKEN || "";
    const asinMatch = window.location.href.match(/\/product-reviews\/([A-Z0-9]{10})/) || window.location.href.match(/\/dp\/([A-Z0-9]{10})/);
    const productId = asinMatch ? asinMatch[1] : "N/A";

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

    const recentOption = document.querySelector("#sort-order-dropdown_1");
    if (recentOption) {
        recentOption.click();
        console.log("-------------------------------------------abc---------------")
    }

    const titleEl = document.querySelector(".product-info-title");
    const productTitle = titleEl ? titleEl.innerText.trim() : "Product Title not found";

    popup.style.padding = "20px";
    popup.style.width = "600px";
    popup.style.textAlign = "center";

    popup.innerHTML = `
        <h3 style="margin-bottom: 5px;">Current URL:</h3>
        <p id="current-url" style="word-break: break-all; font-size: 12px; color: #666; margin-bottom: 15px;">${window.location.href}</p>
        <h3 style="margin-bottom: 5px;">Product Title:</h3>
        <p style="margin-bottom: 15px;">${productTitle}</p>
        
        <div style="background: #f4f6f8; border-radius: 8px; padding: 15px; margin-bottom: 15px; border: 1px solid #e1e3e5;">
            <p style="font-size: 16px; font-weight: 600; color: #008060; margin: 0;">Reviews Collected: <span id="review-count">0</span></p>
        </div>

        <button id="closePopupBtn" style="padding:8px 24px; cursor:pointer; background: #fff; border: 1px solid #babfc3; border-radius: 8px; font-weight: 600;">
            Close
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("closePopupBtn").onclick = () => overlay.remove();

    function scrapeReviews() {
        const reviewElements = document.querySelectorAll('[data-hook="review"]');
        let addedCount = 0;

        reviewElements.forEach(el => {
            const reviewId = el.id;
            if (!reviewId || allReviews.some(r => r.referrenceId === reviewId)) return;

            const name = el.querySelector('.a-profile-name')?.innerText.trim() || "";
            const ratingText = el.querySelector('.review-rating .a-icon-alt')?.innerText || "";
            const rating = parseFloat(ratingText.split(' ')[0]) || 0;
            const time = el.querySelector('.review-date')?.innerText.trim() || "";
            const content = el.querySelector('.review-text-content span')?.innerText.trim() || "";

            const photos = [];
            el.querySelectorAll('.review-image-tile').forEach(img => {
                photos.push(img.src);
            });

            // Identify country from "Reviewed in the [Country] on..." text
            const countryMatch = time.match(/Reviewed in (?:the )?(.+?) on/);
            const country = countryMatch ? countryMatch[1] : "";

            allReviews.push({
                shopOrigin: "test-test-appio.myshopify.com",
                productId: productId,
                referrenceId: reviewId,
                customer: name,
                country: country,
                rating: rating,
                title: name,
                body: content,
                createdAt: time,
                images: photos,
                originalImages: photos,
                videos: [],
                status: "published",
                source: "amazon",
                hashId: reviewId,
                batchId: Date.now().toString(),
            });
            addedCount++;
        });

        const countEl = document.getElementById('review-count');
        if (countEl) countEl.textContent = allReviews.length;

        const urlEl = document.getElementById('current-url');
        if (urlEl) urlEl.textContent = window.location.href;

        if (addedCount > 0) {
            console.log(`Scraped ${addedCount} new reviews. Total: ${allReviews.length}`);
            console.log("Current Data Object:", {
                from: "amazon",
                importToken,
                productId,
                review: allReviews
            });
        }
    }

    scrapeReviews();

    // Auto-click pagination next button
    let clickCount = 0;
    const maxClicks = 10;
    const clickInterval = setInterval(() => {
        scrapeReviews();

        const nextLi = document.querySelector('.a-last');
        const nextBtn = nextLi ? nextLi.querySelector('a') : null;

        if (!nextLi || nextLi.classList.contains('a-disabled') || !nextBtn) {
            console.log("You have reached the last page or the page navigation button is disabled");
            clearInterval(clickInterval);
            scrapeReviews();
            console.log("FINAL DATA OBJECT:", {
                from: "amazon",
                importToken,
                productId,
                review: allReviews
            });
            return;
        }

        if (clickCount < maxClicks) {
            console.log(`Auto-clicking next page (${clickCount + 1}/${maxClicks})`);
            console.log("Next page URL:", nextBtn.href);
            nextBtn.click();
            clickCount++;
        } else {
            console.log("Reached maximum click limit (10 times)");
            clearInterval(clickInterval);
            console.log("FINAL DATA OBJECT:", {
                from: "amazon",
                importToken,
                productId,
                review: allReviews
            });
        }
    }, 2000);

})();