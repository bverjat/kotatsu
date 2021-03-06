/**
 * Kotatsu Build Command
 * ======================
 *
 * Function building the script as a bundle.
 */
var defaults = require('./defaults.js'),
    pretty = require('pretty-ms'),
    solveOutput = require('./solveOutput.js'),
    createCompiler = require('./createCompiler.js'),
    createLogger = require('./createLogger.js'),
    _ = require('lodash');

module.exports = function build(side, opts) {
  opts = _.merge({}, defaults, opts);

  opts.side = side;
  opts.hot = false;
  opts.build = true;
  opts.solvedOutput = solveOutput(opts.output, opts.cwd);

  var logger = createLogger(opts.quiet);

  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

  var compiler = createCompiler(opts);

  compiler.run(function(err, stats) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    stats = stats.toJson();

    // Errors & warnings?
    var errors = stats.errors || [],
        warnings = stats.warnings || [];

    if (errors.length) {
      errors.forEach(function(error) {
        logger.error(error);
      });

      process.exit(1);
    }

    if (warnings.length) {
      warnings.forEach(function(warning) {
        logger.warn(warning);
      });
    }

    logger.info('Built in ' + pretty(stats.time) + '.');
    logger.success('Done!');
  });
};
