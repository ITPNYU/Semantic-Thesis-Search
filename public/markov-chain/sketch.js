// https://github.com/Programming-from-A-to-Z/A2Z-F23

let markov;
let input;
let data;
let output;

let minN = 4;
let maxN = 8;

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
    generators[i] = new MarkovGenerator(i, 40);
    process(data, generators[i]);
  }

  input = createInput();
  input.input(goMarkov);
  output = createP();
}

function goMarkov() {
  let value = input.value().trim();
  let n = minN;
  if (value.length < minN) {
    let matches = [];
    for (let i = 0; i < data.projects.length; i++) {
      let elevator = data.projects[i].elevator_pitch;
      let len = minN - value.length;
      let regex = new RegExp(`${value}.{${len}}`, 'g');
      let match = elevator.match(regex);
      if (match) {
        matches.push(match[0]);
      }
    }
    // if there are no matches, add padding
    if (matches.length === 0) {
      value = value.padEnd(minN, ' ');
    } else {
      value = random(matches);
    }
  } else {
    n = min(value.length, maxN);
  }
  let results = generators[n].generate(value, 10);

  // Shuffle the order
  // for (let i = 0; i < results.length; i++) {
  //   let j = floor(random(results.length));
  //   let temp = results[i];
  //   results[i] = results[j];
  //   results[j] = temp;
  // }
  // results = results.slice(0, 10);

  output.html(results.join('<br>'));
}

function process(data, generator) {
  let projects = data.projects;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].elevator_pitch) {
      let elevator = decodeHtml(projects[i].elevator_pitch);
      generator.feed(elevator);
    }
    if (projects[i].description) {
      let description = decodeHtml(projects[i].description);
      generator.feed(description);
    }
    if (projects[i].background) {
      let background = decodeHtml(projects[i].background);
      generator.feed(background);
    }
    if (projects[i].technical_system) {
      let technical_system = decodeHtml(projects[i].technical_system);
      generator.feed(technical_system);
    }
  }
}

function decodeHtml(html) {
  let txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
