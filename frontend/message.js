const sendMessageForm = document.getElementById("send-message-form");
const chatContainer = document.getElementById("chat-container");

// Clears chat history when clear button is clicked
const clearChatButton = document.getElementById("clear-chat");
clearChatButton.addEventListener("click", () => {
    localStorage.removeItem("message_array");
    localStorage.removeItem("help_counter");

    while (chatContainer.firstChild) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
});

// Toggles between dark and light theme when theme button is clicked
const html = document.documentElement;
const toggleTheme = document.getElementById("theme-toggle");
toggleTheme.addEventListener("click", () => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme !== null) {

        if (storedTheme === 'dark') {
            localStorage.setItem('theme', 'light');
            html.setAttribute('data-bs-theme', 'light');
            chatContainer.className = 'mb-3 bg-white border border-secondary-subtle border-3 rounded-3';
        } else {
            localStorage.setItem('theme', 'dark');
            html.setAttribute('data-bs-theme', 'dark');
            chatContainer.className = 'mb-3 bg-dark border border-light-subtle border-3 rounded-3'
        }
    } 
})

document.addEventListener("DOMContentLoaded", () => {
    const storedUsername = localStorage.getItem("username");
    const storedMessages = localStorage.getItem("message_array");
    const storedTheme = localStorage.getItem("theme");
    const storedHelpCounter = localStorage.getItem("help_counter");

    if (storedHelpCounter === null) {
        localStorage.setItem('help_counter', '0');
    }

    // If a theme exists
    if (storedTheme !== null) {

        if (storedTheme === 'dark') {
            html.setAttribute('data-bs-theme', storedTheme);
            chatContainer.className = 'mb-3 bg-dark border border-light-subtle border-3 rounded-3'
        } else {
            html.setAttribute('data-bs-theme', 'light');
            chatContainer.className = 'mb-3 bg-white border border-secondary-subtle border-3 rounded-3';
        }
    } else {
        localStorage.setItem('theme', 'light');
    }

    // If a user exists
    if (storedUsername !== null) {

        // There are no previous messages
        if (storedMessages === null) {
            const initialServerMessage = `Hello ${storedUsername}! How can I help you today?`;

            let array = [];

            localStorage.setItem("message_array", JSON.stringify(array));

            addMessage(initialServerMessage, 'bot');
        } else { // There are previous messages
            let message_array = JSON.parse(localStorage.getItem("message_array"));

            for (let wholeMessage of message_array) {

                let messageDiv = document.createElement('div');

                if (wholeMessage.redirectContent !== undefined) {
                    wholeMessage.messageContent = wholeMessage.messageContent.replace(`Please visit ${wholeMessage.redirectContent}`, ''); 

                    let redirectLink = document.createElement('a');
                    redirectLink.target = '_blank';
                    redirectLink.href = `${wholeMessage.redirectContent}`;
                    redirectLink.textContent = wholeMessage.redirectContent;

                    messageDiv.textContent = `${wholeMessage.messageContent} Please visit `;
                    messageDiv.appendChild(redirectLink);
                } else {
                    messageDiv.textContent = wholeMessage.messageContent;
                }

                messageDiv.className = wholeMessage.className;
                
                chatContainer.appendChild(messageDiv);
            }
        }
    }
})

// Handles form submission when user sends a message
let clientMessage;
sendMessageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const formData = new FormData(sendMessageForm);
    clientMessage = formData.get("message");

    sendMessageForm.reset(); // Clears out the input box automatically

    if ((clientMessage.toLowerCase()).includes("help")) {

        let helpCount = JSON.parse(localStorage.getItem('help_counter'));
        helpCount += 1;

        localStorage.setItem('help_counter', JSON.stringify(helpCount));

        if (helpCount > 4) {
            addMessage(clientMessage, 'user');
            addMessage("You've asked for help quite a few times! It might be a good idea to seek for help in mental health resources", 'bot');
            return;
        }
    }

    addMessage(clientMessage, 'user');
    sendMessageToServer(clientMessage);
})

/**
 * Sends the client's message to the server via POST request and handles the bot response
 * @param {*} clientMessage - The message from the user to send to server
 */
async function sendMessageToServer(clientMessage) {
    const serverMessageUrl = '/send-message';

    try {
        let response = await fetch(serverMessageUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message_key: clientMessage
            })
        })

        let serverResponse = await response.json();
        addMessage(serverResponse, 'bot');
    } catch (error) {
        console.error("An error for sending messages page has occurred: ", error);
    }
}

/**
 * Creates a message element and adds it to the chat container
 * Handles both plain text and object messages with optional redirect links
 * Also stores the message in localStorage for persistence
 * 
 * @param {*} message - The message content (plain text or object with message and redirect)
 * @param {*} classType - CSS class type ('user' or 'bot') to style the message
 */
function addMessage(message, classType) {
    const messageDiv = document.createElement('div');
    const redirectLink = document.createElement('a');
    redirectLink.target = '_blank';

    let messageObject;

    if (message === null) {
        messageDiv.textContent = "Sorry, I couldn't find an answer for that.";

        messageObject = {
            messageContent: messageDiv.textContent
        }
    } else if (typeof message !== 'object') {
        messageDiv.textContent = message;

        messageObject = {
            messageContent: messageDiv.textContent
        }
    } else {
        if ( !(message.redirect.includes('.html')) ) {
            messageDiv.textContent = `${message.message} ${message.redirect} `;

            messageObject = {
                messageContent: messageDiv.textContent
            }
        } else {
            redirectLink.href = `${message.redirect}`;
            redirectLink.textContent = message.redirect;

            messageDiv.textContent = `${message.message} Please visit `;
            messageDiv.appendChild(redirectLink);

            messageObject = {
                messageContent: messageDiv.textContent,
                redirectContent: message.redirect
            }
        }
    }

    messageDiv.className = `message ${classType}-message`;
    messageObject.className = messageDiv.className;

    let messageArray = JSON.parse(localStorage.getItem("message_array"));
    if (messageArray === null) {
        messageArray = [];
    } 
    messageArray.push(messageObject);

    localStorage.setItem("message_array", JSON.stringify(messageArray));

    chatContainer.appendChild(messageDiv);
}