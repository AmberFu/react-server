import path from "path";
import chalk from "chalk";
import mergeOptions from "./mergeOptions"
import findOptionsInFiles from "./findOptionsInFiles"
import defaultOptions from "./defaultOptions"
import ConfigurationError from "./ConfigurationError"

/* eslint-disable consistent-return */
export default function run(options = {}) {

	// for the option properties that weren't sent in, look for a config file
	// (either .reactserverrc or a reactServer section in a package.json). for
	// options neither passed in nor in a config file, use the defaults.
	options = mergeOptions(defaultOptions, findOptionsInFiles() || {}, options);

	const {
		routesFile,
		jsUrl,
	} = options;

	options.routesPath = path.resolve(process.cwd(), routesFile);
	options.routesDir = path.dirname(options.routesPath);

	// No routes file available when performing init command
	if (options.command !== 'init') {
		try {
			options.routes = require(options.routesPath);
		} catch (e) {
			if (e.code === 'MODULE_NOT_FOUND') {
				console.error(chalk.red(`Failed to load routes file at ${options.routesPath}`));
			}

			throw e;
		}
	}

	options.outputUrl = jsUrl || '/';

	try {
		return require("./" + path.join("commands", options.command)).default(options);
	} catch (e) {
		if (e instanceof ConfigurationError) {
			console.error(chalk.red(e.message));
		} else {
			throw e;
		}
	}
}
