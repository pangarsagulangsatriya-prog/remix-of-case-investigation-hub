const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', exception => {
        console.log('PAGE EXCEPTION:', exception.message);
    });

    try {
        await page.goto('http://localhost:8081/cases/CS-2026-0147');
        await page.waitForTimeout(3000);
        
        // Let's click "Analysis" tab first
        const tabs = await page.getByRole('tab').allTextContents();
        console.log('Tabs:', tabs);
        await page.getByRole('tab', { name: "Analysis" }).click();
        await page.waitForTimeout(2000);

        console.log('Clicking Fact & Chronology Details...');
        // Wait for Fact & Chronology agent's node or "Inspect Node" button
        const factCard = await page.getByText('Fact & Chronology');
        await factCard.first().click(); // Or let's just click 'Inspect Node'
        
        const bts = await page.getByRole('button', { name: /Inspect/i }).elementHandles();
        if (bts.length > 0) {
            await bts[0].click();
            await page.waitForTimeout(2000);
            console.log('Clicked Inspect. Waited 2s.');
        } else {
            console.log('Could not find Inspect button');
            const text = await page.locator('body').innerText();
            console.log('Body:', text.substring(0, 1000));
        }
    } catch (err) {
        console.error('SCRIPT ERR:', err);
    }
    
    await browser.close();
})();
