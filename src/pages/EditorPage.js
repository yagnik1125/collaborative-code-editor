import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import CodeEditor from '../components/CodeEditor';
// --------------------------------------------------
import Editor from "@monaco-editor/react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"
import * as monaco from 'monaco-editor';
// --------------------------------------------------
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const editorRef = useRef(null);
    const socketRef = useRef(null);
    // const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([
        // { socketId: 1, username: 'yagnik vasoya' },
        // { socketId: 2, username: 'yagnik bavla' },
        // { socketId: 3, username: 'yagnik yagnik' },
        // { socketId: 4, username: 'yagnik yagnik' },
        // { socketId: 5, username: 'yagnik' },
        // { socketId: 6, username: 'yagnik yagnik' },
    ]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            // console.log("socketRef.current in editorPage", socketRef.current);
            // console.log("socketRef.current.connected in editorPage", socketRef.current.connected);
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                // console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.on('connect', () => {
                setIsSocketConnected(socketRef.current.connected);
                // console.log("Socket connected in editorpage:", socketRef.current.connected);
            });

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });


            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    // console.log("Inside EditorPage Clients",clients);
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        // console.log(`${username} joined`);
                    }
                    setClients(clients);
                    // if(editorRef.current){
                    //     console.log("editorRef.current in editorpage",editorRef.current);
                    //     socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    //         code: codeRef.current,
                    //         socketId,
                    //     });
                    // }
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        // return () => {
        //     socketRef.current.disconnect();
        //     socketRef.current.off(ACTIONS.JOINED);
        //     socketRef.current.off(ACTIONS.DISCONNECTED);
        // };
    }, []);

    useEffect(() => {
        // if (socketRef.current && editorRef.current) {
        //     console.log("editorRef.current in editorpage", editorRef.current);
        //     socketRef.current.emit(ACTIONS.SYNC_CODE, {
        //         code: codeRef.current,
        //         socketId,
        //     });
        // }
        if (isSocketConnected && isEditorReady) {
            // console.log("socketRef.current.id in editorPage and useeffect", socketRef.current.id);
            // console.log("editorRef.current in editorpage", editorRef.current);
            // console.log("before passing the code to server:", codeRef.current)
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
                // code: codeRef.current,
                roomId,
                socketId: socketRef.current.id,
            });
        }
    }, [isSocketConnected, isEditorReady]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error("Copy room is err",err);
        }
    }

    // function leaveRoom() {
    //     reactNavigator('/');
    //     // return <Navigate to="/" />;
    // }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <button className="btn copybtn" onClick={copyRoomId}>
                    Copy Room Id
                </button>
                {/* <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button> */}
                <div className="asideInner">
                    <div className="logo">
                    
                    </div>
                    <h4>Connected Members</h4>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="editorWrap">
                {/* <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                /> */}
                {/* <Editor
                    id="collaborativeEditor"
                    height="calc(100vh)"
                    language='python'
                    theme="vs-dark"
                    value='print("Hello, World!")'
                    options={{
                        inlineSuggest: true,
                        fontSize: "16px",
                        formatOnType: true,
                        autoClosingBrackets: true,
                        minimap: { scale: 10 }
                    }}
                // onMount={handleEditorDidMount}
                /> */}

                {
                    isSocketConnected &&
                    <CodeEditor socketRef={socketRef}
                        roomId={roomId}
                        editorRef={editorRef}
                        onMountEditor={(editor, monaco) => {
                            // console.log("recieved editor from codeeditor in editorpage:", editor);
                            // console.log("unchanged",editorRef.current===editor);
                            setIsEditorReady(true);
                            // console.log("before update in editorref.current",editorRef.current)
                            // editorRef.current = editor;
                            // console.log("Now after update in editorref.current",editorRef.current)
                        }} />
                    // isSocketConnected && <CodeEditor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => { codeRef.current = code; }} editorRef={editorRef} />
                    // socketRef.current !== null && <CodeEditor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => { codeRef.current = code; }} editorRef={editorRef} />
                    // socketRef.current !== null && <CodeEditor socketRef={socketRef} roomId={roomId} editorRef={editorRef} />
                }



                {/* Your Code Goes Here */}
            </div>
            {/* <div style={{ width: '250px', padding: '10px', background: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column' }}>
                <h3>Input:</h3>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    style={{ height: '40%', marginBottom: '10px', padding: '10px', background: '#333', color: '#fff', border: 'none', resize: 'none' }}
                />
                <h3>Output:</h3>
                <pre style={{ height: '50%', padding: '10px', background: '#333', color: '#fff', overflow: 'auto' }}>{output}</pre>
                <pre style={{ height: '50%', padding: '10px', background: '#333', color: '#fff', overflow: 'auto' }}>Running...</pre>
            </div> */}
        </div>
        // --------------------------------------------------------------------------------------------

        // <div>
        //     Editor page
        // </div>

    );
};

export default EditorPage;