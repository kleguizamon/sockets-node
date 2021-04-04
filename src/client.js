const { Socket } = require('net');
const socket = new Socket();
//con readline leemos de consola
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout,
});

const END = 'END';

const error = (error) => {
	console.log(error);
	process.exit(1);
};

const connect = (host, port) => {
	console.log(`Connecting to ${host}:${port}`);
	socket.connect({ host, port });
	socket.setEncoding('utf-8');

	socket.on('connect', () => {
		console.log('Connected');
		readline.question('Choose your username: ', (username) => {
			//le paso el username al sv
			socket.write(username);
			console.log(`Type any message to send it, type ${END} to finish`);
		});

		//cuando el usuario escriba una linea y esa se la mando al sv
		readline.on('line', (message) => {
			socket.write(message);
			if (message === 'END') {
				socket.end();
				console.log('Disconnected');
				process.exit(0);
			}
		});
	});

	socket.on(error, (err) => error(err.message));
};

socket.on('data', (data) => {
	console.log(data);
});
//cuando se confirma que se cierra el sv, matamos el proceso
socket.on('close', () => process.exit(0));

const main = () => {
	if (process.argv.length != 4) {
		error(`Usage: node ${__filename} host port`);
	}

	let [, , host, port] = process.argv;
	if (isNaN(port)) {
		error(`Invalid ${port}`);
	}
	port = Number(port);
	connect(host, port);
};

if (module === require.main) {
	main();
}
