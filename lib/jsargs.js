module.exports = function () {
	var spawn = require('child_process').spawn
	var EventEmitter = require('events').EventEmitter
	var json = ''
	var jobs = []
	var argv = process.argv.slice(2)
	var cmd = argv.shift()

	emitter = new EventEmitter()

	process.stdin.on('data', function(data) {
		json += data
	})
	process.stdin.on('end', function() {
		try {
			console.log('downloaded archive list')
			jobs = JSON.parse(json)
			emitter.emit('process') 
		} catch(E) {
			console.log('error parsing json', E)
		}
	})

	emitter.once('process', function() {
		console.log('processing',jobs)
		emitter.emit('next')	
	})

	emitter.on('next', function() {
		console.log('next called')
		if (!jobs || ! jobs.length) return;
		var job = jobs.shift()
		console.log('processing job', job)
		run(job)
	})

	function run(job) {
		var proc = spawn(cmd,argv.concat(job))
		proc.on('error', function(err) {
			console.log("spawn error",err)
		})
		proc.on('exit', function(status) {
			if (status != 0) console.log(cmd, "for value", job, "exited status", status)
			console.log('job done', job)
			emitter.emit('next')
		})
		proc.stdout.on('data', function(data) {
			console.log('' + data.toString()) 
		})
	}
}
