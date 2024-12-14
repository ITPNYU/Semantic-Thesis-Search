import * as fs from 'fs';
import { pipeline } from '@huggingface/transformers';

// Load the embeddings model
const extractor = await pipeline('feature-extraction', 'mixedbread-ai/mxbai-embed-large-v1', {
  progress_callback: (x) => {
    if (x.progress) process.stdout.write(`\r${Math.round(x.progress)}% loaded`);
  },
});
// const venuesData = fs.readFileSync('venues.json', 'utf-8');
// const { venues } = JSON.parse(venuesData);

let venues = [{ name: 'Winter Show 2024', id: 211 }];

for (let venue of venues) {
  const outputJSON = { embeddings: [] };
  console.log(`\nProcessing venue: ${venue.name}...`);
  const projectData = fs.readFileSync(`show-data/show-${venue.id}.json`, 'utf-8');
  const { projects } = JSON.parse(projectData);
  for (let project of projects) {
    let title = project.project_name;
    let student = project.users[0].user_name;
    let text = title + '\n' + project.description + '\n' + student;
    let output;
    try {
      output = await extractor(text, {
        pooling: 'cls',
      });
    } catch (e) {
      console.log(e);
    }
    const embedding = output.tolist()[0];
    outputJSON.embeddings.push({ title, student, text, embedding });
  }
  const fileOut = `embeddings/show-embeddings-${venue.id}.json`;
  fs.writeFileSync(fileOut, JSON.stringify(outputJSON));
  console.log(`Embeddings saved to ${fileOut}`);
}
