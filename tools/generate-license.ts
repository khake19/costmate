import { createPrivateKey, sign } from 'crypto';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const buyerInfo = process.argv[2];

if (!buyerInfo) {
  console.error('Usage: npx ts-node tools/generate-license.ts "buyer@email.com"');
  process.exit(1);
}

const privatePath = join(__dirname, '.private-key');

let privateKeyPem: string;
try {
  privateKeyPem = readFileSync(privatePath, 'utf-8');
} catch {
  console.error('Private key not found. Run generate-keypair.ts first.');
  process.exit(1);
}

const privateKey = createPrivateKey(privateKeyPem);
const signature = sign(null, Buffer.from(buyerInfo), privateKey);
const licenseKey = `COSTMATE-${Buffer.from(buyerInfo).toString('base64')}.${signature.toString('base64')}`;

console.log(`License key for "${buyerInfo}":\n`);
console.log(licenseKey);
