let memory = {
    lastPrompt: "",
    chatHistory: []
  };
  
  document.getElementById("prompt").addEventListener("keydown", async function(event) {
    // Check for Shift key pressed along with Enter
    if (event.keyCode === 13 && event.shiftKey) {
      // Prevent default Enter behavior (new line)
      event.preventDefault();
      // Insert a new line character manually
      document.getElementById('prompt').value += '\n';
    } else if (event.keyCode === 13) {
      event.preventDefault();
      await sendMessage();
    }
  });
    

async function sendMessage() {
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    displayMessage("You", prompt);

    promptInput.value = '';

    clearFileName();

    memory.chatHistory.push({ sender: "You", message: prompt });
    saveChatHistory();

    const imageInput = document.getElementById('image-input');
    if (imageInput.files.length > 0) {
        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            
            // Loop through each selected file and append it to FormData
            for (let i = 0; i < imageInput.files.length; i++) {
                formData.append('image', imageInput.files[i]);
            }
            
            const response = await fetch('/Image', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.response) {
                displayMessage("LabiBot", data.response);
                memory.chatHistory.push({ sender: "LabiBot", message: data.response });
                saveChatHistory();
            } else {
                displayMessage("LabiBot", "Well, howdy there, partner! Y'all know, I'm all about spreading good vibes, but reckon I can't wrangle up what you're lookin' for. How 'bout we rustle up somethin' else that'll tickle your fancy?");
                memory.chatHistory.push({ sender: "LabiBot", message: "Well, howdy there, partner! Y'all know, I'm all about spreading good vibes, but reckon I can't wrangle up what you're lookin' for. How 'bout we rustle up somethin' else that'll tickle your fancy?" });
                saveChatHistory();
            }
        } catch (error) {
            console.error("Error generating content:", error.message);
        }
    } else {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userInput: prompt })
            });
            const data = await response.json();

            if (data.response) {
                displayMessage("LabiBot", data.response);
                memory.chatHistory.push({ sender: "LabiBot", message: data.response });
                saveChatHistory();
            } else {
                displayMessage("LabiBot", "Well, howdy there, partner! Y'all know, I'm all about spreading good vibes, but reckon I can't wrangle up what you're lookin' for. How 'bout we rustle up somethin' else that'll tickle your fancy?");
                memory.chatHistory.push({ sender: "LabiBot", message: "Well, howdy there, partner! Y'all know, I'm all about spreading good vibes, but reckon I can't wrangle up what you're lookin' for. How 'bout we rustle up somethin' else that'll tickle your fancy?" });
                saveChatHistory();
            }
        } catch (error) {
            console.error("Error generating content:", error.message);
            displayMessage("LabiBot", "I can't assist with that.");
            memory.chatHistory.push({ sender: "LabiBot", message: "Well, howdy there, partner! Y'all know, I'm all about spreading good vibes, but reckon I can't wrangle up what you're lookin' for. How 'bout we rustle up somethin' else that'll tickle your fancy?" });
            saveChatHistory();
        }
    }

    memory.lastPrompt = prompt;

    imageInput.value = '';
}


function clearFileName() {
    document.getElementById('file-name').textContent = '';
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(memory.chatHistory));
}

function loadChatHistory() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        memory.chatHistory = JSON.parse(savedChatHistory);
    }
}

loadChatHistory();

memory.chatHistory.forEach(message => {
    displayMessage(message.sender, message.message);
});

document.getElementById('prompt').value = memory.lastPrompt;

function displayFileName(input) {
    const fileNamesElement = document.getElementById('file-name');
    fileNamesElement.innerHTML = '';

    const files = input.files;
    
    // Check if more than 2 files are selected
    if (files.length > 2) {
        input.value = ''; // Clear the selection
        const alertMessage = 'You can only attach up to 2 files.';
        window.alert(alertMessage);
        
        const alertBox = document.querySelector('.alert');
        if (alertBox) {
            alertBox.classList.add('alert');
        }
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name;
        const maxLength = 15;
        let displayText = fileName.length > maxLength ? fileName.substring(0, maxLength) + "..." : fileName;
        const fileNameElement = document.createElement('div');
        fileNameElement.textContent = "- " + displayText;
        fileNamesElement.appendChild(fileNameElement);
    }
}

async function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');

    const spacerElement = document.createElement('div');
    spacerElement.classList.add('message-gap');

    if (chatContainer.childNodes.length > 0) {
        chatContainer.appendChild(spacerElement);
    }

    if (typeof message !== 'string') {
        message = String(message);
    }

    const lines = message.split('\n');

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const messageElement = document.createElement('div');

        if (index === 0) {
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

            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            const textNode = document.createElement('div');
            textNode.innerHTML = `${sender}: ${formattedLine.trim()}`;
            messageElement.appendChild(textNode);
        } else {
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            messageElement.innerHTML = formattedLine.trim();
        }

        chatContainer.appendChild(messageElement);

        if (index < lines.length - 1) {
            const lineBreak = document.createElement('br');
            chatContainer.appendChild(lineBreak);
        }
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}



function clearChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    memory.chatHistory = [];

    saveChatHistory();
}
function alert(message) {
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert');
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => {
        alertBox.remove();
    }, 3000); // Remove the alert after 3 seconds
}


function toggleNavbarButtons() {
    var navbarButtons = document.querySelector('.navbar-buttons');
    navbarButtons.classList.toggle('show');
  }
  