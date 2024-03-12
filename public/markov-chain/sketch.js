// https://github.com/Programming-from-A-to-Z/A2Z-F23

//next question - how to display relevant search results?

let markov;
let input;
let data;

function preload() {
  data = loadJSON('thesis-193.json');
}

// let allData = [];

// async function loadData() {
//   for (let venue of data.venues) {
//     statusP.html(`Loading ${venue.name}`);
//     let id = venue.id;
//     let url = `https://itp.nyu.edu/projects/public/projectsJSON_ALL.php?venue_id=${id}`;
//     let response = await fetch(url);
//     let json = await response.json();
//     allData.push(json);
//   }
//   statusP.hide();
//   input = createInput();
// }

function buildMarkov(n) {
  // The Markov Generator
  // First argument is N-gram length, second argument is max length of generated text
  markov = new MarkovGeneratorWord(n, 10);
  process(data);
  // for (let json of allData) {
  //   process(json);
  // }
}

function setup() {
  noCanvas();
  input = createInput();

  // loadData();
}

//generate a markov after there is at least a word
//detect by sensing space?
//then split the words, use them as beginnings for markov generation

function keyPressed() {
  //if space key is pressed, add the previous words into prompt arrays and send them to markov chain as beginnings
  if (keyCode === 32) {
    let value = input.value();
    //split the input into tokens to do word count
    let wordCount = value.tokenize();

    //if word count is less than 4 (n-gram), use the word count as n-gram
    if (wordCount.length < 4) {
      buildMarkov(wordCount.length);
    } else {
      //if word count is more than 4, use 4 as n-gram
      buildMarkov(4);
    }
    generate(value);
  }
}

function process(data) {
  let projects = data.projects;
  for (let i = 0; i < projects.length; i++) {
    //feed the markov generator with elevator pitches to get closer search to content than just titles
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
  // Generate a title
  let title = select('#title');
  title.html(markov.generate(input));
}
