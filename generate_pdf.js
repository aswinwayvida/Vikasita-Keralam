import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const mdPath = 'C:\\Users\\aswin\\.gemini\\antigravity\\brain\\0a1cad7b-a59c-43ff-b6f8-9ae5a0f94242\\roles_and_control_technical_doc.md';
  const pdfPath = 'C:\\Users\\aswin\\.gemini\\antigravity\\brain\\0a1cad7b-a59c-43ff-b6f8-9ae5a0f94242\\Roles_and_Control_Technical_Doc.pdf';

  let mdContent = fs.readFileSync(mdPath, 'utf8');

  // Basic markdown to clean HTML conversion
  let htmlBody = mdContent
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '3><h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n\n/gim, '<br/><br/>');

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Roles and Control Technical Documentation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 24px; }
        h2 { color: #1e293b; margin-top: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; font-size: 18px; }
        h3 { color: #334155; margin-top: 18px; font-size: 15px; }
        code { background: #f1f5f9; color: #0f172a; padding: 2px 6px; rounded: 4px; font-family: monospace; font-size: 13px; }
        pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 13px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
    </html>
  `;

  const htmlPath = 'C:\\Users\\aswin\\.gemini\\antigravity\\brain\\0a1cad7b-a59c-43ff-b6f8-9ae5a0f94242\\temp_doc.html';
  fs.writeFileSync(htmlPath, fullHtml);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    printBackground: true
  });

  console.log('PDF successfully created at:', pdfPath);
  await browser.close();
})();
