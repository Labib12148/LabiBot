let memory = {
    lastPrompt: "", // To store the last prompt given by the user
    chatHistory: [] // Array to store all previous messages
};

document.getElementById("prompt").addEventListener("keypress", async function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        await sendMessage();
    }
});

async function sendMessage() {
    // Display user message in chat
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Display user message in chat
    displayMessage("You", prompt);

    // Clear input field
    promptInput.value = '';

    // Clear file name display
    clearFileName();

    // Save user's message to chat history
    memory.chatHistory.push({ sender: "You", message: prompt });
    saveChatHistory(); // Save chat history after each update

    // Check if there's an image attached
    const imageInput = document.getElementById('image-input');
    if (imageInput.files.length > 0) {
        // If an image is attached, use image explanation
        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('image', imageInput.files[0]);
            const response = await fetch('/Image', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            // Display LabiBot response in chat
            if (data.response) {
                displayMessage("LabiBot", data.response);
                // Update chat history
                memory.chatHistory.push({ sender: "LabiBot", message: data.response });
                saveChatHistory(); // Save chat history after each update
            } else {
                displayMessage("LabiBot", "I can't assist with that. Try generating something else.");
                // Update chat history
                memory.chatHistory.push({ sender: "LabiBot", message: "I can't assist with that. Try generating something else." });
                saveChatHistory(); // Save chat history after each update
            }
        } catch (error) {
            console.error("Error generating content:", error.message);
        }
    } else {
        // Use normal text chat
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userInput: prompt })
            });
            const data = await response.json();

            // Display LabiBot response in chat
            if (data.response) {
                displayMessage("LabiBot", data.response);
                // Update chat history
                memory.chatHistory.push({ sender: "LabiBot", message: data.response });
                saveChatHistory(); // Save chat history after each update
            } else {
                displayMessage("LabiBot", "I can't assist with that. Try generating something else.");
                // Update chat history
                memory.chatHistory.push({ sender: "LabiBot", message: "I can't assist with that. Try generating something else." });
                saveChatHistory(); // Save chat history after each update
            }
        } catch (error) {
            console.error("Error generating content:", error.message);
            displayMessage("LabiBot", "I can't assist with that.");
            // Update chat history
            memory.chatHistory.push({ sender: "LabiBot", message: "I can't assist with that. Try generating something else." });
            saveChatHistory(); // Save chat history after each update
        }
    }

    // Update memory with last prompt
    memory.lastPrompt = prompt;

    // Clear image input field
    imageInput.value = '';
}


function clearFileName() {
    document.getElementById('file-name').textContent = '';
}

// Function to save chat history to local storage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(memory.chatHistory));
}

// Function to load chat history from local storage
function loadChatHistory() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        memory.chatHistory = JSON.parse(savedChatHistory);
    }
}

// Call function to load chat history when the page loads
loadChatHistory();

// Populate chat with chat history
memory.chatHistory.forEach(message => {
    displayMessage(message.sender, message.message);
});

// Populate input field with the last prompt
document.getElementById('prompt').value = memory.lastPrompt;

function displayFileName(input) {
    const fileName = input.files[0].name;
    const maxLength = 15; // Maximum length of file name to display
    let displayText = fileName.length > maxLength ? fileName.substring(0, maxLength) + "..." : fileName;
    document.getElementById('file-name').textContent = "- " + displayText;
}

async function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');

    // Create a spacer element for better visual separation between messages
    const spacerElement = document.createElement('div');
    spacerElement.classList.add('message-gap');

    // Append spacer element only if it's not the first message in the chat
    if (chatContainer.childNodes.length > 0) {
        chatContainer.appendChild(spacerElement);
    }

    // Check if the message is a string
    if (typeof message !== 'string') {
        // If not a string, convert it to a string
        message = String(message);
    }

    // Split message into individual lines
    const lines = message.split('\n');

    // Create a message element for each line
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const messageElement = document.createElement('div');

        // Display sender's message only if it's the first line
        if (index === 0) {
            // Add appropriate class based on the sender
            if (sender === "You") {
                messageElement.classList.add("user-message");
                const userImageElement = document.createElement('img');
                userImageElement.src = "./assets/user.png";
                userImageElement.classList.add('avatar');
                userImageElement.style.width = '30px';
                messageElement.appendChild(userImageElement);
            } else if (sender === "LabiBot") {
                messageElement.classList.add("LabiBot-message");
                const chatImageElement = document.createElement('img');
                chatImageElement.src = "./assets/chat.png";
                chatImageElement.classList.add('avatar');
                chatImageElement.style.width = '30px';
                messageElement.appendChild(chatImageElement);
            }

            // Check for bold text and wrap it in <strong> tags
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            // Append sender's name and message text
            const textNode = document.createElement('div');
            textNode.innerHTML = `${sender}: ${formattedLine.trim()}`;
            messageElement.appendChild(textNode);
        } else {
            // Check for bold text and wrap it in <strong> tags
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            // Append message text directly
            messageElement.innerHTML = formattedLine.trim();
        }

        // Append message element
        chatContainer.appendChild(messageElement);

        if (index < lines.length - 1) {
            const lineBreak = document.createElement('br');
            chatContainer.appendChild(lineBreak);
        }

        // Add typing animation for LabiBot's response
        if (sender === "LabiBot") {
            await sleep(60 + Math.random() * 50); // Adjust timing as needed
        }
    }

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// Function to simulate delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Function to clear chat history
function clearChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    // Clear memory
    memory.chatHistory = [];

    // Save chat history to local storage
    saveChatHistory();
}