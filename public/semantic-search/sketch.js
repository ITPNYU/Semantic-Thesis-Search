import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

// Get the loading bar element
const loadingBar = document.getElementById('loadingBar');
const loadingContainer = document.getElementById('loadingContainer');

const extractor = await pipeline('feature-extraction', 'mixedbread-ai/mxbai-embed-large-v1', {
  progress_callback: (x) => {
    if (x.progress) {
      const progress = Math.round(x.progress * 100); // Convert to percentage
      loadingBar.value = progress;
    }
  },
});

// Hide the loading bar once loading is complete
loadingContainer.style.display = 'none';
async function getEmbeddings(sentences) {
  let embeddings = [];
  for (let sentence of sentences) {
    const output = await extractor(sentence, {
      pooling: 'cls',
    });
    embeddings.push(output.data);
  }
  return embeddings;
}

const raw = await fetch('show-embeddings-211.json');
const { embeddings } = await raw.json();

const searchInput = document.getElementById('searchInput');
const results = document.getElementById('searchResults');

console.log('ready');
searchInput.addEventListener('input', async (event) => {
  const query = event.target.value;
  const queryEmbedding = await getEmbeddings([query]);

  const similarities = embeddings.map((embedding) =>
    cosineSimilarity(embedding.embedding, queryEmbedding[0])
  );
  const sortedIndices = similarities
    .map((_, i) => i)
    .sort((a, b) => similarities[b] - similarities[a]);
  const topResults = sortedIndices.slice(0, 5).map((i) => embeddings[i]);

  // clear all results
  results.innerHTML = '';

  for (let result of topResults) {
    const li = document.createElement('li');
    li.textContent = result.title + ' : ' + result.student;
    results.appendChild(li);
  }
});

// Function to calculate dot product of two vectors
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

// Function to calculate the magnitude of a vector
function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const numerator = dotProduct(vecA, vecB);
  const denominator = magnitude(vecA) * magnitude(vecB);
  // console.log(numerator, denominator);
  return numerator / denominator;
}
