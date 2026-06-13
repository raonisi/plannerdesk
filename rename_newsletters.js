const fs = require('fs');
const path = require('path');

const firebaseBucket = 'plannerdesk-storage-2026.firebasestorage.app';

const companyMap = {
  'General': {
    'DB': 'DB손해보험',
    'Hana': '하나손해보험',
    'Hanhwa': '한화손해보험',
    'Heungkuk': '흥국화재',
    'Hyundai': '현대해상',
    'KB': 'KB손해보험',
    'Lina': '라이나손해보험',
    'Lotte': '롯데손해보험',
    'Meritz': '메리츠화재',
    'NHNonghyup': 'NH농협손해보험',
    'Nonghyup': 'NH농협손해보험',
    'Samsung': '삼성화재'
  },
  'Life': {
    'ABL': 'ABL생명',
    'AIA': 'AIA생명',
    'Chubb': '처브라이프생명',
    'DB': 'DB생명',
    'Dongyang': '동양생명',
    'FubonHyundai': '푸본현대생명',
    'Hana': '하나생명',
    'Hanhwa': '한화생명',
    'Heungkuk': '흥국생명',
    'iM': 'iM라이프',
    'KB': 'KB라이프생명',
    'KDB': 'KDB생명',
    'Kyobo': '교보생명',
    'Lina': '라이나생명',
    'MetLife': '메트라이프생명',
    'Miraeasset': '미래에셋생명',
    'NHNonghyup': 'NH농협생명',
    'Samsung': '삼성생명',
    'Shinhan': '신한라이프'
  }
};

async function listFirebase(prefix) {
  const validPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  const url = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o?prefix=${encodeURIComponent(validPrefix)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

async function downloadFirebase(name) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/${encodeURIComponent(name)}?alt=media`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  return await res.arrayBuffer();
}

async function uploadFirebase(name, arrayBuffer) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/pdf' },
    body: Buffer.from(arrayBuffer)
  });
  if (!res.ok) throw new Error('Upload failed: ' + res.status);
  return await res.json();
}

async function deleteFirebase(name) {
  const url = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/${encodeURIComponent(name)}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) console.error('Delete failed for', name, res.status);
}

async function processMonth(monthStr) {
  const files = await listFirebase(`newsletters/${monthStr}`);
  for (const file of files) {
    if (!file.name.endsWith('.pdf')) continue;
    // Skip if already in life/general folder
    if (file.name.includes('/life/') || file.name.includes('/general/')) continue;
    
    // Parse: newsletters/202605/(General) DB-202605.pdf
    const basename = file.name.split('/').pop(); // (General) DB-202605.pdf
    
    const match = basename.match(/^\((General|Life)\)\s*([A-Za-z]+)-\d{6}\.pdf$/);
    if (!match) {
      console.log('Skipping unmatched file:', file.name);
      continue;
    }
    const type = match[1]; // General or Life
    const englishName = match[2];
    
    const koreanName = companyMap[type][englishName] || englishName;
    const folder = type === 'Life' ? 'life' : 'general';
    const newName = `newsletters/${folder}/${monthStr}/${koreanName}.pdf`;
    
    console.log(`Renaming ${file.name} -> ${newName}`);
    try {
      const buffer = await downloadFirebase(file.name);
      await uploadFirebase(newName, buffer);
      await deleteFirebase(file.name);
      console.log(`  Success`);
    } catch (e) {
      console.error(`  Failed:`, e.message);
    }
  }
}

async function run() {
  await processMonth('202605');
  await processMonth('202606');
}

run().catch(console.error);
