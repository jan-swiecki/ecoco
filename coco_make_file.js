(function(){
  var fs, exec, coco, uglify, uglify_parser, path_helper, uuid, js_header, ref$, out$ = typeof exports != 'undefined' && exports || this, replace$ = ''.replace, join$ = [].join, split$ = ''.split;
  fs = require("fs");
  exec = require("child_process").exec;
  coco = require('coco');
  uglify = require('uglify-js').uglify;
  uglify_parser = require('uglify-js').parser;
  path_helper = require('path');
  uuid = require('node-uuid');
  require('colors');
  require('js-yaml');
  js_header = 'Compiled with Extended COco COmpiler\nWhich is a wrapper for native Coco compiler\n\nCoco  repository: https://github.com/satyr/coco/\n                  Hard work of Satoshi Murakami\n\nEcoco repository: https://github.com/jan-swiecki/ecoco\n                  by Jan Święcki\n\nEcoco headers:';
  ref$ = out$;
  ref$.co_include = [];
  ref$.js_include = [];
  ref$.co = '';
  ref$.nl = undefined;
  ref$.prepend_before_compile = '';
  ref$.prepend_after_compile = '';
  ref$.path_out = '';
  ref$.ecoco_json = {};
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
  ref$.cp_exec = function(cmd, fn){
    var this$ = this;
    exec(cmd, function(err, stdout, stderr){
      if (err) {
        this$.error("CMD: " + cmd);
        this$.error(err.toString());
        return;
      }
      if (fn != null) {
        return fn.apply(this$, arguments);
      }
    });
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
  ref$.get_ecoco_json = function(path){
    var dir, _dir, c, k, to$, _path, e, results$ = [];
    dir = path_helper.dirname(path);
    dir = dir.replace(/\\/g, '/');
    _dir = dir.split('/');
    c = _dir.length;
    for (k = 0, to$ = c - 1; k <= to$; ++k) {
      _path = _dir.join('/');
      _dir.pop();
      _path += '/ecoco.json';
      if (fs.existsSync(_path)) {
        try {
          this.ecoco_json = require(_path);
        } catch (e$) {
          e = e$;
          this.error("Cannot load " + _path);
          this.error("Json: " + e);
        }
        break;
      }
    }
    return results$;
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
  ref$.uglify = function(code){
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
  ref$.js_replace = function(js, repl){
    var script;
    script = "(x) -> x.replace " + repl;
    script = coco.compile(script, {
      bare: true
    });
    return js = eval(script)(js);
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
  ref$.make_ckup = function(path){
    var ckup_src, fn_str, out_path;
    if (!path) {
      this.error("No ckup path");
      return false;
    }
    if (!fs.existsSync(path)) {
      this.error("ckup file doesnt exists at " + path);
      return false;
    }
    ckup_src = fs.readFileSync(path, 'utf8');
    fn_str = 'with(this)' + coco.compile(ckup_src);
    fn_str = this.uglify(fn_str);
    fn_str = "//uuid:" + uuid.v1() + "\n" + fn_str;
    out_path = path.replace(/\.(?:ckup|js\.ckup)$/, '.js');
    fs.writeFileSync(out_path, fn_str, 'utf8');
    return this.ok("Ckup saved to " + out_path);
  };
  ref$.make = function(path, settings){
    var js_comment_headers, m, co_includes, js, js_includes, str_options, cp, proc, err, this$ = this;
    if (typeof path === 'object') {
      settings = path;
      path = settings._path;
    }
    this.settings = settings;
    if (typeof settings['make-readme'] !== 'undefined') {
      this.make_readme(path, settings['make-readme']);
      return;
    }
    if (settings['ckup']) {
      this.make_ckup(path);
      return;
    }
    if (!path) {
      return false;
    }
    if (!fs.existsSync(path)) {
      this.error("File " + path + " doesn't exist.");
      return false;
    }
    this.get_ecoco_json(path);
    this.co = fs.readFileSync(path, 'utf8');
    this.nl = this.detect_new_line(this.co);
    this.path_out = path.replace(/\.(?:co|js\.co)$/, '.js');
    js_comment_headers = [];
    js_comment_headers = js_comment_headers.concat(split$.call(js_header, "\n"));
    this.get_ecoco_json();
    (function(h){
      var hh;
      if (h && h instanceof Array) {
        hh = h.map(function(it){
          return '#!' + it;
        });
        this.co = join$.call(hh, "\n") + "\n" + this.co;
      }
    }.call(this, this.ecoco_json.headers));
    if (m = this.co.match(/^\#!(.*)$/gm)) {
      m.forEach(function(cmd){
        var m;
        cmd = replace$.call(cmd, /^#!/, '');
        js_comment_headers.push("  " + cmd);
        if (m = cmd.match(/^include=(.*)$/)) {
          this$.include_file(m[1]);
          return true;
        }
        if (m = cmd.match(/^replace (.*)$/)) {
          this$.replace(m[1]);
          return true;
        }
        if (m = cmd.match(/^js_replace (.*)$/)) {
          settings.js_replace = m[1];
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
    (function(i){
      if (typeof i === 'string') {
        js_comment_headers = js_comment_headers.concat(['', 'Current project info:'], (split$.call(i, "\n")).map(function(it){
          return "  " + it;
        }));
      }
    }.call(this, this.ecoco_json.project_info));
    try {
      co_includes = this.get_includes('co');
      this.co = this.prepend_before_compile + co_includes + this.co;
      js = coco.compile(this.co, {
        bare: settings.bare
      });
      if (settings.js_replace != null) {
        js = this.js_replace(js, settings.js_replace);
      }
      js_includes = this.get_includes('js');
      js = js_includes + js;
      if (settings.uglify) {
        js = this.uglify(js);
      } else {}
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
