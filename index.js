(function(){
  var easy_cli, argv, exec_argv, raw_argv, cut_after, coco_make_file;
  easy_cli = require('easy-cli');
  argv = easy_cli().argv;
  exec_argv = [];
  if (!argv.compile && argv._.length) {
    raw_argv = process.argv.slice(2);
    cut_after = raw_argv.indexOf(argv._[0]);
    if (cut_after !== -1) {
      exec_argv = raw_argv.slice(cut_after + 1);
    }
  }
  coco_make_file = require('./coco_make_file');
  coco_make_file.make({
    _path: argv._.pop(),
    uglify: argv.uglify,
    bare: argv.bare,
    compile: argv.compile,
    binary: argv.binary,
    include: argv.include,
    'make-readme': argv['make-readme'],
    exec_argv: exec_argv,
    no_colors: argv['no-colors'],
    no_beep: argv['no-beep']
  });
}).call(this);
