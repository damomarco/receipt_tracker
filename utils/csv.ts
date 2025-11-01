
import { Receipt } from '../types';

export const exportToCSV = (receipts: Receipt[], date: string) => {
  if (receipts.length === 0) {
    alert("No receipts to export for this day.");
    return;
  }

  const headers = ['Date', 'Merchant (Original)', 'Merchant (Translated)', 'Total Amount', 'Currency', 'Items (JSON)', 'Image ID (Stored Locally)'];
  const rows = receipts.map(receipt => [
    receipt.date,
    `"${receipt.merchant.original.replace(/"/g, '""')}"`,
    `"${receipt.merchant.translated.replace(/"/g, '""')}"`,
    receipt.total,
    receipt.currency,
    `"${JSON.stringify(receipt.items || []).replace(/"/g, '""')}"`,
    receipt.id
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `receipts_${date}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}
