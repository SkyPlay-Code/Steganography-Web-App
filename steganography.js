const delimiter = '--MESSAGE-START--';  // Unique delimiter to identify the start of the message

// Unified display notification system replacing ugly system alerts
function showNotification(message, isError = false) {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = isError ? 'status-msg error' : 'status-msg success';
        
        // Quiet automatic fade out
        setTimeout(() => {
            statusEl.className = 'status-msg';
        }, 6000);
    } else {
        alert(message);
    }
}

// Function to encode the message into the file and return the encoded file
function encodeMessage() {
    const fileInput = document.getElementById('fileInput').files[0];
    const message = document.getElementById('messageInput').value;

    if (!fileInput || !message) {
        showNotification("Please select a file and enter a message first.", true);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const fileData = new Uint8Array(event.target.result);
        const encodedMessage = new TextEncoder().encode(delimiter + message);
        const combinedData = new Uint8Array(fileData.length + encodedMessage.length);

        combinedData.set(fileData);
        combinedData.set(encodedMessage, fileData.length);

        const blob = new Blob([combinedData], { type: fileInput.type });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = `encoded_${fileInput.name}`;
        downloadLink.style.display = 'inline-block';
        downloadLink.textContent = 'Download Encoded File';

        showNotification("Message embedded successfully. Download is ready below.");
    };
    reader.readAsArrayBuffer(fileInput);
}

// Function to decode the message from the uploaded file
function decodeMessage() {
    const fileInput = document.getElementById('fileInput').files[0];

    if (!fileInput) {
        showNotification("Please select a file to decode.", true);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const fileData = new Uint8Array(event.target.result);
        const decodedData = new TextDecoder().decode(fileData);

        // Find the delimiter in the file data
        const delimiterIndex = decodedData.indexOf(delimiter);
        if (delimiterIndex === -1) {
            showNotification("No encoded message discovered inside this file.", true);
            return;
        }

        // Extract the message after the delimiter
        const message = decodedData.substring(delimiterIndex + delimiter.length);
        document.getElementById('result').value = message;
        showNotification("Hidden sequence parsed successfully.");
    };
    reader.readAsArrayBuffer(fileInput);
}

// Modern Event Listeners configuration to decouple DOM elements from JS 
document.addEventListener('DOMContentLoaded', () => {
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const fileInput = document.getElementById('fileInput');
    const fileLabelText = document.getElementById('fileLabelText');

    if (encodeBtn) encodeBtn.addEventListener('click', encodeMessage);
    if (decodeBtn) decodeBtn.addEventListener('click', decodeMessage);

    // Watch for uploading files to update custom text labels
    if (fileInput && fileLabelText) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileLabelText.textContent = e.target.files[0].name;
            } else {
                fileLabelText.textContent = 'No file loaded';
            }
        });
    }
});
