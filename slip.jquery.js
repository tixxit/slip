/**
 * Let's slip use jQuery's Deferreds and adds a transform for objects like
 * { href: "..." } that automatically map them to the URI.
 */
(function(slip, $, undefined) {

if (!$)
	return;
	
// Add a wrapper for jQuery deferreds.

slip.deferred.wrappers.push(function(obj) {
	
	// This comes after Slip's own deferred wrapper, so even if Slip did have
	// a property named pipe, this would not interfere.
	
	if (obj && obj.then && obj.pipe) {
		var f = slip.deferred();
		obj.then(
			function() { f.set.apply(f, arguments) },
			function() { f.error.apply(f, arguments) }
		);
		return f.promise;
	}
});

// Add a transform that maps objects like { href: "..." } to the object at that
// URL.

slip.context.transform("href", function(obj) {
	if (obj && obj.href) {
		var params = {}, p;
		for (p in obj)
			params[p] = obj;
		delete params["href"];
		return slip.deferred($.get(obj.href, params));
	}
	return obj;
});

})(slip, jQuery);
