# It is assumed that you are familiar with [coco language](https://github.com/satyr/coco/)!

# Ecoco (Extended COco COmpiler)

`ecoco` extends `coco` compiling features. `ecoco example.co` compiles to `example.js`.

# Headers

* `#!b` or `#!bare`

 Removes `(function(){ ... }).call(this);` around your program (equivalent to `coco -b`)

* `#!u` or `#!ugly` or `#!uglify`

 Executes `uglify-js` on JavaScript output (i.e. compresses JavaScript)

* `#!bin`
 Compiles `example.co` into `example` (not `example.js`) and adds `#!/usr/bin/env node` at the beginning of the `example` file.

* `#!include=filename` or `#!include=filename.co`
 Just before compiling `ecoco` will prepend your source file with `filename.co` contents.

# Additional features

* `package.json`

 If `package.json` file is found in the directory of `example.co` then `ecoco` will add into its output a global `PACKAGE_JSON` object which will contain `package.json` data. Useful if you want to add `example --version` functionality (you just need to get `PACKAGE_JSON.version` inside your program).

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
