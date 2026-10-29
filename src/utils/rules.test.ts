import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRatingAverage,
  formatCongolesePrice,
  formatWhatsAppLink,
  validateProducerRegistration,
  filterProducts,
  validateContactMessage,
  formatContactMailtoUrl,
} from './rules';

test('calculateRatingAverage computes exact average and count', () => {
  const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 5 }];
  const res = calculateRatingAverage(reviews);
  assert.equal(res.count, 4);
  assert.equal(res.average, 4.5);
});

test('calculateRatingAverage handles empty list safely', () => {
  const res = calculateRatingAverage([]);
  assert.equal(res.count, 0);
  assert.equal(res.average, 0);
});

test('formatCongolesePrice displays fallback when price is empty or zero', () => {
  assert.equal(formatCongolesePrice(undefined), 'Contacter le producteur pour le prix');
  assert.equal(formatCongolesePrice(0), 'Contacter le producteur pour le prix');
  assert.equal(formatCongolesePrice(null), 'Contacter le producteur pour le prix');
});

test('formatCongolesePrice formats USD and CDF properly', () => {
  const usdPrice = formatCongolesePrice(12.5, 'USD');
  assert.match(usdPrice, /12[,.]5/);
  assert.match(usdPrice, /USD/);

  const cdfPrice = formatCongolesePrice(25000, 'CDF');
  assert.match(cdfPrice, /25/);
  assert.match(cdfPrice, /CDF/);
});

test('formatWhatsAppLink generates valid international URL for DRC numbers', () => {
  const link = formatWhatsAppLink('0858960478', 'Bonjour');
  assert.equal(link, 'https://wa.me/243858960478?text=Bonjour');

  const linkIntl = formatWhatsAppLink('+243858960478');
  assert.equal(linkIntl, 'https://wa.me/243858960478');
});

test('validateProducerRegistration validates mandatory fields', () => {
  const invalid = validateProducerRegistration({ fullName: '' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 4);

  const valid = validateProducerRegistration({
    fullName: 'Dieudonné Mwamba',
    email: 'contact@kivucafe.cd',
    password: 'password123',
    companyName: 'Coopérative Café Kivu',
    category: 'Café, cacao et autres produits de plantation',
    province: 'Nord-Kivu',
    phone: '+243858960478',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('filterProducts filters correctly by category and province', () => {
  const sample = [
    { name: 'Café Arabica', category: 'cafe', province: 'Nord-Kivu' },
    { name: 'Miel de forêt', category: 'miel', province: 'Ituri' },
    { name: 'Chocolat Lowa', category: 'cafe', province: 'Tshopo' },
  ];
  const filtered = filterProducts(sample, { category: 'cafe', province: 'Nord-Kivu' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Café Arabica');
});

test('validateContactMessage validates required fields', () => {
  const invalid = validateContactMessage({ name: '', email: 'not-an-email' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 3);

  const valid = validateContactMessage({
    name: 'Pascaline Luvuezo',
    email: 'pascaline@example.cd',
    subject: 'Demande de partenariat',
    message: 'Bonjour, je souhaiterais proposer nos produits sur Biloko Na Biso.',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('formatContactMailtoUrl formats subject and recipient correctly', () => {
  const url = formatContactMailtoUrl({
    name: 'Pascaline',
    email: 'pascaline@example.cd',
    subject: 'Question projet',
    message: 'Bonjour Little Giants',
  });
  assert.match(url, /^mailto:littlegiantrdc@gmail\.com/);
  assert.match(url, /Biloko%20Na%20Biso/);
});

