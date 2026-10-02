import { writeFile, rename } from 'node:fs/promises';
import { nexoEnabled, nexoCatalog } from '../server/nexo.mjs';

if (!nexoEnabled()) throw new Error('Configure NEXO_API_URL, NEXO_STORE y NEXO_INTEGRATION_TOKEN en el servidor.');
const products = await nexoCatalog();
// Static Astro pages and nutritional comparison use the same published PIM snapshot.
// Build again after adding/removing products. Stock and checkout are rechecked live.
await writeFile(new URL('../src/data/pim/nexo-catalog.json.tmp', import.meta.url), JSON.stringify(products, null, 2));
await rename(new URL('../src/data/pim/nexo-catalog.json.tmp', import.meta.url), new URL('../src/data/pim/nexo-catalog.json', import.meta.url));
console.log(`Catálogo Nexo actualizado: ${products.length} variantes publicadas. Ejecuta npm run build.`);
