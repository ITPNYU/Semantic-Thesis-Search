import * as fs from 'fs';
import { pipeline } from '@xenova/transformers';

// Load the embeddings model
const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

const outputJSON = { embeddings: [] };
const raw = fs.readFileSync(`public/explore-prototype/thesis-2024.json`, 'utf-8');
const data = JSON.parse(raw);
for (let project of data) {
  let title = project.title;
  let student = project.author;
  let text = title + '\n' + project.excerpt + '\n' + student;
  let output;
  try {
    output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
  } catch (e) {
    console.log(e);
  }
  const embedding = output.tolist()[0];
  outputJSON.embeddings.push({ id: project.projectId, embedding });
}
const fileOut = `public/explore-prototype/thesis-embeddings-2024.json`;
fs.writeFileSync(fileOut, JSON.stringify(outputJSON));
console.log(`Embeddings saved to ${fileOut}`);
