function syncColorInputs(){
	let divRgb = document.getElementById("rgb").querySelectorAll("div[data-color]");
	for(let i=0; i<divRgb.length; i++){
		let color = divRgb[i].getAttribute("data-color")
		let slider = divRgb[i].querySelector("input[id|=slider]");
		let number = divRgb[i].querySelector("input[id|=input]");

		chrome.storage.local.get([color]).then((result) =>{
			let val = result[color];
			if(!val){
				val = 0;
			}
			slider.value = val;
			number.value = val;
			
		});

		slider.addEventListener("input", function(){
			let val = parseInt(slider.value, 10);
			chrome.runtime.sendMessage({type: "color", content:{color: color, val: val}}, function(response){
				console.log(response);
			})
			number.value = isNaN(val) ? 0 : val;
		});
		number.addEventListener("keyup", function(){
			let val = parseInt(number.value, 10);
			if(val>255){
				val = 255;
				number.value = val;
			}
			chrome.runtime.sendMessage({type: "color", content:{color: color, val: val}}, function(response){
				console.log(response);
			})
			slider.value = isNaN(val) ? 0 : val;
		})
	}
}


document.addEventListener("DOMContentLoaded", function(){
	let chkBlk = document.getElementById("check-block")
	chkBlk.addEventListener("click", function(){
		if(this.checked){
			chrome.runtime.sendMessage({type: "show"}, function(response){
				console.log(response);
			})
		}else {
			chrome.runtime.sendMessage({type: "hide"}, function(response){
				console.log(response);
			})
		}
	})
	chrome.storage.local.get(["show"]).then((result) =>{
		chkBlk.checked = result.show;
	});
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type === "show") {
        	chkBlk.checked = request.val;
        }
    });
	let btnReset = document.getElementById("reset");
	btnReset.addEventListener("click", function(){
		chrome.runtime.sendMessage({type: "reset"}, function(response){
			console.log(response);
		})
	});
	syncColorInputs();
});