// chatbot.js
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const messageBox = document.getElementById('chatbot-messages');
    const inputBox = document.getElementById('chatbot-input');
  
    toggleBtn.addEventListener('click', () => {
      chatbotWindow.classList.toggle('hidden');
    });
  
    window.sendMessage = function () {
      const msg = inputBox.value.trim();
      if (!msg) return;
  
      const userMsg = document.createElement('div');
      userMsg.className = "my-2 text-right";
      userMsg.innerHTML = `<span class="inline-block bg-green-100 px-3 py-1 rounded-full">${msg}</span>`;
      messageBox.appendChild(userMsg);
  
      const botMsg = document.createElement('div');
      botMsg.className = "my-2";
      botMsg.innerHTML = `<span class="inline-block bg-gray-200 px-3 py-1 rounded-full">I’m here to help! 😊</span>`;
      setTimeout(() => messageBox.appendChild(botMsg), 600);
  
      inputBox.value = '';
      messageBox.scrollTop = messageBox.scrollHeight;
    };
  });
  