import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from "@monaco-editor/react"
// import * as Y from "yjs"
// import { WebrtcProvider } from "y-webrtc"
// import { MonacoBinding } from "y-monaco"
// import * as monaco from 'monaco-editor';
import ACTIONS from '../Actions';
import axios from 'axios';

// const CodeEditor = ({ socketRef, roomId, onCodeChange,editorRef }) => {
// const CodeEditor = ({ socketRef, roomId, editorRef }) => {
const CodeEditor = ({ socketRef, roomId, editorRef, onMountEditor }) => {
    // const editorRef = useRef(null);
    const [language, setLanguage] = useState('--Selecet--');
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    // const [initialcode, setInitialCode] = useState('');
    const [isEditorReady, setIsEditorReady] = useState(false);

    // const defaultCode = {
    //     'python': 'print("Hello, World!")',
    //     'cpp': '#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello, World!" << endl;\n\treturn 0;\n}',
    //     'javascript': 'console.log("Hello, World!");',
    //     'kotlin': 'fun main() {\n\tprintln("Hello, World!")\n}',
    //     'typescript': 'console.log("Hello, World!");',
    //     'java': 'public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
    // }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        // editorRef.current.setValue('');
        // console.log("editorRef.current",editorRef.current);
        editorRef.current.onDidChangeModelContent((event) => {
            const code = editorRef.current?.getValue();
            // onCodeChange(code);
            // // Handle code changes if needed
            // console.log("Code changed:", code);
            // console.log("event", event);

            // console.log("socketRef.current in codeeditor",socketRef.current);

            if (!event.isFlush) { // similar to origin !== 'setValue'
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                });
            }
        });

        // editorRef.current.on('change', (instance, changes) => {
        //     console.log("changes", changes);
        //     // const { origin } = changes;
        //     // const code = instance.getValue();
        //     // onCodeChange(code);
        //     // if (origin !== 'setValue') {
        //     //     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        //     //         roomId,
        //     //         code,
        //     //     });
        //     // }
        // });

        // if (language) {
        //     editorRef.current?.getModel().setValue(initialcode);
        // }

        // // Initialize YJS
        // const doc = new Y.Doc(); // a collection of shared objects -> Text
        // // Connect to peers (or start connection) with WebRTC
        // const provider = new WebrtcProvider("test-room", doc); // room1, room2
        // const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
        // // Bind YJS to Monaco 
        // const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
        // console.log(provider.awareness);

        onMountEditor(editor, monaco);
        setIsEditorReady(true);
    }

    function handleLanguageChange(event) {
        setLanguage(event.target.value);
    }
    function handleInputChange(event) {
        setInput(event.target.value);
    }
    async function handleRunClick() {
        setOutput("Running...");

        const code = editorRef.current?.getValue();
        // console.log("code: ",code);
        const apiKey = process.env.REACT_APP_API_KEY;
        // console.log(apiKey);

        const langMap = {
            'python': 'PYTHON',
            'cpp': 'CPP17',
            'javascript': 'JAVASCRIPT_NODE',
            'kotlin': 'KOTLIN',
            'typescript': 'TYPESCRIPT',
            'java': 'JAVA17',
        };
        /*
        supported lang in api
        ['C', 'CPP14', 'CPP17', 'CLOJURE', 'CSHARP', 'GO', 'HASKELL', 'JAVA8', 'JAVA14', 'JAVA17', 'JAVASCRIPT_NODE', 'KOTLIN', 'OBJECTIVEC', 'PASCAL', 'PERL', 'PHP', 'PYTHON', 'PYTHON3', 'PYTHON3_8', 'R', 'RUBY', 'RUST', 'SCALA', 'SWIFT', 'TYPESCRIPT']
         */

        const body = {
            lang: langMap[language],
            source: `${code}`,
            input: `${input}`,
            memory_limit: 262144,// 256 MB, 262144 KB
            time_limit: 10,// 10 sec
            context: JSON.stringify({ id: 213121 }),
            callback: "https://client.com/callback/"
        };

        try {
            const response1 = await axios.post('https://api.hackerearth.com/v4/partner/code-evaluation/submissions/', body, {
                headers: {
                    'content-type': 'application/json',
                    'client-secret': `${apiKey}`,
                }
            });

            const result1 = response1.data;
            // console.log('result1: ', result1);
            const statusUpdateUrl = result1.status_update_url;
            console.log("statusUpdateUrl:",statusUpdateUrl);

            let response2 = await axios.get(`${statusUpdateUrl}`, {
                headers: {
                    'content-type': 'application/json',
                    'client-secret': `${apiKey}`,
                }
            });

            let result2 = response2.data;
            // console.log('result2: ', result2.result);
            let result2Result = result2.result;
            let runStatus = result2Result.run_status;
            let statusDetail = runStatus.status_detail;

            while (statusDetail === null) {
                response2 = await axios.get(`${statusUpdateUrl}`, {
                    headers: {
                        'content-type': 'application/json',
                        'client-secret': `${apiKey}`,
                    }
                });

                result2 = response2.data;
                result2Result = result2.result;
                runStatus = result2Result.run_status;
                statusDetail = runStatus.status_detail;
            }

            // const outputUrl=runStatus.output;
            // console.log("runstatus: ", runStatus);
            const status = runStatus.status;
            const compileStatus = result2Result.compile_status;
            const timeUsed = runStatus.time_used;
            const memoryUsed = runStatus.memory_used;

            if (compileStatus === 'OK') {
                if (status === "AC") {
                    const codeUrl = runStatus.output;
                    console.log(codeUrl);
                    const response3 = await axios.get(`${codeUrl}`, {});

                    // const result3 = response3.data;
                    console.log("response3:", response3.data);
                    setOutput(`${response3.data}\n-------------------\nTime:${timeUsed * 1000} milli sec\n-------------------\nSpace:${memoryUsed} KB`);
                }
                else {
                    setOutput(`Error: ${status + "->" + statusDetail}`)
                }
            } else {
                setOutput(`Error: ${compileStatus}`);
            }
            // setOutput(result.output);
        } catch (error) {
            setOutput(`Error: ${error}`);
        }
    }

    useEffect(() => {
        async function init() {
            //self analysis thi lakhelu chhe
            // editorRef.current = handleEditorDidMount()

            //         editorRef.current = Codemirror.fromTextArea(
            //             document.getElementById('realtimeEditor'),
            //             {
            //                 mode: { name: 'javascript', json: true },
            //                 theme: 'dracula',
            //                 autoCloseTags: true,
            //                 autoCloseBrackets: true,
            //                 lineNumbers: true,
            //             }
            //         );
            // editorRef.current.on('change', (instance, changes) => {
            //     console.log("changes",changes);
            //     // const { origin } = changes;
            //     // const code = instance.getValue();
            //     // onCodeChange(code);
            //     // if (origin !== 'setValue') {
            //     //     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            //     //         roomId,
            //     //         code,
            //     //     });
            //     // }
            // });

        }
        init();
    }, []);

    useEffect(() => {
        // console.log("iseditorready", isEditorReady, "SocketRef.current", socketRef.current, "Editorref.current", editorRef.current);
        // console.log("SocketRef.current.id in codeeditor:", socketRef.current.id);
        if (socketRef.current) {
            // if (isEditorReady && socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                // console.log("Code in from server to codeeditor", code);
                // console.log("editorRef.current", editorRef.current);
                if (code !== null) { // Ensure editorRef.current is not null
                    // console.log("code inside condition", code);
                    editorRef.current?.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current, isEditorReady]);

    // return <textarea id="realtimeEditor"></textarea>;

    return <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1 }}>
            <div style={{ padding: '10px', background: '#1e1e1e', color: '#fff' }}>
                <label htmlFor="language" style={{ marginRight: '10px' }}>Select Language: </label>
                <select id="language" className='text-black' value={language} onChange={handleLanguageChange}>
                    <option value="--Selecet--" className='text-black' hidden>--Select--</option>
                    <option value="cpp" className='text-black'>C++ 17</option>
                    <option value="javascript" className='text-black'>JavaScript</option>
                    <option value="python" className='text-black'>Python</option>
                    <option value="java" className='text-black'>Java</option>
                    <option value="typescript" className='text-black'>TypeScript</option>
                    <option value="kotlin" className='text-black'>Kotlin</option>
                    {/* Add more languages as needed */}
                </select>
                <button onClick={handleRunClick} style={{ marginLeft: '10px' }}>Run</button>
            </div>
            <Editor
                height="calc(100vh)"
                language={language}
                theme="vs-dark"
                // value={initialcode}
                value={''}
                options={{
                    inlineSuggest: true,
                    fontSize: "16px",
                    formatOnType: true,
                    autoClosingBrackets: true,
                    minimap: { scale: 10 }
                }}
                onMount={(editor, monaco) => {
                    handleEditorDidMount(editor, monaco);
                }}
            // onChange={(value, event) => {    
            //     const code = value;
            //     console.log("code change with onChange", code);
            //     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            //         roomId,
            //         code,
            //     });
            // }}

            />
        </div>
        <div style={{ width: '250px', padding: '10px', background: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <h3>Input:</h3>
            <textarea
                value={input}
                onChange={handleInputChange}
                style={{ height: '40%', marginBottom: '10px', padding: '10px', background: '#333', color: '#fff', border: 'none', resize: 'none' }}
            />
            <h3>Output:</h3>
            <pre style={{ height: '50%', padding: '10px', background: '#333', color: '#fff', overflow: 'auto' }}>{output}</pre>
        </div>
    </div>
};

export default CodeEditor;