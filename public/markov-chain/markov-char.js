// A2Z F23
// Daniel Shiffman
// https://github.com/Programming-from-A-to-Z/A2Z-F23

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

// A Markov Generator class
class MarkovGenerator {
  constructor(n, max) {
    // Order (or length) of each ngram
    this.n = n;
    // What is the maximum amount we will generate?
    this.max = max;
    // An object as dictionary
    // each ngram is the key, a list of possible next elements are the values
    this.ngrams = {};
    // A separate array of possible beginnings to generated text
    this.beginnings = [];
  }

  // A function to feed in text to the markov chain
  feed(text) {
    // Discard this line if it's too short
    if (text.length < this.n) {
      return false;
    }

    // Store the first ngram of this line
    let beginning = text.substring(0, this.n);
    this.beginnings.push(beginning);

    // Now let's go through everything and create the dictionary
    for (let i = 0; i < text.length - this.n; i++) {
      let gram = text.substring(i, i + this.n);
      let next = text.charAt(i + this.n);
      // Is this a new one?
      if (!this.ngrams.hasOwnProperty(gram)) {
        this.ngrams[gram] = [];
      }
      // Add to the list
      this.ngrams[gram].push(next);
    }
  }

  generate(prompt, maxOptions = 10, results = [], currentLength = 0) {
    // Stop at 10 possibilities
    if (results.length >= maxOptions) {
      return results;
    }

    // This should always be minimum length but something is broken
    if (prompt.length < this.n) {
      prompt = prompt.padEnd(this.n, ' ');
    }

    // Get the last n characters of the prompt
    let current = prompt.substring(prompt.length - this.n, prompt.length);
    // console.log(current);

    // Finished at the desired length
    if (currentLength >= this.max) {
      if (!results.includes(prompt)) {
        results.push(prompt);
      }
      return results;
    } else if (this.ngrams[current]) {
      let possible_next = this.ngrams[current];
      for (let next of possible_next) {
        // new prompt withn next character
        let newPrompt = prompt + next;
        // Call the function recursively
        this.generate(newPrompt, maxOptions, results, currentLength + 1);
        if (results.length >= maxOptions) {
          return results;
        }
      }
    } else if (!results.includes(prompt)) {
      results.push(prompt);
    }
    return results;
  }
}
