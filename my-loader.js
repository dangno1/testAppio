(function () {
    const isReviewPage = window.location.href.includes("product-reviews");
    const isDetailPage = window.location.href.includes("/dp/") || window.location.href.includes("/gp/product/");

    // Data Storage
    const allReviews = [];
    let reviewSummary = { totalRatings: "", average: "", count: [] };
    const importToken = window.APPIO_IMPORT_TOKEN || "";
    const shopDomain = window.APPIO_SHOP_DOMAIN || "";
    const asinMatch = window.location.href.match(/\/product-reviews\/([A-Z0-9]{10})/) || window.location.href.match(/\/dp\/([A-Z0-9]{10})/) || window.location.href.match(/\/gp\/product\/([A-Z0-9]{10})/);
    const productId = asinMatch ? asinMatch[1] : "N/A";

    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.3);
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

    if (!isReviewPage) {
        if (isDetailPage && productId !== "N/A") {
            const reviewsUrl = `${window.location.origin}/product-reviews/${productId}/ref=cm_cr_arp_d_viewopt_srt?pageNumber=1&sortBy=recent`;
            popup.innerHTML = `
                <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                    <span style="font-weight: 600; font-size: 16px; color: #202223;">Warning</span>
                    <button id="closeWarning" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                        <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                    </button>
                </div>
                <div style="padding: 20px;">
                    <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; color: #332b00;">
                        <svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0; margin-top: 2px;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
                        <span style="font-size: 14px; line-height: 20px;">This is not the reviews page. <a href="${reviewsUrl}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">Click here</a> to go to the reviews page to start importing.</span>
                    </div>
                </div>
            `;
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            document.getElementById("closeWarning").onclick = () => overlay.remove();
        } else {
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
        }
        return;
    }

    // ===== REVIEW PAGE: Show "Prepare to collect reviews" popup =====

    if (!window.location.href.includes("sortBy=recent")) {
        const sortBtn = document.querySelector("#a-autoid-2-announce");
        if (sortBtn) {
            sortBtn.click();
            setTimeout(() => {
                const recentOption = document.querySelector("#sort-order-dropdown_1");
                if (recentOption) {
                    recentOption.click();
                }
            }, 300);
        }
    }

    let selectedProduct = "";

    popup.innerHTML = `
        <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
            <span style="font-weight: 600; font-size: 16px; color: #202223;">Prepare to collect reviews</span>
            <button id="appio-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
            </button>
        </div>

        <div style="padding: 20px;">
            <label style="font-size: 14px; font-weight: 500; color: #202223; display: block; margin-bottom: 8px;">Select product</label>
            <div style="position: relative;">
                <svg viewBox="0 0 20 20" width="16" fill="#8c9196" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;">
                    <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm9.707 4.293-4.82-4.82A5.968 5.968 0 0 0 14 8 6 6 0 0 0 2 8a6 6 0 0 0 6 6 5.968 5.968 0 0 0 3.473-1.113l4.82 4.82a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414z"></path>
                </svg>
                <input id="appio-product-input" type="text" placeholder="Search product"
                    style="width: 100%; padding: 10px 12px 10px 12px; border: 1px solid #c9cccf; border-radius: 8px; font-size: 14px; color: #202223; outline: none; box-sizing: border-box; transition: border-color 0.15s;">
            </div>

            <div id="appio-status-area" style="margin-top: 16px; display: none;">
                <div style="background: #f4f6f8; border-radius: 8px; padding: 12px 16px; border: 1px solid #e1e3e5;">
                    <p style="font-size: 14px; font-weight: 600; color: #008060; margin: 0;">Reviews Collected: <span id="review-count">0</span></p>
                </div>
                <p id="appio-page-status" style="font-size: 12px; color: #6d7175; margin: 8px 0 0 0;"></p>
            </div>
        </div>

        <div style="padding: 0 20px 20px; display: flex; justify-content: flex-end;">
            <button id="appio-start-btn" disabled
                style="padding: 8px 20px; cursor: not-allowed; background: #e4e5e7; color: #8c9196; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.15s;">
                Start
            </button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById("appio-close-btn");
    const productInput = document.getElementById("appio-product-input");
    const startBtn = document.getElementById("appio-start-btn");
    const statusArea = document.getElementById("appio-status-area");

    closeBtn.onclick = () => overlay.remove();

    // Focus styling for input
    productInput.addEventListener("focus", () => {
        productInput.style.borderColor = "#005bd3";
        productInput.style.boxShadow = "0 0 0 2px rgba(0, 91, 211, 0.2)";
    });
    productInput.addEventListener("blur", () => {
        productInput.style.borderColor = "#c9cccf";
        productInput.style.boxShadow = "none";
    });

    // Enable/disable Start button based on input
    productInput.addEventListener("input", () => {
        selectedProduct = productInput.value.trim();
        if (selectedProduct.length > 0) {
            startBtn.disabled = false;
            startBtn.style.background = "#303030";
            startBtn.style.color = "#fff";
            startBtn.style.cursor = "pointer";
        } else {
            startBtn.disabled = true;
            startBtn.style.background = "#e4e5e7";
            startBtn.style.color = "#8c9196";
            startBtn.style.cursor = "not-allowed";
        }
    });

    // Hover effect for Start button
    startBtn.addEventListener("mouseenter", () => {
        if (!startBtn.disabled) startBtn.style.background = "#1a1a1a";
    });
    startBtn.addEventListener("mouseleave", () => {
        if (!startBtn.disabled) startBtn.style.background = "#303030";
    });

    function scrapeReviewSummary() {
        // Total ratings (e.g. "4,800" or "4 800" or "4.800" global ratings)
        const totalEl = document.querySelector('[data-hook="total-review-count"]');
        const totalText = totalEl?.innerText?.trim() || "";
        const totalMatch = totalText.match(/([\d\s.,\u00A0]+)/);
        const totalRatings = totalMatch ? totalMatch[1].replace(/[\s.,\u00A0]/g, '') : "0";

        // Average rating (e.g. "4.5 out of 5" or "4,5 out of 5")
        const avgEl = document.querySelector('[data-hook="rating-out-of-text"]');
        const avgText = avgEl?.innerText?.trim() || "";
        const avgMatch = avgText.match(/([\d][,.][\d])/);
        const average = avgMatch ? avgMatch[1].replace(',', '.') : "0";

        // Star percentage breakdown (5-star to 1-star)
        const count = [];
        const histogramRows = document.querySelectorAll('#histogramTable li.a-align-center');
        histogramRows.forEach(row => {
            const link = row.querySelector('a.histogram-row-container');
            const ariaLabel = link?.getAttribute('aria-label') || "";
            const pctMatch = ariaLabel.match(/(\d+%)/);
            if (pctMatch) {
                count.push(pctMatch[1]);
            }
        });

        reviewSummary = { totalRatings, average, count: count.reverse() };
    }

    // ===== Scrape logic =====
    function scrapeReviews() {
        scrapeReviewSummary();
        const reviewElements = document.querySelectorAll('[data-hook="review"]');
        let addedCount = 0;

        reviewElements.forEach(el => {
            const reviewId = el.id;
            if (!reviewId || allReviews.some(r => r.referrenceId === reviewId)) return;

            const name = el.querySelector('.a-profile-name')?.innerText.trim() || "";
            const ratingText = el.querySelector('.review-rating .a-icon-alt')?.innerText || "";
            const rating = parseFloat(ratingText.split(' ')[0]) || 0;
            const time = el.querySelector('.review-date')?.innerText.trim() || "";
            const content = el.querySelector('.review-text-content span')?.innerText.trim()
                || el.querySelector('.review-text-content .cr-translated-review-content')?.innerText.trim()
                || el.querySelector('.review-text-content .cr-original-review-content')?.innerText.trim();
            const titleNew = el.querySelector("[data-hook='review-title']")?.innerText.trim() || "";
            const photos = [];
            el.querySelectorAll('[data-hook="review-image-tile"], [data-hook="cmps-review-image-tile"]').forEach(img => {
                let src = img.getAttribute('data-src') || img.src;
                if (src && !src.includes('grey-pixel.gif')) {
                    const fullSizeSrc = src.replace(/\._[A-Z0-9]+_\./g, '.');
                    photos.push(fullSizeSrc);
                }
            });

            const helpfulText = el.querySelector('[data-hook="helpful-vote-statement"]')?.innerText.trim() || "";
            const helpfulMatch = helpfulText.match(/(\d+)/);
            const helpful = helpfulMatch ? parseInt(helpfulMatch[1]) : 0;

            const videos = [];
            el.querySelectorAll('.cr-video-desktop').forEach(v => {
                const url = v.getAttribute('data-video-url');
                if (url) videos.push({ url: url });
            });

            allReviews.push({
                shopOrigin: shopDomain,
                productId: productId,
                referrenceId: reviewId,
                customer: name,
                rating: rating,
                title: titleNew,
                body: content,
                createdAt: time,
                images: photos,
                videos: videos,
                status: "published",
                source: "amazon",
                hashId: reviewId,
                batchId: Date.now().toString(),
                helpful: helpful,
                selectedProduct: selectedProduct,
            });
            addedCount++;
        });

        const countEl = document.getElementById('review-count');
        if (countEl) countEl.textContent = allReviews.length;
    }

    function scrollToElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return el;
    }
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Show Stats Popup after collection =====
    function showStatsPopup() {
        // Calculate stats
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let photoCount = 0;
        allReviews.forEach(r => {
            const s = Math.round(r.rating);
            if (s >= 1 && s <= 5) starCounts[s]++;
            if (r.images && r.images.length > 0) photoCount++;
        });
        const totalReviews = allReviews.length;

        // Try to get product info from Amazon page
        const productTitle = document.querySelector('.product-info-title')?.innerText.trim()
            || selectedProduct || 'Unknown Product';
        const productImg = document.querySelector('#cm_cr-product_info img')?.src
            || document.querySelector('#landingImage')?.src
            || '';

        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: #008060; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">Total reviews collected: ${totalReviews}</span>
                    <button class="stats-view-all-btn" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 12px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                        <svg viewBox="0 0 20 20" width="14" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                        View
                    </button>
                </div>
                <button id="stats-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                </button>
            </div>

            <div style="padding: 20px;">
                <div style="font-size: 13px; font-weight: 600; color: #202223; margin-bottom: 12px;">Stats:</div>
                <div id="stats-rows" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px;">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${[5, 4, 3].map(star => `
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                    <input type="checkbox" class="star-checkbox" data-star="${star}" ${starCounts[star] > 0 ? 'checked' : ''}
                                        style="width: 18px; height: 18px; accent-color: #008060; cursor: pointer;">
                                    <span style="font-size: 14px; color: #202223;">${star}-star:</span>
                                </label>
                                <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${starCounts[star]}</span>
                                <button class="stats-view-star" data-star="${star}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                    <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                    View
                                </button>
                            </div>
                        `).join('')}
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                <input type="checkbox" id="photo-checkbox" checked
                                    style="width: 31px; height: 18px; accent-color: #008060; cursor: pointer;">
                                <span style="font-size: 14px; color: #202223;">Text, image, video</span>
                            </label>
                            <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${photoCount}</span>
                            <button class="stats-view-photo" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                View
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${[2, 1].map(star => `
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                    <input type="checkbox" class="star-checkbox" data-star="${star}" ${starCounts[star] > 0 ? 'checked' : ''}
                                        style="width: 18px; height: 18px; accent-color: #008060; cursor: pointer;">
                                    <span style="font-size: 14px; color: #202223;">${star}-star:</span>
                                </label>
                                <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${starCounts[star]}</span>
                                <button class="stats-view-star" data-star="${star}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                    <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                    View
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-top: 20px; font-size: 13px; font-weight: 600; color: #202223; margin-bottom: 8px;">Product</div>
                <div style="border: 1px solid #e1e3e5; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                    ${productImg ? `<img src="${productImg}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">` : `<div style="width:40px;height:40px;border-radius:6px;background:#f4f6f8;"></div>`}
                    <div>
                        <div style="font-size: 14px; font-weight: 500; color: #202223; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${productTitle}</div>
                    </div>
                </div>
            </div>

            <div style="padding: 12px 20px 20px; display: flex; justify-content: flex-end;">
                <button id="stats-import-btn" style="padding: 10px 24px; background: #008060; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.15s;">
                    Import ${totalReviews} reviews
                </button>
            </div>
        `;

        // Close button
        document.getElementById('stats-close-btn').onclick = () => overlay.remove();

        // Update import count when checkboxes change
        function updateImportCount() {
            const checkedStars = [];
            document.querySelectorAll('.star-checkbox').forEach(cb => {
                if (cb.checked) checkedStars.push(parseInt(cb.dataset.star));
            });
            const photoChecked = document.getElementById('photo-checkbox')?.checked;

            let count = 0;
            allReviews.forEach(r => {
                const s = Math.round(r.rating);
                const hasPhoto = r.images && r.images.length > 0;
                if (checkedStars.includes(s)) {
                    count++;
                } else if (photoChecked && hasPhoto) {
                    count++;
                }
            });

            const importBtn = document.getElementById('stats-import-btn');
            if (importBtn) importBtn.textContent = `Import ${count} reviews`;
        }

        document.querySelectorAll('.star-checkbox').forEach(cb => {
            cb.addEventListener('change', updateImportCount);
        });
        const photoCb = document.getElementById('photo-checkbox');
        if (photoCb) photoCb.addEventListener('change', updateImportCount);

        // Import button hover
        const importBtn = document.getElementById('stats-import-btn');
        if (importBtn) {
            importBtn.addEventListener('mouseenter', () => importBtn.style.background = '#006e52');
            importBtn.addEventListener('mouseleave', () => importBtn.style.background = '#008060');
            importBtn.addEventListener('click', () => {
                const checkedStars = [];
                document.querySelectorAll('.star-checkbox').forEach(cb => {
                    if (cb.checked) checkedStars.push(parseInt(cb.dataset.star));
                });
                const photoChecked = document.getElementById('photo-checkbox')?.checked;

                const filteredReviews = allReviews.filter(r => {
                    const s = Math.round(r.rating);
                    const hasPhoto = r.images && r.images.length > 0;
                    return checkedStars.includes(s) || (photoChecked && hasPhoto);
                });

                console.log('IMPORT DATA:', {
                    from: 'amazon',
                    importToken,
                    shopDomain,
                    productId,
                    selectedProduct,
                    review: filteredReviews
                });

                importBtn.textContent = 'Importing...';
                importBtn.disabled = true;
                importBtn.style.background = '#e4e5e7';
                importBtn.style.color = '#8c9196';
                importBtn.style.cursor = 'not-allowed';
            });
        }

        // Helper: render star icons
        function renderStars(rating) {
            const r = Math.round(rating);
            let html = '';
            for (let i = 1; i <= 5; i++) {
                html += `<svg viewBox="0 0 20 20" width="18" fill="${i <= r ? '#e6a817' : '#d9d9d9'}" style="display:inline-block;"><path d="M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z"></path></svg>`;
            }
            return html;
        }

        // Show review preview panel
        function showReviewPreview(reviews, label) {
            popup.style.width = '620px';
            popup.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 520px;">
                    <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button id="preview-back-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #202223; display: flex; align-items: center;">
                                <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M17 9H5.414l3.293-3.293a1 1 0 1 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414L5.414 11H17a1 1 0 1 0 0-2z"></path></svg>
                            </button>
                            <span style="font-weight: 600; font-size: 15px; color: #202223;">Preview</span>
                            <span style="background: #e3e5e7; color: #202223; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${label}</span>
                        </div>
                        <button id="preview-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                            <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                        </button>
                    </div>
                    <div style="padding: 8px 20px; font-size: 13px; color: #6d7175; border-bottom: 1px solid #f1f2f3;">Showing ${reviews.length} of ${reviews.length} reviews</div>
                    <div style="flex: 1; overflow-y: auto; padding: 0;">
                        ${reviews.map((r, idx) => `
                            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f2f3; position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="margin-bottom: 6px;">${renderStars(r.rating)}</div>
                                        ${r.body ? `<div style="font-size: 14px; color: #202223; line-height: 1.5; margin-bottom: 8px;">${r.body}</div>` : ''}
                                        <div style="font-size: 12px; color: #6d7175;">${r.customer}${r.createdAt ? '  •  ' + r.createdAt : ''}</div>
                                        ${r.images && r.images.length > 0 ? `<div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">${r.images.map(img => `<img src="${img}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e1e3e5;">`).join('')}</div>` : ''}
                                    </div>
                                    <button class="review-delete-btn" data-review-id="${r.referrenceId || r.hashId}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #8c9196; flex-shrink: 0; margin-left: 8px; transition: all 0.15s;" title="Remove review">
                                        <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M8 3.994C8 2.893 8.895 2 10 2s2 .893 2 1.994h4.005c.55 0 .995.448.995.997a.998.998 0 0 1-.995.997H3.995A.999.999 0 0 1 3 4.991c0-.55.445-.997.995-.997H8zM4.5 7h11l-.873 9.186A1.5 1.5 0 0 1 13.136 17.5H6.864a1.5 1.5 0 0 1-1.491-1.314L4.5 7zM8.5 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5zm4 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="padding: 12px 20px; border-top: 1px solid #e1e3e5; display: flex; justify-content: flex-end;">
                        <button id="preview-import-btn" style="padding: 8px 20px; background: #303030; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Import all</button>
                    </div>
                </div>
            `;

            document.getElementById('preview-back-btn').onclick = () => {
                popup.style.width = '500px';
                showStatsPopup();
            };
            document.getElementById('preview-close-btn').onclick = () => overlay.remove();

            // Delete review buttons
            document.querySelectorAll('.review-delete-btn').forEach(btn => {
                btn.addEventListener('mouseenter', () => { btn.style.color = '#d72c0d'; btn.style.background = '#fff4f4'; });
                btn.addEventListener('mouseleave', () => { btn.style.color = '#8c9196'; btn.style.background = 'none'; });
                btn.addEventListener('click', () => {
                    const reviewId = btn.dataset.reviewId;
                    const idx = allReviews.findIndex(r => (r.referrenceId || r.hashId) === reviewId);
                    if (idx !== -1) {
                        allReviews.splice(idx, 1);
                        // Re-filter and re-render preview
                        const currentReviews = reviews.filter(r => allReviews.some(a => (a.referrenceId || a.hashId) === (r.referrenceId || r.hashId)));
                        showReviewPreview(currentReviews, label);
                    }
                });
            });

            document.getElementById('preview-import-btn').addEventListener('click', function () {
                console.log('IMPORT PREVIEW DATA:', { from: 'amazon', importToken, shopDomain, productId, selectedProduct, review: reviews });
                this.textContent = 'Importing...';
                this.disabled = true;
                this.style.background = '#e4e5e7';
                this.style.color = '#8c9196';
                this.style.cursor = 'not-allowed';
            });
        }

        // View buttons - show preview panel
        document.querySelectorAll('.stats-view-star').forEach(btn => {
            btn.addEventListener('click', () => {
                const star = parseInt(btn.dataset.star);
                const filtered = allReviews.filter(r => Math.round(r.rating) === star);
                showReviewPreview(filtered, `${star}-star`);
            });
        });
        const viewPhotoBtn = document.querySelector('.stats-view-photo');
        if (viewPhotoBtn) {
            viewPhotoBtn.addEventListener('click', () => {
                const filtered = allReviews.filter(r => r.images && r.images.length > 0);
                showReviewPreview(filtered, 'Photo reviews');
            });
        }
        const viewAllBtn = document.querySelector('.stats-view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                showReviewPreview(allReviews, 'All reviews');
            });
        }
    }

    // ===== START button click → begin scraping =====
    startBtn.addEventListener("click", async () => {
        if (startBtn.disabled) return;

        // Disable input & button after starting
        startBtn.disabled = true;
        startBtn.textContent = "Collecting...";
        startBtn.style.background = "#e4e5e7";
        startBtn.style.color = "#8c9196";
        startBtn.style.cursor = "not-allowed";
        productInput.disabled = true;
        productInput.style.background = "#f6f6f7";

        // Show status area
        statusArea.style.display = "block";

        let clickCount = 0;
        const maxClicks = 10;
        let randomTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

        async function processPage() {
            const pageStatus = document.getElementById("appio-page-status");

            scrapeReviews();
            if (pageStatus) pageStatus.textContent = `Collecting page ${clickCount + 1}... waiting ${(randomTime / 1000).toFixed(1)}s`;
            await wait(randomTime);
            scrapeReviews();
            scrollToElement('.a-last');
            await wait(2000);
            scrollToElement('#a-autoid-2-announce');
            await wait(1000);

            const nextLi = document.querySelector('.a-last');
            const nextBtn = nextLi ? nextLi.querySelector('a') : null;

            if (!nextLi || nextLi.classList.contains('a-disabled') || !nextBtn) {
                scrapeReviews();
                if (pageStatus) pageStatus.textContent = "All pages collected!";
                startBtn.textContent = "Done";
                console.log("FINAL DATA OBJECT:", {
                    from: "amazon",
                    importToken,
                    shopDomain,
                    productId,
                    selectedProduct,
                    review: allReviews,
                    reviewSummary
                });
                showStatsPopup();
                return;
            }

            if (clickCount < maxClicks) {
                clickCount++;
                if (pageStatus) pageStatus.textContent = `Going to page ${clickCount + 1}...`;
                nextBtn.click();
                randomTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
                await wait(3000);
                processPage();
            } else {
                if (pageStatus) pageStatus.textContent = `Reached max ${maxClicks} pages.`;
                startBtn.textContent = "Done";
                console.log("FINAL DATA OBJECT:", {
                    from: "amazon",
                    importToken,
                    shopDomain,
                    productId,
                    selectedProduct,
                    review: allReviews,
                    reviewSummary
                });
                showStatsPopup();
            }
        }

        processPage();
    });

})();