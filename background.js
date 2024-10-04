chrome.runtime.onInstalled.addListener(function () {
    console.log("La extensión ha sido instalada.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Aquí puedes manejar el mensaje o reenviarlo al popup
    chrome.storage.local.set({recordInfo:message},()=>{
        console.log("Mensaje recibido en background:", message);
    })
});