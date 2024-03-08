all: build@esm

build@esm:
	bunx tsc --project tsconfig.esm.json

fmt:
	bunx prettier -w .

pack:
	npm pack
