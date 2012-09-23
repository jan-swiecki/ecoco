(function(){
  var fs, exec, coco, uglify, uglify_parser, path_helper, ref$, out$ = typeof exports != 'undefined' && exports || this, replace$ = ''.replace, join$ = [].join;
  fs = require("fs");
  exec = require("child_process").exec;
  coco = require('coco');
  uglify = require('uglify-js').uglify;
  uglify_parser = require('uglify-js').parser;
  path_helper = require('path');
  require('colors');
  require('js-yaml');
  ref$ = out$;
  ref$.co_include = [];
  ref$.js_include = [];
  ref$.co = '';
  ref$.nl = undefined;
  ref$.prepend_before_compile = '';
  ref$.prepend_after_compile = '';
  ref$.path_out = '';
  ref$.cp_exec = function(cmd, fn){
    exec(cmd, function(err, stdout, stderr){
      if (err) {
        this.error("CMD: " + cmd);
        this.error(err.toString());
        return;
      }
      if (fn != null) {
        return fn.apply(this, arguments);
      }
    });
  };
  ref$.error = function(){
    var this$ = this;
    if (!this.settings.no_beep) {
      console.error("\x07");
    }
    if (this.settings.no_colors) {
      return console.error.apply(void 8, arguments);
    } else {
      return console.error.apply(void 8, Array.prototype.slice.call(arguments).map(function(it){
        return it.bold.red;
      }));
    }
  };
  ref$.ok = function(){
    var this$ = this;
    if (this.settings.no_colors) {
      return console.log.apply(void 8, arguments);
    } else {
      return console.log.apply(void 8, Array.prototype.slice.call(arguments).map(function(it){
        return it.bold.green;
      }));
    }
  };
  ref$.get_includes = function(type){
    var arr, code, k, path;
    type || (type = 'co');
    arr = this[type + "_include"];
    code = '';
    for (k in arr) {
      path = arr[k];
      if (!fs.existsSync(path)) {
        throw "file " + path + " doesnt exists";
      }
      code += fs.readFileSync(path, 'utf8') + this.nl;
    }
    return code;
  };
  ref$.get_package_json = function(path, json_no_parse){
    var folder, package_json;
    folder = path_helper.dirname(path);
    path = folder + "/package.json";
    if (!fs.existsSync(path)) {
      return false;
    }
    package_json = fs.readFileSync(path, 'utf8');
    if (!json_no_parse) {
      package_json = JSON.parse(package_json);
    }
    return package_json;
  };
  ref$.detect_new_line = function(src){
    if (src.indexOf("\r\n") !== -1) {
      return "\r\n";
    } else if (src.indexOf("\n") !== -1) {
      return "\n";
    } else {
      return "\n";
    }
  };
  ref$.coco_make_ugly = function(code){
    var ast;
    ast = uglify_parser.parse(code);
    ast = uglify.ast_mangle(ast);
    ast = uglify.ast_squeeze(ast);
    return uglify.gen_code(ast);
  };
  ref$.make_binary = function(){
    this.prepend_after_compile = "#!/usr/bin/env node" + this.nl;
    return this.path_out = replace$.call(this.path_out, /\.js$/, '');
  };
  ref$.replace = function(repl){
    var script;
    script = "(x) -> x.replace " + repl;
    script = coco.compile(script, {
      bare: true
    });
    return this.co = eval(script)(this.co);
  };
  ref$.include_file = function(path){
    if (path.match(/\.co$/)) {
      return this.co_include.push(path);
    } else if (path.match(/\.js$/)) {
      return this.js_include.push(path);
    }
  };
  ref$.get_str_options = function(settings){
    var str_options, k;
    str_options = [];
    for (k in settings) {
      if (settings[k] === true) {
        str_options.push(k);
      }
    }
    if (str_options.length) {
      return " (" + join$.call(str_options, ', ') + ")";
    } else {
      return "";
    }
  };
  ref$.make_readme = function(program_name, readme_path){
    var dir, readme_src_filename, readme_src_path, program_filename, cmd, readme;
    readme_path || (readme_path = 'README.md');
    if (typeof readme_path == 'boolean') {
      readme_path = 'README.md';
    }
    if (!readme_path.match(/^README\.(md|markdown)/i)) {
      return false;
    }
    dir = path_helper.dirname(readme_path);
    readme_src_filename = 'README.md.src';
    readme_src_path = dir + "/" + readme_src_filename;
    if (!fs.existsSync(readme_src_path)) {
      this.error("No README.md.src");
      return;
    }
    program_filename = program_name + "";
    cmd = ['node', program_filename + "", "--usage"];
    if (!fs.existsSync(program_filename)) {
      program_filename = program_name + ".co";
      cmd = ['coco', program_filename + "", "--usage"];
      if (!fs.existsSync(program_filename)) {
        program_filename = program_name + ".js";
        cmd = ['node', program_filename + "", "--usage"];
        if (!fs.existsSync(program_filename)) {
          this.error("Cannot find " + program_name);
          return;
        }
      }
    }
    readme = fs.readFileSync(readme_src_path).toString();
    this.cp_exec(join$.call(cmd, ' '), function(err, stdout, stderr){
      var cli_usage, write_path;
      cli_usage = (stdout + stderr).replace(/^/gm, "\t");
      readme = readme.replace(/\{CLI\}/, cli_usage);
      write_path = replace$.call(readme_path, /\.src$/, '');
      this.ok("Writing to " + write_path);
      return fs.writeFileSync(write_path, readme);
    });
  };
  ref$.make = function(path, settings){
    var m, co_includes, js, js_includes, str_options, cp, proc, err, this$ = this;
    if (typeof path === 'object') {
      settings = path;
      path = settings._path;
    }
    this.settings = settings;
    if (typeof settings['make-readme'] !== 'undefined') {
      this.make_readme(path, settings['make-readme']);
      return;
    }
    if (!path) {
      return false;
    }
    if (!fs.existsSync(path)) {
      this.error("File " + path + " doesn't exist.");
      return false;
    }
    this.co = fs.readFileSync(path, 'utf8');
    this.nl = this.detect_new_line(this.co);
    this.path_out = path.replace(/\.(?:co|js\.co)$/, '.js');
    if (m = this.co.match(/^\#!(.*)$/gm)) {
      m.forEach(function(cmd){
        var m;
        cmd = replace$.call(cmd, /^#!/, '');
        if (m = cmd.match(/^include=(.*)$/)) {
          this$.include_file(m[1]);
          return true;
        }
        if (m = cmd.match(/^replace (.*)$/)) {
          this$.replace(m[1]);
          return true;
        }
        if (['b', 'bare'].indexOf(cmd) !== -1) {
          settings.bare = true;
          return true;
        }
        if (['u', 'ugly', 'uglify', 'compress'].indexOf(cmd) !== -1) {
          settings.uglify = true;
          return true;
        }
        if (['c', 'compile'].indexOf(cmd) !== -1) {
          settings.compile = true;
          return true;
        }
        if (['bin', 'binary'].indexOf(cmd) !== -1) {
          settings.binary = true;
          return true;
        }
      });
    }
    try {
      co_includes = this.get_includes('co');
      this.co = this.prepend_before_compile + co_includes + this.co;
      js = coco.compile(this.co, {
        bare: settings.bare
      });
      js_includes = this.get_includes('js');
      js = js_includes + js;
      if (settings.uglify) {
        js = this.coco_make_ugly(js);
      }
      if (settings.binary) {
        this.make_binary();
      }
      js = this.prepend_after_compile + js;
      str_options = this.get_str_options(settings);
      if (settings.compile) {
        this.ok(this.path_out + ": done" + str_options);
        fs.writeFileSync(this.path_out, js, 'utf8');
      } else {
        this.path_out = replace$.call(this.path_out, /\.js/, '') + '.tmp';
        fs.writeFileSync(this.path_out, js, 'utf8');
        cp = require('child_process');
        proc = cp.spawn('node', [this.path_out].concat(settings.exec_argv));
        proc.stdout.on('data', function(data){
          return process.stdout.write(data);
        });
        proc.stderr.on('data', function(data){
          return process.stderr.write(data);
        });
        proc.on('exit', function(exit_code){
          return fs.unlinkSync(this$.path_out);
        });
      }
      return true;
    } catch (e$) {
      err = e$;
      return this.error(this.path_out + ".error", err);
    }
  };
}).call(this);
