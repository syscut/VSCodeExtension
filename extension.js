
const vscode = require('vscode');
const process = require('child_process');
const stderr = require('./lib/stdout_vaild');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.info('插件已啟動');

	let userName = '',
		  password = '';
	/**
	 * @param {vscode.TextDocument} t 依照TextDocument內容更改語言
	 */
	const setEncoding = (t) =>{
		if(t.getText().match(/<\?MI/i)){
			vscode.languages.setTextDocumentLanguage(t,'wio');
			return;
			}
		if(t.getText().match(/<!DOCTYPE html>/i)){
			vscode.languages.setTextDocumentLanguage(t,'html');
			return;
		}
	}

	//插件啟動時(只執行一次)
	setEncoding(vscode.window.activeTextEditor.document);

	//偵測換檔案(每次開啟檔案)
	vscode.workspace.onDidOpenTextDocument(t=>{
			setEncoding(t);
	})
  //偵測存檔
	vscode.workspace.onDidSaveTextDocument(t=>{
			setEncoding(t);
	})

	const batPath = `cd %userprofile%\\.vscode\\extensions && deploy.bat`;
	let inputBoxTitle = '',
			inputBoxPlaceHolder = '',
			inputBoxExtension = '',
			promptText = '',
			batCommand = ``;

/**
 * @param {vscode.TextEditor} t
 * @param {String} command
 */
	const logInFn = (command,t) =>{
		if(!userName||!password){
			vscode.commands.executeCommand('logIn').then(()=>{
				if(!userName||!password){
					return;
				}
				return executeCommand(command,t);
			});
		}
		if(userName||password){
		  return executeCommand(command,t);
		}
	}
/**
 * @param {vscode.TextEditor} t
 * @param {String} command
 */
	const executeCommand = (command,t) =>{
		
		let file = t.document.fileName,
				fileArr = file.split('\\').reverse(),
				fileExtname = fileArr[0].replace(/.*\.(.+)/,'$1'),
				fileBaseName = fileArr[0],
				relativeFileDirname = fileArr[1],
				relativeFilePath = file.replace(/(.+\\).+/,'$1'),
				fileBasenameNoExtension = fileBaseName.replace(/(.*)\..+/,'$1');

		//fileExtname = t.document.languageId(The selected language mode not file extension)
		//${file}=c:\root\your-project\folder\file.ext
		//${fileExtname}=ext
		//${fileBaseName}=file.ext
		//${relativeFileDirname}=folder
		//${relativeFilePath}=c:\root\your-project\folder\
		//${fileBasenameNoExtension}=file
		
		//InputBox參數 https://code.visualstudio.com/api/references/vscode-api#InputBoxOptions
		if(command == 'download'){
			vscode.window.showInputBox({
				ignoreFocusOut:true,
				title: inputBoxTitle,
				value: fileBaseName,
				placeHolder: inputBoxPlaceHolder,
				prompt:promptText
			}).then(input=>{
				if(!input){
					vscode.window.showInformationMessage('已取消');
					return;
				}
				input = input.slice(-inputBoxExtension.length)==inputBoxExtension?input:input+inputBoxExtension;
				relativeFilePath = relativeFilePath+input;
				process.exec(`${batPath} ${relativeFilePath} ${batCommand} ${input} ${relativeFileDirname} ${userName} ${password}`,(error,stdout)=>{
					console.log(stdout)
					if(error){
						vscode.window.showErrorMessage(error.message);
						return;
					}
				
					if(stderr(stdout)[0]){
						vscode.window.showErrorMessage(stderr(stdout)[1]);
						return;
					}
					vscode.workspace.openTextDocument(vscode.Uri.file(relativeFilePath)).then((doc)=>{	
						vscode.window.showTextDocument(doc);
					});
				});
			});
		}

		if(command == 'upload'){
			//workSpaceRootName = vscode.workspace.workspaceFolders[0].name
			//workSpaceRootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
			if(batCommand == `38frontend Uploads`){
				file = vscode.workspace.workspaceFolders[0].uri.fsPath+'\\dist\\';
				relativeFileDirname = vscode.workspace.workspaceFolders[0].name;
			}
			process.exec(`${batPath} ${file} ${batCommand} ${fileBaseName} ${relativeFileDirname} ${userName} ${password}`,(error,stdout)=>{
				console.log(stdout);
				if(error){
					vscode.window.showErrorMessage(error.message);
					return;
				}
			
				if(stderr(stdout)[0]){
					vscode.window.showErrorMessage(stderr(stdout)[1]);
					return;
				}
				vscode.window.showInformationMessage('上傳成功');
			});
		}

		if(command == 'open'){
			process.exec(`${batPath} ${fileBasenameNoExtension} ${batCommand} ${relativeFileDirname} ${fileExtname}`,(error,stdout)=>{
				if(error){
					vscode.window.showErrorMessage(error.message);
					return;
				}
			
				if(stderr(stdout)[0]){
					vscode.window.showErrorMessage(stderr(stdout)[1]);
					return;
				}
				vscode.window.showInformationMessage('開啟成功');
			});
		}
	};

	let download4gl = vscode.commands.registerTextEditorCommand('download4gl', (textEditor) => {
		inputBoxTitle = '下載4gl';
		inputBoxPlaceHolder = '4GL檔名(可不加.4gl)';
		inputBoxExtension = '.4gl';
		promptText = '從3.1的mistest下載4gl';
		batCommand = `31 Download`;
		logInFn('download',textEditor);
  });

	let upload4gl = vscode.commands.registerTextEditorCommand('upload4gl', (textEditor) => {
		batCommand = `31 Upload`;
		logInFn('upload',textEditor);
	});

	let downloadNewEraHelp = vscode.commands.registerTextEditorCommand('downloadNewEraHelp', (textEditor) => {
		inputBoxTitle = '從3.8的htdocs/gfchelp下載htm';
		inputBoxPlaceHolder = 'htm檔名(可不加.htm)';
		inputBoxExtension = '.htm';
		promptText = '從3.8的htdocs/gfchelp下載htm';
		batCommand = `38help Download`;
		logInFn('download',textEditor);
	});

	let uploadNewEraHelp = vscode.commands.registerTextEditorCommand('uploadNewEraHelp', (textEditor) => {
		batCommand = `38help Upload`;
		logInFn('upload',textEditor);
	});

	let downloadFile38 = vscode.commands.registerTextEditorCommand('downloadFile3.8', (textEditor) => {
		inputBoxTitle = '從3.8下載檔案';
		inputBoxPlaceHolder = '完整檔名(包含附檔名)';
		inputBoxExtension = '';
		promptText = '從3.8的 htdocs/(你的上層資料夾) 下載檔案(須加上完整副檔名) 例：htdocs/docd400w';
		batCommand = `38 Download`;
		logInFn('download',textEditor);
	});

	let uploadFile38 = vscode.commands.registerTextEditorCommand('uploadFile3.8', (textEditor) => {
		batCommand = `38 Upload`;
		logInFn('upload',textEditor);
	});

	let openWIOPage = vscode.commands.registerTextEditorCommand('openWIOPage', (textEditor) => {
		batCommand = `WIO`;
		logInFn('open',textEditor);
	});
	
	let uploadfrontend = vscode.commands.registerTextEditorCommand('uploadfrontend', (textEditor) => {
		batCommand = `38frontend Uploads`;
		logInFn('upload',textEditor);
  });

	let logIn = vscode.commands.registerCommand('logIn', async () => {
		await vscode.window.showInputBox({
			ignoreFocusOut:false,
			title: '請輸入UserName',
			value: userName,
			prompt: '請設定連線至3.1和3.8的UserName'
		}).then(async val=>{
			if(!val){
				return;
			}
			userName = val;
			await vscode.window.showInputBox({
				ignoreFocusOut:false,
				title: '請輸入Password',
				value: password,
				password: true,
				prompt: '請設定連線至3.1和3.8的Password'
			}).then(v=>{
				password = v;
				return;
			})
		})
  });

	context.subscriptions.push(
		download4gl,
		upload4gl,
		downloadNewEraHelp,
		uploadNewEraHelp,
		downloadFile38,
		uploadFile38,
		openWIOPage,
		uploadfrontend,
		logIn
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
}
