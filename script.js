let currentBillData = null;

// Generate QR Code for payment
function generateBill() {
    const itemName = document.getElementById('itemName').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    
    if (!itemName || !amount || amount <= 0) {
        alert('Please enter valid item name and amount');
        return;
    }
    
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Create payment data object
    const paymentData = {
        item: itemName,
        amount: parseFloat(amount).toFixed(2),
        phoneNumber: phoneNumber,
        customerName: customerName || 'Customer',
        timestamp: Date.now(),
        merchantId: 'MERCHANT_001'
    };
    
    // Store current bill data
    currentBillData = paymentData;
    
    // Generate UPI payment URL with actual UPI ID
    const upiUrl = `upi://pay?pa=8999925776-3@ybl&pn=Merchant&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(paymentData.item)}`;
    
    generateQRCode(upiUrl);
    generateBillReceipt(paymentData);
    
    // Automatically send payment link
    setTimeout(() => {
        openPhonePeApp(phoneNumber, paymentData.amount, paymentData.item);
    }, 500);
}

// Simple QR Code generation
function generateQRCode(data) {
    try {
        const qr = qrcode(0, 'M');
        qr.addData(data);
        qr.make();
        
        const canvas = document.getElementById('qrcode');
        const ctx = canvas.getContext('2d');
        const modules = qr.getModuleCount();
        const cellSize = 8;
        
        canvas.width = modules * cellSize;
        canvas.height = modules * cellSize;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000000';
        for (let row = 0; row < modules; row++) {
            for (let col = 0; col < modules; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        
        document.getElementById('qrSection').classList.remove('hidden');
    } catch (error) {
        console.error('QR Code generation error:', error);
        alert('Error generating QR code');
    }
}

// Generate QR code for bill receipt
function generateBillQRCode(data) {
    try {
        const qr = qrcode(0, 'M');
        qr.addData(data);
        qr.make();
        
        const canvas = document.getElementById('billQrcode');
        const ctx = canvas.getContext('2d');
        const modules = qr.getModuleCount();
        const cellSize = 4;
        
        canvas.width = modules * cellSize;
        canvas.height = modules * cellSize;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000000';
        for (let row = 0; row < modules; row++) {
            for (let col = 0; col < modules; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
    } catch (error) {
        console.error('Bill QR Code generation error:', error);
    }
}

// Auto-send via WhatsApp with instructions
function openPhonePeApp(phoneNumber, amount, description) {
    const upiUrl = `upi://pay?pa=8999925776-3@ybl&pn=Merchant&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;
    const billData = currentBillData;
    
    const billMessage = `📋 *BILL RECEIPT*\n` +
        `Bill No: ${Date.now()}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Customer: ${billData.customerName}\n` +
        `Item: ${billData.item}\n` +
        `Amount: ₹${billData.amount}\n\n` +
        `💳 *PAY NOW*\n${upiUrl}\n\n` +
        `Click the link above to pay via PhonePe`;
    
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(billMessage)}`;
    
    // Copy message to clipboard as backup
    navigator.clipboard.writeText(billMessage);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show automation instructions
    alert(`✅ WhatsApp opened with bill for ${phoneNumber}\n\n🤖 QUICK SEND:\n1. Message is pre-filled\n2. Just press ENTER or click Send`);
    
    setTimeout(() => {
        clearForm();
    }, 2000);
}

// Generate printable bill with QR code
function generateBillReceipt(data) {
    const billNumber = 'BILL-' + Date.now().toString().slice(-8);
    const billHtml = `
        <div class="bill-receipt">
            <div class="bill-header">
                <h2>Bill Receipt</h2>
            </div>
            <div class="bill-row">
                <span class="label">Bill No</span>
                <span class="value">${billNumber}</span>
            </div>
            <div class="bill-row">
                <span class="label">Date</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="bill-row">
                <span class="label">Time</span>
                <span class="value">${new Date().toLocaleTimeString()}</span>
            </div>
            <hr class="divider">
            <div class="bill-row">
                <span class="label">Customer</span>
                <span class="value">${data.customerName}</span>
            </div>
            <div class="bill-row">
                <span class="label">Phone</span>
                <span class="value">${data.phoneNumber}</span>
            </div>
            <hr class="divider">
            <div class="bill-row">
                <span class="label">Item</span>
                <span class="value">${data.item}</span>
            </div>
            <div class="bill-total">Total: ₹${data.amount}</div>
            <div class="bill-footer">
                <canvas id="billQrcode"></canvas>
                <p>Scan to Pay</p>
                <p>Thank you for your business</p>
                <p class="print-credit">Designed & Developed by Awaizalam</p>
            </div>
        </div>
    `;
    
    document.getElementById('billContent').innerHTML = billHtml;
    document.getElementById('billSection').classList.remove('hidden');
    
    // Generate QR code for the bill
    setTimeout(() => {
        const upiUrl = `upi://pay?pa=8999925776-3@ybl&pn=Merchant&am=${data.amount}&cu=INR&tn=${encodeURIComponent(data.item)}`;
        generateBillQRCode(upiUrl);
    }, 100);
}

// Print bill function
function printBill() {
    const billContent = document.getElementById('billContent').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill Receipt</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                    background: #ffffff;
                    color: #1a1a1a;
                    padding: 20px;
                }
                .bill-receipt { max-width: 400px; margin: 0 auto; padding: 24px; }
                .bill-header { text-align: center; margin-bottom: 16px; }
                .bill-header h2 { font-size: 16px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
                .bill-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #333333; }
                .bill-row .label { color: #777777; }
                .bill-row .value { font-weight: 600; color: #1a1a1a; }
                .bill-total { text-align: center; padding: 12px 0; margin: 12px 0; border-top: 1px dashed #cccccc; border-bottom: 1px dashed #cccccc; font-size: 18px; font-weight: 700; color: #000000; }
                .bill-footer { text-align: center; margin-top: 16px; }
                .bill-footer p { font-size: 11px; color: #999999; margin: 4px 0; }
                canvas { border: 1px solid #e0e0e0; border-radius: 4px; }
                hr.divider { border: none; border-top: 1px dashed #cccccc; margin: 12px 0; }
                .print-credit { text-align: center; margin-top: 24px; font-size: 10px; color: #aaaaaa; letter-spacing: 0.3px; font-family: 'Georgia', 'Palatino', serif; font-style: italic; }
            </style>
        </head>
        <body>
            ${billContent}
            <p class="print-credit">Designed & Developed by Awaizalam</p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Clear form after generating QR code
function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('billSection').classList.add('hidden');
}