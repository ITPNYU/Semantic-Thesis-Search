// https://github.com/Programming-from-A-to-Z/A2Z-F23

let markov;
let input;
let data;
let outputP;

let minN = 3;
let maxN = 5;

let generators = [];

function preload() {
  data = loadJSON('thesis-193.json');
}

function buildMarkov(n) {
  process(data);
}

function setup() {
  noCanvas();
  for (let i = minN; i <= maxN; i++) {
    generators[i] = RiTa.markov(i);
    process(data, generators[i]);
  }
  input = createInput('');
  input.input(goMarkov);
  outputP = createP();
}

function goMarkov() {
  let n = minN;
  let value = input.value().trim() || 'interactive';
  let tokens = RiTa.tokenize(value);
  let word = tokens[tokens.length - 1];
  let matches = [];
  for (let i = 0; i < data.projects.length; i++) {
    let elevator = decodeHtml(data.projects[i].elevator_pitch).toLowerCase();
    let tokens = RiTa.tokenize(elevator);
    for (let token of tokens) {
      let regex = new RegExp(`^${word}.*`, 'g');
      let match = token.match(regex);
      if (match) {
        matches.push(match[0]);
      }
    }
  }
  word = random(matches);
  tokens[tokens.length - 1] = word;
  let seed = tokens.slice(max(0, tokens.length - n));
  let results = [];
  for (let i = 0; i < 10; i++) {
    results[i] = generators[n].generate({ seed });
  }
  let extra = max(0, tokens.length - n + 1);
  prefix = tokens.slice(0, extra);
  results = results.map((elt) => RiTa.untokenize(prefix) + ' ' + elt);
  if (results) {
    outputP.html(results.join('<br>'));
  }
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

function decodeHtml(html) {
  let txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
