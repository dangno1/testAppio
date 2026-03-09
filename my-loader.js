!function(){if(document.getElementById("appio-overlay"))return;let e=window.location.href.includes("product-reviews"),t=window.location.href.includes("/dp/")||window.location.href.includes("/gp/product/"),o=[],i={totalRatings:"",average:"",count:[]},r=window.APPIO_IMPORT_TOKEN||"",n=window.APPIO_SHOP_DOMAIN||"",l=window.location.href.match(/\/product-reviews\/([A-Z0-9]{10})/)||window.location.href.match(/\/dp\/([A-Z0-9]{10})/)||window.location.href.match(/\/gp\/product\/([A-Z0-9]{10})/),$=l?l[1]:"N/A",a=document.createElement("div");a.id="appio-overlay",a.style.cssText=`
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
    `;let d=document.createElement("div");if(d.style.cssText=`
        background:#fff;
        border-radius:12px;
        width:500px;
        box-shadow:0 10px 30px rgba(0,0,0,0.2);
        overflow:hidden;
        font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    `,!e){if(t&&"N/A"!==$){let s=`${window.location.origin}/product-reviews/${$}/ref=cm_cr_arp_d_viewopt_srt?pageNumber=1&sortBy=recent`;d.innerHTML=`
                <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                    <span style="font-weight: 600; font-size: 16px; color: #202223;">Warning</span>
                    <button id="closeWarning" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                        <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                    </button>
                </div>
                <div style="padding: 20px;">
                    <div style="background-color: #fff4e4; border: 1px solid #ffebcc; border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; color: #332b00;">
                        <svg viewBox="0 0 20 20" width="20" fill="#a67100" style="flex-shrink: 0; margin-top: 2px;"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63l6.28-10.875zM10 5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
                        <span style="font-size: 14px; line-height: 20px;">This is not the reviews page. <a href="${s}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">Click here</a> to go to the reviews page to start importing.</span>
                    </div>
                </div>
            `,a.appendChild(d),document.body.appendChild(a),document.getElementById("closeWarning").onclick=()=>a.remove()}else d.innerHTML=`
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
            `,a.appendChild(d),document.body.appendChild(a),document.getElementById("closeUnsupported").onclick=()=>a.remove();return}if(!window.location.href.includes("sortBy=recent")){let p=document.querySelector("#a-autoid-2-announce");p&&(p.click(),setTimeout(()=>{let e=document.querySelector("#sort-order-dropdown_1");e&&e.click()},300))}let c="";d.innerHTML=`
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
    `,a.appendChild(d),document.body.appendChild(a);let _=document.getElementById("appio-close-btn"),x=document.getElementById("appio-product-input"),g=document.getElementById("appio-start-btn"),u=document.getElementById("appio-status-area");function f(){!function e(){let t=document.querySelector('[data-hook="total-review-count"]'),o=t?.innerText?.trim()||"",r=o.match(/([\d\s.,\u00A0]+)/),n=r?r[1].replace(/[\s.,\u00A0]/g,""):"0",l=document.querySelector('[data-hook="rating-out-of-text"]'),$=l?.innerText?.trim()||"",a=$.match(/([\d][,.][\d])/),d=a?a[1].replace(",","."):"0",s=[],p=document.querySelectorAll("#histogramTable li.a-align-center");p.forEach(e=>{let t=e.querySelector("a.histogram-row-container"),o=t?.getAttribute("aria-label")||"",i=o.match(/(\d+%)/);i&&s.push(i[1])}),i={totalRatings:n,average:d,count:s.reverse()}}();let e=document.querySelectorAll('[data-hook="review"]'),t=0;e.forEach(e=>{let i=e.id;if(!i||o.some(e=>e.referrenceId===i))return;let r=e.querySelector(".a-profile-name")?.innerText.trim()||"",l=e.querySelector(".review-rating .a-icon-alt")?.innerText||"",a=parseFloat(l.split(" ")[0])||0,d=e.querySelector(".review-date")?.innerText.trim()||"",s=e.querySelector(".review-text-content span")?.innerText.trim()||e.querySelector(".review-text-content .cr-translated-review-content")?.innerText.trim()||e.querySelector(".review-text-content .cr-original-review-content")?.innerText.trim(),p=e.querySelector("[data-hook='review-title']")?.innerText.trim()||"",_=[];e.querySelectorAll('[data-hook="review-image-tile"], [data-hook="cmps-review-image-tile"]').forEach(e=>{let t=e.getAttribute("data-src")||e.src;if(t&&!t.includes("grey-pixel.gif")){let o=t.replace(/\._[A-Z0-9]+_\./g,".");_.push(o)}});let x=e.querySelector('[data-hook="helpful-vote-statement"]')?.innerText.trim()||"",g=x.match(/(\d+)/),u=g?parseInt(g[1]):0,f=[];e.querySelectorAll(".cr-video-desktop").forEach(e=>{let t=e.getAttribute("data-video-url");t&&f.push({url:t})}),o.push({shopOrigin:n,productId:$,referrenceId:i,customer:r,rating:a,title:p,body:s,createdAt:d,images:_,videos:f,status:"published",source:"amazon",hashId:i,batchId:Date.now().toString(),helpful:u,selectedProduct:c}),t++});let r=document.getElementById("review-count");r&&(r.textContent=o.length)}function v(e){let t=document.querySelector(e);return t&&t.scrollIntoView({behavior:"smooth",block:"center"}),t}function y(e){return new Promise(t=>setTimeout(t,e))}function h(){let e={5:0,4:0,3:0,2:0,1:0},t=0;o.forEach(o=>{let i=Math.round(o.rating);i>=1&&i<=5&&e[i]++,o.images&&o.images.length>0&&t++});let i=o.length,l=document.querySelector(".product-info-title")?.innerText.trim()||c||"Unknown Product",s=document.querySelector("#cm_cr-product_info img")?.src||document.querySelector("#landingImage")?.src||"";function p(){let e=[];document.querySelectorAll(".star-checkbox").forEach(t=>{t.checked&&e.push(parseInt(t.dataset.star))});let t=document.getElementById("photo-checkbox")?.checked,i=0;o.forEach(o=>{let r=Math.round(o.rating),n=o.images&&o.images.length>0;e.includes(r)?i++:t&&n&&i++});let r=document.getElementById("stats-import-btn");r&&(r.textContent=`Import ${i} reviews`)}d.innerHTML=`
            <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: #008060; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">Total reviews collected: ${i}</span>
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
                        ${[5,4,3].map(t=>`
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                    <input type="checkbox" class="star-checkbox" data-star="${t}" ${e[t]>0?"checked":""}
                                        style="width: 18px; height: 18px; accent-color: #008060; cursor: pointer;">
                                    <span style="font-size: 14px; color: #202223;">${t}-star:</span>
                                </label>
                                <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${e[t]}</span>
                                <button class="stats-view-star" data-star="${t}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                    <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                    View
                                </button>
                            </div>
                        `).join("")}
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                <input type="checkbox" id="photo-checkbox" checked
                                    style="width: 31px; height: 18px; accent-color: #008060; cursor: pointer;">
                                <span style="font-size: 14px; color: #202223;">Text, image, video</span>
                            </label>
                            <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${t}</span>
                            <button class="stats-view-photo" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                View
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${[2,1].map(t=>`
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 100px;">
                                    <input type="checkbox" class="star-checkbox" data-star="${t}" ${e[t]>0?"checked":""}
                                        style="width: 18px; height: 18px; accent-color: #008060; cursor: pointer;">
                                    <span style="font-size: 14px; color: #202223;">${t}-star:</span>
                                </label>
                                <span style="font-size: 14px; font-weight: 600; color: #202223; min-width: 30px;">${e[t]}</span>
                                <button class="stats-view-star" data-star="${t}" style="background: none; border: 1px solid #c9cccf; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: #202223;">
                                    <svg viewBox="0 0 20 20" width="12" fill="currentColor"><path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>
                                    View
                                </button>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div style="margin-top: 20px; font-size: 13px; font-weight: 600; color: #202223; margin-bottom: 8px;">Product</div>
                <div style="border: 1px solid #e1e3e5; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                    ${s?`<img src="${s}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">`:'<div style="width:40px;height:40px;border-radius:6px;background:#f4f6f8;"></div>'}
                    <div>
                        <div style="font-size: 14px; font-weight: 500; color: #202223; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l}</div>
                    </div>
                </div>
            </div>

            <div style="padding: 12px 20px 20px; display: flex; justify-content: flex-end;">
                <button id="stats-import-btn" style="padding: 10px 24px; background: #008060; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.15s;">
                    Import ${i} reviews
                </button>
            </div>
        `,document.getElementById("stats-close-btn").onclick=()=>a.remove(),document.querySelectorAll(".star-checkbox").forEach(e=>{e.addEventListener("change",p)});let _=document.getElementById("photo-checkbox");_&&_.addEventListener("change",p);let x=document.getElementById("stats-import-btn");function g(e,t){d.style.width="620px",d.innerHTML=`
                <div style="display: flex; flex-direction: column; height: 520px;">
                    <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e3e5;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button id="preview-back-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #202223; display: flex; align-items: center;">
                                <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M17 9H5.414l3.293-3.293a1 1 0 1 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414L5.414 11H17a1 1 0 1 0 0-2z"></path></svg>
                            </button>
                            <span style="font-weight: 600; font-size: 15px; color: #202223;">Preview</span>
                            <span style="background: #e3e5e7; color: #202223; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${t}</span>
                        </div>
                        <button id="preview-close-btn" style="background:none; border:none; cursor:pointer; padding:4px; color:#5c5f62;">
                            <svg viewBox="0 0 20 20" width="20" fill="currentColor"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06L11.06 10l3.97-3.97a.75.75 0 0 0-1.06-1.06L10 8.94 6.03 4.97a.75.75 0 0 0-1.06 1.06L8.94 10l-3.97 3.97a.75.75 0 1 0 1.06 1.06L10 11.06l3.97 3.97z"></path></svg>
                        </button>
                    </div>
                    <div style="padding: 8px 20px; font-size: 13px; color: #6d7175; border-bottom: 1px solid #f1f2f3;">Showing ${e.length} of ${e.length} reviews</div>
                    <div style="flex: 1; overflow-y: auto; padding: 0;">
                        ${e.map((e,t)=>`
                            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f2f3; position: relative;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="margin-bottom: 6px;">${function e(t){let o=Math.round(t),i="";for(let r=1;r<=5;r++)i+=`<svg viewBox="0 0 20 20" width="18" fill="${r<=o?"#e6a817":"#d9d9d9"}" style="display:inline-block;"><path d="M10 1.3l2.388 6.722H18.8l-5.232 3.948 1.871 6.928L10 14.744l-5.438 4.154 1.87-6.928L1.2 8.022h6.412L10 1.3z"></path></svg>`;return i}(e.rating)}</div>
                                        ${e.body?`<div style="font-size: 14px; color: #202223; line-height: 1.5; margin-bottom: 8px;">${e.body}</div>`:""}
                                        <div style="font-size: 12px; color: #6d7175;">${e.customer}${e.createdAt?"  •  "+e.createdAt:""}</div>
                                        ${e.images&&e.images.length>0?`<div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">${e.images.map(e=>`<img src="${e}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e1e3e5;">`).join("")}</div>`:""}
                                    </div>
                                    <button class="review-delete-btn" data-review-id="${e.referrenceId||e.hashId}" style="background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #8c9196; flex-shrink: 0; margin-left: 8px; transition: all 0.15s;" title="Remove review">
                                        <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M8 3.994C8 2.893 8.895 2 10 2s2 .893 2 1.994h4.005c.55 0 .995.448.995.997a.998.998 0 0 1-.995.997H3.995A.999.999 0 0 1 3 4.991c0-.55.445-.997.995-.997H8zM4.5 7h11l-.873 9.186A1.5 1.5 0 0 1 13.136 17.5H6.864a1.5 1.5 0 0 1-1.491-1.314L4.5 7zM8.5 9.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5zm4 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <div style="padding: 12px 20px; border-top: 1px solid #e1e3e5; display: flex; justify-content: flex-end;">
                        <button id="preview-import-btn" style="padding: 8px 20px; background: #303030; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Import all</button>
                    </div>
                </div>
            `,document.getElementById("preview-back-btn").onclick=()=>{d.style.width="500px",h()},document.getElementById("preview-close-btn").onclick=()=>a.remove(),document.querySelectorAll(".review-delete-btn").forEach(i=>{i.addEventListener("mouseenter",()=>{i.style.color="#d72c0d",i.style.background="#fff4f4"}),i.addEventListener("mouseleave",()=>{i.style.color="#8c9196",i.style.background="none"}),i.addEventListener("click",()=>{let r=i.dataset.reviewId,n=o.findIndex(e=>(e.referrenceId||e.hashId)===r);if(-1!==n){o.splice(n,1);let l=e.filter(e=>o.some(t=>(t.referrenceId||t.hashId)===(e.referrenceId||e.hashId)));g(l,t)}})}),document.getElementById("preview-import-btn").addEventListener("click",function(){console.log("IMPORT PREVIEW DATA:",{from:"amazon",importToken:r,shopDomain:n,productId:$,selectedProduct:c,review:e}),this.textContent="Importing...",this.disabled=!0,this.style.background="#e4e5e7",this.style.color="#8c9196",this.style.cursor="not-allowed"})}x&&(x.addEventListener("mouseenter",()=>x.style.background="#006e52"),x.addEventListener("mouseleave",()=>x.style.background="#008060"),x.addEventListener("click",()=>{let e=[];document.querySelectorAll(".star-checkbox").forEach(t=>{t.checked&&e.push(parseInt(t.dataset.star))});let t=document.getElementById("photo-checkbox")?.checked,i=o.filter(o=>{let i=Math.round(o.rating),r=o.images&&o.images.length>0;return e.includes(i)||t&&r});console.log("IMPORT DATA:",{from:"amazon",importToken:r,shopDomain:n,productId:$,selectedProduct:c,review:i}),x.textContent="Importing...",x.disabled=!0,x.style.background="#e4e5e7",x.style.color="#8c9196",x.style.cursor="not-allowed"})),document.querySelectorAll(".stats-view-star").forEach(e=>{e.addEventListener("click",()=>{let t=parseInt(e.dataset.star),i=o.filter(e=>Math.round(e.rating)===t);g(i,`${t}-star`)})});let u=document.querySelector(".stats-view-photo");u&&u.addEventListener("click",()=>{let e=o.filter(e=>e.images&&e.images.length>0);g(e,"Photo reviews")});let f=document.querySelector(".stats-view-all-btn");f&&f.addEventListener("click",()=>{g(o,"All reviews")})}_.onclick=()=>a.remove(),x.addEventListener("focus",()=>{x.style.borderColor="#005bd3",x.style.boxShadow="0 0 0 2px rgba(0, 91, 211, 0.2)"}),x.addEventListener("blur",()=>{x.style.borderColor="#c9cccf",x.style.boxShadow="none"}),x.addEventListener("input",()=>{(c=x.value.trim()).length>0?(g.disabled=!1,g.style.background="#303030",g.style.color="#fff",g.style.cursor="pointer"):(g.disabled=!0,g.style.background="#e4e5e7",g.style.color="#8c9196",g.style.cursor="not-allowed")}),g.addEventListener("mouseenter",()=>{g.disabled||(g.style.background="#1a1a1a")}),g.addEventListener("mouseleave",()=>{g.disabled||(g.style.background="#303030")}),g.addEventListener("click",async()=>{if(g.disabled)return;g.disabled=!0,g.textContent="Collecting...",g.style.background="#e4e5e7",g.style.color="#8c9196",g.style.cursor="not-allowed",x.disabled=!0,x.style.background="#f6f6f7",u.style.display="block";let e=0,t=Math.floor(4001*Math.random())+1e3;async function l(){let a=document.getElementById("appio-page-status");f(),a&&(a.textContent=`Collecting page ${e+1}... waiting ${(t/1e3).toFixed(1)}s`),await y(t),f(),v(".a-last"),await y(2e3),v("#a-autoid-2-announce"),await y(1e3);let d=document.querySelector(".a-last"),s=d?d.querySelector("a"):null;if(!d||d.classList.contains("a-disabled")||!s){f(),a&&(a.textContent="All pages collected!"),g.textContent="Done",console.log("FINAL DATA OBJECT:",{from:"amazon",importToken:r,shopDomain:n,productId:$,selectedProduct:c,review:o,reviewSummary:i}),h();return}e<10?(e++,a&&(a.textContent=`Going to page ${e+1}...`),s.click(),t=Math.floor(4001*Math.random())+1e3,await y(3e3),l()):(a&&(a.textContent="Reached max 10 pages."),g.textContent="Done",console.log("FINAL DATA OBJECT:",{from:"amazon",importToken:r,shopDomain:n,productId:$,selectedProduct:c,review:o,reviewSummary:i}),h())}l()})}();