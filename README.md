# Golang Tools

[Install extension from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=neonxp.gotools)

[Install extension from Open-VSX](https://open-vsx.org/extension/neonxp/gotools) (codeserver/vscodium/gitpod)

Extensions with frequently used snippets and code actions for productive go development.

Extension in active development! Your contribution is always welcome :)

# Snippets

| Prefix| Description|
| :---- |:----------:|
| `pkg` | Package header line |
| `construct` | Constructor for structure type |
| `iferr` |if err := fuction(); err != nil { ... }|
# Code actions

`Add error checking` - adds stub error checking to current line:

<img src="/wraperror.gif" width="500" />


# Interface implementation

Command "Go: Implement Interface Methods" based on https://github.com/ricardoerikson/vscode-go-impl-methods/ extension by Ricardo Erikson.

Install the impl package as follows:

```
go get -u github.com/josharian/impl
```

## Usage

1. At command pallete select command "Go: Implement Interface Methods"
2. Write receiver for methods. Example: "f *File", "m MyType", "c CustomType" 
3. Select interface to implement


# Group imports

Group imports command based on https://github.com/gustavo-bordin/golang-imports-group/ extension by Gustavo Bordin.

## Usage

1. At command pallete select command "Go: Group imports"