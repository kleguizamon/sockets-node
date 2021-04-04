const { Server } = require('net');

const host = '0.0.0.0';
const END = 'END';

const connections = new Map();

const error = (error) => {
	console.log(error);
	process.exit(1);
};

//enviar el message a todos menos a origin
const sendMessage = (message, origin) => {
	for (const socket of connections.keys()) {
		//si el socket no es origin, envio el message
		if (socket != origin) {
			socket.write(message);
		}
	}
};

const listen = (port) => {
	const server = new Server();
	//cuando ocurra una conexion genero un socket
	server.on('connection', (socket) => {
		const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
		console.log(`New connection from ${remoteSocket}`);
		socket.setEncoding('utf-8');

		socket.on('data', (message) => {
			//si map tiene socket
			if (!connections.has(socket)) {
				console.log(
					`Username ${message} set for connection ${remoteSocket}`
				);
				connections.set(socket, message);
			} else if (message === 'END') {
				console.log(`Connection with ${remoteSocket} closed`);
				//borro el socket
				connections.delete(socket);
				socket.end();
			} else {
				//enviar el message al resto del cliente
				const fullMessage = `[${connections.get(socket)}]: ${message}`;
				console.log(`${remoteSocket} -> ${fullMessage}`);
				sendMessage(fullMessage, socket);
			}
		});
	});
	server.listen({ port, host }, () => {
		console.log(`Listening port 8000`);
	});
	server.on('error', (err) => error(err.message));
};

const main = () => {
	if (process.argv.length != 3) {
		error(`Usage: node ${__filename} port`);
	}
	let port = process.argv[2];
	if (isNaN(port)) {
		error(`Invalid port ${port}`);
	}
	port = Number(port);
	listen(port);
};

if (module === require.main) {
	main();
}
