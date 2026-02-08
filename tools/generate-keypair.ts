import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { publicKey, privateKey } = generateKeyPairSync('ed25519');

const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

const privatePath = join(__dirname, '.private-key');
writeFileSync(privatePath, privateKeyPem, 'utf-8');

console.log('Private key saved to tools/.private-key');
console.log('\nPublic key (embed this in the app):\n');
console.log(publicKeyPem);
