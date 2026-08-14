import { CONFIG } from "../utils/config.js";

import {
    initializeEditor,
    getEditorText,
    clearEditor,
    setLanguage,
    updateEditorTheme
} from "../components/editor.js";

import {
    addUserMessage,
    addThinkingMessage,
    addAIMessage,
    scrollBottom,
    attachCopyButtons
} from "../components/workspace.js";

import {
    setStorageType
} from "../utils/storage.js";

import {
    saveConversationToDB,
    getConversationFromDB
} from "../api/conversationApi.js";


// ==========================================
// Storage Setup
// ==========================================

setStorageType("algorithm");
localStorage.setItem("currentTool", "algorithm");


// ==========================================
// DOM Elements
// ==========================================

const solveBtn = document.getElementById("solveBtn");
const language = document.getElementById("language");
const welcomeScreen = document.getElementById("welcomeScreen");


// ==========================================
// Initialize Monaco Editor
// ==========================================

initializeEditor(solveProblem);


setTimeout(() => {

    updateEditorTheme();

}, 200);


setTimeout(() => {

    if(language){
        setLanguage(language.value);
    }

}, 500);


if(language){

    language.addEventListener(
        "change",
        () => {

            setLanguage(language.value);

        }
    );

}


// ==========================================
// Load Existing Conversation
// ==========================================

let firstQuery = true;

const conversationId =
    localStorage.getItem(
        "codementor_algorithm_current"
    );

if (conversationId) {

    try {

        const savedConversation =
            await getConversationFromDB(
                conversationId
            );

        if (
            savedConversation &&
            savedConversation.tool === "algorithm"
        ) {

            welcomeScreen.style.display = "none";

            firstQuery = false;

            if (savedConversation.messages) {

                savedConversation.messages.forEach(msg => {

                    if (msg.role === "user") {

                        addUserMessage(msg.content);

                    } else if (msg.role === "assistant") {

                        addAIMessage(msg.content);

                    }

                });

            }

            scrollBottom();
            attachCopyButtons();

        }

    } catch (err) {

        console.error(
            "Failed to load conversation:",
            err
        );

    }

}



// ==========================================
// Events
// ==========================================

if(solveBtn){

    solveBtn.addEventListener(
        "click",
        solveProblem
    );

}



// ==========================================
// Solve Algorithm Query
// ==========================================

async function solveProblem(){


    const question =
        getEditorText().trim();



    if(!question){

        return;

    }



    if(firstQuery){


        welcomeScreen.style.display =
            "none";


        firstQuery = false;


    }



    addUserMessage(question);


    clearEditor();



    const thinking =
        addThinkingMessage();



    scrollBottom();



    try{


        let previousMessages = [];



        const currentId =
            localStorage.getItem(
                "currentConversationId"
            );



        if(currentId){


            try{


                const conversation =
                    await getConversationFromDB(
                        currentId
                    );


                if(
                    conversation &&
                    conversation.tool === "algorithm"
                ){

                    previousMessages =
                        conversation.messages || [];

                }


            }

            catch(err){


                console.error(
                    "Conversation load failed:",
                    err
                );


            }


        }




        const response =
            await fetch(
                `${CONFIG.API_BASE}/algorithm`,
                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                            "application/json"

                    },


                    body:JSON.stringify({

                        question,

                        language:
                            language.value,


                        messages:
                            previousMessages

                    })


                }
            );



        const data =
            await response.json();



        thinking.remove();



        await addAIMessage(
            data.answer
        );





        // ==================================
        // Generate Title
        // ==================================

        let chatTitle =
            "New Chat";



        try{


            const titleResponse =
                await fetch(
                    `${CONFIG.API_BASE}/title`,
                    {

                        method:"POST",

                        headers:{

                            "Content-Type":
                                "application/json"

                        },


                        body:JSON.stringify({

                            question

                        })


                    }
                );



            const titleData =
                await titleResponse.json();



            chatTitle =
                titleData.title ||
                chatTitle;



        }

        catch(err){


            console.error(
                "Title generation failed:",
                err
            );


        }





        // ==================================
        // Save Conversation
        // ==================================

        const saved =
            await saveConversationToDB({

                conversationId:
                    currentId || null,


                tool:
                    "algorithm",


                title:
                    chatTitle,


                language:
                    language.value,


                messages:[


                    ...previousMessages,


                    {

                        role:"user",

                        content:question

                    },


                    {

                        role:"assistant",

                        content:data.answer

                    }


                ]

            });




        if(saved && saved._id){


            localStorage.setItem(

                "currentConversationId",

                saved._id

            );


        }




        if(window.refreshSidebar){


            await window.refreshSidebar();


        }




        attachCopyButtons();



    }


    catch(error){


        console.error(error);



        thinking.remove();



        addAIMessage(

            "❌ Unable to connect to backend."

        );


    }



    scrollBottom();



}
