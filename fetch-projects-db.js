import fs from 'fs';

// let data = fs.readFileSync('venues.json', 'utf-8');
// let { venues } = JSON.parse(data);

let venues = [{ id: 202 }];

for (let i = 0; i < venues.length; i++) {
  let venue = venues[i];
  console.log(venue);
  let url = `https://itp.nyu.edu/projects/public/projectsJSON_ALL.php?venue_id=${venue.id}`;

  console.log(`Fetching data from ${url}...`);
  let response = await fetch(url);
  let json = await response.json();
  let output = {
    projects: json,
  };
  fs.writeFileSync(`thesis-data/thesis-${venue.id}.json`, JSON.stringify(output));
}
