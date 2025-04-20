//https://github.com/GoogleChromeLabs/picture-in-picture-chrome-extension/blob/master/src/script.js
function findLargestPlayingVideo() {
  const videos = Array.from(document.querySelectorAll('video'))
    .filter(video => video.readyState != 0)
    .filter(video => video.disablePictureInPicture == false)
    .sort((v1, v2) => {
      const v1Rect = v1.getClientRects()[0]||{width:0,height:0};
      const v2Rect = v2.getClientRects()[0]||{width:0,height:0};
      return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
    });

  if (videos.length === 0) {
    return;
  }

  return videos[0];
}

let deflt = {
  x: 30,
  y: 119,
  width: 240,
  height: 26,
};

//https://www.reddit.com/r/ajatt/comments/fpd9ez/tampermonkey_script_for_4anime_to_block_hard](https://www.reddit.com/r/ajatt/comments/fpd9ez/tampermonkey_script_for_4anime_to_block_hard
function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;
}

function init() {
  let vid = findLargestPlayingVideo();
  if (vid == null) {
    setTimeout(init, 1000);
    return;
  }

  let canvas = document.createElement("canvas");
  canvas.id = "paintpad";
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  const resizeObserver = new ResizeObserver(function(element){
    canvas.style.width = element[0].target.clientWidth+"px";
    canvas.style.height = element[0].target.clientHeight+"px";
    canvas.style.left = element[0].target.offsetLeft+"px";
  });
  resizeObserver.observe(vid);

  canvas.style.width = vid.clientWidth+"px";
  canvas.style.height = vid.clientHeight+"px";
  chrome.storage.local.get(["show"]).then((result) =>{
    if(result.show){
      canvas.style.display = "inline";
    }else {
      canvas.style.display = "none";
    }
  });

  if(!document.getElementById("paintpad")){
  	vid.parentNode.insertBefore(canvas, vid.nextSibling);
  }
  updateCover();
}

function toggleCover(){
  let canv = document.getElementById("paintpad");
  if(canv){
    if(canv.style.display === "none"){
      canv.style.display = "inline";
      chrome.storage.local.set({show:true});
      return true;
    }else{
      canv.style.display = "none";
      chrome.storage.local.set({show:false});
      return false;
    }
  }
}

function showCover(){
  let canv = document.getElementById("paintpad");
  canv.style.display = "inline";
  chrome.storage.local.set({show:true});
}

function hideCover(){
  let canv = document.getElementById("paintpad");
  canv.style.display = "none";
  chrome.storage.local.set({show:false});
}


function resetCover(){
  chrome.storage.local.set(deflt);
  let canv = document.getElementById("paintpad");
  let ctx = canv.getContext("2d");
  ctx.clearRect(0, 0, canv.width, canv.height);
  ctx.fillRect(deflt.x, deflt.y, deflt.width, deflt.height);

}

function updateCover(){
  let canv = document.getElementById("paintpad");
  if(canv){
    chrome.storage.local.get(["x", "y","width", "height","red", "green", "blue"]).then((result) =>{
      let x = isNaN(result.x) ? 30 : result.x;
      let y = isNaN(result.y) ? 119 : result.y;
      let width = isNaN(result.width) ? 240 : result.width;
      let height = isNaN(result.height) ? 26 : result.height;
      let ctx = canv.getContext("2d");
      let red = isNaN(result.red) ? 0 : result.red;
      let green = isNaN(result.green) ? 0 : result.green;
      let blue = isNaN(result.blue) ? 0 : result.blue;
      ctx.clearRect(0, 0, canv.width, canv.height);
      ctx.fillStyle = `rgb(${red},${green},${blue})`;
      ctx.fillRect(x, y, width, height);
    }); 
  }
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse){
	if(request.action == "block"){
		let show = toggleCover();
		sendResponse({success: true,
      data:{
        type: "show", content: show
      }
    });
	}
  if(request.action == "redraw"){
    updateCover();
    sendResponse({success: true});
  }
  if(request.action == "reset"){
    resetCover();
    sendResponse({success: true});
  }
  if(request.action == "hide"){
    hideCover();
    sendResponse({success: true});
  }
  if(request.action == "show"){
    showCover()
    sendResponse({success: true});
  }
  if(request.action == "move"){
    let offset = await chrome.storage.local.get(["x", "y"]);
    let x = isNaN(offset.x) ? deflt.x : offset.x;
    let y = isNaN(offset.y) ? deflt.y : offset.y;
    switch(request.direction){
      case "left":
        x++;
        chrome.storage.local.set({x: x});
        sendResponse({success: true});
        break;
      case "right":
        x--;
        chrome.storage.local.set({x: x});
        sendResponse({success: true});
        break;
      case "up":
        y--;
        chrome.storage.local.set({y: y});
        sendResponse({success: true});
        break;
      case "down":
        y++;
        chrome.storage.local.set({y: y});
        sendResponse({success: true});
        break;
    }
    updateCover();
  }
  if(request.action == "scale"){
    let dimensions = await chrome.storage.local.get(["width", "height"]);
    let width = isNaN(dimensions.width) ? deflt.width : dimensions.width;
    let height = isNaN(dimensions.height) ? deflt.height : dimensions.height;
    if(request.scale.dimension == "width"){
      if(request.scale.change == "increase"){
        width++;
        chrome.storage.local.set({width: width});
        sendResponse({success: true});
      }
      if(request.scale.change == "decrease"){
        width--;
        chrome.storage.local.set({width: width});
        sendResponse({success: true});
      }
    }
    if(request.scale.dimension == "height"){
      if(request.scale.change == "increase"){
        height++;
        chrome.storage.local.set({height: height});
        sendResponse({success: true});
      }
      if(request.scale.change == "decrease"){
        height--;
        chrome.storage.local.set({height: height});
        sendResponse({success: true});
      }
    }
    updateCover();
  }
	return true;
});

init();
