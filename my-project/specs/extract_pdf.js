const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function main() {
    const pdfPath = process.argv[2] || 'guide.pdf';
    const buffer = fs.readFileSync(pdfPath);
    const uint8 = new Uint8Array(buffer);
    
    const parser = new PDFParse(uint8);
    await parser.load();
    
    const info = parser.getInfo();
    console.log('PDF Info:', JSON.stringify(info, null, 2));
    
    let allText = '';
    let pageNum = 1;
    while (true) {
        try {
            const text = parser.getPageText(pageNum);
            if (!text && pageNum > 1) break;
            allText += `\n--- PAGE ${pageNum} ---\n` + text;
            pageNum++;
            if (pageNum > 100) break;
        } catch(e) {
            break;
        }
    }
    
    const outputPath = pdfPath.replace('.pdf', '_extracted.txt');
    fs.writeFileSync(outputPath, allText, 'utf8');
    console.log('Total pages extracted:', pageNum - 1);
    console.log('Text length:', allText.length);
    console.log('--- CONTENT ---');
    console.log(allText.substring(0, 20000));
    
    parser.destroy();
}

main().catch(e => { console.error('Error:', e.message); console.error(e.stack); });
