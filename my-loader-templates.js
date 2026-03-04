// ===== SVG Icons =====
const ICONS = {
    close: `<svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>`,
    warning: `<svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0; margin-top: 2px;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>`,
    info: `<svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0;"><path fill-rule="evenodd" d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-13a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg>`,
    search: `<svg viewBox="0 0 20 20" width="16" fill="#8c9196" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm9.707 4.293-4.82-4.82A5.968 5.968 0 0 0 14 8 6 6 0 0 0 2 8a6 6 0 0 0 6 6 5.968 5.968 0 0 0 3.473-1.113l4.82 4.82a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414z"></path></svg>`,
    eye: (size = 14) => `<svg viewBox="0 0 20 20" width="${size}" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>`,
    back: `<svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M17 9H5.414l3.293-3.293a1 1 0 1 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414L5.414 11H17a1 1 0 1 0 0-2z"></path></svg>`,
    trash: `<svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M8 3.994C8 2.893 8.895 2 10 2s2 .893 2 1.994h4.005c.55 0 .995.448.995.997a.998.998 0 0 1-.995.997H3.995A.999.999 0 0 1 3 4.991c0-.55.445-.997.995-.997H8zM4.5 7h11l-.873 9.186A1.5 1.5 0 0 1 13.136 17.5H6.864a1.5 1.5 0 0 1-1.491-1.314L4.5 7zM8.5 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5zm4 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5z"></path></svg>`,
    star: (filled) => `<svg viewBox="0 0 20 20" width="18" fill="${filled ? '#e6a817' : '#d9d9d9'}" style="display:inline-block;"><path d="M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z"></path></svg>`,
};

// ===== Helper: render star icons =====
function renderStars(rating) {
    const r = Math.round(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += ICONS.star(i <= r);
    }
    return html;
}

// ===== Shared header bar =====
function headerBar(title, closeId) {
    return `
        <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
            <span style="font-weight: 600; font-size: 16px; color: #202223;">${title}</span>
            <button id="${closeId}" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                ${ICONS.close}
            </button>
        </div>`;
}

// ===== Alert banner =====
function alertBanner(icon, message) {
    return `
        <div style="padding: 20px;">
            <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; color: #332b00;">
                ${icon}
                <span style="font-size: 14px; line-height: 20px;">${message}</span>
            </div>
        </div>`;
}

// ===== Templates =====
const AppioTemplates = {
    // 1. Warning popup (product detail page → redirect to reviews page)
    warningPopup(reviewsUrl) {
        return `
            ${headerBar('Warning', 'closeWarning')}
            ${alertBanner(ICONS.warning, `This is not the reviews page. <a href="${reviewsUrl}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">Click here</a> to go to the reviews page to start importing.`)}
        `;
    },

    // 2. Unsupported page popup
    unsupportedPopup() {
        return `
            ${headerBar('Unsupported page', 'closeUnsupported')}
            ${alertBanner(ICONS.info, 'This page is not supported. Go to a product or reviews page to use the importer.')}
        `;
    },

    // 3. Prepare to collect reviews popup
    preparePopup() {
        return `
            ${headerBar('Prepare to collect reviews', 'appio-close-btn')}
            <div style="padding: 20px;">
                <label style="font-size: 14px; font-weight: 500; color: #202223; display: block; margin-bottom: 8px;">Select product</label>
                <div style="position: relative;">
                    ${ICONS.search}
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
    },

    // 4. Stats popup after collection
    statsPopup({ totalReviews, starCounts, photoCount, productTitle, productImg }) {
        const viewBtn = (cls, dataStar) => `
            <button class="${cls}" ${dataStar ? `data-star="${dataStar}"` : ''} style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                ${ICONS.eye(12)} View
            </button>`;

        const starRow = (star, count) => `
            <div style="display: flex; align-items: center; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                    <input type="checkbox" class="star-checkbox" data-star="${star}" ${count > 0 ? 'checked' : ''}
                        style="width: 18px; height: 18px; accent-color: #008060; cursor: pointer;">
                    <span style="font-size: 14px; color: #202223;">${star}-star:</span>
                </label>
                <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${count}</span>
                ${viewBtn('stats-view-star', star)}
            </div>`;

        return `
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: #008060; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">Total reviews collected: ${totalReviews}</span>
                    <button class="stats-view-all-btn" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 4px 12px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                        ${ICONS.eye(14)} View
                    </button>
                </div>
                <button id="stats-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                    ${ICONS.close}
                </button>
            </div>

            <div style="padding: 20px;">
                <div style="font-size: 13px; font-weight: 600; color: #202223; margin-bottom: 12px;">Stats:</div>
                <div id="stats-rows" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px;">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${[5, 4, 3].map(s => starRow(s, starCounts[s])).join('')}
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                <input type="checkbox" id="photo-checkbox" checked
                                    style="width: 31px; height: 18px; accent-color: #008060; cursor: pointer;">
                                <span style="font-size: 14px; color: #202223;">Text, image, video</span>
                            </label>
                            <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${photoCount}</span>
                            ${viewBtn('stats-view-photo')}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${[2, 1].map(s => starRow(s, starCounts[s])).join('')}
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
    },

    // 5. Review preview panel
    reviewPreview(reviews, label) {
        const reviewItems = reviews.map((r, idx) => `
            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f2f3; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="margin-bottom: 6px;">${renderStars(r.rating)}</div>
                        ${r.body ? `<div style="font-size: 14px; color: #202223; line-height: 1.5; margin-bottom: 8px;">${r.body}</div>` : ''}
                        <div style="font-size: 12px; color: #6d7175;">${r.customer}${r.createdAt ? '  •  ' + r.createdAt : ''}</div>
                        ${r.images && r.images.length > 0 ? `<div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">${r.images.map(img => `<img src="${img}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e1e3e5;">`).join('')}</div>` : ''}
                    </div>
                    <button class="review-delete-btn" data-review-id="${r.referrenceId || r.hashId}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #8c9196; flex-shrink: 0; margin-left: 8px; transition: all 0.15s;" title="Remove review">
                        ${ICONS.trash}
                    </button>
                </div>
            </div>
        `).join('');

        return `
            <div style="display: flex; flex-direction: column; height: 520px;">
                <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button id="preview-back-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #202223; display: flex; align-items: center;">
                            ${ICONS.back}
                        </button>
                        <span style="font-weight: 600; font-size: 15px; color: #202223;">Preview</span>
                        <span style="background: #e3e5e7; color: #202223; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${label}</span>
                    </div>
                    <button id="preview-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                        ${ICONS.close}
                    </button>
                </div>
                <div style="padding: 8px 20px; font-size: 13px; color: #6d7175; border-bottom: 1px solid #f1f2f3;">Showing ${reviews.length} of ${reviews.length} reviews</div>
                <div style="flex: 1; overflow-y: auto; padding: 0;">
                    ${reviewItems}
                </div>
                <div style="padding: 12px 20px; border-top: 1px solid #e1e3e5; display: flex; justify-content: flex-end;">
                    <button id="preview-import-btn" style="padding: 8px 20px; background: #303030; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Import all</button>
                </div>
            </div>
        `;
    },
};

window.AppioTemplates = AppioTemplates;
