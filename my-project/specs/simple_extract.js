const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extract() {
    const dataBuffer = fs.readFileSync('ad (3) (1).pdf');
    const uint8 = new Uint8Array(dataBuffer);
    const parser = new PDFParse(uint8);
    await parser.load();
    
    let allText = '';
    let page = 1;
    while (true) {
        try {
            const text = parser.getText(page); // Some versions use page index
            if (!text && page > 1) break;
            allText += `\n--- PAGE ${page} ---\n` + text;
            page++;
            if (page > 100) break;
        } catch(e) { break; }
    }
    
    fs.writeFileSync('ad_extracted.txt', allText);
    console.log('Extracted', allText.length, 'characters');
}

extract().catch(console.error);
