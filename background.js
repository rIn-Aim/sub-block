
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
	      		})
	    	})
	  		break;
	  	case "reset":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "reset"}, function(response){
	      			console.log(response);
	      		})
	    	})
	  		break;
	  	case "move-left":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "move", direction: "left"})
	    	})
	  		break;
	  	case "move-right":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "move", direction: "right"})
	    	})
	  		break;
	  	case "move-up":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "move", direction: "up"})
	    	})
	  		break;
	  	case "move-down":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "move", direction: "down"})
	    	})
	  		break;
	  	case "increase-height":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "scale", scale: {dimension: "height", change: "increase"}})
	    	})
	  		break;
	  	case "decrease-height":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "scale", scale: {dimension: "height", change: "decrease"}})
	    	})
	  		break;
	  	case "increase-width":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "scale", scale: {dimension: "width", change: "increase"}})
	    	})
	  		break;
	  	case "decrease-width":
	  		chrome.tabs.query({ active:true, currentWindow:true}, function(tab){
	      		chrome.tabs.sendMessage(tab[0].id, {action: "scale", scale: {dimension: "width", change: "decrease"}})
	    	})
	  		break;
	}
});