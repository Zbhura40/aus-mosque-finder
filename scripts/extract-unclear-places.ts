import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('docs/prayer-rooms-search-results.json', 'utf-8'));

// Places to auto-approve
const approveIds = new Set([
  'ChIJd5XKtcKxEmsRFV78z2_ffPM',  // Prayer Room (with Jumu'ah Prayer) - Sydney Airport
  'ChIJwZEaDxK5MioRlnM9wvvV_Ow',  // Quiet Room - Perth Airport
  'ChIJzyD96yRNFmsRIZjnBgVN3eA',  // AL-INAYA PRAYER ROOM FOR SISTERS
  'ChIJu-wHrAkFkWsRigdNS89bTgY',  // Prayer Place Ground Floor
  'ChIJY0RtFdpC1moRHKRLAiLR1yg',  // Islamic Council of Victoria
  'ChIJtVP5_cRZ1moRk8KoXb0Pqhw',  // Tullamarine Public Hall (Jumua'h only)
]);

// Places to reject
const rejectKeywords = ['Gold Coast House of Prayer', 'Adelaide Airport', 'Gold Coast Airport', 'Cairns Airport'];

console.log('\n🟡 UNCLEAR PLACES - MANUAL REVIEW NEEDED\n');
console.log('='.repeat(80));
console.log('\nThese 25 places need your decision: APPROVE or REJECT\n');

let count = 1;
const unclearPlaces: any[] = [];

for (const place of data.needsReview) {
  // Skip approved ones
  if (approveIds.has(place.place_id)) {
    continue;
  }
  // Skip rejected ones
  if (rejectKeywords.some(keyword => place.name.includes(keyword))) {
    continue;
  }

  unclearPlaces.push(place);

  console.log(`\n${count}. ${place.name}`);
  console.log(`   📍 ${place.address}`);
  console.log(`   🆔 ${place.place_id}`);
  console.log(`   🏷️  Types: ${place.types.join(', ')}`);
  if (place.phone) console.log(`   📞 ${place.phone}`);
  if (place.website) console.log(`   🌐 ${place.website}`);
  if (place.rating) console.log(`   ⭐ ${place.rating}`);

  count++;
}

console.log('\n' + '='.repeat(80));
console.log(`\nTotal unclear places: ${unclearPlaces.length}\n`);

// Export to CSV for easier review
const csv = [
  'Number,Name,Address,Place_ID,Types,Phone,Website,Rating,Decision',
  ...unclearPlaces.map((p, i) =>
    `${i+1},"${p.name}","${p.address}",${p.place_id},"${p.types.join(';')}","${p.phone || ''}","${p.website || ''}",${p.rating || ''},`
  )
].join('\n');

fs.writeFileSync('docs/unclear-places-for-review.csv', csv);
console.log('📄 Exported to: docs/unclear-places-for-review.csv\n');
