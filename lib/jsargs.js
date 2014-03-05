module.exports = function () {
	var spawn = require('child_process').spawn
	var EventEmitter = require('events').EventEmitter
	emitter = new EventEmitter()
	var json = ''
	process.stdin.on('data', function(data) {
		json += data
	})
	process.stdin.on('end', function() {
		try {
			emitter.emit('process', JSON.parse(json))
		} catch(E) {
			console.log('error parsing json', E)
		}
	})

	emitter.on('process', function(json) {
		var argv = process.argv.slice(2)
		var cmd = argv.shift()
		json.map(function(X) {
			var args = argv.concat(X)
			var proc = spawn(cmd,args)
			proc.on('error', function(err) {
				console.log(err)
			})
			proc.on('exit', function(status) {
				if (status != 0) console.log(cmd, "for value", X, "exited status", status)
			})
			proc.stdout.on('data', function(data) {
				console.log('' + data) 
			})
		})
	})
}
