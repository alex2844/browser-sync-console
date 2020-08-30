const
	browserSync = require('browser-sync'),
	logger = require('eazy-logger');

module.exports.plugin = (server, client, bs) => {
	let logger2info = logger.Logger({ prefix:'[{blue:INFO}] ' }),
		logger2error = logger.Logger({ prefix:'[{red:ERROR}] ' });
	client.io.sockets.on('connect', client => {
		client.on('console:log', args => logger2info.info.apply(logger2info, args));
		client.on('console:error', args => logger2error.error.apply(logger2error, args));
	});
}
module.exports.hooks = {
	'client:js': '('+(function(console) {
		var client = {
			log: console.log,
			error: console.error
		};
		var selector = function(el) {
			var names = [];
			while (el.parentNode) {
				if (el.id) {
					names.unshift('#'+el.id);
					break;
				}else{
					if (el == el.ownerDocument.documentElement)
						names.unshift(el.tagName);
					else{
						for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
						names.unshift(el.tagName+':nth-child('+c+')');
					}
					el = el.parentNode;
				}
			}
			return names.join(' > ');
		}
		args2arr = function(args) {
			for (var l=args.length, a=new Array(l), k=0; k<l; ++k) {
				if ((a[k] = args[k]) instanceof HTMLElement)
					a[k] = selector(a[k]);
				else if ((k == 0) && !(a[0] instanceof String))
					a.unshift('');
			};
			a.push(new Error().stack.split('\n')[2].trim());
			return a;
		}
		console.log = function() {
			 ___browserSync___.socket.emit('console:log', args2arr(arguments));
			client.log.apply(console, arguments);
		}
		console.error = function() {
			 ___browserSync___.socket.emit('console:error', args2arr(arguments));
			client.error.apply(console, arguments);
		}
	}).toString()+')(console);'
}
