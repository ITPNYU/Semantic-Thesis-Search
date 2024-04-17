import * as fs from 'fs';
import { pipeline } from '@xenova/transformers';

// Load the embeddings model
const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

// const venuesData = fs.readFileSync('venues.json', 'utf-8');
// const { venues } = JSON.parse(venuesData);

let venues = [{ name: '2024', id: 202 }];

for (let venue of venues) {
  const outputJSON = { embeddings: [] };
  console.log(`Processing venue: ${venue.name}...`);
  const projectData = fs.readFileSync(`thesis-data/thesis-${venue.id}.json`, 'utf-8');
  const { projects } = JSON.parse(projectData);
  for (let project of projects) {
    let title = project.project_name;
    let student = project.users[0].user_name;
    let text = title + '\n' + project.description + '\n' + student;
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
    outputJSON.embeddings.push({ title, student, text, embedding });
  }
  const fileOut = `embeddings/thesis-embeddings-${venue.id}.json`;
  fs.writeFileSync(fileOut, JSON.stringify(outputJSON));
  console.log(`Embeddings saved to ${fileOut}`);
}
