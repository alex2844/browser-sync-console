const
	browserSync = require('browser-sync'),
	logger = require('eazy-logger').Logger({ useLevelPrefixes: true });

module.exports.plugin = (server, client, bs) => client.io.sockets.on('connect', client => {
	client.on('console:log', args => logger.info.apply(logger, args));
	client.on('console:error', args => logger.error.apply(logger, args));
});
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
			};
			if (!(a[0] instanceof String))
				a.unshift('');
			a.push(new Error().stack.split('\n').slice(3).join('\n').trim());
			return a;
		}
		console.log = function() {
			 ___browserSync___.socket.emit('console:log', args2arr(arguments));
			client.log.apply(console, arguments);
		}
		console.error = function() {
			console.warn('console:log', args2arr(arguments));
			 ___browserSync___.socket.emit('console:error', args2arr(arguments));
			client.error.apply(console, arguments);
		}
	}).toString()+')(console);'
}
