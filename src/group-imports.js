const vscode = require('vscode');
const { getModuleName, getImportsRange, getFileContent } = require('./utils');

const BUILTIN_TYPE = "builtin"
const THIRD_PARTY_TYPE = "thirdParty"
const VENDOR_TYPE = "vendor"
const LOCAL_TYPE = "local"


function getImports(fileContent) {
    try {
        let importsRegex = new RegExp("(?<=import \\(\n).*?(?=\\))", "s")
        let imports = importsRegex.exec(fileContent)[0]
        return imports
    } catch(_) {
        vscode.window.showErrorMessage("Could not find imports")
    }
}

function convertImportsToList(imports) {
    return imports.split("\n")
}

function getImportType(import_) { 
    let goModName = getModuleName() + "/"
    let vendorPath = goModName.substring(0, goModName.lastIndexOf('/'));
    
    let isBuiltin = !import_.includes(".") && !import_.includes(goModName)
    let isThirdParty = import_.includes(".") && !import_.includes(goModName)
    let isLocal = import_.includes(goModName)
    let isVendor = import_.includes(vendorPath) && !isLocal

    if(isBuiltin) {
        return BUILTIN_TYPE
    } else if (isVendor) {
        return VENDOR_TYPE
    } else if(isThirdParty) {
        return THIRD_PARTY_TYPE
    } else if(isLocal) {
        return LOCAL_TYPE
    }
}

function importGroupsToString(importsGroup) {
    return Object.keys(importsGroup)
    .filter((key) => importsGroup[key].length)
    .map((key) => importsGroup[key].join('\n'))
    .join('\n\n');
}

function saveImportsGroup(importsGroup, importRanges, activeEditor) {
    const edit = new vscode.WorkspaceEdit();
    const range = new vscode.Range(
        importRanges.start,
        0,
        importRanges.end - 1,
        Number.MAX_VALUE
    );

    let importsParsed = importGroupsToString(importsGroup)
    let documentUri = activeEditor.document.uri
    
    edit.replace(documentUri, range, importsParsed);
    vscode.workspace.applyEdit(edit).then(activeEditor.document.save);
}


function getImportGroups(importsList) {
    const importsGroup = {
        [BUILTIN_TYPE]: [],
        [THIRD_PARTY_TYPE]: [],
        [VENDOR_TYPE]: [],
        [LOCAL_TYPE]: [],
    };
    

    importsList.filter(n => n).forEach(import_ => {
        let importType = getImportType(import_)
        importsGroup[importType].push(import_)
    })

    return importsGroup
}

function formatImports() {
    const activeEditor = vscode.window.activeTextEditor
    let fileContent = getFileContent(activeEditor)
    let imports = getImports(fileContent)
    let importsList = convertImportsToList(imports)
    let importsGroup = getImportGroups(importsList)
    let importsRange = getImportsRange(fileContent)
    saveImportsGroup(importsGroup,importsRange,activeEditor)
}



module.exports = formatImports;