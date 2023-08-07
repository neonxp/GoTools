const vscode = require('vscode');
const path = require('path')
const fs = require('fs')


function getModuleName() {
    try {
        let workspacePath = vscode.workspace.workspaceFolders[0].uri.path
        let modPath = path.join(workspacePath, "go.mod")
        let data = fs.readFileSync(modPath).toString()
        let moduleNameReg = new RegExp("(?<=module ).*")
        let moduleName =moduleNameReg.exec(data)

        return moduleName[0]
    } catch (err) {
        vscode.window.showInformationMessage("Could not get module name")
    }
}

function getFileContent(activeEditor) {
    return activeEditor.document.getText()
}

function getImportsRange(documentText) {
    let start = 1;
    let documentLines = documentText.split('\n')
    for (var line of documentLines) {
        if (line.includes('import (')) {
            break;
        }
        start++;
    }

    let end = start;
    for (var line of documentLines.slice(start)) {
        if (line.includes(')')) {
            break;
        }
        end++;
    }

    return {
        end,
        start,
    };
};



module.exports = {
    getModuleName, getFileContent, getImportsRange
};