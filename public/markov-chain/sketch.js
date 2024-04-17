let N = 2;
let generator;
let allTokens = {};

// Elements
let input;
let outputP;
let searchP;

let extractor;
let embeddings;

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0';
// Load JSON data using fetch
async function loadData() {
  let response = await fetch('thesis-202.json');
  let data = await response.json();
  generator = RiTa.markov(N, { maxAttempts: 50 });
  process(data, generator);
  initializeUI();
  tokenizeData(data);
  extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');

  const raw = await fetch('thesis-embeddings-202.json');
  const json = await raw.json();
  embeddings = json.embeddings;
}

// Initialize UI components
function initializeUI() {
  input = document.createElement('input');
  input.style.width = '500px';
  input.addEventListener('input', goMarkov);
  document.body.appendChild(input);

  outputP = document.createElement('p');
  document.body.appendChild(outputP);

  searchP = document.createElement('p');
  document.body.appendChild(searchP);
}

// Tokenize data
function tokenizeData(data) {
  for (let i = 0; i < data.projects.length; i++) {
    tokenizeAndAdd(data.projects[i].elevator_pitch);
    tokenizeAndAdd(data.projects[i].description);
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

  for (let i = 0; i < Math.min(5, matches.length); i++) {
    let swap = matches[Math.floor(Math.random() * matches.length)];
    let tokensCopy = tokens.slice();
    if (swap) tokensCopy[tokens.length - 1] = swap;
    let generated = '';
    try {
      let seed = tokensCopy.slice(-N);
      generated = generator.generate({ seed, maxLength: 5 });
      let prefix = tokensCopy.slice(0, tokensCopy.length - N + 1);
      generated = RiTa.untokenize(prefix.concat(RiTa.tokenize(generated)));
    } catch (e) {
      // console.error(e);
    }
    results.push(generated);
  }
  results = results.filter((r) => r.length > 0);
  if (results.length < 1) results.push(value);
  outputP.innerHTML = results.join('<br>');

  const queryEmbedding = await getEmbeddings([value]);

  const similarities = embeddings.map((embedding) => cosineSimilarity(embedding.embedding, queryEmbedding[0]));
  const sortedIndices = similarities.map((_, i) => i).sort((a, b) => similarities[b] - similarities[a]);
  const topResults = sortedIndices.slice(0, 5).map((i) => embeddings[i]);

  searchP.innerHTML = topResults.map((r) => r.title + ' : ' + r.student).join('<br>');
}

// Decode HTML entities
function decodeHtml(html) {
  let txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function process(data, generator) {
  let projects = data.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].elevator_pitch) {
      let elevator = decodeHtml(projects[i].elevator_pitch.toLowerCase());
      generator.addText(elevator);
    }
    if (projects[i].description) {
      let description = decodeHtml(projects[i].description.toLowerCase());
      generator.addText(description);
    }
    if (projects[i].background) {
      let background = decodeHtml(projects[i].background.toLowerCase());
      generator.addText(background);
    }
    if (projects[i].technical_system) {
      let technical_system = decodeHtml(projects[i].technical_system.toLowerCase());
      generator.addText(technical_system);
    }
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
