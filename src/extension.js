const vscode = require('vscode');
const { ErrorsWrapper, wrapError } = require('./errors');
const selectReceiver = require('./implement-interface');
const groupImports = require('./group-imports');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let wrapErrorCommand = vscode.commands.registerCommand('gotools.wrap-error', wrapError);
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            'go',
            new ErrorsWrapper(),
            {
                providedCodeActionKinds: [
                    vscode.CodeActionKind.RefactorRewrite
                ]
            }
        )
    );
    context.subscriptions.push(wrapErrorCommand);

    context.subscriptions.push(vscode.commands.registerCommand("gotools.group-imports", groupImports))

    context.subscriptions.push(vscode.commands.registerCommand("gotools.implement", selectReceiver));
}

// This method is called when your extension is deactivated
function deactivate() { }



module.exports = {
    activate,
    deactivate
}
