/**
 * Kotatsu Library
 * ================
 *
 */
var webpack = require('webpack'),
    spawn =  require('child_process').spawn,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

/**
 * Helpers.
 */
function rewire(child) {

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

/**
 * Main.
 */
module.exports = function(opts) {
  opts = opts || {};

  // TODO: Poll or signal?
  // TODO: configurable
  // TODO: file location
  var config = {
    entry: [
      'webpack/hot/signal',
      opts.entry
    ],
    target: 'node',
    output: {
      path: path.join('.kotatsu'),
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  };

  var compiler = webpack(_.extend({}, config, opts.config));

  // Starting to watch
  var running = false,
      child;

  var watcher = compiler.watch(100, function(err, stats) {
    if (err)
      return console.error(err);

    // Running the script
    if (!running) {
      child = spawn('node', [path.join('.kotatsu', 'bundle.js')]);

      rewire(child);

      running = true;
    }
    else {

      // TODO: replace this by custom handling through messages
      child.kill('SIGUSR2');
    }
  });

  // Cleaning up on exit
  function cleanup(isSignal) {
    if (child)
      child.kill();
    rmrf.sync(path.join('.kotatsu'));

    if (isSignal)
      process.exit();
  }

  process.on('exit', cleanup.bind(null, false));
  process.on('SIGINT', cleanup.bind(null, true));

  return watcher;
};
