<<<<<<< HEAD
## Ecoco (Extended COco COmpiler) v0.2.2-beta

It is assumed that you are familiar with [coco language](https://github.com/satyr/coco/)!

`ecoco` extends `coco` compiling features.

### CLI

	Usage:
		ecoco file [options]
		ecoco   -c [options] file [arguments]
	
	Options:
	
	  --examples                 Show code examples
	
	  --defaults                 Show default command line values
	
	  --help, --usage, -h        Show help
	
	  --version                  Show version
	
	  --compile, -c              Equivalent to `coco -c`
	
	  --bare, -b                 Equivalent to `coco -b`
	
	  --uglify, -u, --compress   Compress output (uses `uglify-js`)
	
	  --binary                   Output filename without `.js` and adds
	                             `#!/usr/bin/env node` at the beginning of output
	                             file.
	
	  --include FILE             If FILE has `co` extension then AT COMPILE TIME
	                             prepend FILE to source file. Otherwise if FILE has
	                             `js` extension then AFTER compiling prepend FILE
	                             to compiled file.
	
	  --make-readme FILE         Replace `{CLI}` in `README.md.src` with `name
	                             --usage` and save it to `README.md`.
	
	
	
	Examples:
	
	  ecoco -cbu awesome.co    compiles to awesome.js with `bare` and `uglify`
	  ecoco --make-readme      compiles README.md.src into README.md
	  ecoco binary.co --what   executes binary.co with `--what` argument
	
	

### Headers

Adding these at the beggining of your source file will change Ecoco behaviour accordingly:

* `#!b` or `#!bare` like `ecoco -b`
* `#!u` or `#!ugly` or `#!uglify` like `ecoco -u`
* `#!binary` like `ecoco --binary`
* `#!include=filename` or `#!include=filename.co` like `ecoco --include`
 
### Examples

	fn = -> "ok!"

compiles to

	(function(){
	  var fn;
	  fn = function(){
	    return "ok!";
	  };
	}).call(this);


--

	#!b

	fn = -> "bare!"

compiles to

	var fn;
	fn = function(){
	  return "bare!";
	};

--


	#!u

	fn = -> "uglify!"


compiles to

	(function(){var e;e=function(){return"uglify!"}}).call(this)

--

`node_bin.co`:

	#!bin
	process.stdout.write "I'm alive!\n"

compiles to `node_bin`:

	#!/usr/bin/env node
	(function(){
	  process.stdout.write("I'm alive!\n");
	}).call(this);

--

`example.co`:

	#!include=include_me.co
	im_not_alone = true

`include_me.co`:

	you_are_not_alone = true

`ecoco example.co` compiles to:

	(function(){
	  var you_are_not_alone, im_not_alone;
	  you_are_not_alone = true;
	  im_not_alone = true;
	}).call(this);

### Install

`npm install -g ecoco`

or

`git clone https://github.com/jan-swiecki/ecoco && cd ecoco && npm install && npm link`

or if you want to build

`git clone https://github.com/jan-swiecki/ecoco && cd ecoco && npm install && coco index.co index.co && npm link`
=======
# Ecoco (Extended COco COmpiler)
>>>>>>> 9aa07a2ff26ed07bbc6f1066ce8948ff7e78d6c5
