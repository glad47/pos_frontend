// Receipt Printer - SAR currency, LTR numbers in RTL, wait for QR, auto-print without preview

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

  // Wait for QR image to fully load, then print silently
  const tryPrint = () => {
    try {
      const imgs = printFrame.contentWindow.document.querySelectorAll('img');
      let allLoaded = true;
      imgs.forEach(img => { if (!img.complete || img.naturalWidth === 0) allLoaded = false; });

      if (!allLoaded) {
        // Retry in 300ms
        setTimeout(tryPrint, 300);
        return;
      }

      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        try { if (printFrame && printFrame.parentNode) printFrame.parentNode.removeChild(printFrame); } catch (e) {}
      }, 2000);
    } catch (error) { console.error('Print error:', error); }
  };

  // Start checking after document loads
  if (printFrame.contentWindow.document.readyState === 'complete') {
    setTimeout(tryPrint, 500);
  } else {
    printFrame.contentWindow.addEventListener('load', () => setTimeout(tryPrint, 500));
  }
};

const generateReceiptHTML = (order, companyInfo) => {
  const { companyName = 'كيو', companyNameEn = 'Q', vat = '312001752300003', configName = 'Main POS', address = 'شارع الأمير محمد بن عبدالعزيز', neighborhood = 'حي الصفا', buildingNumber = '4291', postalCode = '23251', city = 'جدة', region = 'مكه' } = companyInfo;
  const { orderNumber = '', subtotal = 0, taxAmount = 0, totalAmount = 0, discountAmount = 0, paymentMethod = 'CASH', cashierName = 'Cashier', createdAt = new Date().toISOString(), change = 0, amountPaid = 0, loyaltySections = [], remainingItems = [], customerName = null, customerPhone = null, customerVat = null } = order;

  const formatDate = (ds) => new Date(ds).toLocaleString('en-GB', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit' });

  // Format currency: number always LTR, SAR instead of ﷼
  const fc = (a) => '<span class="num">' + a.toFixed(2) + '</span> SAR';
  const fcNeg = (a) => '<span class="num">-' + a.toFixed(2) + '</span> SAR';
  const numSpan = (n) => '<span class="num">' + n.toFixed(2) + '</span>';

  const totalDiscount = discountAmount;
  const actualAmountPaid = amountPaid || totalAmount;
  const actualChange = change || Math.max(0, actualAmountPaid - totalAmount);

  // Determine if this is a tax invoice (has VAT number)
  const isTaxInvoice = customerVat && customerVat.trim();
  const invoiceTitle = isTaxInvoice ? 'فاتورة ضريبية' : 'فاتورة ضريبية مبسطة';
  const invoiceTitleEn = isTaxInvoice ? 'Tax Invoice' : 'Simplified Tax Invoice';

  // ZATCA QR
  const toHex = (str) => { let h=''; for(let i=0;i<str.length;i++) h+=str.charCodeAt(i).toString(16).padStart(2,'0'); return h; };
  const createTLV = (tag,val) => tag.toString(16).padStart(2,'0') + val.length.toString(16).padStart(2,'0') + toHex(val);
  const tlv = createTLV(1,companyNameEn||companyName)+createTLV(2,vat)+createTLV(3,new Date(createdAt).toISOString())+createTLV(4,totalAmount.toFixed(2))+createTLV(5,taxAmount.toFixed(2));
  const bytes = []; for(let i=0;i<tlv.length;i+=2) bytes.push(parseInt(tlv.substr(i,2),16));
  const qrCodeData = btoa(String.fromCharCode.apply(null,bytes));

  // Build customer info section
  const customerInfoHTML = (customerName || customerPhone || customerVat) ? `
<!-- Customer Info  -->
<table style="margin-bottom:5pt;font-size:7pt;border-top:0.5px dashed #999;padding-top:5pt;">
  ${customerPhone ? '<tr><td class="en" style="padding-top:2pt;">Phone:</td><td class="center" style="padding-top:2pt;font-size:7pt;"><span class="num">' + customerPhone + '</span></td><td style="padding-top:2pt;text-align:right;">الهاتف:</td></tr>' : ''}
  ${customerVat ? '<tr><td class="en" style="padding-top:2pt;">Customer VAT:</td><td class="center bold" style="padding-top:2pt;font-size:7pt;"><span class="num">' + customerVat + '</span></td><td style="padding-top:2pt;text-align:right;">الرقم الضريبي للعميل:</td></tr>' : ''}
</table>
` : '';

  // Build loyalty sections
  const loyaltyHTML = loyaltySections.map(sec => {
    const typeLabel = sec.type === 1
      ? 'Buy ' + (sec.triggerItems[0]?.quantity||0) + ' Get ' + (sec.rewardItems[0]?.freeQty||0) + ' Free / اشتر واحصل مجاناً'
      : sec.discountPercent + '% Off / ' + sec.discountPercent + '% خصم';

    const tLines = sec.triggerItems.map(ti =>
      '<tr style="font-size:8pt;line-height:1.6;"><td style="text-align:center;padding:3pt 2pt;">'+fc(ti.lineTotal)+'</td><td style="text-align:center;padding:3pt 2pt;">'+fc(ti.price)+'</td><td style="text-align:center;padding:3pt 2pt;">'+numSpan(ti.quantity)+'</td><td style="text-align:right;padding:3pt 2pt;">'+ti.name+'</td></tr>'
    ).join('');

    const rLines = sec.rewardItems.map(ri =>
      '<tr style="font-size:8pt;line-height:1.6;"><td style="text-align:center;padding:3pt 2pt;">'+(sec.type===1?fc(0):fc(ri.lineTotal))+'</td><td style="text-align:center;padding:3pt 2pt;">'+(sec.type===1?fc(0):fc(ri.price))+'</td><td style="text-align:center;padding:3pt 2pt;">'+numSpan(ri.quantity)+'</td><td style="text-align:right;padding:3pt 2pt;">'+ri.name+'</td></tr>'
    ).join('');

    const dLine = sec.type === 0
      ? '<tr style="font-size:7.5pt;"><td style="text-align:center;padding:2pt;">'+fcNeg(sec.totalDiscount)+'</td><td colspan="3" style="text-align:right;padding:2pt;">Discount '+sec.discountPercent+'%</td></tr>'
      : '';

    return '<tr style="border-top:0.5px dashed #999;"><td colspan="4" style="padding:5pt 2pt 2pt;text-align:right;"><div style="font-weight:bold;font-size:7.5pt;">'+sec.loyaltyName+'</div><div style="font-size:6.5pt;color:#333;">'+typeLabel+'</div></td></tr>'+tLines+rLines+dLine+'<tr style="border-top:0.5px solid #ccc;"><td style="text-align:center;padding:3pt 2pt;font-weight:bold;font-size:7.5pt;">'+fc(sec.sectionSubtotal)+'</td><td colspan="3" style="text-align:right;padding:3pt 2pt;font-weight:bold;font-size:7pt;">Subtotal / الاجمالي الفرعي</td></tr>';
  }).join('');

  const otherHeader = (loyaltySections.length > 0 && remainingItems.length > 0)
    ? '<tr style="border-top:0.5px dashed #999;"><td colspan="4" style="padding:5pt 2pt 2pt;text-align:right;font-weight:bold;font-size:7.5pt;">Other Items / اصناف اخرى</td></tr>' : '';

  const otherLines = remainingItems.map(item =>
    '<tr style="font-size:8pt;line-height:1.6;"><td style="text-align:center;padding:3pt 2pt;">'+fc(item.price*item.quantity)+'</td><td style="text-align:center;padding:3pt 2pt;">'+fc(item.price)+'</td><td style="text-align:center;padding:3pt 2pt;">'+numSpan(item.quantity)+'</td><td style="text-align:right;padding:3pt 2pt;">'+item.name+'</td></tr>'
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
@page { size: 80mm auto; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif; width: 80mm; margin: 0 auto; padding: 5mm 4mm; direction: rtl; text-align: right; background: #fff; font-size: 8pt; color: #000; }
table { width: 100%; border-collapse: collapse; }
td, th { padding: 3pt; }
.center { text-align: center; }
.bold { font-weight: bold; }
.num { direction: ltr; unicode-bidi: embed; font-family: Arial, sans-serif; }
.en { font-family: Arial, sans-serif; direction: ltr; unicode-bidi: embed; }
.qr-container { text-align: center; margin: 8pt 0; padding: 6pt; }
.qr-code { max-width: 120px; height: auto; margin: 0 auto; }
@media print { body { margin: 0; padding: 5mm 4mm; } @page { margin: 0; } }
</style>
</head>
<body>
<div>
<!-- Header -->
<div class="center" style="padding-bottom:6pt;">
  <div style="font-size:14pt;font-weight:bold;margin-bottom:3pt;">${companyName}</div>
  <div style="font-size:9pt;font-weight:bold;" class="en">${companyNameEn}</div>
</div>

<!-- Company Info -->
<table style="margin-bottom:5pt;font-size:7pt;">
  <tr><td colspan="3" class="center" style="padding:2pt 0;">${address}</td></tr>
  <tr><td colspan="3" class="center" style="padding:2pt 0;">${neighborhood} ${buildingNumber} - ${city} ${region} ${postalCode}</td></tr>
  <tr><td class="en" style="padding-top:4pt;font-size:6.5pt;">VAT:</td><td class="center bold" style="padding-top:4pt;font-size:7pt;"><span class="num">${vat}</span></td><td style="padding-top:4pt;text-align:right;font-size:6.5pt;">:الرقم الضريبي</td></tr>
  <tr><td colspan="3" class="center" style="padding-top:3pt;font-size:7pt;">(${configName})</td></tr>
</table>

<!-- Title -->
<div style="border-top:1px solid #000;border-bottom:1px solid #000;padding:6pt 0;margin:6pt 0;">
  <div class="center bold" style="font-size:11pt;margin-bottom:2pt;">${invoiceTitle}</div>
  <div class="center bold en" style="font-size:8pt;">${invoiceTitleEn}</div>
</div>

<!-- Invoice Details -->
<table style="margin-bottom:5pt;font-size:7pt;">
  <tr><td class="en">Invoice No:</td><td class="center bold" style="font-size:7.5pt;"><span class="num">${orderNumber}</span></td><td style="text-align:right;">رقم الفاتورة:</td></tr>
  <tr><td class="en" style="padding-top:3pt;">Date:</td><td class="center" style="padding-top:3pt;font-size:7pt;"><span class="num">${formatDate(createdAt)}</span></td><td style="padding-top:3pt;text-align:right;">التاريخ:</td></tr>
  <tr><td class="en" style="padding-top:3pt;">Cashier:</td><td class="center" style="padding-top:3pt;">${cashierName}</td><td style="padding-top:3pt;text-align:right;">البائع:</td></tr>
</table>

${customerInfoHTML}

<!-- Items -->
<table style="margin:6pt 0;border-top:1px solid #000;font-size:7pt;">
<thead><tr style="font-size:6.5pt;border-bottom:1px solid #000;">
  <th class="center" style="padding:5pt 2pt;"><div class="bold">الإجمالي</div><div class="en">Total</div></th>
  <th class="center" style="padding:5pt 2pt;"><div class="bold">السعر</div><div class="en">Price</div></th>
  <th class="center" style="padding:5pt 2pt;"><div class="bold">الكمية</div><div class="en">Qty</div></th>
  <th style="padding:5pt 2pt;text-align:right;"><div class="bold">الصنف</div><div class="en">Item</div></th>
</tr></thead>
<tbody>${loyaltyHTML}${otherHeader}${otherLines}</tbody>
</table>

<!-- Totals -->
<div style="border-top:1px solid #000;padding:6pt 0;margin:6pt 0;">
<table style="font-size:8pt;">
  <tr><td style="padding:3pt 0;"><span class="bold">الإجمالي الفرعي</span> <span class="en" style="font-size:6.5pt;">/ Subtotal</span></td><td class="center bold" style="padding:3pt 0;">${fc(subtotal)}</td></tr>
  ${totalDiscount > 0 ? '<tr><td style="padding:3pt 0;"><span class="bold">الخصم</span> <span class="en" style="font-size:6.5pt;">/ Discount</span></td><td class="center bold" style="padding:3pt 0;">'+fcNeg(totalDiscount)+'</td></tr>' : ''}
  <tr style="border-top:0.5px dashed #999;"><td style="padding:3pt 0;"><span class="bold">ضريبة القيمة المضافة</span> <span class="en" style="font-size:6.5pt;">/ VAT</span></td><td class="center bold" style="padding:3pt 0;">${fc(taxAmount)}</td></tr>
  <tr style="border-top:1px solid #000;"><td style="padding:5pt 0;"><span class="bold" style="font-size:10pt;">المجموع النهائي</span> <span class="bold en" style="font-size:8pt;">/ Total</span></td><td class="center bold" style="padding:5pt 0;font-size:11pt;">${fc(totalAmount)}</td></tr>
</table>
</div>

<!-- Payment -->
<table style="font-size:7.5pt;margin-bottom:6pt;border-top:0.5px dashed #999;padding-top:5pt;">
  <tr><td style="padding:3pt 0;"><span class="bold">طريقة الدفع</span> <span class="en" style="font-size:6.5pt;">/ Payment</span></td><td class="center bold" style="padding:3pt 0;">${paymentMethod === 'CASH' ? 'نقدي / Cash' : 'بطاقة / Card'}</td></tr>
  <tr><td style="padding:3pt 0;"><span class="bold">المبلغ المستلم</span> <span class="en" style="font-size:6.5pt;">/ Paid</span></td><td class="center bold" style="padding:3pt 0;">${fc(actualAmountPaid)}</td></tr>
  ${actualChange > 0 ? '<tr><td style="padding:3pt 0;"><span class="bold">الباقي</span> <span class="en" style="font-size:6.5pt;">/ Change</span></td><td class="center bold" style="padding:3pt 0;">'+fc(actualChange)+'</td></tr>' : ''}
</table>

<!-- QR -->
<div class="qr-container">
  <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}" alt="QR" />
  <div style="font-size:5.5pt;color:#666;margin-top:4pt;" class="center">امسح للتحقق / Scan to verify</div>
</div>

<!-- Return policy -->
<div style="border-top:0.5px dashed #999;padding-top:6pt;font-size:6pt;text-align:center;line-height:1.5;">
  <div class="bold" style="margin-bottom:3pt;">سياسة الاسترجاع والاستبدال</div>
  <div>الاسترجاع خلال 3 أيام | الاستبدال خلال 7 أيام</div>
  <div class="en" style="color:#666;margin-top:2pt;">Returns 3 days | Exchange 7 days | With receipt</div>
</div>

<!-- Thank you -->
<div class="center bold" style="margin-top:8pt;font-size:9pt;">
  <div style="margin-bottom:2pt;">شكراً لزيارتكم</div>
  <div class="en">Thank You</div>
</div>
</div>
</body>
</html>`;
};

export default printReceipt;