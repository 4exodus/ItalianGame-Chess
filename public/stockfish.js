// Stockfish Web Worker
self.importScripts('/stockfish.wasm/stockfish.js');

let stockfish = null;

// Initialize Stockfish when the worker starts
Stockfish().then(sf => {
  stockfish = sf;
  stockfish.addMessageListener(line => {
    self.postMessage(line);
  });
  self.postMessage('engine loaded');
}).catch(err => {
  self.postMessage('error: ' + err.message);
});

// Forward messages between the main thread and Stockfish
self.onmessage = function(e) {
  if (stockfish) {
    stockfish.postMessage(e.data);
  }
};