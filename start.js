#!/usr/bin/env node

var cluster = require('cluster'),
	async = require('async'),
	debug = require('debug')('arrow:run');

if (cluster.isMaster) {
	var numWorkers = 0,
		shuttingDown,
		timers = {};

	if (process.env.APPC_WORKER_COUNT) {
		// allow the worker to be set from the environment
		numWorkers = +process.env.APPC_WORKER_COUNT;
	} else if (process.env.NODE_ACS_URL && !process.env.ARROWCLOUD_CONTAINER) {
		// for legacy API Runtime Services, don't fork since we can't reliably determine memory
		numWorkers = 1;
	} else if (process.env.NODE_ACS_URL && !process.env.ARROWCLOUD_SELFMANAGED) {
		// for API Runtime Services, we need to currently determine cpus manually based on
		// container size until API-989 is resolved by CPU sizing
		var containerSize = (process.env.ARROWCLOUD_CONTAINER || 'Dev').toLowerCase();
		var memorySizes = {
			dev: 256,
			small: 256,
			medium: 512,
			large: 1024,
			xlarge: 2048
		};
		var memory = memorySizes[containerSize] || memorySizes.dev;
		var allocSize = 256 + 50; // size of a container app + some overhead
		numWorkers = Math.max(1, Math.floor(memory / allocSize));
	} else if (process.env.NODE_ENV === 'production') {
		// if running in production outside of API Runtime Services or locally, use CPU cores
		numWorkers = require('os').cpus().length;
	} else {
		// by default, if running locally, use 1 worker
		numWorkers = 1;
	}
}

// if only 1 worker, we shouldn't fork to create the extra overhead.
// in this case (below), just load it directly and start
if (numWorkers > 1) {
	process.env.APPC_WORKER_COUNT = numWorkers;
	debug('creating %d workers', numWorkers);

	// handle signals
	['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGABRT'].forEach(function (name) {
		debug('adding signal handler %s', name);
		process.on(name, function () {
			if (shuttingDown) {
				debug('(ignoring %s; shut down already in progress)', name);
				return;
			}
			debug('master received signal %s; server termination imminent.', name);
			shuttingDown = true;
			if (name === 'exit') {
				sendToAll('SIGTERM');
			} else {
				sendToAll(name);
			}
		});
	});

	// restart if we receive the SIGUSR2 signal
	process.on('SIGUSR2', gotSigUsr2);

	// monitor any unhandled exceptions
	process.on('uncaughtException', function (error) {
		console.error(error);
	});
	cluster.on('disconnect', restartWorker);
	cluster.on('exit', restartWorker);

	for (var c = 0; c < numWorkers; c++) {
		var worker = cluster.fork();
		setupWorker(worker);
	}

	function createWorkerMessageHandler(worker, handlers) {
		return function workerMessageReceived(msg) {
			if (handlers && handlers[msg]) {
				var cb = handlers[msg];
				handlers[msg] = null;
				cb();
			}
		};
	}

	function gotSigUsr2() {
		debug('bin/run.js: signal received SIGUSR2 restarting');
		async.each(Object.keys(cluster.workers).reverse(), function (id, next) {
			var worker = cluster.workers[id];
			stopWorker(worker, id, next);
		}, function () {
			process.kill(process.pid, 'SIGUSR2');
		});
	}

	function setupWorker(worker, handlers) {
		worker.on('message', createWorkerMessageHandler(worker, handlers));
	}

	function sendToAll(signal) {
		debug('sending %s to all workers', signal);
		Object.keys(cluster.workers).forEach(function (id) {
			var worker = cluster.workers[id];
			stopWorker(worker, id);
		});
	}

	function stopWorker(worker, id, cb) {
		worker.on('disconnect', function () {
			debug('master received disconnect from cluster %s', id);
			var timer = timers[id];
			if (timer) {
				delete timers[id];
				clearTimeout(timer);
			}
			if (cb) {
				setImmediate(cb);
				cb = null;
			}
		});
		worker.send('shutdown');
		worker.disconnect();
		timers[id] = setTimeout(function () {
			debug('master timed out waiting for disconnect from cluster %s', id);
			if (!worker.isDead) {
				try {
					worker.kill();
					if (cb) {
						setImmediate(cb);
						cb = null;
					}
				}
				catch (E) {
				}
			}
			var timer = timers[id];
			if (timer) {
				delete timers[id];
				clearTimeout(timer);
			}
		}, 9000);
		timers[id].unref();
	}

	function restartWorker(worker) {
		if (!shuttingDown && !worker.suicide) {
			// restart a new worker
			if (Object.keys(cluster.workers).length < numWorkers) {
				var newWorker = cluster.fork();
				debug('re-starting worker');
				setupWorker(newWorker);
			}
		}
	}


} else {

	var path = require('path'),
		fs = require('fs'),
		exec = require('child_process').exec,
		pkgfile = path.join(process.cwd(), 'package.json'),
		pkg = fs.existsSync(pkgfile) && require(pkgfile) || {},
		start = process.env.NODE_ACS_URL ? pkg.poststart : pkg.start;

	// for convenience, set our worker PID
	process.env.APPC_WORKER_PID = cluster.worker && cluster.worker.process.pid;
	process.env.APPC_WORKER_ID = cluster.worker && cluster.worker.id;

	if (!cluster.isMaster && start) {
		exec(start, {stdio: 'inherit'}, function (err, stdout, stderr) {
			if (err) {
				console.error(stderr);
				process.exit(1);
			}
		});
	} else {
		var app = path.resolve(process.cwd(), pkg._main || pkg.main || 'app.js');
		try {
			require(app);
		}
		catch(ex) {
			console.error('error requiring package: ' + app, ex);
		}
	}
}
