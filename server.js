const fs = require('fs');
const express = require('express');

async function readFile(file) {
  if (fs.existsSync(file)) {
    const content = await fs.promises.readFile(file, 'utf-8');
    const mensajes = await JSON.parse(content);
    return mensajes;
  } else {
    console.log('File not exist');
    return null;
  }
}

const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));

const PORT = 8080;

const mensajes = [];

const productos = [
  { title: 'Calculadora', price: '$123.45', thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-512.png', id: 1 },
  { title: 'Escuadra', price: '$243.56', thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-128.png', id: 2 },
  { title: 'Reloj', price: '$345', thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/clock-stopwatch-timer-time-512.png', id: 3 },
];

// const mensajes = [
//   { name: 'carlos@hotmail.com', message: 'Hola!', date: '[03/08/2022 18:08:76]' },
//   { name: 'juan@gmail.com', message: 'Bien! Vos?', date: '[03/08/2022 18:08:76]' },
//   { name: 'carlos@hotmail.com', message: 'Todo bien por suerte!', date: '[03/08/2022 18:08:76]' },
// ];

httpServer.listen(PORT, function () {
  console.log('Servidor corriendo en http://localhost:8080');
  //Llenar mensajes con los que se encuentren en el txt, pero solo cuando levanto el servidor
  fs.promises
    .readFile('mensajes.txt', 'utf-8')
    .then((data) => JSON.parse(data))
    .then((data) => {
      for (const mensaje of data) {
        mensajes.push(mensaje);
      }
    });
});

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.emit('productos', productos);

  socket.emit('mensajes', mensajes);

  socket.on('new-product', (newProduct) => {
    const id = productos.length !== 0 ? productos[productos.length - 1].id + 1 : 1;

    const productoAGuardar = { ...newProduct, id: id };
    productos.push(productoAGuardar);

    io.sockets.emit('productos', productos);
  });
  socket.on('new-message', (newMessage) => {
    mensajes.push(newMessage);
    fs.promises.writeFile('mensajes.txt', `${JSON.stringify(mensajes)}`).then(io.sockets.emit('mensajes', mensajes));
  });
});

httpServer.on('error', (error) => console.log(`Error en el servidor: ${error}`));
