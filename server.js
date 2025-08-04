const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = 8080;

const server = http.createServer((req, res) => {
  console.log(`Requisição: ${req.url}`);

  // Define o caminho do arquivo solicitado
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html'; // Página inicial
  }

  // Extensão do arquivo
  const extname = String(path.extname(filePath)).toLowerCase();

  // Mapear tipo de conteúdo (MIME types)
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT'){
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Arquivo não encontrado\n');
      }
      else {
        res.writeHead(500);
        res.end(`Erro do servidor: ${error.code}\n`);
      }
    }
    else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
