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

  // Generate a text from the information ngrams
  // Updated generate function to incorporate recursion with a limit on the results array size
  generate(prompt, results = [], currentLength = 0) {
    if (results.length >= 10) {
      // If we've reached the max number of results, stop the recursion
      return results;
    }

    let current = prompt.substring(prompt.length - this.n, prompt.length);

    if (currentLength >= this.max) {
      // If we've reached the max length for a single result, add it to the results and return
      if (!results.includes(prompt)) {
        // Prevent adding duplicates
        results.push(prompt);
      }
      return results;
    } else if (this.ngrams[current]) {
      // If the current ngram has possible continuations
      let possible_next = this.ngrams[current];
      for (let next of possible_next) {
        // For each possible continuation, recursively generate more continuations
        let newPrompt = prompt + next; // Create a new string with the next character
        this.generate(newPrompt, results, currentLength + 1); // Pass the results array through recursion
        if (results.length >= this.max) {
          // Early exit if max results are reached during recursion
          return results;
        }
      }
    } else if (!results.includes(prompt)) {
      // If no possible continuations and the prompt is not already in results
      results.push(prompt);
    }
    return results;
  }
}
