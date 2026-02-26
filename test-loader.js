(function () {
    // let domain = 'https://reviews-importer.test';
    let domain = 'https://reviews.smartifyapps.com';
    // let domain = 'https://reviews-testing.smartifyapps.com';

    const iframeSrc = `${domain}/external-import-app`;
    const method = 'bookmark';

    const persistentToken = localStorage.getItem('LAI_IMPORT_TOKEN');
    if (persistentToken) {
        window.LAI_IMPORT_TOKEN = persistentToken;
    }

    const changePersistentToken = (newToken) => {
        localStorage.setItem('LAI_IMPORT_TOKEN', newToken);
    };

    // START LAI Core code block (Used in both bookmark and extension)

    let postMessageInterval;

    function getPlatformFromUrl() {
        const url = window.location.href;
        if (url.includes('amazon.')) return 'amazon';
        if (url.includes('etsy.com')) return 'etsy';
        if (url.includes('shopee.')) return 'shopee';
        if (url.includes('ebay.')) return 'ebay';
        if (url.includes('shein.')) return 'shein';
        if (url.includes('temu.com')) return 'temu';
        if (url.includes('walmart')) return 'walmart';
        return null;
    }

    function buildContainer(id) {
        const container = document.createElement('div');
        container.style =
            'width: 100vw; height: 100vh; position: fixed; top: 0; left:0; z-index: 10000;background-color:transparent;display: flex;justify-content:center; align-items:center;';
        container.setAttribute('id', id);
        return container;
    }

    function buildImportIframe(iframeId) {
        const iframe = document.createElement('iframe');
        iframe.src = iframeSrc;
        iframe.style =
            'border: none;height:100%; width: 100%; background-color: transparent;';
        iframe.id = iframeId;
        return iframe;
    }

    function sendMessage(message, iframeId) {
        const iframe = document.getElementById(iframeId);
        iframe?.contentWindow?.postMessage(message, '*');
    }

    const amazonHandler = {
        name: 'amazon',
        containerId: 'LAI-Amazon-Importer-container',
        iframeId: 'LAI-Amazon-Importer-iframe',
        handleMessage(event) {
            switch (event?.data?.type) {
                case 'AMAZON/START_CRAWL':
                    console.log('Start crawl.');
                    this.crawlAllReviews();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'AMAZON/GO_TO_REVIEW_PAGE':
                    console.log('Go to review page.');
                    this.goToReviewPage();
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                default:
                    break;
            }
        },
        async scrollToBottom() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
        },
        getReviewsFromPage() {
            const reviewEls = document.querySelectorAll(
                "[data-hook='review']"
            );

            return Array.from(reviewEls).map((el) => {
                const reviewId = el.id;

                const name = el
                    .querySelector('.a-profile-name')
                    ?.innerText.trim();

                const content = el
                    .querySelector("span[data-hook='review-body'] > span")
                    ?.innerText.trim();

                const helpfulVotes = !!el
                    .querySelector('span[data-hook="helpful-vote-statement"]')
                    ?.innerText.trim();

                let photoSections = el.querySelectorAll(
                    '.review-image-tile-section img[data-hook="review-image-tile"]'
                );

                if (photoSections.length === 0) {
                    photoSections = el.querySelectorAll(
                        '.review-image-tile-section img[data-hook="cmps-review-image-tile"]'
                    );
                }

                let photos = [];

                if (photoSections.length > 0) {
                    photos = Array.from(photoSections).map((img) => {
                        let src = img.getAttribute('src');
                        if (src?.includes('._SY88.')) {
                            return src.replace('._SY88.', '.');
                        }
                        return src;
                    });
                }

                let ratingText = el.querySelector(
                    "i[data-hook='review-star-rating']"
                )?.textContent;
                if (!ratingText) {
                    ratingText = el.querySelector(
                        "i[data-hook='cmps-review-star-rating']"
                    )?.textContent;
                }

                const dateText =
                    el
                        .querySelector("span[data-hook='review-date']")
                        ?.textContent?.trim() || '';

                return {
                    reviewId,
                    name,
                    content,
                    helpfulVotes,
                    photos,
                    ratingText,
                    dateText
                };
            });
        },
        async clickNextAndWaitForChange(lastReviewId) {
            const nextBtn = document.querySelector('.a-last a');
            if (!nextBtn) return false; // no more pages

            nextBtn.click();

            // Wait for last review to disappear (means new page is loading)
            // await new Promise((resolve) => {
            //   const interval = setInterval(() => {
            //     if (!document.getElementById(lastReviewId)) {
            //       clearInterval(interval);
            //       resolve();
            //     }
            //   }, 500);
            // });

            // Optionally wait for new reviews to appear (DOM settle time)
            await new Promise((resolve) => setTimeout(resolve, 3000));

            return true;
        },
        async crawlAllReviews() {
            let allReviews = [];
            let page = 1;

            console.log('Start crawl...');
            while (true) {
                console.log(`Crawling page ${page}...`);
                await this.scrollToBottom();

                const reviews = this.getReviewsFromPage();
                allReviews = allReviews.concat(reviews);

                const lastReviewId = reviews[reviews.length - 1]?.reviewId;
                if (!lastReviewId) break;

                // Check if "Next" is disabled
                const nextDisabled = document.querySelector(
                    'li.a-disabled.a-last'
                );
                if (nextDisabled) {
                    console.log('Reached the last page.');
                    break;
                }

                // Click "Next" and wait for the last review to disappear
                const hasNext = await this.clickNextAndWaitForChange(
                    lastReviewId
                );
                if (!hasNext) break;

                page++;
            }

            console.log('Crawling done:', allReviews);

            sendMessage(
                { type: 'AMAZON/CRAWL_DONE', data: allReviews },
                this.iframeId
            );
        },
        goToReviewPage() {
            const reviewPageLink = document.querySelector(
                '[data-hook="see-all-reviews-link-foot"]'
            );
            reviewPageLink?.click();
        }
    };

    const etsyHandler = {
        name: 'etsy',
        containerId: 'LAI-Etsy-Importer-container',
        iframeId: 'LAI-Etsy-Importer-iframe',
        reviewQuantity: 30,
        handleMessage(event) {
            switch (event?.data?.type) {
                case 'ETSY/START_CRAWL':
                    const quantity = event?.data?.data || 30;
                    this.reviewQuantity = quantity;

                    console.log('Start crawl.');
                    this.startCrawl();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                default:
                    break;
            }
        },
        getReviewsFromPage() {
            const reviewCards = document.querySelectorAll(
                'div.review-card[data-review-region]'
            );

            return Array.from(reviewCards).map((card) => {
                const reviewId = card.getAttribute('data-review-region');

                const usernameWrapper = card.querySelector(
                    'a[data-review-username]'
                );
                const name = usernameWrapper?.textContent?.trim();

                const dateTextWrapper = usernameWrapper?.parentElement;
                const dateText = dateTextWrapper
                    ? dateTextWrapper?.childNodes?.[
                        dateTextWrapper?.childNodes?.length - 1
                    ]?.textContent?.trim()
                    : null;

                const rating = card.querySelector('input[name="rating"]')
                    ?.value;

                const content =
                    card
                        .querySelector('.wt-text-truncate--multi-line')
                        ?.textContent?.trim() ||
                        card.querySelectorAll('.wt-text-body').length > 1
                        ? card
                            .querySelectorAll('.wt-text-body')[1]
                            ?.textContent?.trim()
                        : card
                            .querySelector('.wt-text-body')
                            ?.textContent?.trim() || '';

                const imgEls = card.querySelectorAll('button img');

                let photos = [];

                if (imgEls.length > 0) {
                    photos = Array.from(imgEls)
                        .filter((img) => img?.getAttribute('src'))
                        .map((img) =>
                            img
                                .getAttribute('src')
                                .replace(/iap_\d+x\d+/, 'iap_800x800')
                        );
                }

                return {
                    photos,
                    reviewId,
                    name,
                    dateText,
                    rating,
                    content
                };
            });
        },
        getReviewsFromPageModal() {
            const reviewCards = document.querySelectorAll(
                'div.wt-dialog-container div[data-review-region]'
            );
            return Array.from(reviewCards).map((card) => {
                const reviewId = card.getAttribute('data-review-region');
                const usernameWrapper = card.querySelector(
                    'a[data-clg-id="WtTextLink"]'
                )
                const name = usernameWrapper?.textContent?.trim();

                const dateTextWrapper = usernameWrapper?.parentElement;
                const dateText = dateTextWrapper
                    ? dateTextWrapper?.childNodes?.[
                        dateTextWrapper?.childNodes?.length - 1
                    ]?.textContent?.trim()
                    : null;
                const content = card
                    .querySelector('.wt-text-body')
                    ?.textContent?.trim() || card.querySelector(':scope > div:nth-of-type(3)')?.textContent?.trim() || '';
                const imgEls = card.querySelectorAll('button img');

                let photos = [];

                if (imgEls.length > 0) {
                    photos = Array.from(imgEls)
                        .filter((img) => img?.getAttribute('src'))
                        .map((img) =>
                            img
                                .getAttribute('src')
                                .replace(/iap_\d+x\d+/, 'iap_800x800')
                        );
                }

                const wrapperRating = card.querySelector('div[data-clg-id="WtStarRating"] div[aria-label]');
                const ratingText = wrapperRating ? wrapperRating.getAttribute('aria-label') : null;
                const rating = Number(
                    ratingText?.match(/\d+(\.\d+)?/)?.[0] ?? 5
                );
                return {
                    photos,
                    reviewId,
                    name,
                    dateText,
                    rating,
                    content
                };
            });
        },
        async clickNextAndWaitForChange(nextButton, lastReviewId) {
            nextButton.click();

            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (
                        !document.querySelector(
                            `div.review-card[data-review-region="${lastReviewId}"]`
                        )
                    ) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 500);
            });

            await new Promise((resolve) => setTimeout(resolve, 2500));
        },
        async startCrawl() {
            let collectedReviews = [];
            let page = 1;

            console.log('Start crawl...');
            const reviews_header = document.querySelector('div[data-appears-component-name="reviews_header"]');
            console.log('reviews_header', reviews_header);
            if (!reviews_header) {
                sendMessage(
                    {
                        type: 'ETSY/CRAWL_DONE',
                        data: collectedReviews
                    },
                    this.iframeId
                );
                return;
            }
            const buttonViewAll = document.querySelector('div[data-reviews-container] button[data-view-all-reviews-button="same-listing"]');
            console.log('buttonViewAll', buttonViewAll);
            if (!buttonViewAll) {
                const reviews = this.getReviewsFromPage();
                collectedReviews = collectedReviews.concat(reviews);

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                }

                sendMessage(
                    {
                        type: 'ETSY/CRAWL_DONE',
                        data: collectedReviews
                    },
                    this.iframeId
                );
                return;
            }

            buttonViewAll.click();
            await new Promise((resolve) => setTimeout(resolve, 2500));
            while (true) {
                if (page >= 40) {
                    break;
                }
                const reviews = this.getReviewsFromPageModal();
                collectedReviews = collectedReviews.concat(reviews);
                console.log('collectedReviews', collectedReviews);
                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    break;
                }
                sendMessage(
                    {
                        type: 'ETSY/SEND_TEMP_COLLECTED',
                        data: collectedReviews.length
                    },
                    this.iframeId
                );
                const buttons = document.querySelectorAll(
                    'div.wt-dialog-container nav[data-clg-id="WtPagination"] button[data-clg-id="WtButton"]'
                );

                const buttonNext = buttons[buttons.length - 1];

                console.log('buttonNext', buttonNext);
                if (!buttonNext || buttonNext.getAttribute('aria-disabled') === 'true') {
                    break;
                }
                buttonNext.click();
                await new Promise((resolve) => setTimeout(resolve, 2500));
                page++;
            }
            // while (true) {
            //   console.log(`Crawling page ${page}...`);
            //
            //   const reviews = this.getReviewsFromPage();
            //   collectedReviews = collectedReviews.concat(reviews);
            //
            //   if (collectedReviews.length >= this.reviewQuantity) {
            //     collectedReviews = collectedReviews.slice(
            //       0,
            //       this.reviewQuantity
            //     );
            //     break;
            //   }
            //
            //   sendMessage(
            //     {
            //       type: 'ETSY/SEND_TEMP_COLLECTED',
            //       data: collectedReviews.length
            //     },
            //     this.iframeId
            //   );
            //
            //   const paginationButtons = document.querySelectorAll(
            //     'nav[data-clg-id=WtPagination] a'
            //   );
            //   const nextButton = paginationButtons
            //     ? paginationButtons[paginationButtons.length - 1]
            //     : undefined;
            //
            //   if (!nextButton) {
            //     break;
            //   }
            //   const isNextButtonDisabled =
            //     nextButton.getAttribute('aria-disabled') === 'true';
            //
            //   if (isNextButtonDisabled) {
            //     console.log('Reached the last page.');
            //     break;
            //   }
            //
            //   const lastReviewId = reviews[reviews.length - 1]?.reviewId;
            //
            //   await this.clickNextAndWaitForChange(
            //     nextButton,
            //     lastReviewId
            //   );
            //
            //   page++;
            // }

            console.log('Crawling done:', collectedReviews);

            sendMessage(
                {
                    type: 'ETSY/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        }
    };

    const shopeeHandler = {
        name: 'shopee',
        containerId: 'LAI-Shopee-Importer-container',
        iframeId: 'LAI-Shopee-Importer-iframe',
        reviewQuantity: 30,
        handleMessage(event) {
            switch (event?.data?.type) {
                case 'SHOPEE/START_CRAWL':
                    const quantity = event?.data?.data || 30;
                    this.reviewQuantity = quantity;
                    console.log('Start crawl...');

                    this.startCrawl();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                default:
                    break;
            }
        },
        // async crawlFirstPage() {
        //   return new Promise((resolve, reject) => {
        //     const filters = Array.from(
        //       document.querySelectorAll(
        //         '.product-rating-overview__filter'
        //       )
        //     );

        //     const activeIndex = filters.findIndex((el) =>
        //       el.classList.contains(
        //         'product-rating-overview__filter--active'
        //       )
        //     );
        //     const altIndex = filters.findIndex(
        //       (_el, idx) => idx !== activeIndex
        //     );

        //     const originalFilter = filters[activeIndex];
        //     const dummyFilter = filters[altIndex];

        //     const originalFetch = window.fetch;
        //     let phase = 'dummy';

        //     window.fetch = async function(...args) {
        //       const url = args[0];
        //       const isShopeeRatingApi =
        //         typeof url === 'string' &&
        //         url.includes('/api/v2/item/get_ratings');

        //       const res = await originalFetch.apply(this, args);

        //       if (isShopeeRatingApi) {
        //         const cloned = res.clone();
        //         cloned.json().then((json) => {
        //           if (phase === 'dummy') {
        //             phase = 'original';
        //             setTimeout(() => {
        //               originalFilter?.click();
        //             }, 3000);
        //           } else if (phase === 'original') {
        //             window.fetch = originalFetch;
        //             resolve(json);
        //           }
        //         });
        //       }

        //       return res;
        //     };

        //     dummyFilter?.click();
        //   });
        // },
        async crawlFirstPage() {
            try {
                const commentListDiv = document.querySelectorAll("div.q2b7Oq");

                if (!commentListDiv || commentListDiv.length === 0) {
                    return {
                        data: { ratings: [] },
                    };
                }

                let reviews = [];

                let region = null;
                let regionGetImage = null;
                let url = window?.location?.href;
                try {
                    if (typeof url !== "undefined" && url) {
                        const match = url.match(/(?:[a-z0-9-]+\.)?shopee\.(?:com|co)?\.?([a-z]{2})/i);

                        region = (match && (match[1] || match[2] || match[3]))?.toUpperCase() || null;
                        regionGetImage = region;
                    }
                } catch (e) {
                    region = "VN";
                }

                commentListDiv.forEach((div, index) => {
                    try {
                        if (!div) {
                            return;
                        }

                        const cmtid = div.getAttribute("data-cmtid") || null;
                        const author_username = div.querySelector(".InK5kS")?.innerText?.trim() || null;
                        const comment = div.querySelector(".YNedDV")?.innerText?.trim() || null;


                        const ctime_raw = div.querySelector(".XYk98l")?.innerText?.trim();
                        console.log('ctime_raw', ctime_raw);
                        let ctime = null;
                        if (ctime_raw) {
                            try {
                                const ctime_str = ctime_raw.split("|")[0]?.trim();
                                const ctime_str_2 = ctime_raw.split("|")[1]?.trim();
                                if (ctime_str) {
                                    const timestamp = new Date(ctime_str).getTime();
                                    if (!isNaN(timestamp) && isFinite(timestamp)) {
                                        ctime = Math.floor(timestamp / 1000);
                                    }
                                    else if (ctime_str_2) {
                                        const timestamp = new Date(ctime_str_2).getTime();
                                        region = ctime_raw.split("|")[0]?.trim()?.toUpperCase();
                                        if (!isNaN(timestamp) && isFinite(timestamp)) {
                                            ctime = Math.floor(timestamp / 1000);
                                        }
                                    }
                                }

                            } catch (e) {
                                ctime = null;
                            }
                        }

                        const rating_star = div.querySelector(".rGdC5O")?.querySelectorAll(".icon-rating-solid")?.length || 0;

                        let images = [];
                        try {
                            const imageElements = div.querySelectorAll(".P37NgF");
                            if (imageElements && imageElements.length > 0) {
                                images = Array.from(imageElements)
                                    .map((picture) => {
                                        try {
                                            const source = picture?.querySelector("source");
                                            const srcset = source?.getAttribute("srcset") || "";
                                            const match = srcset.match(/file\/(.*?)@resize/);
                                            return match && match[1] ? match[1] : null;
                                        } catch (e) {
                                            return null;
                                        }
                                    })
                                    .filter(Boolean);
                            }
                        } catch (e) {
                            images = [];
                        }

                        let videos = [];
                        try {
                            const videoElements = div.querySelectorAll(".YknRSx");
                            if (videoElements && videoElements.length > 0) {
                                videos = Array.from(videoElements)
                                    .map((videoDiv) => {
                                        try {
                                            const video = videoDiv?.querySelector("video");
                                            const src = video?.getAttribute("src");
                                            return src
                                                ? {
                                                    url: src,
                                                }
                                                : null;
                                        } catch (e) {
                                            return null;
                                        }
                                    })

                                    .filter(Boolean);
                            }
                        } catch (e) {
                            videos = [];
                        }

                        const safeCmtId = cmtid ? parseInt(cmtid) : null;
                        if (safeCmtId !== null && !isNaN(safeCmtId)) {
                            reviews.push({
                                cmtid: safeCmtId,
                                author_username: author_username,
                                comment: comment,
                                ctime: ctime,
                                rating_star: rating_star,
                                images: images,
                                videos: videos,
                                region: region,
                                regionGetImage: regionGetImage
                            });
                        }
                    } catch (err) {
                        console.error(`Error processing review at index ${index}:`, err);
                    }
                });

                return {
                    data: { ratings: reviews },
                };
            } catch (error) {
                return {
                    data: { ratings: [] },
                };
            }
        },
        async crawlNextPage() {
            return new Promise((resolve, reject) => {
                const pagination = document.querySelector(
                    'nav.shopee-page-controller'
                );

                const buttons = Array.from(
                    pagination.querySelectorAll('button')
                );
                const nextButton = buttons.find((btn) =>
                    btn.classList.contains('shopee-icon-button--right')
                );
                const currentPageIndex = buttons.findIndex((btn) =>
                    btn.classList.contains('shopee-button-solid--primary')
                );
                const nextButtonIndex = buttons.indexOf(nextButton);
                const isNextClickable =
                    nextButton && nextButtonIndex - currentPageIndex > 1;
                console.log('isNextClickable', isNextClickable);
                if (!isNextClickable) {
                    resolve(null);
                }

                const originalFetch = window.fetch;
                window.fetch = async function (...args) {
                    const url = args[0];
                    const isShopeeRatingApi =
                        typeof url === 'string' &&
                        url.includes('/api/v2/item/get_ratings');

                    const res = await originalFetch.apply(this, args);

                    if (isShopeeRatingApi) {
                        const cloned = res.clone();
                        cloned.json().then((json) => {
                            window.fetch = originalFetch;
                            resolve(json);
                        });
                    }

                    return res;
                };

                nextButton.click();
            });
        },
        async scrollToBottomTwice() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
        },
        endCrawl(collectedReviews) {
            sendMessage(
                {
                    type: 'SHOPEE/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        sendTempCollectedNumber(number) {
            sendMessage(
                {
                    type: 'SHOPEE/SEND_TEMP_COLLECTED',
                    data: number
                },
                this.iframeId
            );
        },
        async startCrawl() {
            await this.scrollToBottomTwice();
            let collectedReviews = [];
            let page = 1;

            let isSinglePageReview = (() => {
                const pagination = document.querySelector(
                    'nav.shopee-page-controller.product-ratings__page-controller'
                );
                if (!pagination) return true; // fallback if pagination not found

                const buttons = pagination.querySelectorAll('button');
                return buttons.length === 3;
            })();

            if (isSinglePageReview) {
                let crawledData = await this.crawlFirstPage();

                collectedReviews = crawledData?.data?.ratings || [];
                console.log('collectedReviews', collectedReviews);
                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                }
                this.endCrawl(collectedReviews);
            } else {
                console.log(`Crawling page ${page}...`);

                let crawledData = await this.crawlFirstPage();

                collectedReviews = crawledData?.data?.ratings || [];

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                if (collectedReviews.length === 0) {
                    this.endCrawl([]);
                    return;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);

                await new Promise((resolve) => setTimeout(resolve, 2500));

                while (true) {
                    const tempData = await this.crawlNextPage();

                    if (!tempData) break;

                    const reviews = tempData?.data?.ratings || [];
                    collectedReviews = collectedReviews.concat(reviews);

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await new Promise((resolve) => setTimeout(resolve, 2500));

                    page++;
                }
                console.log('Crawling done:', collectedReviews);
                this.endCrawl(collectedReviews);
            }
        }
    };

    const ebayHandler = {
        name: 'ebay',
        containerId: 'LAI-Ebay-Importer-container',
        iframeId: 'LAI-Ebay-Importer-iframe',
        CONFIG: {
            REQUEST_TIMEOUT: 25000,
            CAPTCHA_CODE: 1
        },

        handleMessage(event) {
            switch (event?.data?.type) {
                case 'EBAY/START_CRAWL':
                    console.log('Start crawl v1.');
                    this.reviewQuantity =
                        event?.data?.data.reviewQuantity || 30;
                    this.startCrawl();
                    break;
                case 'EBAY/START_CRAWL_V2':
                    console.log('Start crawl v2.');
                    this.reviewQuantity =
                        event?.data?.data.reviewQuantity || 30;
                    this.startCrawlV2();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'EBAY/GO_TO_REVIEW_PAGE':
                    console.log('Go to review page.');
                    this.goToReviewPage();
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                default:
                    break;
            }
        },
        goToReviewPage() {
            const reviewPageLink = document.querySelector(
                'a.fdbk-detail-list__tabbed-btn, a.fdbk-detail-list__btn-container__btn'
            );

            if (!reviewPageLink) {
                sendMessage(
                    {
                        type:
                            'EBAY/CAN_NOT_GO_TO_REVIEW_PAGE_DUE_PRODUCT_HAS_NO_REVIEWS'
                    },
                    this.iframeId
                );
                return;
            }

            reviewPageLink.click();
            window.location.reload();
        },
        async crawlFirstPage() {
            return new Promise((resolve, reject) => {
                const sortByFilters = Array.from(
                    document.querySelectorAll(
                        'div.listbox__option.fdbk-sort-by-options'
                    )
                );

                let activeIndex = sortByFilters.findIndex((el) =>
                    el.classList.contains('listbox__option--active')
                );

                if (activeIndex === -1) {
                    activeIndex = 0;
                }

                const altIndex = sortByFilters.findIndex(
                    (_el, idx) => idx !== activeIndex
                );

                const originalFilter = sortByFilters[activeIndex];
                const dummyFilter = sortByFilters[altIndex];
                const originalFetch = window.fetch;
                let phase = 'dummy';
                const self = this;

                window.fetch = async function (...args) {
                    const url = args[0];
                    const isEbayApi =
                        typeof url === 'string' &&
                        url.includes('/fdbk/mweb_profile');
                    const isCaptchaApi =
                        typeof url === 'string' &&
                        url.includes('/splashui/captcha');
                    if (isEbayApi) {
                        const urlObj = new URL(url);
                        urlObj.searchParams.set('page_id_item', '1');
                        args[0] = urlObj.toString();
                    }

                    const res = await originalFetch.apply(this, args);

                    if (isEbayApi) {
                        const cloned = res.clone();
                        cloned.json().then((json) => {
                            if (phase === 'dummy') {
                                phase = 'original';
                                setTimeout(() => {
                                    originalFilter?.click();
                                }, 3000);
                            } else if (phase === 'original') {
                                window.fetch = originalFetch;
                                resolve(json);
                            }
                        });
                    }
                    if (isCaptchaApi) {
                        resolve(self.CONFIG.CAPTCHA_CODE);
                        return;
                    }

                    return res;
                };

                dummyFilter?.click();
            });
        },
        async crawlNextPage() {
            return new Promise((resolve, reject) => {
                const nextA = document.querySelector(
                    'a[data-testid="pagination-next"]'
                );
                const nextButton = document.querySelector(
                    'button[data-testid="pagination-next"]'
                );

                if (nextButton) {
                    resolve(null);
                    return;
                }
                const self = this;

                const originalFetch = window.fetch;

                window.fetch = async function (...args) {
                    const url = args[0];
                    const isEbayApi =
                        typeof url === 'string' &&
                        url.includes('/fdbk/mweb_profile');
                    const isCaptchaApi =
                        typeof url === 'string' &&
                        url.includes('/splashui/captcha');

                    const res = await originalFetch.apply(this, args);

                    if (isEbayApi) {
                        const cloned = res.clone();
                        cloned.json().then((json) => {
                            window.fetch = originalFetch;
                            resolve(json);
                        });
                    }
                    if (isCaptchaApi) {
                        resolve(self.CONFIG.CAPTCHA_CODE);
                        return;
                    }

                    return res;
                };

                nextA?.click();
            });
        },
        async getReviewsFromResponse(data) {
            if (!data || !data.modules) return [];
            const moduleEntries = Object.entries(
                data.modules
            ).filter(([key, value]) =>
                key.startsWith('FEEDBACK_CARD_MODULE_')
            );

            if (moduleEntries.length === 0) {
                console.log(
                    'No feedback card modules found in response data.'
                );
                return [];
            }
            const processedReviews = [];

            // Xá»­ lÃ½ tuáº§n tá»± tá»«ng module
            for (const [key, value] of moduleEntries) {
                const keyParts = key.split('_');
                const feedbackId = keyParts[keyParts.length - 1];

                const feedbackInfo = value?.card?.feedbackInfo;
                let images = null;

                if (
                    feedbackInfo?.imageCount &&
                    parseInt(feedbackInfo?.imageCount) > 1
                ) {
                    const urlObj = new URL(window.location.href);
                    const username = urlObj.searchParams.get('username');
                    const itemId = urlObj.searchParams.get('item_id');
                    const hostname = urlObj.hostname;

                    try {
                        const res = await fetch(
                            `https://${hostname}/fdbk/feedback_detail?receiver_username=${username}&item_id=${itemId}&feedback_id=${feedbackId}&action_source=ITEM&supported_ux_components=HEADER,IMAGE_GALLERY,FEEDBACK_CARD,FEEDBACK_CARD_V3`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        const resJson = await res.json();
                        images =
                            resJson?.modules?.IMAGE_GALLERY_MODULE?.images?.map(
                                (image) => image.URL.split('?')[0]
                            ) || [];
                    } catch (error) {
                        sendMessage(
                            {
                                type: 'EBAY/ERROR_FETCHING_IMAGES',
                                data: {
                                    error: error?.message
                                }
                            },
                            this.iframeId
                        );
                        console.error(
                            'âŒ Error fetching images for feedback',
                            feedbackId,
                            ':',
                            error
                        );
                    }
                }

                processedReviews.push({
                    ...value?.card?.feedbackInfo,
                    feedbackId: feedbackId,
                    images: images
                });
            }

            return processedReviews;
        },
        async startCrawl() {
            const container = document.getElementById(this.containerId);
            if (container) {
                container.style.zIndex = '100000000000000';
            }

            let collectedReviews = [];
            let page = 1;

            const isSinglePageReview = (() => {
                const pagination = document.querySelector(
                    'ol.pagination__items'
                );
                if (!pagination) return true;
                const buttons = pagination.querySelectorAll('li');
                const hasHiddenItems = Array.from(buttons).some(
                    (li) => li.hasAttribute('hidden') || li.hidden === true
                );
                return !hasHiddenItems;
            })();

            if (isSinglePageReview) {
                console.log('Processing single page review');
                const tempData = await this.crawlFirstPage();
                if (tempData === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlByCaptcha(collectedReviews);
                    return;
                }
                collectedReviews = await this.getReviewsFromResponse(
                    tempData
                );

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                }

                this.endCrawl(collectedReviews);
            } else {
                console.log(
                    `Crawling multiple pages - Starting page ${page}...`
                );

                const firstPageResponse = await this.crawlFirstPage();
                if (firstPageResponse === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlByCaptcha(collectedReviews);
                    return;
                }
                collectedReviews = await this.getReviewsFromResponse(
                    firstPageResponse
                );

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                if (collectedReviews.length === 0) {
                    console.log('No reviews found on first page');
                    this.endCrawl([]);
                    return;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                await new Promise((resolve) => setTimeout(resolve, 2500));

                while (true) {
                    console.log(`Crawling page ${page}...`);

                    const tempData = await this.crawlNextPage();
                    if (tempData === this.CONFIG.CAPTCHA_CODE) {
                        this.endCrawlByCaptcha(collectedReviews);
                        return;
                    }

                    const reviews = await this.getReviewsFromResponse(tempData);
                    if (reviews.length === 0) {
                        console.log('No reviews found on this page');
                        break;
                    }
                    collectedReviews = collectedReviews.concat(reviews);

                    console.log(
                        `Page ${page} collected:`,
                        reviews.length,
                        'reviews. Total:',
                        collectedReviews.length
                    );

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await new Promise((resolve) => setTimeout(resolve, 2500));

                    page++;
                }

                console.log(
                    'Crawling completed - Total reviews:',
                    collectedReviews.length
                );
                this.endCrawl(collectedReviews);
            }
        },
        restoreXHR(originalOpen, originalSend) {
            window.XMLHttpRequest.prototype.open = originalOpen;
            window.XMLHttpRequest.prototype.send = originalSend;
        },
        async getReviewsFromResponseV2(data) {
            if (!data || !data.modules) return [];

            const arrayData =
                data?.modules?.FEEDBACK_SUMMARY_V2?.feedbackView
                    ?.feedbackCards || [];

            const url = window.location.href;
            const urlObj = new URL(window.location.href);

            const hostname = urlObj.hostname;

            const match = url.match(/feedback_profile\/([^/?#]+)/);
            const username = match?.[1];

            const processedReviews = [];

            for (let i = 0; i < arrayData.length; i++) {
                const item = arrayData[i];
                const feedbackId = item?.feedbackId;
                let images = null;

                try {
                    if (
                        item?.feedbackInfo?.imageCount &&
                        parseInt(item?.feedbackInfo?.imageCount) > 1
                    ) {
                        const text =
                            item?.feedbackInfo?.item?.itemSummary?.textSpans || '';
                        const itemId =
                            text?.[0]?.text.match(/\(#(\d+)\)/)?.[1] ||
                            parseInt(text?.[0]?.text) ||
                            null;

                        if (itemId) {
                            if (i > 0) {
                                await this.randomDelay(500);
                            }
                            const res = await fetch(
                                `https://${hostname}/fdbk/feedback_detail?receiver_username=${username}&item_id=${itemId}&feedback_id=${feedbackId}&action_source=ITEM&supported_ux_components=HEADER,IMAGE_GALLERY,FEEDBACK_CARD,FEEDBACK_CARD_V3`,
                                {
                                    method: 'GET',
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );

                            if (res.ok) {
                                const resJson = await res.json();
                                images =
                                    resJson?.modules?.IMAGE_GALLERY_MODULE?.images?.map(
                                        (image) => image.URL.split('?')[0]
                                    ) || [];
                            } else {
                                console.warn(
                                    `âš ï¸ Failed to fetch images for item ${i +
                                    1}: HTTP ${res.status}`
                                );
                            }
                        }
                    }

                    processedReviews.push({
                        ...item?.feedbackInfo,
                        feedbackId: feedbackId,
                        images: images
                    });
                } catch (error) {
                    console.error(`âŒ Error processing item ${i + 1}:`, error);
                    processedReviews.push({
                        ...item?.feedbackInfo,
                        feedbackId: feedbackId,
                        images: null
                    });
                }
            }

            return processedReviews;
        },
        randomDelay(baseMs = 1000) {
            const ms = baseMs + Math.random() * baseMs;
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        async crawlFirstPageWithImageFilter() {
            return new Promise((resolve, reject) => {
                const checkbox = document.querySelector(
                    'input#imageFilterCheckbox'
                );
                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve([]);
                }, this.CONFIG.REQUEST_TIMEOUT);

                const self = this;
                let phase = 'dummy';

                originalXHR.prototype.open = function (method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                originalXHR.prototype.send = function (data) {
                    if (
                        this._url &&
                        this._url.includes('/fdbk/update_feedback_profile')
                    ) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            if (this.status === 200) {
                                try {
                                    const json = JSON.parse(this.responseText);
                                    if (phase === 'dummy') {
                                        phase = 'original';
                                        setTimeout(() => {
                                            checkbox?.click();
                                        }, 3000);
                                    } else if (phase === 'original') {
                                        self.restoreXHR(originalOpen, originalSend);
                                        resolve(json);
                                    }
                                } catch (e) {
                                    console.error('Response parse error:', e);
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(self.CONFIG.TIMEOUT_ERROR);
                                }
                            } else {
                                console.log('Too many requests - server busy.');
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.TIMEOUT_ERROR);
                            }
                        });
                    }
                    if (this._url && this._url.includes('/splashui/captcha')) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            self.restoreXHR(originalOpen, originalSend);
                            resolve(self.CONFIG.CAPTCHA_CODE);
                        });
                    }
                    return originalSend.apply(this, arguments);
                };
                checkbox?.click();
            });
        },
        async crawlFirstPageWithPerPage() {
            return new Promise((resolve, reject) => {
                console.log('Crawling first page v2...');
                const itemsPerPage = document.querySelector(
                    'div.itemsPerPage'
                );

                const lastItem = itemsPerPage?.querySelector(
                    'button:last-child'
                );

                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve([]);
                }, this.CONFIG.REQUEST_TIMEOUT);

                originalXHR.prototype.open = function (method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                const self = this;

                originalXHR.prototype.send = function (data) {
                    if (
                        this._url &&
                        this._url.includes('/fdbk/update_feedback_profile')
                    ) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            if (this.status === 200) {
                                try {
                                    const json = JSON.parse(this.responseText);
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(json);
                                } catch (e) {
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(self.CONFIG.TIMEOUT_ERROR);
                                }
                            } else {
                                console.log('Error while fetching first page');
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.TIMEOUT_ERROR);
                            }
                        });
                    }
                    if (this._url && this._url.includes('/splashui/captcha')) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            self.restoreXHR(originalOpen, originalSend);
                            resolve(self.CONFIG.CAPTCHA_CODE);
                        });
                    }
                    return originalSend.apply(this, arguments);
                };

                lastItem?.click();
            });
        },

        async crawlNextPageV2() {
            return new Promise((resolve, reject) => {
                const buttonNext = document.querySelector('button#next-page');

                if (buttonNext?.getAttribute('aria-disabled') === 'true') {
                    console.log('checked next button is disabled');
                    resolve([]);
                    return;
                }

                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve([]);
                }, this.CONFIG.REQUEST_TIMEOUT);

                const self = this;

                originalXHR.prototype.open = function (method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                originalXHR.prototype.send = function (data) {
                    if (
                        this._url &&
                        this._url.includes('/fdbk/update_feedback_profile')
                    ) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            if (this.status === 200) {
                                try {
                                    const json = JSON.parse(this.responseText);
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(json);
                                } catch (e) {
                                    console.error('Response parse error:', e);
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(self.CONFIG.TIMEOUT_ERROR);
                                }
                            } else {
                                console.log('error while fetching next page');
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.TIMEOUT_ERROR);
                            }
                        });
                    }
                    if (this._url && this._url.includes('/splashui/captcha')) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            self.restoreXHR(originalOpen, originalSend);
                            resolve(self.CONFIG.CAPTCHA_CODE);
                        });
                    }
                    return originalSend.apply(this, arguments);
                };

                buttonNext?.click();
            });
        },
        async startCrawlV2() {
            const container = document.getElementById(this.containerId);
            if (container) {
                container.style.zIndex = '100000000000000';
            }

            const buttonTab = document.querySelectorAll(
                'button.tabs__item'
            );
            if (buttonTab[2].getAttribute('selected') !== 'true') {
                buttonTab[2].click();
                await new Promise((resolve) => setTimeout(resolve, 4000));
            }

            let collectedReviews = [];
            let page = 2;

            const isSinglePageReview = (() => {
                const itemsPerPage = document.querySelector(
                    'div.itemsPerPage'
                );
                if (!itemsPerPage) return true;
            })();

            if (isSinglePageReview) {
                console.log('Processing single page review');
                const tempData = await this.crawlFirstPageWithImageFilter();
                if (tempData === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlByCaptcha(collectedReviews);
                    return;
                }
                collectedReviews = await this.getReviewsFromResponseV2(
                    tempData
                );

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                }

                this.endCrawl(collectedReviews);
            } else {
                console.log(`Crawling multiple pages ...`);

                const firstPageResponse = await this.crawlFirstPageWithPerPage();
                if (firstPageResponse === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlByCaptcha(collectedReviews);
                    return;
                }
                collectedReviews = await this.getReviewsFromResponseV2(
                    firstPageResponse
                );

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                if (collectedReviews.length === 0) {
                    console.log('No reviews found on first page');
                    this.endCrawl([]);
                    return;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                await new Promise((resolve) => setTimeout(resolve, 2500));

                while (true) {
                    console.log(`Crawling page ${page}...`);

                    const tempData = await this.crawlNextPageV2();
                    if (tempData === this.CONFIG.CAPTCHA_CODE) {
                        this.endCrawlByCaptcha(collectedReviews);
                        return;
                    }
                    const reviews = await this.getReviewsFromResponseV2(
                        tempData
                    );

                    if (reviews.length === 0) {
                        console.log('No reviews found on this page');
                        break;
                    }
                    collectedReviews = collectedReviews.concat(reviews);

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await this.randomDelay(2000);

                    page++;
                }

                console.log(
                    'Crawling completed - Total reviews:',
                    collectedReviews.length
                );
                this.endCrawl(collectedReviews);
            }
        },
        sendTempCollectedNumber(number) {
            sendMessage(
                {
                    type: 'EBAY/SEND_TEMP_COLLECTED',
                    data: number
                },
                this.iframeId
            );
        },
        endCrawl(collectedReviews) {
            sendMessage(
                {
                    type: 'EBAY/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByCaptcha(collectedReviews) {
            sendMessage(
                {
                    type: 'EBAY/CRAWL_DONE_BY_CAPTCHA',
                    data: collectedReviews
                },
                this.iframeId
            );
        }
    };

    const sheinHandler = {
        name: 'shein',
        containerId: 'LAI-Shein-Importer-container',
        iframeId: 'LAI-Shein-Importer-iframe',
        isCrawlStopped: false,
        CONFIG: {
            CAPTCHA_CODE: 1,
            FORBIDEN_CODE: 2,
            TIMEOUT_CODE: 3,
            REQUEST_TIMEOUT: 120000
        },
        handleMessage(event) {
            switch (event?.data?.type) {
                case 'SHEIN/START_CHECK_THEME':
                    console.log('Start check theme.');
                    this.checkTheme();
                    break;
                case 'SHEIN/START_CRAWL_V1':
                    this.reviewQuantity =
                        event?.data?.data.reviewQuantity || 30;
                    this.defaultCountry =
                        event?.data?.data.defaultCountry || 'US';
                    console.log('Start crawl.');
                    this.startCrawlV1();
                    break;
                case 'SHEIN/START_CRAWL_V2':
                    this.reviewQuantity =
                        event?.data?.data.reviewQuantity || 30;
                    this.defaultCountry =
                        event?.data?.data.defaultCountry || 'US';
                    console.log('Start crawl.');
                    this.startCrawlV2();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'SHEIN/GO_TO_REVIEW_PAGE':
                    console.log('Go to review page.');
                    this.goToReviewPage();
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                case 'SHEIN/RELOAD_PAGE':
                    console.log('Reload page.');
                    window.location.reload();
                default:
                    break;
            }
        },
        checkTheme() {
            let theme = 'v1';
            if (document.querySelector('div.common-reviews__pageViewAll')) {
                theme = 'v2';
            }
            sendMessage(
                {
                    type: 'SHEIN/CHECK_THEME',
                    data: theme
                },
                this.iframeId
            );
        },
        goToReviewPage() {
            const pageViewAll = document.querySelector(
                'div.common-reviews__pageViewAll'
            );
            if (pageViewAll) {
                pageViewAll.click();
            }
        },

        restoreXHR(originalOpen, originalSend) {
            window.XMLHttpRequest.prototype.open = originalOpen;
            window.XMLHttpRequest.prototype.send = originalSend;
        },
        randomDelay(min = 2000, max = 4000) {
            const delay = Math.floor(Math.random() * (max - min + 1)) + min;
            return new Promise((resolve) => setTimeout(resolve, delay));
        },
        getReviewsFromResponse(divreviews) {
            if (!divreviews) return [];

            const reviewEls = divreviews.querySelectorAll(
                '.j-expose__common-reviews__list-item'
            );

            return Array.from(reviewEls).map((el) => {
                const name =
                    el.querySelector('.nikename')?.textContent?.trim() || '';

                const time =
                    el.querySelector('.date')?.textContent?.trim() || '';

                const rating =
                    el.querySelectorAll('.common-rate__star .common-rate__icon')
                        .length || 5;

                let content =
                    el.querySelector('.rate-des')?.textContent?.trim() || '';
                if (content == '') {
                    const ul = el.querySelector('ul[data-v-d32effe1]');
                    let result = '';

                    if (ul) {
                        const listItems = ul.querySelectorAll(
                            'li[data-v-d32effe1]'
                        );
                        listItems.forEach((li) => {
                            const tagName = li
                                .querySelector('.tag-name')
                                ?.textContent.trim();
                            const tagContent = li
                                .querySelector('.tag-content')
                                ?.textContent.trim();
                            if (tagName && tagContent) {
                                result += `${tagName}: ${tagContent}. `;
                            }
                        });
                    }

                    content = result.trim();
                }

                const imgEls = el.querySelectorAll(
                    '.common-reviews__list-item-pic img'
                );
                const photos = Array.from(imgEls)
                    .map(
                        (img) =>
                            img.getAttribute('src') || img.getAttribute('data-src')
                    )
                    .filter(Boolean)
                    .map((src) =>
                        src.startsWith('http') ? src : `https:${src}`
                    );

                const reviewId =
                    el
                        .getAttribute('data-expose-id')
                        ?.match(/^\d+-(\d+)-/)?.[1] || '';
                return {
                    reviewId,
                    name,
                    time,
                    rating,
                    content,
                    photos
                };
            });
        },
        crawlFirstPageV2() {
            const divreviews = document.querySelector(
                'div.common-reviews__list.j-expose__common-reviews__list'
            );
            const reviews = this.getReviewsFromResponse(divreviews);
            return reviews;
        },
        async crawlNextPageV2(page) {
            return new Promise((resolve, reject) => {
                const self = this;
                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                originalXHR.prototype.open = function (method, url, ...args) {
                    const xhr = this;
                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        const urlObj = new URL(url);
                        urlObj.searchParams.set('tag_id', '');
                        url = urlObj.toString();
                        this._url = url;
                    } else {
                        this._url = url;
                    }
                    return originalOpen.apply(this, [method, url, ...args]);
                };
                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve(this.CONFIG.TIMEOUT_CODE);
                }, this.CONFIG.REQUEST_TIMEOUT);
                originalXHR.prototype.send = function (data) {
                    const xhr = this;
                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        xhr.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            if (xhr.status === 200) {
                                try {
                                    const json = JSON.parse(xhr.responseText);

                                    if (json?.sub_code) {
                                        // console.log('Captcha detected in next page');
                                    } else {
                                        self.restoreXHR(originalOpen, originalSend);
                                        resolve(json);
                                    }
                                } catch (e) {
                                    console.error(
                                        'âŒ Page',
                                        page,
                                        'JSON parse error:',
                                        e
                                    );
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                // setTimeout(() => {
                                //   buttonNext?.click();
                                // }, 2000);
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.FORBIDEN_CODE);
                            }
                        });
                    }
                    if (
                        xhr._url &&
                        xhr._url.includes(
                            '/risk/verify/identity/validation/check'
                        )
                    ) {
                        console.log(
                            'XHR URL verify identity next page:',
                            xhr._url
                        );
                        xhr.addEventListener('load', function () {
                            if (xhr.status === 200) {
                                try {
                                    const json = JSON.parse(xhr.responseText);
                                    if (json?.code == 0) {
                                        // console.log('captcha can pass');
                                    } else {
                                        const container = document.getElementById(
                                            self.containerId
                                        );
                                        if (container) {
                                            container.style.zIndex = '100000000000000';
                                        }
                                        resolve(self.CONFIG.CAPTCHA_CODE);
                                    }
                                } catch (e) {
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                //chÆ°a gáº·p trÆ°á»ng há»£p nÃ y
                                console.log(
                                    'verify captcha resposne status different from 200',
                                    xhr.status
                                );
                            }
                        });
                    }

                    return originalSend.apply(this, arguments);
                };
                window.scrollTo({
                    top: document.body.scrollHeight
                });
            });
        },
        getTotalItems() {
            try {
                const scripts = Array.from(
                    document.querySelectorAll('script')
                );
                for (const script of scripts) {
                    const content = script.textContent;
                    if (content.includes('commentBuyBoxTotal')) {
                        const match = content.match(
                            /["']?commentBuyBoxTotal["']?\s*:\s*(\d+)/
                        );
                        if (match && match[1]) {
                            return match[1];
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
            return 1;
        },
        async startCrawlV2() {
            console.log('ðŸš€ Báº®T Äáº¦U CRAWL Tá»”NG THá»‚');

            let collectedReviews = [];
            let page = 2;

            const commentSection = document.querySelector(
                'div.common-reviews__list.j-expose__common-reviews__list'
            );

            if (!commentSection || commentSection.childElementCount === 0) {
                console.log(
                    'âš ï¸ No reviews found - sending no reviews message'
                );
                sendMessage(
                    { type: 'SHEIN/PRODUCT_HAS_NO_REVIEWS' },
                    this.iframeId
                );
                return;
            }
            const totalItems = this.getTotalItems();

            if (totalItems < 20) {
                let crawledData = this.crawlFirstPageV2();

                if (crawledData.length >= this.reviewQuantity) {
                    collectedReviews = crawledData.slice(
                        0,
                        this.reviewQuantity
                    );
                }
                this.endCrawl(collectedReviews);
            } else {
                console.log('Crawling multiple pages...');
                let crawledData = this.crawlFirstPageV2();

                collectedReviews = collectedReviews.concat(crawledData);

                if (crawledData.length >= this.reviewQuantity) {
                    collectedReviews = crawledData.slice(
                        0,
                        this.reviewQuantity
                    );
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                await new Promise((resolve) => setTimeout(resolve, 3000));

                while (true) {
                    console.log('ðŸ”„ Processing page: ' + page);

                    const tempData = await this.crawlNextPageV2(page);

                    if (!tempData) {
                        break;
                    }

                    if (tempData === this.CONFIG.FORBIDEN_CODE) {
                        this.endCrawlByForbidden(collectedReviews);
                        return;
                    }

                    if (tempData === this.CONFIG.CAPTCHA_CODE) {
                        this.endCrawlBySuperCaptcha(collectedReviews);
                        return;
                    }

                    if (tempData === this.CONFIG.TIMEOUT_CODE) {
                        this.endCrawlByTimeOut(collectedReviews);
                        return;
                    }

                    const reviews = tempData?.info?.comment_info || tempData;
                    if (reviews.length === 0) {
                        console.log('No more reviews found on this page');
                        break;
                    }
                    collectedReviews = collectedReviews.concat(reviews);

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await this.randomDelay();
                    page++;
                }

                console.log(
                    'ðŸ“‹ Káº¾T THÃšC CRAWL - Collected: ' +
                    collectedReviews.length +
                    ' reviews'
                );
                this.endCrawl(collectedReviews);
            }
        },
        //v1
        async crawlFirstPageV1() {
            return new Promise((resolve, reject) => {
                const reviewTag = document.querySelector(
                    'span.common-reviews__tag-item'
                );
                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                let phase = 'dummy';
                const self = this;

                originalXHR.prototype.open = function (method, url, ...args) {
                    const xhr = this;
                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        const urlObj = new URL(url);
                        urlObj.searchParams.set('page', '1');
                        url = urlObj.toString();
                        this._url = url;
                    } else {
                        this._url = url;
                    }
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve(this.CONFIG.TIMEOUT_CODE);
                }, this.CONFIG.REQUEST_TIMEOUT);
                originalXHR.prototype.send = function (data) {
                    const xhr = this;

                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        xhr.addEventListener('load', function () {
                            if (xhr.status === 200) {
                                clearTimeout(timeoutId);
                                try {
                                    const json = JSON.parse(xhr.responseText);

                                    if (phase === 'dummy') {
                                        phase = 'original';
                                        if (json?.sub_code) {
                                            // console.log('Captcha detected in dummy phase');
                                        } else {
                                            setTimeout(() => {
                                                reviewTag?.click();
                                            }, 3000);
                                        }
                                    } else if (phase === 'original') {
                                        // console.log('original phase', json);
                                        if (json?.sub_code) {
                                            // console.log(
                                            //   'Captcha detected in original phase'
                                            // );
                                            return;
                                        } else {
                                            self.restoreXHR(originalOpen, originalSend);
                                            // const data = self.handleJsonResponse(json);
                                            resolve(json);
                                        }
                                    }
                                } catch (e) {
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.FORBIDEN_CODE);
                            }
                        });
                    }

                    if (
                        xhr._url &&
                        xhr._url.includes(
                            '/risk/verify/identity/validation/check'
                        )
                    ) {
                        xhr.addEventListener('load', function () {
                            if (xhr.status === 200) {
                                try {
                                    const json = JSON.parse(xhr.responseText);
                                    if (json?.code == 0) {
                                        setTimeout(() => {
                                            reviewTag?.click();
                                        }, 2000);
                                    } else {
                                        const container = document.getElementById(
                                            self.containerId
                                        );
                                        if (container) {
                                            container.style.zIndex = '100000000000000';
                                        }

                                        resolve(self.CONFIG.CAPTCHA_CODE);
                                    }
                                } catch (e) {
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                // const reviews = self.crawlThisPage();
                                // resolve(reviews);

                                //chÆ°a gáº·p trÆ°á»ng há»£p nÃ y
                                console.log(
                                    'verify captcha resposne status different from 200',
                                    xhr.status
                                );
                            }
                        });
                    }

                    return originalSend.apply(this, arguments);
                };

                reviewTag?.click();
            });
        },
        async crawlNextPageV1(page) {
            const buttonNext = document.querySelector(
                'span.sui-pagination__next.sui-pagination__btn.sui-pagination__hover'
            );
            const buttonNextDisabled = document.querySelector(
                'span.sui-pagination__next.sui-pagination__btn.sui-pagination__btn-disabled'
            );

            if (buttonNextDisabled) {
                console.log(
                    'âš ï¸ Next button disabled for page',
                    page,
                    '- no more pages available'
                );
                return Promise.resolve(null);
            }

            return new Promise((resolve, reject) => {
                const self = this;
                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                originalXHR.prototype.open = function (method, url, ...args) {
                    const xhr = this;
                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        const urlObj = new URL(url);
                        urlObj.searchParams.set('tag_id', '');
                        url = urlObj.toString();
                        this._url = url;
                    } else {
                        this._url = url;
                    }
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve(this.CONFIG.TIMEOUT_CODE);
                }, this.CONFIG.REQUEST_TIMEOUT);
                originalXHR.prototype.send = function (data) {
                    const xhr = this;
                    console.log('XHR URL next page:', xhr._url);

                    if (
                        xhr._url &&
                        xhr._url.includes('/product/get_goods_review_detail')
                    ) {
                        xhr.addEventListener('load', function () {
                            if (xhr.status === 200) {
                                clearTimeout(timeoutId);
                                try {
                                    const json = JSON.parse(xhr.responseText);

                                    if (json?.sub_code) {
                                        // console.log('Captcha detected in next page');
                                    } else {
                                        self.restoreXHR(originalOpen, originalSend);
                                        resolve(json);
                                    }
                                } catch (e) {
                                    console.error(
                                        'âŒ Page',
                                        page,
                                        'JSON parse error:',
                                        e
                                    );
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                // setTimeout(() => {
                                //   buttonNext?.click();
                                // }, 2000);
                                self.restoreXHR(originalOpen, originalSend);

                                resolve(self.CONFIG.FORBIDEN_CODE);
                            }
                        });
                    }
                    if (
                        xhr._url &&
                        xhr._url.includes(
                            '/risk/verify/identity/validation/check'
                        )
                    ) {
                        xhr.addEventListener('load', function () {
                            if (xhr.status === 200) {
                                try {
                                    const json = JSON.parse(xhr.responseText);
                                    if (json?.code == 0) {
                                        // console.log('captcha can pass');
                                    } else {
                                        const container = document.getElementById(
                                            self.containerId
                                        );
                                        if (container) {
                                            container.style.zIndex = '100000000000000';
                                        }
                                        resolve(self.CONFIG.CAPTCHA_CODE);
                                    }
                                } catch (e) {
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                //chÆ°a gáº·p trÆ°á»ng há»£p nÃ y
                                console.log(
                                    'verify captcha resposne status different from 200',
                                    xhr.status
                                );
                            }
                        });
                    }

                    return originalSend.apply(this, arguments);
                };

                buttonNext?.click();
            });
        },
        async startCrawlV1() {
            console.log('ðŸš€ Báº®T Äáº¦U CRAWL Tá»”NG THá»‚');

            let collectedReviews = [];
            let page = 1;

            const commentSection = document.querySelector(
                'div.common-reviews__list.j-expose__common-reviews__list'
            );

            if (!commentSection || commentSection.childElementCount === 0) {
                console.log(
                    'âš ï¸ No reviews found - sending no reviews message'
                );
                sendMessage(
                    { type: 'SHEIN/PRODUCT_HAS_NO_REVIEWS' },
                    this.iframeId
                );
                return;
            }
            const isSinglePageReview = (() => {
                const nextButton = document.querySelector(
                    'span.sui-pagination__next.sui-pagination__btn.sui-pagination__hover'
                );
                return !nextButton;
            })();

            if (isSinglePageReview) {
                let crawledData = await this.crawlFirstPageV1();

                if (crawledData === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlBySuperCaptcha();
                    return;
                }
                if (crawledData === this.CONFIG.FORBIDEN_CODE) {
                    this.endCrawlByForbidden();
                    return;
                }
                if (crawledData === this.CONFIG.TIMEOUT_CODE) {
                    this.endCrawlByTimeOut();
                    return;
                }

                collectedReviews =
                    crawledData?.info?.comment_info || crawledData;

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                }

                this.endCrawl(collectedReviews);
            } else {
                console.log('ðŸ“š Xá»¬ LÃ MULTI PAGE');

                let crawledData = await this.crawlFirstPageV1();

                if (crawledData === this.CONFIG.CAPTCHA_CODE) {
                    this.endCrawlBySuperCaptcha();
                    return;
                }
                if (crawledData === this.CONFIG.FORBIDEN_CODE) {
                    this.endCrawlByForbidden();
                    return;
                }

                if (crawledData === this.CONFIG.TIMEOUT_CODE) {
                    this.endCrawlByTimeOut();
                    return;
                }

                collectedReviews =
                    crawledData?.info?.comment_info || crawledData;

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                if (collectedReviews.length === 0) {
                    this.endCrawl([]);
                    return;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                await new Promise((resolve) => setTimeout(resolve, 3000));

                while (true) {
                    console.log('ðŸ”„ Processing page: ' + page);

                    const tempData = await this.crawlNextPageV1(page);

                    if (!tempData) {
                        break;
                    }
                    if (tempData === this.CONFIG.CAPTCHA_CODE) {
                        this.endCrawlBySuperCaptcha(collectedReviews);
                        return;
                    }
                    if (tempData === this.CONFIG.FORBIDEN_CODE) {
                        this.endCrawlByForbidden(collectedReviews);
                        return;
                    }
                    if (tempData === this.CONFIG.TIMEOUT_CODE) {
                        this.endCrawlByTimeOut(collectedReviews);
                        return;
                    }


                    const reviews = tempData?.info?.comment_info || tempData;
                    collectedReviews = collectedReviews.concat(reviews);

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await this.randomDelay();
                    page++;
                }
                console.log(
                    'ðŸ“‹ Káº¾T THÃšC CRAWL - Collected: ' +
                    collectedReviews.length +
                    ' reviews'
                );
                this.endCrawl(collectedReviews);
            }
        },
        //end v1

        sendTempCollectedNumber(number) {
            sendMessage(
                {
                    type: 'SHEIN/SEND_TEMP_COLLECTED',
                    data: number
                },
                this.iframeId
            );
        },
        endCrawl(collectedReviews) {
            sendMessage(
                {
                    type: 'SHEIN/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlBySuperCaptcha(collectedReviews = []) {
            sendMessage(
                {
                    type: 'SHEIN/END_BY_SUPER_CAPTCHA',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByForbidden(collectedReviews = []) {
            sendMessage(
                {
                    type: 'SHEIN/END_BY_FORBIDDEN',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByTimeOut(collectedReviews = []) {
            sendMessage(
                {
                    type: 'SHEIN/END_BY_TIMEOUT',
                    data: collectedReviews
                },
                this.iframeId
            );
        }
    };

    const temuHandler = {
        name: 'temu',
        containerId: 'LAI-Temu-Importer-container',
        iframeId: 'LAI-Temu-Importer-iframe',

        urlRequestReview: '/api/bg/engels/reviews/list',
        SELECTORS: {
            SCROLL_CONTAINER: 'div._10EiyDKr._3hjIP4Y2._2gC1sYKf.HVCrPqZh',
            SEE_ALL_BUTTON:
                'div._2ugbvrpI._1TeP2qll._28_m8Owy.MONl7TFo._2nOneDag'
        },

        CONFIG: {
            MAX_RETRY_ATTEMPTS: 5,
            REQUEST_TIMEOUT: 15000,
            SCROLL_UP_DISTANCE: 200,
            MAX_PAGES: 30,

            SCROLL_NO_REQUEST: 1,
            TOO_MANY_REQUESTS: 2
        },

        handleMessage(event) {
            switch (event?.data?.type) {
                case 'TEMU/START_CRAWL':
                    this.reviewQuantity = event?.data?.data || 30;
                    console.log('Start crawl.');
                    this.startCrawl();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'TEMU/RELOAD_PAGE':
                    console.log('Reload page.');
                    window.location.reload();
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                default:
                    break;
            }
        },
        restoreXHR(originalOpen, originalSend) {
            window.XMLHttpRequest.prototype.open = originalOpen;
            window.XMLHttpRequest.prototype.send = originalSend;
        },

        createXHRInterceptor(url, callback) {
            return new Promise((resolve, reject) => {
                const originalXHR = window.XMLHttpRequest;
                const originalOpen = originalXHR.prototype.open;
                const originalSend = originalXHR.prototype.send;

                let timeoutId = setTimeout(() => {
                    this.restoreXHR(originalOpen, originalSend);
                    resolve(this.CONFIG.SCROLL_NO_REQUEST);
                }, this.CONFIG.REQUEST_TIMEOUT);

                originalXHR.prototype.open = function (method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    return originalOpen.apply(this, [method, url, ...args]);
                };

                const self = this;

                originalXHR.prototype.send = function (data) {
                    if (this._url && this._url.includes(url)) {
                        this.addEventListener('load', function () {
                            clearTimeout(timeoutId);
                            if (this.status === 200) {
                                try {
                                    const json = JSON.parse(this.responseText);
                                    self.restoreXHR(originalOpen, originalSend);
                                    resolve(callback(json));
                                } catch (e) {
                                    console.log('status not 200');
                                    self.restoreXHR(originalOpen, originalSend);
                                    reject(e);
                                }
                            } else {
                                console.log('Too many requests');
                                self.restoreXHR(originalOpen, originalSend);
                                resolve(self.CONFIG.TOO_MANY_REQUESTS);
                            }
                        });
                    }
                    return originalSend.apply(this, arguments);
                };
            });
        },

        clickShowMoreButton() {
            const button = document.querySelector(
                this.SELECTORS.SEE_ALL_BUTTON
            );
            if (button) button.click();
        },

        scrollToLastComment() {
            const scrollContainer = document.querySelector(
                this.SELECTORS.SCROLL_CONTAINER
            );
            if (scrollContainer) {
                scrollContainer.scrollTop = Math.max(
                    0,
                    scrollContainer.scrollTop - this.CONFIG.SCROLL_UP_DISTANCE
                );

                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }, 500);
            }
        },

        async crawlFirstPage() {
            this.clickShowMoreButton();
            return this.createXHRInterceptor(
                this.urlRequestReview,
                (json) => ({
                    reviews: json?.data,
                    totalItems: json?.max_list_size
                })
            );
        },

        async crawlNextPage() {
            this.scrollToLastComment();
            return this.createXHRInterceptor(
                this.urlRequestReview,
                (json) => json?.data
            );
        },
        randomDelay() {
            const ms = 2500 + Math.random() * 1000; // tá»« 2000ms Ä‘áº¿n 3000ms
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        async startCrawl() {
            try {
                console.log('ðŸš€ Báº®T Äáº¦U CRAWL');
                let collectedReviews = [];

                const button = document.querySelector(
                    this.SELECTORS.SEE_ALL_BUTTON
                );
                if (!button) {
                    sendMessage(
                        { type: 'TEMU/PRODUCT_HAS_NO_REVIEWS' },
                        this.iframeId
                    );
                    return;
                }
                const response = await this.crawlFirstPage();

                if (response === this.CONFIG.TOO_MANY_REQUESTS) {
                    this.endCrawlByTooManyRequests([]);
                    return;
                }
                const reviews = response?.reviews || [];
                const totalItems = response?.totalItems || 0;
                if (!reviews || reviews.length === 0) {
                    console.log('KhÃ´ng tÃ¬m tháº¥y bÃ¬nh luáº­n nÃ o');
                    this.endCrawl([]);
                    return;
                }

                collectedReviews = collectedReviews.concat(reviews);
                console.log(`Trang Ä‘áº§u tiÃªn: ${reviews.length} bÃ¬nh luáº­n`);

                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                await this.randomDelay();

                const totalPages = Math.ceil(totalItems / 10);

                if (totalPages <= 1) {
                    console.log(
                        'Chá»‰ cÃ³ má»™t trang bÃ¬nh luáº­n, khÃ´ng cáº§n xá»­ lÃ½ Ä‘a trang'
                    );
                    this.endCrawl(collectedReviews);
                    return;
                }

                let currentPage = 2;
                const maxPages = Math.min(totalPages, this.CONFIG.MAX_PAGES);

                let crawlAttempts = {};
                while (currentPage <= maxPages) {
                    crawlAttempts[currentPage] =
                        (crawlAttempts[currentPage] || 0) + 1;
                    if (crawlAttempts[currentPage] > 5) {
                        this.endCrawlByCannotRequestNextPage(collectedReviews);
                        return;
                    }

                    if (currentPage % 5 === 0) {
                        await this.randomDelay();
                    }
                    console.log(`Crawling page ${currentPage}...`);
                    const nextReviews = await this.crawlNextPage(currentPage);
                    if (nextReviews === this.CONFIG.SCROLL_NO_REQUEST) {
                        console.log('Page loading');
                        continue;
                    }
                    if (nextReviews === this.CONFIG.TOO_MANY_REQUESTS) {
                        console.log(
                            'Too many requests - server busy, ending crawl.'
                        );
                        this.endCrawlByTooManyRequests(collectedReviews);
                        return;
                    }
                    if (!nextReviews || nextReviews.length === 0) {
                        console.log('No more reviews available');
                        break;
                    }

                    collectedReviews = collectedReviews.concat(nextReviews);
                    console.log(
                        `Page ${currentPage}: ${nextReviews.length} reviews, Total: ${collectedReviews.length}`
                    );

                    if (collectedReviews.length >= this.reviewQuantity) {
                        collectedReviews = collectedReviews.slice(
                            0,
                            this.reviewQuantity
                        );
                        break;
                    }

                    this.sendTempCollectedNumber(collectedReviews?.length);
                    await this.randomDelay();
                    currentPage++;
                }
                console.log(
                    'Crawl hoÃ n táº¥t, tá»•ng sá»‘ bÃ¬nh luáº­n:',
                    collectedReviews
                );
                this.endCrawl(collectedReviews);
            } catch (error) {
                console.error('Lá»—i trong quÃ¡ trÃ¬nh crawl:', error);
                this.endCrawl([]);
            }
        },

        sendTempCollectedNumber(number) {
            sendMessage(
                {
                    type: 'TEMU/SEND_TEMP_COLLECTED',
                    data: number
                },
                this.iframeId
            );
        },

        endCrawl(collectedReviews) {
            sendMessage(
                {
                    type: 'TEMU/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByTooManyRequests(collectedReviews) {
            sendMessage(
                {
                    type: 'TEMU/CRAWL_DONE_BY_TOO_MANY_REQUESTS',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByCannotRequestNextPage(collectedReviews) {
            sendMessage(
                {
                    type: 'TEMU/CRAWL_DONE_CANNOT_REQUEST_NEXT_PAGE',
                    data: collectedReviews
                },
                this.iframeId
            );
        }
    };

    const walmartHandler = {
        name: 'walmart',
        containerId: 'LAI-Walmart-Importer-container',
        iframeId: 'LAI-Walmart-Importer-iframe',
        isCaptcha: false,

        urlRequestReview: '/graphql/ReviewsById',

        SELECTORS: {
            SEE_ALL_BUTTON: 'button.w_hhLG.w_XK4d.w_0_LY.tc',
            NEXT_PAGE_BUTTON: 'a[aria-label="Next Page"]',
            PAGINATION_NAV: 'nav[aria-label="pagination"].mv5'
        },

        CONFIG: {
            MAX_RETRY_ATTEMPTS: 5,
            REQUEST_TIMEOUT: 25000
        },
        handleMessage(event) {
            switch (event?.data?.type) {
                case 'WALMART/START_CRAWL':
                    this.reviewQuantity = event?.data?.data || 30;
                    console.log('Start crawl.');
                    this.startCrawl();
                    break;
                case 'MODAL/CLOSE':
                    console.log('Close importer.');
                    if (event?.data?.isReload) {
                        window.location.reload();
                    } else {
                        const container = document.getElementById(
                            this.containerId
                        );
                        container?.remove();
                        window.removeEventListener(
                            'message',
                            this.boundHandleMessage
                        );
                    }
                    break;
                case 'APP/RECEIVED_FIRST_DATA':
                    console.log('Handshake done.');
                    clearInterval(postMessageInterval);
                    break;
                case 'WALMART/RELOAD_PAGE':
                    console.log('Reload page.');
                    window.location.reload();
                    break;
                case 'APP/CHANGE_TOKEN':
                    const newToken = event?.data?.data;
                    changePersistentToken(newToken);
                    break;
                case 'WALMART/GO_TO_REVIEW_PAGE':
                    console.log('Go to review page.');
                    this.goToReviewPage();
                    break;
                default:
                    break;
            }
        },
        goToReviewPage() {
            const buttons = document.querySelector(
                this.SELECTORS.SEE_ALL_BUTTON
            );
            if (buttons) {
                buttons.click();
                const container = document.getElementById(this.containerId);
                container?.remove();
                window.removeEventListener(
                    'message',
                    this.boundHandleMessage
                );
            } else {
                sendMessage(
                    {
                        type: 'WALMART/PRODUCT_HAS_NO_REVIEWS'
                    },
                    this.iframeId
                );
            }
        },
        extractCustomerReviews() {
            const scripts = document.getElementsByTagName('script');

            for (let script of scripts) {
                const scriptContent =
                    script.textContent || script.innerText || '';
                if (!scriptContent.includes('customerReviews')) continue;

                try {
                    // TÃ¬m vá»‹ trÃ­ cá»§a "customerReviews": [
                    const keyMatch = scriptContent.match(
                        /["']?customerReviews["']?\s*:\s*\[/
                    );
                    if (!keyMatch) continue;

                    const startIndex = keyMatch.index + keyMatch[0].length - 1; // vá»‹ trÃ­ dáº¥u [
                    let bracketCount = 1;
                    let endIndex = startIndex + 1;

                    // Äáº¿m dáº¥u ngoáº·c vuÃ´ng Ä‘á»ƒ láº¥y Ä‘Ãºng máº£ng JSON
                    while (
                        bracketCount > 0 &&
                        endIndex < scriptContent.length
                    ) {
                        if (scriptContent[endIndex] === '[') bracketCount++;
                        else if (scriptContent[endIndex] === ']') bracketCount--;
                        endIndex++;
                    }

                    const reviewsJson = scriptContent.slice(
                        startIndex,
                        endIndex
                    );

                    // Chuyá»ƒn chuá»—i JSON thÃ nh object
                    const reviews = JSON.parse(reviewsJson);

                    console.log('TÃ¬m tháº¥y customerReviews:', reviews);
                    return reviews;
                } catch (e) {
                    console.warn('Lá»—i khi parse customerReviews JSON:', e);
                }
            }

            console.log('KhÃ´ng tÃ¬m tháº¥y customerReviews trong script.');
            return null;
        },
        async crawlFirstPage() {
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const reviews = this.extractCustomerReviews() || [];
            if (reviews.length > 0) {
                return reviews;
            }

            await new Promise((resolve) => setTimeout(resolve, 3000));
            return this.extractCustomerReviews() || [];
        },
        async crawlNextPage(page) {
            console.log(`Crawling page ${page}...`);
            return new Promise((resolve, reject) => {
                const nextButton = document.querySelector(
                    this.SELECTORS.NEXT_PAGE_BUTTON
                );
                if (!nextButton) {
                    resolve(null);
                    return;
                }

                let timeoutId = setTimeout(() => {
                    window.fetch = originalFetch;
                    resolve(1);
                }, this.CONFIG.REQUEST_TIMEOUT);

                const originalFetch = window.fetch;
                const self = this;
                window.fetch = async function (...args) {
                    const url = args[0];
                    const isWalmartReviewsApi =
                        typeof url === 'string' &&
                        url.includes(self.urlRequestReview);
                    const res = await originalFetch.apply(this, args);

                    if (isWalmartReviewsApi) {
                        clearTimeout(timeoutId);
                        const cloned = res.clone();
                        cloned.json().then((json) => {
                            window.fetch = originalFetch;
                            if (!json) {
                                //resposne khÃ´ng cÃ³ gÃ¬ cáº£
                                console.log('empty response');
                                // setTimeout(() => {
                                //   resolve(2);
                                // }, 3000);
                                resolve([]);
                                return;
                            } else if (json?.blockScript) {
                                console.warn(
                                    'Walmart API blocked the request, returning empty data.'
                                );
                                self.isCaptcha = true;
                                resolve([]);
                                return;
                            }
                            resolve(json);
                        });
                    }
                    return res;
                };

                nextButton.click();
            });
        },
        randomDelay() {
            const ms = 3000 + Math.random() * 1000; // tá»« 3000ms Ä‘áº¿n 4000ms
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        async startCrawl() {
            let collectedReviews = [];
            let page = 2;
            console.log('ðŸš€ Báº®T Äáº¦U CRAWL');

            // Crawl first page
            const firstPageData = await this.crawlFirstPage();
            if (!firstPageData || firstPageData.length === 0) {
                return this.endCrawlEmptyFirstPage();
            }

            collectedReviews = collectedReviews.concat(firstPageData);
            console.log(`First page: ${firstPageData.length} reviews`);

            if (collectedReviews.length >= this.reviewQuantity) {
                return this.endCrawl(
                    collectedReviews.slice(0, this.reviewQuantity)
                );
            }

            // Check if has pagination
            const paginationElement = document.querySelector(
                this.SELECTORS.PAGINATION_NAV
            );
            if (!paginationElement) {
                return this.endCrawl(collectedReviews);
            }
            this.sendTempCollectedNumber(collectedReviews?.length);
            await new Promise((resolve) => setTimeout(resolve, 4000));

            while (true) {
                console.log(`Crawling page ${page}...`);
                let tempData = await this.crawlNextPage(page);
                console.log('Temp data:', tempData);
                if (tempData === 1) {
                    console.log('resolve 1');
                    this.endCrawlByTimeout(collectedReviews);
                    return;
                }
                if (this.isCaptcha) {
                    console.warn('Captcha detected, stopping crawl.');
                    this.endCrawlByCaptcha(collectedReviews);
                    return;
                }
                if (!tempData) {
                    console.log('No more reviews available');
                    break;
                }

                const reviews =
                    tempData?.data?.reviews?.customerReviews || [];

                if (reviews.length === 0) {
                    console.log('No more reviews available');
                    break;
                }

                collectedReviews = collectedReviews.concat(reviews);
                if (collectedReviews.length >= this.reviewQuantity) {
                    collectedReviews = collectedReviews.slice(
                        0,
                        this.reviewQuantity
                    );
                    break;
                }

                this.sendTempCollectedNumber(collectedReviews?.length);
                page++;
                await this.randomDelay();
            }
            console.log(
                'Crawl completed, total reviews:',
                collectedReviews
            );
            if (this.isCaptcha) {
                console.warn(
                    'Captcha detected, ending crawl with collected reviews.'
                );
                this.endCrawlByCaptcha(collectedReviews);
                return;
            }
            this.endCrawl(collectedReviews);
        },
        sendTempCollectedNumber(number) {
            sendMessage(
                {
                    type: 'WALMART/SEND_TEMP_COLLECTED',
                    data: number
                },
                this.iframeId
            );
        },
        endCrawl(collectedReviews) {
            sendMessage(
                {
                    type: 'WALMART/CRAWL_DONE',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlByCaptcha(collectedReviews) {
            sendMessage(
                {
                    type: 'WALMART/CRAWL_DONE_BY_CAPTCHA',
                    data: collectedReviews
                },
                this.iframeId
            );
        },
        endCrawlEmptyFirstPage() {
            sendMessage(
                {
                    type: 'WALMART/CRAWL_DONE_EMPTY_FIRST_PAGE'
                },
                this.iframeId
            );
        },
        endCrawlByTimeout() {
            sendMessage(
                {
                    type: 'WALMART/CRAWL_DONE_BY_TIMEOUT'
                },
                this.iframeId
            );
        }
    };

    const platformHandlers = {
        amazon: amazonHandler,
        etsy: etsyHandler,
        shopee: shopeeHandler,
        ebay: ebayHandler,
        shein: sheinHandler,
        temu: temuHandler,
        walmart: walmartHandler
    };

    function renderImporterIframe(handler) {
        const container = buildContainer(handler.containerId);
        const iframe = buildImportIframe(handler.iframeId);

        handler.boundHandleMessage = handler.handleMessage.bind(handler);

        window.addEventListener('message', handler.boundHandleMessage);

        container.appendChild(iframe);
        document.body.appendChild(container);

        postMessageInterval = setInterval(() => {
            sendMessage(
                {
                    type: 'APP/SEND_FIRST_DATA',
                    data: {
                        token: window.LAI_IMPORT_TOKEN,
                        url: window.location.href,
                        platform: handler.name,
                        method
                    }
                },
                handler.iframeId
            );
        }, 1000);
    }

    function init() {
        const platform = getPlatformFromUrl();
        const handler = platformHandlers[platform];

        if (!handler) {
            console.log('âŒ Unsupported platform');
            return;
        }

        if (document.getElementById(handler.containerId)) {
            console.log('âœ… LAI is already open.');
            return;
        }

        renderImporterIframe(handler);
    }

    // END LAI Core code block (Used in both bookmark and extension)

    init();
})();