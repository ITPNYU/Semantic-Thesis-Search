let N = 2;
let generator;
let allTokens = {};

// Elements
let input;
let outputP;

let extractor;
let embeddings;

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0';

async function loadData() {
  let response = await fetch('thesis-2024.json');
  let data = await response.json();
  generator = RiTa.markov(N, { maxAttempts: 50 });
  process(data, generator);
  initializeUI();
  tokenizeData(data);

  extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
  // extractEmbeddings(data);
  const raw = await fetch('thesis-embeddings-2024.json');
  const json = await raw.json();
  embeddings = json.embeddings;
}

// Initialize UI components
function initializeUI() {
  input = document.createElement('input');
  input.placeholder = 'explore';

  input.style.width = '500px';
  input.addEventListener('input', goMarkov);
  document.body.appendChild(input);

  outputP = document.createElement('p');
  document.body.appendChild(outputP);
}

async function extractEmbeddings(data) {
  let sentences = data.map((d) => decodeHtml(d.title) + '\n' + decodeHtml(d.excerpt));
  console.log(sentences);
  const raw = await getEmbeddings(sentences);
  embeddings = raw.map((r, i) => ({
    id: data[i].projectId,
    embedding: r,
  }));
}

// Tokenize data
function tokenizeData(data) {
  for (let i = 0; i < data.length; i++) {
    tokenizeAndAdd(data[i].excerpt);
    tokenizeAndAdd(data[i].title);
  }
  allTokens = Object.keys(allTokens);
}

// Tokenize and add words to allTokens
function tokenizeAndAdd(text) {
  if (!text) return;
  let decodedText = decodeHtml(text.toLowerCase());
  let tokens = RiTa.tokenize(decodedText);
  tokens.forEach((word) => {
    if (!allTokens[word]) allTokens[word] = true;
  });
}

// Get matches for autocompletion
function getMatches(word) {
  return allTokens.filter((token) => token.startsWith(word));
}

async function getEmbeddings(sentences) {
  let embeddings = [];
  for (let sentence of sentences) {
    let output = await extractor(sentence, { pooling: 'mean', normalize: true });
    embeddings.push(output.data);
  }
  return embeddings;
}

// Generate and display markov chain output
async function goMarkov() {
  let value = input.value.trim().toLowerCase();
  let tokens = RiTa.tokenize(value);
  let word = tokens[tokens.length - 1];
  let matches = getMatches(word);
  let results = [];

  let generating = true;
  let count = 0;
  while (generating) {
    let swap = matches[Math.floor(Math.random() * matches.length)];
    let tokensCopy = tokens.slice();
    if (swap) tokensCopy[tokens.length - 1] = swap;
    let generated = '';
    count++;
    try {
      let seed = tokensCopy.slice(-N);
      generated = generator.generate({ seed, maxLength: 5 });
      let prefix = tokensCopy.slice(0, tokensCopy.length - N + 1);
      generated = RiTa.untokenize(prefix.concat(RiTa.tokenize(generated)));
    } catch (e) {
      // console.log('stopping');
      // Stop after 50 failed tries
      if (count > 50) {
        generating = false;
      }
      // console.error(e);
    }
    generated = generated.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '');

    if (generated.length > 0 && !results.includes(generated)) {
      // filter our all punctuation from generated
      results.push(generated);
    }
  }
  results = results.filter((r) => r.length > 0);
  results.sort((a, b) => b.length - a.length);
  outputP.innerHTML = results.join('<br>');

  const queryEmbedding = await getEmbeddings([value]);

  const similarities = embeddings.map((embedding) =>
    cosineSimilarity(embedding.embedding, queryEmbedding[0])
  );
  const sortedIndices = similarities
    .map((_, i) => i)
    .sort((a, b) => similarities[b] - similarities[a]);
  const topResults = sortedIndices.map((i) => embeddings[i].id);
  console.log(topResults);
}

// Decode HTML entities
function decodeHtml(html) {
  let txt = document.createElement('textarea');
  txt.innerHTML = html;
  txt.innerHTML = txt.value.replace(/<p>/g, '').replace(/<\/p>/g, '');
  return txt.value;
}

function process(data, generator) {
  for (let i = 0; i < data.length; i++) {
    let excerpt = decodeHtml(data[i].excerpt.toLowerCase());
    generator.addText(excerpt);
  }
}

// Load the data when the document is ready
document.addEventListener('DOMContentLoaded', loadData);

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
