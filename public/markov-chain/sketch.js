// https://github.com/Programming-from-A-to-Z/A2Z-F23

let markov;
let input;
let data;
let output;

let minN = 3;
let maxN = 6;

function preload() {
  data = loadJSON('thesis-193.json');
}

function buildMarkov(n) {
  markov = new MarkovGenerator(n, 20);
  process(data);
}

function setup() {
  noCanvas();
  input = createInput();
  input.input(goMarkov);
  output = createP();
}

function goMarkov() {
  let value = input.value();
  if (value.length <= minN) {
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
    value = random(matches);
    buildMarkov(minN);
  } else if (value.length > maxN) {
    buildMarkov(maxN);
  }
  generate(value);
}

function process(data) {
  let projects = data.projects;
  for (let i = 0; i < projects.length; i++) {
    // feed the markov generator with elevator pitches to get closer search to content than just titles
    // Not all the data has elevator pitches
    if (projects[i].elevator_pitch) {
      let elevator = decodeHtml(projects[i].elevator_pitch);
      markov.feed(elevator);
    }
  }
}

function decodeHtml(html) {
  let txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function generate(input) {
  let results = markov.generate(input);
  output.html(results.join('<br>'));
}
