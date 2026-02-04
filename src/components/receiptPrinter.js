// Receipt Printer Utility
// This utility formats and prints receipts for Q Store with ZATCA compliance

export const printReceipt = (order, companyInfo = {}) => {
  // Create a hidden iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow.document;
  
  // Generate the receipt HTML
  const receiptHTML = generateReceiptHTML(order, companyInfo);
  
  doc.open();
  doc.write(receiptHTML);
  doc.close();

  // Wait for content to load, then print
  const handlePrint = () => {
    try {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      
      // Remove iframe after a delay to ensure printing started
      setTimeout(() => {
        try {
          if (printFrame && printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        } catch (e) {
          console.log('Frame already removed');
        }
      }, 1000);
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  // Wait for iframe to load
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} SAR`;
  };

  // Calculate totals
  const totalBeforeTax = subtotal + discountAmount;
  const totalDiscount = discountAmount;
  const actualAmountPaid = amountPaid || totalAmount;
  const actualChange = change || (actualAmountPaid - totalAmount);

  // Generate ZATCA-compliant QR code (TLV format)
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
      const valueHex = toHex(value);
      return tagHex + lengthHex + valueHex;
    };

    // ZATCA QR Code Tags:
    // 1: Seller name
    // 2: VAT registration number
    // 3: Timestamp
    // 4: Total with VAT
    // 5: VAT amount
    
    const sellerName = companyNameEn || companyName;
    const vatNumber = vat;
    const timestamp = new Date(createdAt).toISOString();
    const total = totalAmount.toFixed(2);
    const vatAmt = taxAmount.toFixed(2);

    const tlvData = 
      createTLV(1, sellerName) +
      createTLV(2, vatNumber) +
      createTLV(3, timestamp) +
      createTLV(4, total) +
      createTLV(5, vatAmt);

    // Convert hex to base64
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

  // Generate items HTML
  const itemsHTML = items.map((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    const hasDiscount = item.discount && item.discount > 0;
    
    return `
      <tr style="font-size:9pt;line-height:1.8;padding-top:8pt;${index === 0 ? 'border-top: 0.1px solid black;' : ''}">
        <td style="text-align:center;padding:6pt 3pt;">
          ${formatCurrency(itemTotal)}
        </td>
        <td style="text-align:center;padding:6pt 3pt;">
          ${formatCurrency(item.price || 0)}
        </td>
        <td style="text-align:center;padding:6pt 3pt;font-family: Arial, sans-serif;">
          ${(item.quantity || 0).toFixed(2)}
        </td>
        <td style="text-align:right;padding:6pt 3pt;font-family: 'Traditional Arabic', Arial, sans-serif;">
          ${item.name || 'Item'}
          ${hasDiscount ? `<div style="color: #666; font-size: 7pt; padding-top:2pt;">خصم ${item.discount}٪ / Discount ${item.discount}%</div>` : ''}
          ${item.freeProduct ? `<div style="color: green; font-size: 7pt; padding-top: 2pt;">+ مجاناً: ${item.freeProduct}</div>` : ''}
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
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif;
          width: 80mm;
          margin: 0 auto;
          padding: 8mm 5mm;
          direction: rtl;
          text-align: right;
          background: white;
        }
        
        .receipt-container {
          width: 100%;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        td, th {
          padding: 4pt;
        }
        
        .arabic {
          font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif;
          direction: rtl;
        }

        .english {
          font-family: Arial, sans-serif;
          direction: ltr;
        }

        .center {
          text-align: center;
        }

        .bold {
          font-weight: bold;
        }

        .qr-container {
          text-align: center;
          margin: 15pt 0;
          padding: 10pt;
          background: white;
        }

        .qr-code {
          max-width: 150px;
          height: auto;
          margin: 0 auto;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 8mm 5mm;
          }

          @page {
            margin: 0mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        
        <!-- Company Header -->
        <div class="center" style="padding-bottom:10pt;">
          <div style="font-size:16pt;font-weight:bold;margin-bottom:6pt;font-family:'Traditional Arabic',Arial;" class="arabic">${companyName}</div>
          <div style="font-size:10pt;font-weight:bold;margin-bottom:4pt;" class="english">${companyNameEn}</div>
        </div>

        <!-- Company Info Table -->
        <table style="margin-bottom:8pt;font-size:7.5pt;">
          <tr>
            <td colspan="3" class="center arabic" style="padding:3pt 0;">${address}</td>
          </tr>
          <tr>
            <td colspan="3" class="center arabic" style="padding:3pt 0;">${neighborhood} ${buildingNumber} - ${city} ${region} ${postalCode}</td>
          </tr>
          <tr>
            <td colspan="3" class="center english" style="padding:3pt 0;">${country}</td>
          </tr>
          <tr>
            <td class="english" style="padding-top:8pt;">VAT Number:</td>
            <td class="center bold" style="padding-top:8pt;">${vat}</td>
            <td class="arabic" style="padding-top:8pt;text-align:right;">:الرقم الضريبي</td>
          </tr>
          <tr>
            <td class="english">Building:</td>
            <td class="center">${buildingNumber}</td>
            <td class="arabic" style="text-align:right;">:رقم المبنى</td>
          </tr>
          <tr>
            <td class="english">Plot ID:</td>
            <td class="center">${plotId}</td>
            <td class="arabic" style="text-align:right;">:رقم القطعة</td>
          </tr>
          <tr>
            <td colspan="3" class="center" style="padding-top:6pt;font-size:9pt;">(${configName})</td>
          </tr>
        </table>

        <!-- Invoice Title -->
        <div style="border-top:1.5px solid #000;border-bottom:1.5px solid #000;padding:10pt 0;margin:10pt 0;">
          <div class="center bold arabic" style="font-size:14pt;margin-bottom:4pt;">فاتورة ضريبية مبسطة</div>
          <div class="center bold english" style="font-size:10pt;">Simplified Tax Invoice</div>
        </div>

        <!-- Invoice Details -->
        <table style="margin-bottom:8pt;font-size:8pt;">
          <tr>
            <td class="english">Invoice No:</td>
            <td class="center bold" style="font-size:9pt;">${orderNumber}</td>
            <td class="arabic" style="text-align:right;">:رقم الفاتورة</td>
          </tr>
          <tr>
            <td class="english" style="padding-top:5pt;">Date:</td>
            <td class="center" style="padding-top:5pt;font-size:8pt;">${formatDate(createdAt)}</td>
            <td class="arabic" style="padding-top:5pt;text-align:right;">:التاريخ</td>
          </tr>
          <tr>
            <td class="english" style="padding-top:5pt;">Cashier:</td>
            <td class="center" style="padding-top:5pt;">${cashierName}</td>
            <td class="arabic" style="padding-top:5pt;text-align:right;">:البائع</td>
          </tr>
        </table>

        <!-- Items Table -->
        <table style="margin:10pt 0;border-top:1px solid #000;font-size:8pt;">
          <thead>
            <tr style="font-size:7.5pt;border-bottom:1px solid #000;">
              <th class="center" style="padding:8pt 3pt;">
                <div class="arabic bold">السعر الإجمالي</div>
                <div class="english">Total Price</div>
              </th>
              <th class="center" style="padding:8pt 3pt;">
                <div class="arabic bold">سعر الوحدة</div>
                <div class="english">Unit Price</div>
              </th>
              <th class="center" style="padding:8pt 3pt;">
                <div class="arabic bold">الكمية</div>
                <div class="english">Qty</div>
              </th>
              <th style="padding:8pt 3pt;text-align:right;">
                <div class="arabic bold">الصنف</div>
                <div class="english">Item</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div style="border-top:1.5px solid #000;border-bottom:1.5px solid #000;padding:10pt 0;margin:10pt 0;">
          <div class="center bold" style="font-size:12pt;margin-bottom:6pt;">
            <span class="arabic">الإجمالي مع الضريبة</span>
            <span class="english" style="margin:0 8pt;">/</span>
            <span class="english">Total with VAT</span>
          </div>
          <div class="center bold" style="font-size:16pt;color:#000;">
            ${formatCurrency(totalAmount)}
          </div>
        </div>

        <!-- Price Breakdown -->
        <table style="font-size:9pt;margin-bottom:10pt;">
          <tr>
            <td style="padding:5pt 0;">
              <div class="arabic bold">الإجمالي قبل الضريبة</div>
              <div class="english">Subtotal Before VAT</div>
            </td>
            <td class="center bold" style="padding:5pt 0;">
              ${formatCurrency(totalBeforeTax)}
            </td>
          </tr>
          <tr style="border-top:0.5px dashed #999;">
            <td style="padding:5pt 0;">
              <div class="arabic bold">ضريبة القيمة المضافة (15%)</div>
              <div class="english">VAT Amount (15%)</div>
            </td>
            <td class="center bold" style="padding:5pt 0;">
              ${formatCurrency(taxAmount)}
            </td>
          </tr>
          ${totalDiscount > 0 ? `
          <tr style="border-top:0.5px dashed #999;">
            <td style="padding:5pt 0;color:#22c55e;">
              <div class="arabic bold">الخصم</div>
              <div class="english">Discount</div>
            </td>
            <td class="center bold" style="padding:5pt 0;color:#22c55e;">
              -${formatCurrency(totalDiscount)}
            </td>
          </tr>
          ` : ''}
          <tr style="border-top:1px solid #000;border-bottom:1px solid #000;">
            <td style="padding:8pt 0;">
              <div class="arabic bold" style="font-size:11pt;">المجموع النهائي</div>
              <div class="english bold">Grand Total</div>
            </td>
            <td class="center bold" style="padding:8pt 0;font-size:12pt;">
              ${formatCurrency(totalAmount)}
            </td>
          </tr>
        </table>

        <!-- Payment Info -->
        <table style="font-size:9pt;margin-bottom:10pt;border-top:0.5px dashed #999;padding-top:8pt;">
          <tr>
            <td style="padding:4pt 0;">
              <div class="arabic bold">طريقة الدفع</div>
              <div class="english">Payment Method</div>
            </td>
            <td class="center bold" style="padding:4pt 0;">
              ${paymentMethod === 'CASH' ? '💵 نقدي / Cash' : '💳 بطاقة / Card'}
            </td>
          </tr>
          <tr>
            <td style="padding:4pt 0;">
              <div class="arabic bold">المبلغ المستلم</div>
              <div class="english">Amount Received</div>
            </td>
            <td class="center bold" style="padding:4pt 0;">
              ${formatCurrency(actualAmountPaid)}
            </td>
          </tr>
          ${actualChange > 0 ? `
          <tr>
            <td style="padding:4pt 0;">
              <div class="arabic bold">الباقي</div>
              <div class="english">Change</div>
            </td>
            <td class="center bold" style="padding:4pt 0;">
              ${formatCurrency(actualChange)}
            </td>
          </tr>
          ` : ''}
        </table>

        ${customer && customer.name ? `
        <!-- Customer Info -->
        <table style="font-size:8pt;border-top:1px solid #000;border-bottom:1px solid #000;padding:6pt 0;margin:8pt 0;">
          <tr>
            <td class="arabic" style="padding:3pt 0;">اسم العميل:</td>
            <td class="center" style="padding:3pt 0;">${customer.name}</td>
            <td class="english" style="padding:3pt 0;">Customer Name</td>
          </tr>
          ${customer.vat ? `
          <tr>
            <td class="arabic" style="padding:3pt 0;">الرقم الضريبي:</td>
            <td class="center" style="padding:3pt 0;">${customer.vat}</td>
            <td class="english" style="padding:3pt 0;">VAT Number</td>
          </tr>
          ` : ''}
        </table>
        ` : ''}

        <!-- ZATCA QR Code -->
        <div class="qr-container">
          <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}" alt="QR Code" />
          <div style="font-size:6pt;color:#666;margin-top:6pt;" class="center">
            <div class="arabic">امسح للتحقق من الفاتورة</div>
            <div class="english">Scan to verify invoice</div>
          </div>
        </div>

        <!-- Return Policy Footer -->
        <div style="border-top:0.5px dashed #999;padding-top:10pt;font-size:7pt;text-align:center;line-height:1.6;">
          <div class="arabic bold" style="margin-bottom:6pt;">سياسة الاسترجاع والاستبدال</div>
          <div class="arabic" style="margin-bottom:3pt;">نحن نسعى دائماً لضمان رضاكم التام عن مشترياتكم</div>
          <div class="arabic" style="margin-bottom:3pt;">الاسترجاع خلال 3 أيام من تاريخ الشراء</div>
          <div class="arabic" style="margin-bottom:3pt;">الاستبدال خلال 7 أيام</div>
          <div class="arabic" style="margin-bottom:8pt;">بشرط أن تكون المنتجات بحالتها الأصلية مع الفاتورة</div>
          
          <div class="english" style="margin-top:8pt;color:#666;">
            Returns within 3 days | Exchange within 7 days<br/>
            Products must be in original condition with receipt
          </div>
        </div>

        <!-- Thank You -->
        <div class="center bold" style="margin-top:15pt;font-size:10pt;">
          <div class="arabic" style="margin-bottom:4pt;">شكراً لزيارتكم</div>
          <div class="english">Thank You for Your Visit</div>
        </div>

      </div>
    </body>
    </html>
  `;
};

export default printReceipt;