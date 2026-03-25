(function () {
    if (document.getElementById('appio-overlay')) return;
    const isReviewPage = window.location.href.includes("product-reviews");
    const isDetailPage = window.location.href.includes("/dp/") || window.location.href.includes("/gp/product/");
    const isAmazonPage = /(^|\.)amazon\./i.test(window.location.hostname);
    const amazonSupported = /https:\/\/www\.amazon\.(?:ca|cn|eg|de|fr|in|it|nl|pl|sa|sg|es|se|ae|com|com\.au|com\.be|com\.br|com\.mx|com\.tr|co\.jp|co\.uk)/;

    const allReviews = [];
    const reviewIdSet = new Set();
    let reviewSummary = { totalRatings: "", average: "", count: [] };
    const token = window.APPIO_IMPORT_TOKEN || "";
    const shop = window.APPIO_SHOP_DOMAIN || "";
    const asinMatch = window.location.href.match(/\/(?:product-reviews|dp|gp\/product)\/([A-Z0-9]{10})/);
    const productId = asinMatch ? asinMatch[1] : "N/A";

    // ── SVG Icon Constants ──
    const ICONS = {
        close: `<svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>`,
        warning: `<svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>`,
        info: `<svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-13a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg>`,
        search: `<svg viewBox="0 0 20 20" width="16" fill="#8c9196" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm9.707 4.293-4.82-4.82A5.968 5.968 0 0 0 14 8 6 6 0 0 0 2 8a6 6 0 0 0 6 6 5.968 5.968 0 0 0 3.473-1.113l4.82 4.82a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414z"></path></svg>`,
        eye: `<svg viewBox="0 0 20 20" width="13" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>`,
        back: `<svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M17 9H5.414l3.293-3.293a1 1 0 1 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414L5.414 11H17a1 1 0 1 0 0-2z"></path></svg>`,
        trash: `<svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M8 3.994C8 2.893 8.895 2 10 2s2 .893 2 1.994h4.005c.55 0 .995.448.995.997a.998.998 0 0 1-.995.997H3.995A.999.999 0 0 1 3 4.991c0-.55.445-.997.995-.997H8zM4.5 7h11l-.873 9.186A1.5 1.5 0 0 1 13.136 17.5H6.864a1.5 1.5 0 0 1-1.491-1.314L4.5 7zM8.5 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5zm4 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5z"></path></svg>`,
        refresh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 2200" style="width: 28px; height: 28px;"><defs><style>.cls-1{fill:#5050ff;}</style></defs><path class="cls-1" d="M1770.06,302.9c-100.13-42.38-210.23-65.81-325.8-65.81-462.07,0-836.66,374.59-836.66,836.66h61.41c35.56,0,53.05,43.27,27.48,67.96l-286.72,276.93c-15.31,14.81-39.61,14.81-54.92,0l-286.72-276.93c-25.57-24.69-8.09-67.96,27.48-67.96h61.41c0-555.35,450.2-1005.55,1005.55-1005.55,233.86,0,449.06,79.83,619.86,213.73,11.32,8.87.86,26.59-12.39,20.97Z"/><path class="cls-1" d="M2099.12,1149.45h-61.41c0,555.35-450.2,1005.55-1005.55,1005.55-233.86,0-449.06-79.83-619.86-213.73-11.32-8.87-.86-26.59,12.39-20.97,100.13,42.38,210.23,65.81,325.8,65.81,462.07,0,836.66-374.59,836.66-836.66h-61.41c-35.56,0-53.05-43.27-27.48-67.96l286.72-276.93c15.31-14.81,39.61-14.81,54.92,0l286.72,276.93c25.57,24.69,8.09,67.96-27.48,67.96Z"/></svg>`,
        starPath: `M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z`,
    };

    // ── Reusable Helpers ──
    function popupHeader(title, closeId) {
        return `<div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
            <span style="font-weight: 600; font-size: 16px; color: #202223;">${title}</span>
            <button id="${closeId}" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">${ICONS.close}</button>
        </div>`;
    }

    function warningBanner(message, icon, align = 'center') {
        return `<div style="padding: 20px;">
            <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: ${align === 'top' ? 'flex-start' : 'center'}; color: #332b00;">
                ${icon}
                <span style="font-size: 14px; line-height: 20px;">${message}</span>
            </div>
        </div>`;
    }

    function showWarningPopup(title, message, closeId, icon, align) {
        popup.innerHTML = popupHeader(title, closeId) + warningBanner(message, icon, align);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.getElementById(closeId).onclick = () => overlay.remove();
    }

    function renderStars(rating, size = 18) {
        const r = Math.round(rating);
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<svg viewBox="0 0 20 20" width="${size}" height="${size}" fill="${i <= r ? '#e6a817' : '#d9d9d9'}" style="display:inline-block;vertical-align:middle;${size < 18 ? 'margin-right:1px;' : ''}"><path d="${ICONS.starPath}"></path></svg>`;
        }
        return html;
    }

    function setButtonState(btn, { text, disabled, bg, color, cursor }) {
        if (!btn) return;
        if (text !== undefined) btn.textContent = text;
        if (disabled !== undefined) btn.disabled = disabled;
        if (bg) btn.style.background = bg;
        if (color) btn.style.color = color;
        if (cursor) btn.style.cursor = cursor;
    }

    function getRandomDelay(min = 1000, max = 5000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function isOverlayAlive() {
        return !!document.getElementById('appio-overlay');
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function scrollToElement(selector) {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return el;
    }

    // ── Overlay & Popup Setup ──
    const overlay = document.createElement("div");
    overlay.id = "appio-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:9998;";

    const popup = document.createElement("div");
    popup.style.cssText = `background:#fff;border-radius:12px;width:500px;box-shadow:0 10px 30px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"San Francisco","Segoe UI",Roboto,"Helvetica Neue",sans-serif;`;

    // ── Page Validation ──
    if (!isAmazonPage || !amazonSupported.test(window.location.href)) {
        showWarningPopup("Warning", "You are not on the Amazon page.", "closeNotAmazon", ICONS.warning);
        return;
    }

    if (!isReviewPage) {
        if (isDetailPage && productId !== "N/A") {
            const reviewsUrl = `${window.location.origin}/product-reviews/${productId}/ref=cm_cr_arp_d_viewopt_srt?pageNumber=1&sortBy=recent`;
            const msg = `This is not the reviews page. <a href="${reviewsUrl}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">Click here</a> to go to the reviews page to start importing.`;
            showWarningPopup("Warning", msg, "closeWarning", ICONS.warning, 'top');
        } else {
            showWarningPopup("Unsupported page", "This page is not supported. Go to a product or reviews page to use the importer.", "closeUnsupported", ICONS.info, 'top');
        }
        return;
    }

    // ── Auto-sort by Recent ──
    if (!window.location.href.includes("sortBy=recent")) {
        const sortBtn = document.querySelector("#a-autoid-2-announce");
        if (sortBtn) {
            sortBtn.click();
            setTimeout(() => {
                const recentOption = document.querySelector("#sort-order-dropdown_1");
                if (recentOption) recentOption.click();
            }, 300);
        }
    }

    // ── State Variables ──
    let selectedProduct = "";
    let selectedProductId = "";
    let selectedProductImage = "";
    let searchTimeout = null;
    let allProducts = [];
    let productsLoaded = false;
    let productsLoading = false;

    function buildData(review) {
        return { shop, token, url: window.location.href, productId: selectedProductId, summary: reviewSummary, reviews: review };
    }

    // ── Main Popup ──
    popup.innerHTML = `
        ${popupHeader("Prepare to import reviews", "appio-close-btn")}
        <div style="padding: 20px;">
            <label style="font-size: 14px; font-weight: 500; color: #202223; display: block; margin-bottom: 8px;">Select product</label>
            <div style="position: relative;">
                ${ICONS.search}
                <input id="appio-product-input" type="text" placeholder="Search product" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                    style="width: 100%; padding: 10px; border: 1px solid #c9cccf; border-radius: 8px; font-size: 14px; color: #202223; outline: none; box-sizing: border-box; transition: border-color 0.15s;">
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

    let closeBtn = document.getElementById("appio-close-btn");
    let productInput = document.getElementById("appio-product-input");
    let startBtn = document.getElementById("appio-start-btn");
    let statusArea = document.getElementById("appio-status-area");
    let productResults = document.getElementById("appio-product-results");
    let isChangeProductMode = false;

    closeBtn.onclick = () => overlay.remove();

    // ── Input Event Binding ──
    function bindInputEvents() {
        if (!productInput) return;
        productInput.addEventListener("focus", () => {
            productInput.style.borderColor = "#005bd3";
            productInput.style.boxShadow = "0 0 0 2px rgba(0, 91, 211, 0.2)";
            if (productsLoaded) {
                renderProductResults(sortProductsByQuery(allProducts, productInput.value.trim()));
            }
        });
        productInput.addEventListener("blur", () => {
            productInput.style.borderColor = "#c9cccf";
            productInput.style.boxShadow = "none";
        });
        productInput.addEventListener("input", () => {
            const query = productInput.value.trim();
            selectedProductId = "";
            selectedProductImage = "";
            setStartButtonState(false);
            updateImportButtonState();
            if (!productResults) return;
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchProducts(query), 400);
        });
        productInput.addEventListener("click", () => {
            if (!productsLoading) searchProducts(productInput.value.trim());
        });
        productInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const firstItem = productResults.querySelector(".appio-product-item");
                if (firstItem) firstItem.click();
            }
        });
    }

    bindInputEvents();

    function setStartButtonState(enabled) {
        if (!startBtn) return;
        startBtn.disabled = !enabled;
        startBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    function updateImportButtonState() {
        const importBtn = document.getElementById('stats-import-btn');
        if (!importBtn) return;
        const isEnabled = !!selectedProductId;
        setButtonState(importBtn, {
            disabled: !isEnabled,
            bg: isEnabled ? '#003366' : '#e4e5e7',
            color: isEnabled ? '#fff' : '#8c9196',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
        });
    }

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
                if (isChangeProductMode) {
                    productResults.style.display = "none";
                    showStatsPopup();
                    isChangeProductMode = false;
                    updateImportButtonState();
                } else {
                    productInput.value = selectedProduct;
                    productResults.style.display = "none";
                    setStartButtonState(!!selectedProductId);
                }
            });
        });
    }

    function sortProductsByQuery(products, query) {
        const q = (query || "").toLowerCase();
        if (!q) return products;
        return [...products].sort((a, b) => {
            const aT = (a.title || "").toLowerCase();
            const bT = (b.title || "").toLowerCase();
            const aS = aT.startsWith(q) ? 0 : 1;
            const bS = bT.startsWith(q) ? 0 : 1;
            if (aS !== bS) return aS - bS;
            const aI = aT.includes(q) ? 0 : 1;
            const bI = bT.includes(q) ? 0 : 1;
            if (aI !== bI) return aI - bI;
            return aT.localeCompare(bT);
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
            productsLoaded = true;
            renderProductResults(sortProductsByQuery(allProducts, query));
        } catch (e) {
            renderProductResults([], "Failed to load products");
        } finally {
            productsLoading = false;
        }
    }

    document.addEventListener("click", (e) => {
        if (!productResults) return;
        if (e.target === productInput || productResults.contains(e.target)) return;
        productResults.style.display = "none";
    });

    // ── Scraping Functions ──
    function scrapeReviewSummary() {
        const totalEl = document.querySelector('[data-hook="total-review-count"]');
        const totalText = totalEl?.innerText?.trim() || "";
        const totalMatch = totalText.match(/([\d\s.,\u00A0]+)/);
        const totalRatings = totalMatch ? totalMatch[1].replace(/[\s.,\u00A0]/g, '') : "0";
        const avgEl = document.querySelector('[data-hook="rating-out-of-text"]');
        const avgText = avgEl?.innerText?.trim() || "";
        const avgMatch = avgText.match(/([\d][,.]\d)/);
        const average = avgMatch ? avgMatch[1].replace(',', '.') : "0";
        const starPercentMap = { 1: "0%", 2: "0%", 3: "0%", 4: "0%", 5: "0%" };
        document.querySelectorAll('#histogramTable tr, #histogramTable li.a-align-center').forEach(row => {
            const rowText = (row.textContent || "").replace(/\s+/g, " ").trim();
            const ariaLabel = row.querySelector('a.histogram-row-container')?.getAttribute('aria-label') || "";
            const text = `${ariaLabel} ${rowText}`;
            const starMatch = text.match(/([1-5])\s*star/i);
            const pctMatch = text.match(/(\d+%)/);
            if (starMatch) {
                starPercentMap[parseInt(starMatch[1], 10)] = pctMatch ? pctMatch[1] : "0%";
            }
        });
        reviewSummary = { totalRatings, average, count: [starPercentMap[1], starPercentMap[2], starPercentMap[3], starPercentMap[4], starPercentMap[5]] };
    }

    function scrapeReviews() {
        scrapeReviewSummary();
        document.querySelectorAll('[data-hook="review"]').forEach(el => {
            const reviewId = el.id;
            if (!reviewId || reviewIdSet.has(reviewId)) return;

            const name = el.querySelector('.a-profile-name')?.innerText.trim() || "";
            const ratingText = el.querySelector('.review-rating .a-icon-alt')?.innerText || "";
            const rating = parseFloat(ratingText.split(' ')[0]) || 0;
            const time = el.querySelector('.review-date')?.innerText.trim() || "";
            const content = el.querySelector('.review-text-content span')?.innerText.trim()
                || el.querySelector('.review-text-content .cr-translated-review-content')?.innerText.trim()
                || el.querySelector('.review-text-content .cr-original-review-content')?.innerText.trim();
            const titleNew = el.querySelector("[data-hook='review-title'] span:nth-of-type(2)")?.innerText?.trim() || "";

            const photos = [];
            el.querySelectorAll('[data-hook="review-image-tile"], [data-hook="cmps-review-image-tile"]').forEach(img => {
                let src = img.getAttribute('data-src') || img.src;
                if (src && !src.includes('grey-pixel.gif')) {
                    photos.push(src.replace(/\._[A-Z0-9]+_\./g, '.'));
                }
            });

            const helpfulText = el.querySelector('[data-hook="helpful-vote-statement"]')?.innerText.trim() || "";
            const helpfulMatch = helpfulText.match(/(\d+)/);

            const videos = [];
            el.querySelectorAll('.cr-video-desktop').forEach(v => {
                const url = v.getAttribute('data-video-url');
                if (url) videos.push({ url });
            });

            reviewIdSet.add(reviewId);
            allReviews.push({
                shopOrigin: shop, productId: selectedProductId, referrenceId: reviewId,
                customer: name, rating, title: titleNew, body: content, createdAt: time,
                images: photos, videos, hashId: reviewId,
                helpful: helpfulMatch ? parseInt(helpfulMatch[1]) : 0,
            });
        });

        const countEl = document.getElementById('review-count');
        if (countEl) countEl.textContent = allReviews.length;
    }

    // ── Stats Popup ──
    function showStatsPopup() {
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach(r => {
            const s = Math.round(r.rating);
            if (s >= 1 && s <= 5) starCounts[s]++;
        });
        const totalReviews = allReviews.length;

        popup.innerHTML = `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 14px; font-weight: 600; cursor: default;">${shop}</span>
                </div>
                <button id="stats-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">${ICONS.close}</button>
            </div>
            <div style="padding: 20px 20px;">
                <div style="display: flex; gap: 20px; flex-direction: column;">
                    <div style="flex: 1;">
                        <div id="appio-selected-product-container" style="border: 1px solid #e1e3e5; border-radius: 12px; padding: 5px; display: flex; align-items: center; gap: 16px; background: #fff;justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                                ${selectedProductImage ? `<img src="${selectedProductImage}" style="width: 100%; max-width: 40px; height: auto; border-radius: 8px; object-fit: contain;">` : `<div style="width:70px;height:70px;border-radius:8px;background:#f4f6f8;"></div>`}
                                <div style="font-size: 12px; color: #212b36; line-height: 1.4; text-align: left; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${selectedProduct}</div>
                            </div>
                            <div id="appio-change-product-btn" style="cursor: pointer;" title="Change product">${ICONS.refresh}</div>
                        </div>
                    </div>
                    <div style="width: 235px; padding-left: 15px;">
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${[5, 4, 3, 2, 1].map(star => {
            const checked = starCounts[star] > 0;
            return `
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <label style="display: flex; align-items: center; cursor: pointer; position: relative; width: 18px; height: 18px;">
                                            <input type="checkbox" class="star-checkbox" data-star="${star}" ${checked ? 'checked' : ''}
                                                style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; margin: 0; z-index: 2;">
                                            <div class="checkbox-visual" style="position: absolute; top:0; left:0; width: 16px; height: 16px; border: 1px solid #c9cccf; border-radius: 4px; background: ${checked ? '#003366' : '#fff'}; display: flex; align-items: center; justify-content: center; z-index: 1; transition: all 0.2s;">
                                                <svg viewBox="0 0 20 20" fill="none" stroke="#fff" stroke-width="1.2" style="width: 12px; height: 12px; display: ${checked ? 'block' : 'none'};">
                                                    <path d="M4 10l4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </label>
                                        <div style="display: flex; align-items: center; width: 75px;">${renderStars(star, 14)}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-end;">
                                        <span style="font-size: 14px; color: #212b36; min-width: 30px; text-align: right;">${starCounts[star]}</span>
                                        <button class="stats-view-star" data-star="${star}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #5c5f62; transition: all 0.15s;">${ICONS.eye}</button>
                                    </div>
                                </div>`;
        }).join('')}
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 7px; margin-top: 7px; border-top: 1px solid #cecece;">
                            <span style="font-size: 13px; cursor: default;">Total reviews collected:</span>
                            <div style="display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-end;">
                                <strong style="font-size: 14px; color: #212b36; min-width: 30px; text-align: right;">${totalReviews}</strong>
                                <button class="stats-view-all-btn" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 7px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #202223;">${ICONS.eye}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="padding: 0 20px 24px; display: flex; justify-content: space-between; align-items: center;">
                <div id="stats-import-msg" style="font-size: 14px; font-weight: 500; padding-left: 15px;"></div>
                <button id="stats-import-btn" ${!selectedProductId ? 'disabled' : ''} style="padding: 8px 18px; background: ${selectedProductId ? '#003366' : '#e4e5e7'}; color: ${selectedProductId ? '#fff' : '#8c9196'}; border: none; border-radius: 8px; font-weight: 400; font-size: 13px; cursor: ${selectedProductId ? 'pointer' : 'not-allowed'}; transition: background 0.15s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Import ${totalReviews} reviews
                </button>
            </div>
        `;

        document.getElementById('stats-close-btn').onclick = () => overlay.remove();

        // Change product handler
        document.getElementById('appio-change-product-btn').addEventListener('click', () => {
            const container = document.getElementById('appio-selected-product-container');
            if (!container) return;
            isChangeProductMode = true;
            container.innerHTML = `
                <div style="position: relative; width: 100%;">
                    ${ICONS.search}
                    <input id="appio-product-input-inline" type="text" placeholder="Search product" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                        style="width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 14px; color: #202223; outline: none; box-sizing: border-box; transition: border-color 0.15s;">
                    <div id="appio-product-results-inline" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 6px; background: #fff; border: 1px solid #e1e3e5; border-radius: 10px; max-height: 260px; overflow-y: auto; box-shadow: 0 12px 24px rgba(0,0,0,0.12); display: none; z-index: 9999;"></div>
                </div>`;
            productInput = document.getElementById('appio-product-input-inline');
            productResults = document.getElementById('appio-product-results-inline');
            bindInputEvents();
            productInput.focus();
            searchProducts("");

            const handleClickOutside = (e) => {
                if (!isChangeProductMode) { document.removeEventListener('click', handleClickOutside); return; }
                const c = document.getElementById('appio-selected-product-container');
                if (!c || !c.contains(e.target)) {
                    if (selectedProductId) {
                        isChangeProductMode = false;
                        showStatsPopup();
                        document.removeEventListener('click', handleClickOutside);
                    }
                }
            };
            setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
        });

        // Star checkbox update
        function updateImportCount() {
            const checkedStars = new Set();
            document.querySelectorAll('.star-checkbox').forEach(cb => {
                const visual = cb.parentElement.querySelector('.checkbox-visual');
                const svg = visual?.querySelector('svg');
                if (cb.checked) {
                    checkedStars.add(parseInt(cb.dataset.star));
                    if (visual) visual.style.background = '#003366';
                    if (svg) svg.style.display = 'block';
                } else {
                    if (visual) visual.style.background = '#fff';
                    if (svg) svg.style.display = 'none';
                }
            });
            let count = 0;
            allReviews.forEach(r => { if (checkedStars.has(Math.round(r.rating))) count++; });
            const importBtn = document.getElementById('stats-import-btn');
            if (importBtn) importBtn.textContent = `Import ${count} reviews`;
        }

        document.querySelectorAll('.star-checkbox').forEach(cb => cb.addEventListener('change', updateImportCount));

        // Import button handlers
        const importBtn = document.getElementById('stats-import-btn');
        if (importBtn) {
            importBtn.addEventListener('mouseenter', () => { if (!importBtn.disabled) importBtn.style.background = '#828282'; });
            importBtn.addEventListener('mouseleave', () => { if (!importBtn.disabled) importBtn.style.background = '#003366'; });
            importBtn.addEventListener('click', () => {
                const checkedStars = new Set();
                document.querySelectorAll('.star-checkbox').forEach(cb => { if (cb.checked) checkedStars.add(parseInt(cb.dataset.star)); });
                const filteredReviews = allReviews.filter(r => checkedStars.has(Math.round(r.rating)));
                const data = buildData(filteredReviews);
                setButtonState(importBtn, { text: 'Importing...', disabled: true, bg: '#e4e5e7', color: '#8c9196', cursor: 'not-allowed' });

                const API_URL = 'https://jsonplaceholder.typicode.com/posts';
                fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
                    .then(response => { if (!response.ok) throw new Error('Network response was not ok'); return response.json(); })
                    .then(result => {
                        console.log('Import Success:', result);
                        const msgEl = document.getElementById('stats-import-msg');
                        if (msgEl) { msgEl.textContent = 'Import Success!'; msgEl.style.color = '#4CAF50'; msgEl.style.display = 'block'; }
                        setButtonState(importBtn, { text: 'Imported', disabled: true, bg: '#e4e5e7', color: '#8c9196', cursor: 'not-allowed' });
                    })
                    .catch(error => {
                        console.error('Import Error:', error);
                        const msgEl = document.getElementById('stats-import-msg');
                        if (msgEl) { msgEl.textContent = 'Import Failed!'; msgEl.style.color = '#d72c0d'; msgEl.style.display = 'block'; }
                        setButtonState(importBtn, { text: 'Try again', disabled: false, bg: '#003366', color: '#fff', cursor: 'pointer' });
                    });
            });
        }

        // Review preview
        function showReviewPreview(reviews, label) {
            popup.style.width = '620px';
            popup.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 520px;">
                    <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button id="preview-back-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #202223; display: flex; align-items: center;">${ICONS.back}</button>
                            <span style="font-weight: 600; font-size: 15px; color: #202223;">Preview</span>
                            <span style="background: #e3e5e7; color: #202223; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${label}</span>
                        </div>
                        <button id="preview-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">${ICONS.close}</button>
                    </div>
                    <div style="padding: 8px 20px; font-size: 13px; color: #6d7175; border-bottom: 1px solid #f1f2f3;">Showing ${reviews.length} of ${reviews.length} reviews</div>
                    <div style="flex: 1; overflow-y: auto; padding: 0;">
                        ${reviews.map(r => `
                            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f2f3; position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="margin-bottom: 6px;">${renderStars(r.rating)}</div>
                                        ${r.body ? `<div style="font-size: 14px; color: #202223; line-height: 1.5; margin-bottom: 8px;">${r.body}</div>` : ''}
                                        <div style="font-size: 12px; color: #6d7175;">${r.customer}${r.createdAt ? '  •  ' + r.createdAt : ''}</div>
                                        ${r.images?.length ? `<div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">${r.images.map(img => `<img src="${img}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e1e3e5;">`).join('')}</div>` : ''}
                                    </div>
                                    <button class="review-delete-btn" data-review-id="${r.referrenceId || r.hashId}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #8c9196; flex-shrink: 0; margin-left: 8px; transition: all 0.15s;" title="Remove review">${ICONS.trash}</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="padding: 12px 20px; border-top: 1px solid #e1e3e5; display: flex; justify-content: flex-end;">
                        <button id="preview-import-btn" style="padding: 8px 20px; background: #003366; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Import all</button>
                    </div>
                </div>
            `;

            document.getElementById('preview-back-btn').onclick = () => { popup.style.width = '500px'; showStatsPopup(); };
            document.getElementById('preview-close-btn').onclick = () => overlay.remove();

            document.querySelectorAll('.review-delete-btn').forEach(btn => {
                btn.addEventListener('mouseenter', () => { btn.style.color = '#d72c0d'; btn.style.background = '#fff4f4'; });
                btn.addEventListener('mouseleave', () => { btn.style.color = '#8c9196'; btn.style.background = 'none'; });
                btn.addEventListener('click', () => {
                    const reviewId = btn.dataset.reviewId;
                    const idx = allReviews.findIndex(r => (r.referrenceId || r.hashId) === reviewId);
                    if (idx !== -1) {
                        allReviews.splice(idx, 1);
                        reviewIdSet.delete(reviewId);
                        showReviewPreview(reviews.filter(r => allReviews.some(a => (a.referrenceId || a.hashId) === (r.referrenceId || r.hashId))), label);
                    }
                });
            });

            document.getElementById('preview-import-btn').addEventListener('click', function () {
                const data = buildData(reviews);
                console.log('IMPORT PREVIEW DATA:', data);
                setButtonState(this, { text: 'Importing...', disabled: true, bg: '#e4e5e7', color: '#8c9196', cursor: 'not-allowed' });
            });
        }

        document.querySelectorAll('.stats-view-star').forEach(btn => {
            btn.addEventListener('click', () => {
                const star = parseInt(btn.dataset.star);
                showReviewPreview(allReviews.filter(r => Math.round(r.rating) === star), `${star}-star`);
            });
        });

        const viewAllBtn = document.querySelector('.stats-view-all-btn');
        if (viewAllBtn) viewAllBtn.addEventListener('click', () => showReviewPreview(allReviews, 'All reviews'));
    }

    // ── Start Button Handler ──
    startBtn.addEventListener("click", async () => {
        if (startBtn.disabled) return;
        startBtn.style.display = "none";
        productInput.disabled = true;
        productInput.style.background = "#f6f6f7";
        statusArea.style.display = "block";

        let clickCount = 0;
        const maxClicks = 10;
        let randomTime = getRandomDelay();

        async function processPage() {
            if (!isOverlayAlive()) return;
            const pageStatus = document.getElementById("appio-page-status");
            const showMoreBtn = document.querySelector('[data-hook="show-more-button"]');
            const nextLi = document.querySelector('.a-last');
            const nextBtn = nextLi ? nextLi.querySelector('a') : null;

            if (showMoreBtn && showMoreBtn.offsetParent !== null) {
                if (pageStatus) pageStatus.textContent = `Expanding...${clickCount + 1}`;
                showMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await wait(randomTime);
                if (!isOverlayAlive()) return;
                showMoreBtn.click();
                clickCount++;
                await wait(randomTime);
                processPage();
            } else if (nextLi && !nextLi.classList.contains('a-disabled') && nextBtn) {
                scrapeReviews();
                if (pageStatus) pageStatus.textContent = `Collected ${allReviews.length} (Page ${clickCount + 1})`;
                nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await wait(randomTime);
                if (!isOverlayAlive()) return;
                nextBtn.click();
                clickCount++;
                await wait(randomTime);
                processPage();
            } else {
                if (pageStatus) pageStatus.textContent = "Finalizing data collection...";
                scrapeReviews();
                if (pageStatus) pageStatus.textContent = `Done! Total collected: ${allReviews.length}`;
                await wait(randomTime);
                showStatsPopup();
            }
        }
        processPage();
    });

})();
