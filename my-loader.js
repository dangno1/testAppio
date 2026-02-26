// (function () {
//     const domain = "https://dangno1.github.io/testAppio";
//     const iframeSrc = `${domain}/importerUI.html`;
//     const containerId = "Appio-Importer-container";
//     const iframeId = "Appio-Importer-iframe";

//     function buildContainer(id) {
//         const container = document.createElement('div');
//         container.style =
//             'width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 10000; background-color: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center;';
//         container.setAttribute('id', id);
//         return container;
//     }

//     function buildImportIframe(id) {
//         const token = window.LAI_IMPORT_TOKEN || "";
//         const iframe = document.createElement('iframe');
//         iframe.src = `${iframeSrc}?token=${token}`;
//         iframe.style =
//             'border: none; max-height: 90vh; width: 530px; height: 480px; background-color: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); overflow: hidden;';
//         iframe.id = id;
//         return iframe;
//     }

//     function handleMessage(event) {
//         if (event.data && event.data.type === 'MODAL/CLOSE') {
//             const container = document.getElementById(containerId);
//             container?.remove();
//             window.removeEventListener('message', handleMessage);
//         }
//     }

//     function init() {
//         if (document.getElementById(containerId)) {
//             console.log('Appio is already open.');
//             return;
//         }

//         const container = buildContainer(containerId);
//         const iframe = buildImportIframe(iframeId);

//         window.addEventListener('message', handleMessage);

//         container.appendChild(iframe);
//         document.body.appendChild(container);

//         setTimeout(function () {
//             const btn = document.querySelector('#writeReviewButton');
//             if (btn) {
//                 console.log("Tìm thấy nút Write a review");
//             }
//         }, 2000);
//     }

//     init();
// })();

(function() {
    const titleEl = document.querySelector(".product-info-title");
    const productTitle = titleEl ? titleEl.innerText.trim() : "Không tìm thấy Product Title";

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
        padding:20px;
        border-radius:8px;
        width:350px;
        text-align:center;
        box-shadow:0 5px 15px rgba(0,0,0,0.3);
    `;

    popup.innerHTML = `
        <h3>Product Title:</h3>
        <p>${productTitle}</p>
        <button id="closePopupBtn" style="margin-top:15px;padding:8px 12px;cursor:pointer;">
            Đóng
        </button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById("closePopupBtn").onclick = () => overlay.remove();

    setTimeout(function() {
        const btn = document.querySelector('#writeReviewButton');
        if (btn) {
            btn.click();
            console.log("Đã click Write a review");
        } else {
            console.log("Không tìm thấy nút Write a review");
        }

    }, 2000);

})();