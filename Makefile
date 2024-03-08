ENTRIES=src/use-workspace.ts src/git.ts

all: build

build@esm:
	bunx tsc --project tsconfig.esm.json

fmt:
	bunx prettier -w .
