lib_path = ./lib
esm_path = $(lib_path)/esm
cjs_path = $(lib_path)/cjs
types_path = $(lib_path)/types

all: build

build: clean_lib build@esm build@cjs build@types

clean_lib:
	rm -rf $(lib_path)

build@esm:
	rm -rf $(esm_path)
	bunx tsc --project tsconfig.esm.json --outDir $(esm_path)
	echo '{"type": "module"}' > $(esm_path)/package.json

build@cjs:
	rm -rf $(cjs_path)
	bunx tsc --project tsconfig.cjs.json --outDir $(cjs_path)
	echo '{"type": "commonjs"}' > $(cjs_path)/package.json

build@types:
	rm -rf $(types_path)
	bunx tsc --project tsconfig.types.json --outDir $(types_path)

fmt:
	bunx prettier -w .

pack:
	npm pack
