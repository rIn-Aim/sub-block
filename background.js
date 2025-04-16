
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status == "complete"){
		chrome.scripting.executeScript({
    		target: { tabId: tab.id, allFrames: true },
    		files: ["insertCanvas.js"],
  		});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.type == "color"){
		let color = request.content.color;
		let val = request.content.val;
		chrome.storage.local.set({[color]: val})
		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
      		chrome.tabs.sendMessage(tab[0].id, {action: "redraw"}, function(response){
      			sendResponse(response)
      		})
    	})
	}
	if(request.type){
		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
      		chrome.tabs.sendMessage(tab[0].id, {action: request.type}, function(response){
      			sendResponse(response)
      		})
    	})
	}
})

chrome.commands.onCommand.addListener((command) => {
	switch(command){
  		case "toggle-cover":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "block"}, function(response){
	      			console.log(response)
	      			if(response.success){
	      				chrome.runtime.sendMessage({
						    type: response.data.type, 
						    val: response.data.content
						});
	      			}
	      			//sendResponse(response)
	      		})
	    	})
	  		break;
	  	case "reset":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "reset"}, function(response){
	      			//sendResponse(response)
	      		})
	    	})
	  		break;
	}
});