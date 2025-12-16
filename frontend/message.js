const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('send-message-form');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-message-button');

// Clear example messages on load
chatMessages.innerHTML = '';

// Add message to chat UI
function addMessage(content, isUser = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user' : 'bot'}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = content;
    
    wrapper.appendChild(messageDiv);
    chatMessages.appendChild(wrapper);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function showTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper bot';
    wrapper.id = 'typing-indicator';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = 'Thinking...';
    
    wrapper.appendChild(messageDiv);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle form submission
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;
    
    // Add user message to chat
    addMessage(userMessage, true);
    
    // Clear input and disable button
    messageInput.value = '';
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();

    // AWS Elastic Beanstalk URL
    const API_BASE_URL = "http://med-ai-env.us-east-1.elasticbeanstalk.com";
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/api/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success) {
            // Add bot response
            addMessage(data.message, false);
            
            // Optionally show sources (for debugging/transparency)
            if (data.sources && data.sources.length > 0) {
                console.log('Sources:', data.sources);
            }
        } else {
            addMessage('Sorry, I encountered an error. Please try again or contact our office at (555) 123-4567.', false);
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, I could not reach the server. Please try again later.', false);
    } finally {
        // Re-enable button
        sendButton.disabled = false;
        messageInput.focus();
    }
});

// Add welcome message on load
window.addEventListener('DOMContentLoaded', () => {
    addMessage('Hello! I\'m here to help with administrative questions about appointments, prescriptions, lab results, billing, and clinic hours. How can I assist you today?', false);
});