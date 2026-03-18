/**
 * TradingView_DOM_Scanner_v4.1
 * 功能：穿透 Iframe 提取 OHLC 核心数据，支持排重逻辑。
 */
(function() {
    window.cleanDump = [];
    let lastKey = ""; 

    const getValFromDoc = (doc, title) => {
        const el = doc.querySelector(`div[data-test-id-value-title="${title}="] .valueValue-l31H9iuA`);
        return el ? el.innerText.replace(/,/g, '') : null;
    };

    const findValidDoc = () => {
        if (getValFromDoc(document, '收')) return document;
        const frames = document.querySelectorAll('iframe');
        for (let f of frames) {
            try {
                const fDoc = f.contentDocument || f.contentWindow.document;
                if (getValFromDoc(fDoc, '收')) return fDoc;
            } catch (e) {}
        }
        return null;
    };

    const targetDoc = findValidDoc();
    if (!targetDoc) return;

    const scanner = setInterval(() => {
        const o = getValFromDoc(targetDoc, '开');
        const h = getValFromDoc(targetDoc, '高');
        const l = getValFromDoc(targetDoc, '低');
        const c = getValFromDoc(targetDoc, '收');

        if (h && l) {
            const currentKey = `${h}-${l}`; 
            if (currentKey !== lastKey) {
                window.cleanDump.push({ "O": o, "H": h, "L": l, "C": c });
                lastKey = currentKey;
                console.log(`Captured: ${window.cleanDump.length}/30`);

                if (window.cleanDump.length >= 30) {
                    clearInterval(scanner);
                    console.table(window.cleanDump);
                }
            }
        }
    }, 250);
})();
