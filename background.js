chrome.runtime.onInstalled.addListener(function () {
    console.log("La extensión ha sido instalada.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Aquí puedes manejar el mensaje o reenviarlo al popup
    console.log("Mensaje recibido en background:", message);
});