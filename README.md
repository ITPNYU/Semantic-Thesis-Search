# ITP Thesis Semantic Search Prototype

This is an example Node.js application that processes projects from the ITP Project Database, generates embeddings, and saves the embeddings to local files. The embeddings are then used for a semantic search.

- `fetch-projects-db.js`: Retrieve project data from ITP Project Database API.
- `embeddings-transformers.js`: Generates embeddings using the bge-small model with transformers.js.
- `index.js`: run a local web server
- `public/index.html` + `public/sketch.js`: proof of concept semantic search

* [transformers.js package](https://www.npmjs.com/package/@xenova/transformers)
* [bge-small model](https://huggingface.co/ggrn/bge-small-en)

```sh
npm install
node fetch-projects-db.js
node embeddings-transformers.js
```
