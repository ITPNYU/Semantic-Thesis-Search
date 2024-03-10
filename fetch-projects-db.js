import fs from 'fs';

let data = fs.readFileSync('venues.json', 'utf-8');
let { venues } = JSON.parse(data);

for (let i = 0; i < venues.length; i++) {
  let venue = venues[i];
  let url = `https://itp.nyu.edu/projects/public/projectsJSON_ALL.php?venue_id=${venue.id}`;

  console.log(`Fetching data from ${url}...`);
  let response = await fetch(url);
  let json = await response.json();
  fs.writeFileSync(`thesis-data/thesis-${venue.id}.json`, JSON.stringify(json));
}
