// Receipt Printer Utility
// Formats and prints receipts with ZATCA compliance and Odoo-style loyalty rewards
// Designed to fit on a single 80mm thermal receipt page

export const printReceipt = (order, companyInfo = {}) => {
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow.document;
  const receiptHTML = generateReceiptHTML(order, companyInfo);

  doc.open();
  doc.write(receiptHTML);
  doc.close();

  const handlePrint = () => {
    try {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        try {
          if (printFrame && printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        } catch (e) { console.log('Frame already removed'); }
      }, 1000);
    } catch (error) { console.error('Print error:', error); }
  };

  if (printFrame.contentWindow.document.readyState === 'complete') {
    setTimeout(handlePrint, 250);
  } else {
    printFrame.contentWindow.addEventListener('load', () => {
      setTimeout(handlePrint, 250);
    });
  }
};

const generateReceiptHTML = (order, companyInfo) => {
  const {
    companyName = 'كيو',
    companyNameEn = 'Q',
    vat = '312001752300003',
    configName = 'Main POS',
    address = 'شارع الأمير محمد بن عبدالعزيز',
    neighborhood = 'حي الصفا',
    buildingNumber = '4291',
    plotId = '9418',
    postalCode = '23251',
    city = 'جدة',
    region = 'مكه',
    country = 'Saudi Arabia'
  } = companyInfo;

  const {
    orderNumber = '',
    items = [],
    subtotal = 0,
    taxAmount = 0,
    totalAmount = 0,
    discountAmount = 0,
    paymentMethod = 'CASH',
    cashierName = 'Cashier',
    customer = null,
    createdAt = new Date().toISOString(),
    change = 0,
    amountPaid = 0
  } = order;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const formatCurrency = (amount) => `${amount.toFixed(2)} SAR`;

  const totalDiscount = discountAmount;
  const actualAmountPaid = amountPaid || totalAmount;
  const actualChange = change || (actualAmountPaid - totalAmount);

  // Generate ZATCA QR
  const generateZATCAQR = () => {
    const toHex = (str) => {
      let hex = '';
      for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
      }
      return hex;
    };
    const createTLV = (tag, value) => {
      const tagHex = tag.toString(16).padStart(2, '0');
      const lengthHex = value.length.toString(16).padStart(2, '0');
      return tagHex + lengthHex + toHex(value);
    };
    const tlvData =
      createTLV(1, companyNameEn || companyName) +
      createTLV(2, vat) +
      createTLV(3, new Date(createdAt).toISOString()) +
      createTLV(4, totalAmount.toFixed(2)) +
      createTLV(5, taxAmount.toFixed(2));
    const hexToBase64 = (hex) => {
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      return btoa(String.fromCharCode.apply(null, bytes));
    };
    return hexToBase64(tlvData);
  };

  const qrCodeData = generateZATCAQR();

  // Generate items HTML — plain product lines only
  const itemsHTML = items.map((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0);

    return `
      <tr style="font-size:8pt;line-height:1.6;${index === 0 ? 'border-top: 0.1px solid black;' : ''}">
        <td style="text-align:center;padding:4pt 2pt;">${formatCurrency(itemTotal)}</td>
        <td style="text-align:center;padding:4pt 2pt;">${formatCurrency(item.price || 0)}</td>
        <td style="text-align:center;padding:4pt 2pt;font-family:Arial,sans-serif;">${(item.quantity || 0).toFixed(2)}</td>
        <td style="text-align:right;padding:4pt 2pt;font-family:'Traditional Arabic',Arial,sans-serif;">${item.name || 'Item'}</td>
      </tr>
    `;
  }).join('');

  // Generate loyalty breakdown sections — each loyalty program as its own block
  const loyaltyBreakdown = order.loyaltyBreakdown || [];
  const loyaltySectionsHTML = loyaltyBreakdown.map((entry) => {
    const typeLabel = entry.type === 1
      ? `${entry.rewardItems[0]?.freeQty || 0} مجاناً / Free`
      : `${entry.discountPercent}% خصم / ${entry.discountPercent}% Off`;

    const rewardLines = entry.rewardItems.map((ri) => {
      const displayAmount = entry.type === 1 ? formatCurrency(0) : `-${formatCurrency(ri.discountAmount)}`;
      return `
        <tr style="font-size:7.5pt;line-height:1.5;color:#000;">
          <td style="text-align:center;padding:2pt;">${displayAmount}</td>
          <td colspan="3" style="text-align:right;padding:2pt;font-family:'Traditional Arabic',Arial,sans-serif;">
            ${ri.name}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <tr style="border-top:0.5px dashed #999;">
        <td colspan="4" style="padding:5pt 2pt 2pt;text-align:right;">
          <div style="font-weight:bold;font-size:7.5pt;color:#000;font-family:'Traditional Arabic',Arial,sans-serif;">${entry.loyaltyName}</div>
          <div style="font-size:6.5pt;color:#333;font-family:'Traditional Arabic',Arial,sans-serif;">${typeLabel}</div>
        </td>
      </tr>
      ${rewardLines}
      <tr style="font-size:7pt;color:#000;border-top:0.5px solid #ccc;">
        <td style="text-align:center;padding:3pt 2pt;font-weight:bold;">-${formatCurrency(entry.totalDiscount)}</td>
        <td colspan="3" style="text-align:right;padding:3pt 2pt;font-weight:bold;font-family:'Traditional Arabic',Arial,sans-serif;">
          <span class="arabic">الاجمالي الفرعي</span> <span class="english" style="font-size:6pt;">/ Subtotal</span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: 80mm auto;
          margin: 0mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif;
          width: 80mm;
          margin: 0 auto;
          padding: 5mm 4mm;
          direction: rtl;
          text-align: right;
          background: white;
          font-size: 8pt;
        }
        .receipt-container { width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 3pt; }
        .arabic { font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif; direction: rtl; }
        .english { font-family: Arial, sans-serif; direction: ltr; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .qr-container { text-align: center; margin: 8pt 0; padding: 6pt; }
        .qr-code { max-width: 120px; height: auto; margin: 0 auto; }
        @media print {
          body { margin: 0; padding: 5mm 4mm; }
          @page { margin: 0mm; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">

        <!-- Company Header (compact) -->
        <div class="center" style="padding-bottom:6pt;">
          <div style="font-size:14pt;font-weight:bold;margin-bottom:3pt;" class="arabic">${companyName}</div>
          <div style="font-size:9pt;font-weight:bold;" class="english">${companyNameEn}</div>
        </div>

        <!-- Company Info (compact) -->
        <table style="margin-bottom:5pt;font-size:7pt;">
          <tr><td colspan="3" class="center arabic" style="padding:2pt 0;">${address}</td></tr>
          <tr><td colspan="3" class="center arabic" style="padding:2pt 0;">${neighborhood} ${buildingNumber} - ${city} ${region} ${postalCode}</td></tr>
          <tr>
            <td class="english" style="padding-top:4pt;font-size:6.5pt;">VAT:</td>
            <td class="center bold" style="padding-top:4pt;font-size:7pt;">${vat}</td>
            <td class="arabic" style="padding-top:4pt;text-align:right;font-size:6.5pt;">:الرقم الضريبي</td>
          </tr>
          <tr><td colspan="3" class="center" style="padding-top:3pt;font-size:7pt;">(${configName})</td></tr>
        </table>

        <!-- Invoice Title -->
        <div style="border-top:1px solid #000;border-bottom:1px solid #000;padding:6pt 0;margin:6pt 0;">
          <div class="center bold arabic" style="font-size:11pt;margin-bottom:2pt;">فاتورة ضريبية مبسطة</div>
          <div class="center bold english" style="font-size:8pt;">Simplified Tax Invoice</div>
        </div>

        <!-- Invoice Details -->
        <table style="margin-bottom:5pt;font-size:7pt;">
          <tr>
            <td class="english">Invoice No:</td>
            <td class="center bold" style="font-size:7.5pt;">${orderNumber}</td>
            <td class="arabic" style="text-align:right;">:رقم الفاتورة</td>
          </tr>
          <tr>
            <td class="english" style="padding-top:3pt;">Date:</td>
            <td class="center" style="padding-top:3pt;font-size:7pt;">${formatDate(createdAt)}</td>
            <td class="arabic" style="padding-top:3pt;text-align:right;">:التاريخ</td>
          </tr>
          <tr>
            <td class="english" style="padding-top:3pt;">Cashier:</td>
            <td class="center" style="padding-top:3pt;">${cashierName}</td>
            <td class="arabic" style="padding-top:3pt;text-align:right;">:البائع</td>
          </tr>
        </table>

        <!-- Items Table -->
        <table style="margin:6pt 0;border-top:1px solid #000;font-size:7pt;">
          <thead>
            <tr style="font-size:6.5pt;border-bottom:1px solid #000;">
              <th class="center" style="padding:5pt 2pt;">
                <div class="arabic bold">الإجمالي</div>
                <div class="english">Total</div>
              </th>
              <th class="center" style="padding:5pt 2pt;">
                <div class="arabic bold">السعر</div>
                <div class="english">Price</div>
              </th>
              <th class="center" style="padding:5pt 2pt;">
                <div class="arabic bold">الكمية</div>
                <div class="english">Qty</div>
              </th>
              <th style="padding:5pt 2pt;text-align:right;">
                <div class="arabic bold">الصنف</div>
                <div class="english">Item</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            ${loyaltySectionsHTML}
          </tbody>
        </table>

        <!-- Totals (compact) -->
        <div style="border-top:1px solid #000;padding:6pt 0;margin:6pt 0;">
          <table style="font-size:8pt;">
            <tr>
              <td style="padding:3pt 0;">
                <span class="arabic bold">الإجمالي الفرعي</span>
                <span class="english" style="font-size:6.5pt;"> / Subtotal</span>
              </td>
              <td class="center bold" style="padding:3pt 0;">${formatCurrency(subtotal)}</td>
            </tr>
            ${totalDiscount > 0 ? `
            <tr>
              <td style="padding:3pt 0;">
                <span class="arabic bold">الخصم</span>
                <span class="english" style="font-size:6.5pt;"> / Discount</span>
              </td>
              <td class="center bold" style="padding:3pt 0;">-${formatCurrency(totalDiscount)}</td>
            </tr>
            ` : ''}
            <tr style="border-top:0.5px dashed #999;">
              <td style="padding:3pt 0;">
                <span class="arabic bold">ضريبة القيمة المضافة</span>
                <span class="english" style="font-size:6.5pt;"> / VAT</span>
              </td>
              <td class="center bold" style="padding:3pt 0;">${formatCurrency(taxAmount)}</td>
            </tr>
            <tr style="border-top:1px solid #000;">
              <td style="padding:5pt 0;">
                <span class="arabic bold" style="font-size:10pt;">المجموع النهائي</span>
                <span class="english bold" style="font-size:8pt;"> / Total</span>
              </td>
              <td class="center bold" style="padding:5pt 0;font-size:11pt;">${formatCurrency(totalAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Info -->
        <table style="font-size:7.5pt;margin-bottom:6pt;border-top:0.5px dashed #999;padding-top:5pt;">
          <tr>
            <td style="padding:3pt 0;">
              <span class="arabic bold">طريقة الدفع</span>
              <span class="english" style="font-size:6.5pt;"> / Payment</span>
            </td>
            <td class="center bold" style="padding:3pt 0;">
              ${paymentMethod === 'CASH' ? '💵 نقدي / Cash' : '💳 بطاقة / Card'}
            </td>
          </tr>
          <tr>
            <td style="padding:3pt 0;">
              <span class="arabic bold">المبلغ المستلم</span>
              <span class="english" style="font-size:6.5pt;"> / Paid</span>
            </td>
            <td class="center bold" style="padding:3pt 0;">${formatCurrency(actualAmountPaid)}</td>
          </tr>
          ${actualChange > 0 ? `
          <tr>
            <td style="padding:3pt 0;">
              <span class="arabic bold">الباقي</span>
              <span class="english" style="font-size:6.5pt;"> / Change</span>
            </td>
            <td class="center bold" style="padding:3pt 0;">${formatCurrency(actualChange)}</td>
          </tr>
          ` : ''}
        </table>

        <!-- ZATCA QR Code -->
        <div class="qr-container">
          <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}" alt="QR Code" />
          <div style="font-size:5.5pt;color:#666;margin-top:4pt;" class="center">
            <span class="arabic">امسح للتحقق</span> / <span class="english">Scan to verify</span>
          </div>
        </div>

        <!-- Return Policy (compact) -->
        <div style="border-top:0.5px dashed #999;padding-top:5pt;font-size:6pt;text-align:center;line-height:1.5;">
          <div class="arabic bold" style="margin-bottom:3pt;">سياسة الاسترجاع والاستبدال</div>
          <div class="arabic">الاسترجاع خلال 3 أيام | الاستبدال خلال 7 أيام</div>
          <div class="english" style="color:#666;margin-top:2pt;">Returns 3 days | Exchange 7 days | With receipt</div>
        </div>

        <!-- Thank You -->
        <div class="center bold" style="margin-top:8pt;font-size:9pt;">
          <div class="arabic" style="margin-bottom:2pt;">شكراً لزيارتكم</div>
          <div class="english">Thank You</div>
        </div>

      </div>
    </body>
    </html>
  `;
};

export default printReceipt;
