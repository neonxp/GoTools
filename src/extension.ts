import * as vscode from 'vscode';

const fnRegex = /^(\t*)(.*)err(\s?):=(.+?)$/

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('go', new ErrorsWrapper(), {
		providedCodeActionKinds: ErrorsWrapper.providedCodeActionKinds
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('gotools.wrap-error', () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const document = editor.document;
				const line = document.lineAt(editor.selection.start.line);
				const matches = line.text.match(fnRegex);
				if (matches == null) {
					return;
				}
				if (matches.length > 0) {
					const intendation = matches[1];
					const extravars = matches[2].split(',').map(x => x.trim()).filter(x => x);
					const rest = matches[4].trim();
					editor.edit(editBuilder => {
						if (extravars.filter(x => x != "_").length > 0) {
							editBuilder.insert(
								new vscode.Position(line.lineNumber + 1, 0),
								`${intendation}if err != nil {\n${intendation}\treturn err\n${intendation}}`
							);
						} else {
							extravars.push("err");
							editBuilder.replace(
								line.range,
								`${intendation}if ${extravars.join(", ")} := ${rest}; err != nil {\n${intendation}\treturn err\n${intendation}}`
							);
						}
					});
				}
			}
		})
	);
}

export function deactivate() { }

export class ErrorsWrapper implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return undefined;
		}
		const selection = editor.selection;
		const line = document.lineAt(editor.selection.start.line);
		if (!fnRegex.test(line.text)) {
			return undefined;
		}
		const action = new vscode.CodeAction('Add error checking', vscode.CodeActionKind.RefactorRewrite);
		action.command = { command: 'gotools.wrap-error', title: 'Add error checking block', tooltip: '' };
		return [
			action,
		];
	}
}
