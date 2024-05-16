const _MOCHA_PATH = new RegExp("(\\\\|/)node_modules\\1mocha\\1bin\\1_mocha$");
var isMochaRunning =
	process.argv.findIndex((arg) => _MOCHA_PATH.test(arg)) > -1;
module.exports = isMochaRunning;
