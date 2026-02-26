(function () {
    const domain = "https://dangno1.github.io/testAppio";
    const iframeSrc = `${domain}/importerUI.html`;
    const containerId = "Appio-Importer-container";
    const iframeId = "Appio-Importer-iframe";

    function buildContainer(id) {
        const container = document.createElement('div');
        container.style =
            'width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 10000; background-color: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center;';
        container.setAttribute('id', id);
        return container;
    }

    function buildImportIframe(id) {
        const iframe = document.createElement('iframe');
        iframe.src = iframeSrc;
        iframe.style =
            'border: none; max-height: 90vh; width: 530px; height: 480px; background-color: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); overflow: hidden;';
        iframe.id = id;
        return iframe;
    }

    function handleMessage(event) {
        if (event.data && event.data.type === 'MODAL/CLOSE') {
            const container = document.getElementById(containerId);
            container?.remove();
            window.removeEventListener('message', handleMessage);
        }
    }

    function init() {
        if (document.getElementById(containerId)) {
            console.log('Appio is already open.');
            return;
        }

        const container = buildContainer(containerId);
        const iframe = buildImportIframe(iframeId);

        window.addEventListener('message', handleMessage);

        container.appendChild(iframe);
        document.body.appendChild(container);

        setTimeout(function () {
            const btn = document.querySelector('#writeReviewButton');
            if (btn) {
                console.log("Tìm thấy nút Write a review");
            }
        }, 2000);
    }

    init();
})();
