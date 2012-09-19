# It is assumed that you are familiar with [coco language](https://github.com/satyr/coco/)!

# Ecoco (Extended COco COmpiler)

`ecoco` extends `coco` compiling features.

# CLI

	Usage: ecoco [options] [file] [ -- arguments ]
	
	Options:
	  --version, --info         Display current version                    [boolean]
	  --usage, --help           Display help                               [boolean]
	  --compile, -c             Equivalent to `coco -c`                    [boolean]
	  --bare, -b                Equivalent to `coco -b`                    [boolean]
	  --uglify, -u, --compress  Compress output (uses `uglify-js`)         [boolean]
	  --binary                  Output filename without `.js` and adds
	                            `#!/usr/bin/env node` at the beginning of output
	                            file.                                      [boolean]
	  --include FILE            If FILE has `co` extension then AT COMPILE TIME
	                            prepend FILE to source file. Otherwise if FILE has
	                            `js` extension then AFTER compiling prepend FILE to
	                            compiled file.                                      
	  --make-readme FILE        Replace `{CLI}` in `README.md.src` with command
	                            line usage (which is generated from `CLI.yaml`
	                            file) and save it to `README.md`.                   
	Examples:
	  ecoco -cbu awesome.co
	  ecoco --make-readme
	  ecoco -cbu --make-readme awesome.co
	  
	  ecoco binary.co -- --what
	  (coco binary.co --what)
	  
	  ecoco binary.co -- arguments
	  (coco binary.co arguments)
	

# Headers

Adding these at the beggining of your source file will change Ecoco behaviour accordingly:

* `#!b` or `#!bare` like `ecoco -b`
* `#!u` or `#!ugly` or `#!uglify` like `ecoco -u`
* `#!binary` like `ecoco --binary`
* `#!include=filename` or `#!include=filename.co` like `ecoco --include`
 
# Examples

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

# Node binary example

See `node_bin_example` directory.

# Install

`npm install -g ecoco`

or

`git clone https://github.com/jan-swiecki/ecoco && cd ecoco && npm install && npm link`

or if you want to build

`git clone https://github.com/jan-swiecki/ecoco && cd ecoco && npm install && coco ecoco.co ecoco.co && npm link`
