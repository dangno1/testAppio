(function () {
    // Prevent duplicate popups
    if (document.getElementById('appio-overlay')) return;
    const isReviewPage = window.location.href.includes("product-reviews");
    const isDetailPage = window.location.href.includes("/dp/") || window.location.href.includes("/gp/product/");
    const isAmazonPage = /(^|\.)amazon\./i.test(window.location.hostname);
    const amazonAny = /https:\/\/www\.amazon\.(?:ca|cn|eg|de|fr|in|it|nl|pl|sa|sg|es|se|ae|com|com\.au|com\.be|com\.br|com\.mx|com\.tr|co\.jp|co\.uk)/;
    const amazonSupported = /https:\/\/www\.amazon\.(?:ca|cn|eg|de|fr|it|nl|pl|sa|sg|es|se|ae|com|com\.au|com\.be|com\.br|com\.mx|com\.tr|co\.jp|co\.uk)/;

    // Data Storage
    const allReviews = [];
    let reviewSummary = { totalRatings: "", average: "", count: [] };
    const token = window.APPIO_IMPORT_TOKEN || "";
    const shop = window.APPIO_SHOP_DOMAIN || "";
    const asinMatch = window.location.href.match(/\/product-reviews\/([A-Z0-9]{10})/) || window.location.href.match(/\/dp\/([A-Z0-9]{10})/) || window.location.href.match(/\/gp\/product\/([A-Z0-9]{10})/);
    const productId = asinMatch ? asinMatch[1] : "N/A";

    const overlay = document.createElement("div");
    overlay.id = "appio-overlay";
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9998;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
        background:#fff;
        border-radius:12px;
        width:500px;
        box-shadow:0 10px 30px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    `;

    if (!isAmazonPage || !amazonAny.test(window.location.href)) {
        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <span style="font-weight: 600; font-size: 16px; color: #202223;">Warning</span>
                <button id="closeNotAmazon" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                </button>
            </div>
            <div style="padding: 20px;">
                <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: center; color: #332b00;">
                    <svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
                    <span style="font-size: 14px; line-height: 20px;">You are not on the Amazon page.</span>
                </div>
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.getElementById("closeNotAmazon").onclick = () => overlay.remove();
        return;
    }

    if (!amazonSupported.test(window.location.href)) {
        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <span style="font-weight: 600; font-size: 16px; color: #202223;">Warning</span>
                <button id="closeNotSupported" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                </button>
            </div>
            <div style="padding: 20px;">
                <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: center; color: #332b00;">
                    <svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
                    <span style="font-size: 14px; line-height: 20px;">This Amazon marketplace is not supported.</span>
                </div>
            </div>
        `;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.getElementById("closeNotSupported").onclick = () => overlay.remove();
        return;
    }


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
    let selectedProductId = "";
    let selectedProductImage = "";
    let searchTimeout = null;
    let allProducts = [];
    let productsLoaded = false;
    let productsLoading = false;
    // Gom payload dữ liệu chuẩn để dùng chung cho tất cả log/import.
    function buildData(review) {
        return {
            shop,
            token,
            url: window.location.href,
            productId: selectedProductId,
            summary: reviewSummary,
            reviews: review,
        };
    }

    popup.innerHTML = `
        <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
            <span style="font-weight: 600; font-size: 16px; color: #202223;">Prepare to import reviews</span>
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
                <input id="appio-product-input" type="text" placeholder="Search product" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                    style="width: 100%; padding: 10px 12px 10px 12px; border: 1px solid #c9cccf; border-radius: 8px; font-size: 14px; color: #202223; outline: none; box-sizing: border-box; transition: border-color 0.15s;">
                <div id="appio-product-results" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 6px; background: #fff; border: 1px solid #e1e3e5; border-radius: 10px; max-height: 260px; overflow-y: auto; box-shadow: 0 12px 24px rgba(0,0,0,0.12); display: none; z-index: 9999;"></div>
            </div>

            <div id="appio-status-area" style="margin-top: 16px; display: none;">
                <p id="appio-page-status" style="font-size: 12px; color: #6d7175; margin: 8px 0 0 0;"></p>
            </div>
        </div>

        <div style="padding: 0 20px 20px; display: flex; justify-content: flex-end;">
            <button id="appio-start-btn" disabled
                style="padding: 8px 20px; cursor: not-allowed; background: #003366; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.15s;">
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
    const productResults = document.getElementById("appio-product-results");

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

    // Bật/tắt nút Start theo trạng thái đã chọn sản phẩm hợp lệ.
    function setStartButtonState(enabled) {
        startBtn.disabled = !enabled;
        if (enabled) {
            startBtn.style.background = "#003366";
            startBtn.style.color = "#fff";
            startBtn.style.cursor = "pointer";
        } else {
            startBtn.style.background = "#003366";
            startBtn.style.color = "#fff";
            startBtn.style.cursor = "not-allowed";
        }
    }

    // Render danh sách sản phẩm tìm kiếm và xử lý chọn sản phẩm.
    function renderProductResults(products, message) {
        if (!productResults) return;
        if (message) {
            productResults.innerHTML = `<div style="padding: 10px 12px; font-size: 13px; color: #6d7175;">${message}</div>`;
            productResults.style.display = "block";
            return;
        }
        if (!products.length) {
            productResults.innerHTML = `<div style="padding: 10px 12px; font-size: 13px; color: #6d7175;">No products found</div>`;
            productResults.style.display = "block";
            return;
        }
        productResults.innerHTML = products.map(p => `
            <div class="appio-product-item" data-id="${p.id}" data-title="${(p.title || '').replace(/"/g, '&quot;')}" data-image="${p.featuredImage?.src || ''}" style="display: flex; gap: 10px; align-items: center; padding: 8px 10px; cursor: pointer;">
                <div style="width: 34px; height: 34px; border-radius: 8px; overflow: hidden; background: #f4f6f8; flex-shrink: 0;">
                    ${p.featuredImage?.src ? `<img src="${p.featuredImage.src}" style="width: 100%; height: 100%; object-fit: cover;">` : ""}
                </div>
                <div style="flex: 1; font-size: 13px; color: #202223; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.title || ""}</div>
            </div>
        `).join('');
        productResults.style.display = "block";
        productResults.querySelectorAll(".appio-product-item").forEach(el => {
            el.addEventListener("mouseenter", () => el.style.background = "#f6f6f7");
            el.addEventListener("mouseleave", () => el.style.background = "transparent");
            el.addEventListener("click", () => {
                selectedProductId = el.getAttribute("data-id") || "";
                selectedProduct = el.getAttribute("data-title") || "";
                selectedProductImage = el.getAttribute("data-image") || "";
                productInput.value = selectedProduct;
                productResults.style.display = "none";
                setStartButtonState(!!selectedProductId);
            });
        });
    }

    function sortProductsByQuery(products, query) {
        const normalizedQuery = (query || "").toLowerCase();
        if (!normalizedQuery) return products;
        return [...products].sort((a, b) => {
            const aTitle = (a.title || "").toLowerCase();
            const bTitle = (b.title || "").toLowerCase();
            const aStarts = aTitle.startsWith(normalizedQuery) ? 0 : 1;
            const bStarts = bTitle.startsWith(normalizedQuery) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            const aIncludes = aTitle.includes(normalizedQuery) ? 0 : 1;
            const bIncludes = bTitle.includes(normalizedQuery) ? 0 : 1;
            if (aIncludes !== bIncludes) return aIncludes - bIncludes;
            return aTitle.localeCompare(bTitle);
        });
    }

    async function searchProducts(query = "") {
        if (productsLoading) return;
        productsLoading = true;
        renderProductResults([], "Searching...");
        const url = `https://k8s.appio.pro/production/api/v1/product/?shop_domain=${shop}&api_token=${token}&searchKeyword=${encodeURIComponent(query)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            allProducts = data?.data?.products || [];
            const sortedProducts = sortProductsByQuery(allProducts, query);
            renderProductResults(sortedProducts);
        } catch (e) {
            renderProductResults([], "Failed to load products");
        } finally {
            productsLoading = false;
        }
    }

    productInput.addEventListener("input", () => {
        const query = productInput.value.trim();
        selectedProduct = query;
        selectedProductId = "";
        selectedProductImage = "";
        setStartButtonState(false);
        if (!productResults) return;
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProducts(query);
        }, 400);
    });

    productInput.addEventListener("focus", () => {
        if (!productsLoaded) return;
        const query = productInput.value.trim();
        const sortedProducts = sortProductsByQuery(allProducts, query);
        renderProductResults(sortedProducts);
    });

    productInput.addEventListener("click", () => {
        if (productsLoading) return;
        const query = productInput.value.trim();
        searchProducts(query);
    });

    document.addEventListener("click", (e) => {
        if (!productResults) return;
        if (e.target === productInput || productResults.contains(e.target)) return;
        productResults.style.display = "none";
    });

    // Hover effect for Start button
    startBtn.addEventListener("mouseenter", () => {
        if (!startBtn.disabled) startBtn.style.background = "#003366";
    });
    startBtn.addEventListener("mouseleave", () => {
        if (!startBtn.disabled) startBtn.style.background = "#003366";
    });

    // Lấy thông tin tổng quan review: tổng đánh giá, điểm trung bình, % theo sao.
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
        const starPercentMap = { 1: "0%", 2: "0%", 3: "0%", 4: "0%", 5: "0%" };
        const histogramRows = document.querySelectorAll('#histogramTable tr, #histogramTable li.a-align-center');
        histogramRows.forEach(row => {
            const rowText = (row.textContent || "").replace(/\s+/g, " ").trim();
            const ariaLabel = row.querySelector('a.histogram-row-container')?.getAttribute('aria-label') || "";
            const text = `${ariaLabel} ${rowText}`;
            const starMatch = text.match(/([1-5])\s*star/i);
            const pctMatch = text.match(/(\d+%)/);
            if (starMatch) {
                const star = parseInt(starMatch[1], 10);
                starPercentMap[star] = pctMatch ? pctMatch[1] : "0%";
            }
        });
        const count = [starPercentMap[1], starPercentMap[2], starPercentMap[3], starPercentMap[4], starPercentMap[5]];

        reviewSummary = { totalRatings, average, count };
    }

    // ===== Scrape logic =====
    // Quét từng review trên trang hiện tại và thêm vào allReviews nếu chưa tồn tại.
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
            const titleNew = el.querySelector("[data-hook='review-title'] span:nth-of-type(2)").innerText.trim()
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
                shopOrigin: shop,
                productId: selectedProductId,
                referrenceId: reviewId,
                customer: name,
                rating: rating,
                title: titleNew,
                body: content,
                createdAt: time,
                images: photos,
                videos: videos,
                hashId: reviewId,
                helpful: helpful,
            });
            addedCount++;
        });

        const countEl = document.getElementById('review-count');
        if (countEl) countEl.textContent = allReviews.length;
    }

    // Cuộn mượt tới phần tử để hỗ trợ thao tác phân trang tự động.
    function scrollToElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return el;
    }
    // Tạm dừng theo mili giây để đợi trang/DOM cập nhật.
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Show Stats Popup after collection =====
    // Hiển thị popup thống kê sau khi thu thập và cung cấp thao tác import/preview.
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
        const productImg = selectedProductImage
            || document.querySelector('#cm_cr-product_info img')?.src
            || document.querySelector('#landingImage')?.src
            || '';

        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 14px; font-weight: 600; cursor: default;">${shop}</span>
                </div>
                <button id="stats-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                </button>
            </div>

            <div style="padding: 20px 20px;">
                <div style="display: flex; gap: 20px; flex-direction: column;">
                    <div style="flex: 1;">
                        <div style="border: 1px solid #e1e3e5; border-radius: 12px; padding: 5px; display: flex; align-items: center; gap: 16px; background: #fff;">
                            ${productImg ? `<img src="${productImg}" style="width: 100%; max-width: 40px; height: auto; border-radius: 8px; object-fit: contain;">` : `<div style="width:70px;height:70px;border-radius:8px;background:#f4f6f8;"></div>`}
                            <div style="font-size: 12px; color: #212b36; line-height: 1.4; text-align: left; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${productTitle}</div>
                            <div style="cursor: pointer;">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                width="25px" height="25px" viewBox="0 0 348.000000 348.000000"
                                preserveAspectRatio="xMidYMid meet" style="flex-shrink: 0; margin-left: auto;">

                                <g transform="translate(0.000000,348.000000) scale(0.100000,-0.100000)"
                                fill="#000000" stroke="none">
                                <path d="M1392 3473 c-34 -13 -42 -59 -42 -236 l0 -174 -142 -6 c-170 -7 -284
                                -34 -425 -102 -451 -219 -683 -728 -552 -1215 29 -111 117 -282 192 -375 74
                                -91 185 -188 284 -246 79 -45 105 -48 138 -14 35 34 32 71 -11 130 -75 103
                                -124 252 -124 373 1 148 73 316 185 427 108 109 279 184 418 185 l37 0 0 -184
                                c0 -102 4 -196 10 -210 12 -32 50 -51 83 -42 13 3 202 182 431 408 358 354
                                407 407 406 433 0 26 -56 86 -413 442 -419 420 -426 426 -475 406z m465 -598
                                l244 -240 -301 -300 -300 -300 0 146 c0 192 8 184 -184 183 -125 0 -150 -3
                                -221 -27 -219 -73 -397 -238 -482 -447 -41 -102 -55 -192 -50 -315 2 -60 8
                                -119 12 -130 14 -36 -52 48 -99 126 -85 141 -135 345 -123 499 31 398 287 706
                                681 818 48 13 102 17 249 17 239 0 227 -10 227 178 l0 131 52 -49 c29 -28 162
                                -158 295 -290z"/>
                                <path d="M2631 2364 c-30 -38 -26 -64 15 -125 146 -211 161 -455 41 -669 -47
                                -85 -168 -198 -257 -242 -86 -42 -182 -68 -257 -68 l-53 0 -2 201 -3 202 -27
                                20 c-17 13 -34 18 -50 14 -12 -4 -207 -188 -431 -409 -382 -378 -408 -405
                                -408 -438 0 -33 25 -59 408 -438 224 -221 418 -405 431 -408 32 -9 70 11 82
                                42 6 14 10 103 10 198 l0 173 143 6 c109 4 164 11 237 32 247 68 466 225 604
                                435 230 348 228 807 -4 1151 -84 123 -246 271 -367 333 -48 24 -88 21 -112
                                -10z m366 -442 c98 -157 139 -316 130 -506 -7 -150 -23 -211 -92 -351 -113
                                -227 -300 -384 -550 -462 -85 -26 -101 -27 -283 -28 -180 0 -195 -1 -208 -19
                                -10 -15 -14 -55 -14 -160 l0 -141 -297 297 -298 298 290 290 c159 159 293 290
                                297 290 4 0 9 -64 10 -141 3 -139 4 -142 28 -161 35 -26 148 -34 247 -18 167
                                26 303 92 419 203 173 164 251 353 242 586 -3 58 -8 115 -13 126 -17 41 46
                                -29 92 -103z"/>
                                </g>
                            </svg>
                            </div>
                        </div>
                    </div>

                    <div style="width: 220px;">
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${[5, 4, 3, 2, 1].map(star => {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<svg viewBox="0 0 20 20" width="14" height="14" fill="${i <= star ? '#e6a817' : '#d9d9d9'}" style="display:inline-block;vertical-align:middle;margin-right:1px;"><path d="M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z"></path></svg>`;
            }
            return `
                                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <label style="display: flex; align-items: center; cursor: pointer; position: relative; width: 18px; height: 18px;">
                                                <input type="checkbox" class="star-checkbox" data-star="${star}" ${starCounts[star] > 0 ? 'checked' : ''}
                                                    style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; margin: 0; z-index: 2;">
                                                <div class="checkbox-visual" style="position: absolute; top:0; left:0; width: 16px; height: 16px; border: 1px solid #c9cccf; border-radius: 4px; background: ${starCounts[star] > 0 ? '#003366' : '#fff'}; display: flex; align-items: center; justify-content: center; z-index: 1; transition: all 0.2s;">
                                                    <svg viewBox="0 0 20 20" fill="none" stroke="#fff" stroke-width="1.2" style="width: 12px; height: 12px; display: ${starCounts[star] > 0 ? 'block' : 'none'};">
                                                        <path d="M4 10l4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </div>
                                            </label>
                                            <div style="display: flex; align-items: center; width: 75px;">${starsHtml}</div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-end;">
                                            <span style="font-size: 14px; color: #212b36; min-width: 30px; text-align: right;">${starCounts[star]}</span>
                                            <button class="stats-view-star" data-star="${star}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #5c5f62; transition: all 0.15s;">
                                                <svg viewBox="0 0 20 20" width="13" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    `;
        }).join('')}
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 7px; margin-top: 7px; border-top: 1px solid #cecece;">
                            <span style="font-size: 13px; cursor: default;">Total reviews collected:</span>
                            <div style="display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-end;">
                                <strong style="font-size: 14px; color: #212b36; min-width: 30px; text-align: right;">${totalReviews}</strong>
                                <button class="stats-view-all-btn" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 7px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #202223;">
                                    <svg viewBox="0 0 20 20" width="13" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="padding: 0 20px 24px; display: flex; justify-content: flex-end;">
                <button id="stats-import-btn" style="padding: 8px 18px; background: #003366; color: #fff; border: none; border-radius: 8px; font-weight: 400; font-size: 13px; cursor: pointer; transition: background 0.15s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Import ${totalReviews} reviews
                </button>
            </div>
        `;

        // Close button
        document.getElementById('stats-close-btn').onclick = () => overlay.remove();

        // Update import count when checkboxes change
        // Cập nhật số lượng review sẽ import dựa trên bộ lọc sao được chọn.
        function updateImportCount() {
            const checkedStars = [];
            document.querySelectorAll('.star-checkbox').forEach(cb => {
                const visual = cb.parentElement.querySelector('.checkbox-visual');
                const svg = visual?.querySelector('svg');
                if (cb.checked) {
                    checkedStars.push(parseInt(cb.dataset.star));
                    if (visual) visual.style.background = '#003366';
                    if (svg) svg.style.display = 'block';

                } else {
                    if (visual) visual.style.background = '#fff';
                    if (svg) svg.style.display = 'none';
                }
            });

            let count = 0;
            allReviews.forEach(r => {
                const s = Math.round(r.rating);
                if (checkedStars.includes(s)) {
                    count++;
                }
            });

            const importBtn = document.getElementById('stats-import-btn');
            if (importBtn) importBtn.textContent = `Import ${count} reviews`;
        }

        document.querySelectorAll('.star-checkbox').forEach(cb => {
            cb.addEventListener('change', updateImportCount);
        });

        // Import button hover
        const importBtn = document.getElementById('stats-import-btn');
        if (importBtn) {
            importBtn.addEventListener('mouseenter', () => importBtn.style.background = '#828282');
            importBtn.addEventListener('mouseleave', () => importBtn.style.background = '#003366');
            importBtn.addEventListener('click', () => {
                const checkedStars = [];
                document.querySelectorAll('.star-checkbox').forEach(cb => {
                    if (cb.checked) checkedStars.push(parseInt(cb.dataset.star));
                });

                const filteredReviews = allReviews.filter(r => {
                    const s = Math.round(r.rating);
                    return checkedStars.includes(s);
                });

                const data = buildData(filteredReviews);
                console.log('IMPORT DATA:', data);

                importBtn.textContent = 'Importing...';
                importBtn.disabled = true;
                importBtn.style.background = '#e4e5e7';
                importBtn.style.color = '#8c9196';
                importBtn.style.cursor = 'not-allowed';
            });
        }

        // Helper: render star icons
        // Render dãy icon sao theo rating của từng review.
        function renderStars(rating) {
            const r = Math.round(rating);
            let html = '';
            for (let i = 1; i <= 5; i++) {
                html += `<svg viewBox="0 0 20 20" width="18" fill="${i <= r ? '#e6a817' : '#d9d9d9'}" style="display:inline-block;"><path d="M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z"></path></svg>`;
            }
            return html;
        }

        // Show review preview panel
        // Hiển thị màn hình preview review theo bộ lọc (all/1-5 sao).
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
                        <button id="preview-import-btn" style="padding: 8px 20px; background: #003366; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Import all</button>
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
                const data = buildData(reviews);
                console.log('IMPORT PREVIEW DATA:', data);
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

        // Hide button after starting
        startBtn.style.display = "none";
        productInput.disabled = true;
        productInput.style.background = "#f6f6f7";


        // Show status area
        statusArea.style.display = "block";

        let clickCount = 0;
        const maxClicks = 10;
        let randomTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

        // Luồng chính: quét review theo từng trang cho tới hết trang hoặc đạt giới hạn.
        async function processPage() {
            if (!document.getElementById('appio-overlay')) return; // Dừng nếu đã đóng popup
            const pageStatus = document.getElementById("appio-page-status");

            scrapeReviews();
            if (pageStatus) pageStatus.textContent = `Collecting...${allReviews.length}`;
            await wait(randomTime);
            if (!document.getElementById('appio-overlay')) return;

            scrapeReviews();
            if (pageStatus) pageStatus.textContent = `Collecting...${allReviews.length}`;

            scrollToElement('.a-last');
            await wait(2000);
            if (!document.getElementById('appio-overlay')) return;

            scrollToElement('#a-autoid-2-announce');
            await wait(1000);
            if (!document.getElementById('appio-overlay')) return;

            const nextLi = document.querySelector('.a-last');
            const nextBtn = nextLi ? nextLi.querySelector('a') : null;

            if (!nextLi || nextLi.classList.contains('a-disabled') || !nextBtn) {
                scrapeReviews();
                if (pageStatus) pageStatus.textContent = "All pages collected!";
                startBtn.textContent = "Done";
                const data = buildData(allReviews);
                console.log("FINAL DATA OBJECT:", data);
                showStatsPopup();
                return;
            }

            if (clickCount < maxClicks) {
                clickCount++;
                if (pageStatus) pageStatus.textContent = `Collecting...${allReviews.length}`;
                nextBtn.click();

                randomTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
                await wait(3000);
                if (!document.getElementById('appio-overlay')) return;
                processPage();
            } else {
                if (pageStatus) pageStatus.textContent = `Reached max ${maxClicks} pages.`;
                startBtn.textContent = "Done";
                const data = buildData(allReviews);
                console.log("FINAL DATA OBJECT:", data);
                showStatsPopup();
            }
        }

        processPage();
    });

})();
