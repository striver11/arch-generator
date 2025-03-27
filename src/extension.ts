import * as vscode from 'vscode';

const BASE_PROMPT = 'You are a helpful architecture generator based on the project imported in the current workspace. Remember, you have to generate the architecture diagram of the project that has been imported by the user in the workspace in the mermaid format. The .md file generated should explain the architecture of the project in a detailed way. The arrows should flow in and out based on the dependencies of the project.';

const EXERCISES_PROMPT1 = 'You are a helpful architecture generator based on the project imported in the current workspace. Remember, you have to generate the architecture diagram of the project that has been imported by the user in the workspace in the mermaid format. The .md file generated should explain the architecture of the project in a detailed way. The arrows should flow in and out based on the dependencies of the project.';
const EXERCISES_PROMPT2 = 'You are a helpful architecture generator based on the project imported in the current workspace. Remember, you have to generate the sequence diagram of the project that has been imported by the user in the workspace in the mermaid format. You have to go through the code and generate the sequence diagram of the project in the mermaid format in a very detailed format.';
const EXERCISES_PROMPT3 = 'You are a helpful architecture generator based on the project imported in the current workspace. Remember, you have to generate the class diagram of the project that has been imported by the user in the workspace in the mermaid format. You have to go through the code and generate the class diagram of the project in the mermaid format in a very detailed format.';

export function activate(context: vscode.ExtensionContext) {

    
    // define a chat handler
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {

        // log the request command
        console.log(`Received command: ${request.command}`);

        // initialize the prompt
        let prompt = BASE_PROMPT;

        if (request.command === 'architecture') {
            prompt = EXERCISES_PROMPT1;
        }
        else if (request.command === 'sequence diagram') {
            prompt = EXERCISES_PROMPT2;
        } else if (request.command === 'class diagram') {
            prompt = EXERCISES_PROMPT3;
        }

        // Add the @workspace context to the prompt
        prompt += '\n\n@workspace';

        // initialize the messages array with the prompt
        const messages = [
            vscode.LanguageModelChatMessage.User(prompt),
        ];

        // get all the previous participant messages
        const previousMessages = context.history.filter(
            (h) => h instanceof vscode.ChatResponseTurn
        );

        // add the previous messages to the messages array
        previousMessages.forEach((m) => {
            let fullMessage = '';
            m.response.forEach((r) => {
                const mdPart = r as vscode.ChatResponseMarkdownPart;
                fullMessage += mdPart.value.value;
            });
            messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
        });

        // add in the user's message
        messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

        // send the request
        const chatResponse = await request.model.sendRequest(messages, {}, token);

        // stream the response
        for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
        }

        return;

    };

    // create participant
    const arch_generator = vscode.chat.createChatParticipant("architecture-generator", handler);

    // add icon to participant
    arch_generator.iconPath = vscode.Uri.joinPath(context.extensionUri, 'architecture.jpg');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.generateArchitecture', () => {
            vscode.window.showInformationMessage('Generating architecture diagram...');
            // Add your logic to generate the architecture diagram here
        }),
        vscode.commands.registerCommand('extension.generateSequenceDiagram', () => {
            vscode.window.showInformationMessage('Generating sequence diagram...');
            // Add your logic to generate the sequence diagram here
        }),
        vscode.commands.registerCommand('extension.generateClassDiagram', () => {
            vscode.window.showInformationMessage('Generating class diagram...');
            // Add your logic to generate the class diagram here
        })
    );
}

export function deactivate() { }
