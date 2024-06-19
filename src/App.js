// import { useState, useRef, useEffect } from 'react'
// import Editor from "@monaco-editor/react"
// import * as Y from "yjs"
// import { WebrtcProvider } from "y-webrtc"
// import { MonacoBinding } from "y-monaco"
// import * as monaco from 'monaco-editor';
// import axios from 'axios';

// // Setup Monaco Editor
// // Attach YJS Text to Monaco Editor

// function App() {
//   const editorRef = useRef(null);
//   const [language, setLanguage] = useState('--Selecet--');
//   const [output, setOutput] = useState('');
//   const [input, setInput] = useState('');
//   const [initialcode,setInitialCode] = useState('');
//   const defaultCode={
//     'python':'print("Hello, World!")',
//     'cpp':'#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello, World!" << endl;\n\treturn 0;\n}',
//     'javascript':'console.log("Hello, World!");',
//     'kotlin':'fun main() {\n\tprintln("Hello, World!")\n}',
//     'typescript':'console.log("Hello, World!");',
//     'java':'public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
//   }


//   useEffect(() => {
//     // This useEffect hook will ensure that the Monaco Editor instance is properly reconfigured when the language changes
//     if (editorRef.current) {
//       monaco.editor.setModelLanguage(editorRef.current.getModel(), language);
//     }
//   }, [language]);

//   // Editor value -> YJS Text value (A text value shared by multiple people)
//   // One person deletes text -> Deletes from the overall shared text value
//   // Handled by YJS

//   // Initialize YJS, tell it to listen to our Monaco instance for changes.

//   function handleEditorDidMount(editor, monaco) {
//     editorRef.current = editor;
//     // Initialize YJS
//     const doc = new Y.Doc(); // a collection of shared objects -> Text
//     // Connect to peers (or start connection) with WebRTC
//     const provider = new WebrtcProvider("test-room", doc); // room1, room2
//     const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
//     // Bind YJS to Monaco 
//     const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
//     console.log(provider.awareness);
//   }

//   function handleLanguageChange(event) {
//     setLanguage(event.target.value);
//     setInitialCode(defaultCode[event.target.value]);
//   }

//   function handleInputChange(event) {
//     setInput(event.target.value);
//   }

//   async function handleRunClick() {
//     setOutput("Running...");

//     const code = editorRef.current.getValue();
//     // console.log("code: ",code);
//     const apiKey = process.env.REACT_APP_API_KEY;

//     const langMap = {
//       'python': 'PYTHON',
//       'cpp': 'CPP17',
//       'javascript': 'JAVASCRIPT_NODE',
//       'kotlin': 'KOTLIN',
//       'typescript': 'TYPESCRIPT',
//       'java': 'JAVA17',
//     };
//     /*
//     supported lang in api
//     ['C', 'CPP14', 'CPP17', 'CLOJURE', 'CSHARP', 'GO', 'HASKELL', 'JAVA8', 'JAVA14', 'JAVA17', 'JAVASCRIPT_NODE', 'KOTLIN', 'OBJECTIVEC', 'PASCAL', 'PERL', 'PHP', 'PYTHON', 'PYTHON3', 'PYTHON3_8', 'R', 'RUBY', 'RUST', 'SCALA', 'SWIFT', 'TYPESCRIPT']
//      */

//     const body = {
//       lang: langMap[language],
//       source: `${code}`,
//       input: `${input}`,
//       memory_limit: 262144,// 256 MB, 262144 KB
//       time_limit: 1,// 1 sec
//       context: JSON.stringify({ id: 213121 }),
//       callback: "https://client.com/callback/"
//     };

//     try {
//       const response1 = await axios.post('https://api.hackerearth.com/v4/partner/code-evaluation/submissions/', body, {
//         headers: {
//           'content-type': 'application/json',
//           'client-secret': `${apiKey}`,
//         }
//       });

//       const result1 = response1.data;
//       // console.log('result1: ', result1);
//       const statusUpdateUrl = result1.status_update_url;
//       // console.log(statusUpdateUrl);

//       let response2 = await axios.get(`${statusUpdateUrl}`, {
//         headers: {
//           'content-type': 'application/json',
//           'client-secret': `${apiKey}`,
//         }
//       });

//       let result2 = response2.data;
//       console.log('result2: ', result2.result);
//       let result2Result = result2.result;
//       let runStatus = result2Result.run_status;
//       let statusDetail = runStatus.status_detail;

//       while (statusDetail === null) {
//         response2 = await axios.get(`${statusUpdateUrl}`, {
//           headers: {
//             'content-type': 'application/json',
//             'client-secret': `${apiKey}`,
//           }
//         });

//         result2 = response2.data;
//         result2Result = result2.result;
//         runStatus = result2Result.run_status;
//         statusDetail=runStatus.status_detail;
//       }

//       // const outputUrl=runStatus.output;
//       console.log("runstatus: ",runStatus);
//       const status = runStatus.status;
//       const compileStatus = result2Result.compile_status;
//       const timeUsed = runStatus.time_used;
//       const memoryUsed = runStatus.memory_used;

//       if (compileStatus === 'OK') {
//         if (status === "AC") {
//           const codeUrl = runStatus.output;
//           console.log(codeUrl);
//           const response3 = await axios.get(`${codeUrl}`, {});

//           // const result3 = response3.data;
//           console.log("response3:", response3.data);
//           setOutput(`${response3.data}\n-------------------\nTime:${timeUsed*1000} milli sec\n-------------------\nSpace:${memoryUsed} KB`);
//         }
//         else {
//           setOutput(`Error: ${status+ "->" +statusDetail}`)
//         }
//       } else {
//         setOutput(`Error: ${compileStatus}`);
//       }
//       // setOutput(result.output);
//     } catch (error) {
//       setOutput(`Error: ${error}`);
//     }
//   }

//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       <div style={{ flex: 1 }}>
//         <div style={{ padding: '10px', background: '#1e1e1e', color: '#fff' }}>
//           <label htmlFor="language" style={{ marginRight: '10px' }}>Select Language: </label>
//           <select id="language" value={language} onChange={handleLanguageChange}>
//             <option value="--Selecet--" hidden>--Select--</option>
//             <option value="cpp">C++ 17</option>
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//             <option value="java">Java</option>
//             <option value="typescript">TypeScript</option>
//             <option value="kotlin">Kotlin</option>
//             {/* Add more languages as needed */}
//           </select>
//           <button onClick={handleRunClick} style={{ marginLeft: '10px' }}>Run</button>
//         </div>
//         <Editor
//           height="calc(100vh - 40px)"
//           language={language}
//           theme="vs-dark"
//           value={initialcode}
//           options={{
//             inlineSuggest: true,
//             fontSize: "16px",
//             formatOnType: true,
//             autoClosingBrackets: true,
//             minimap: { scale: 10 }
//           }}
//           onMount={handleEditorDidMount}
//         />
//       </div>
//       <div style={{ width: '300px', padding: '10px', background: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column' }}>
//         <h3>Input:</h3>
//         <textarea 
//           value={input}
//           onChange={handleInputChange}
//           style={{ height: '40%', marginBottom: '10px', padding: '10px', background: '#333', color: '#fff', border: 'none', resize: 'none' }}
//         />
//         <h3>Output:</h3>
//         <pre style={{ height: '50%', padding: '10px', background: '#333', color: '#fff', overflow: 'auto' }}>{output}</pre>
//       </div>
//     </div>
//   )
// }

// export default App


// // https://www.hackerearth.com/api/register/
// // https://www.hackerearth.com/docs/wiki/developers/v4/




// -----------------------------------------------------------------------------------

import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CreateRoomPage from './pages/CreateRoomPage';
import EditorPage from './pages/EditorPage';

function App() {
    return (
        <>
            <div>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4aed88',
                            },
                        },
                    }}
                ></Toaster>
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CreateRoomPage />}></Route>
                    <Route
                        path="/editor/:roomId"
                        element={<EditorPage />}
                    ></Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;