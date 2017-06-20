import {logging} from "./react-server";

const logger = logging.getLogger(__LOGGER__);

// takes in stats object returned by a webpack compilation and returns
// removes the require.cache entry for modified files
export default function serverSideHotModuleReload (webpackStats) {
	if (webpackStats.compilation.errors.length !== 0) {
		logger.warning("Not reloading server side code because Webpack ended with an error compiling.");
		return;
	}
	//Ava (test framework) overwrites require.cache with an object that lacks a prototype
	// https://github.com/avajs/ava/blob/4b6323e85e509a57f5183a5c7c1385a43d859a30/lib/ava-files.js#L131
	if (typeof require.cache.hasOwnProperty === 'undefined') {
		logger.warning("Cache not available. This should only happen in a test environment");
		return;
	}

	/*
	This commented code is a placeholder for now.  It took a while to find out which files caused Webpack to recompile
	and we'll probably need it again in the future when we do server side Webpack.

	// Get the list of files that were modified, causing Webpack to recompile
	const modifiedFiles = Object.keys(webpackStats.compilation.compiler.watchFileSystem.watcher.mtimes);
	*/

	// For now, loop through all of the project code to remove require caches so that we ensure the server is most up
	// to date.
	Object.keys(require.cache).map((filename) => {
		if (/node_modules/.test(filename) === false && require.cache.hasOwnProperty(filename)) {
			logger.info(`Reloading file: ${filename}`);
			delete require.cache[filename];
		}
	});
}


