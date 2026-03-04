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
    const T = window.AppioTemplates;

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
            popup.innerHTML = T.warningPopup(reviewsUrl);
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            document.getElementById("closeWarning").onclick = () => overlay.remove();
        } else {
            popup.innerHTML = T.unsupportedPopup();
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

    popup.innerHTML = T.preparePopup();

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
        const avgMatch = avgText.match(/([\d][,.]\d)/);
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

        popup.innerHTML = T.statsPopup({ totalReviews, starCounts, photoCount, productTitle, productImg });

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

        // Show review preview panel
        function showReviewPreview(reviews, label) {
            popup.style.width = '620px';
            popup.innerHTML = T.reviewPreview(reviews, label);

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