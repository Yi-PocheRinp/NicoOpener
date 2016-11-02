




function setContentId(url)
{
  console.log(url);

  var niconicoUrl = convertToNiconicoProtocolUrl(url);
  var playElem = document.getElementById('play');
  playElem.href = niconicoUrl;

  var options = new NiconicoSchemeOptions();
  options.AddToPlaylist = true;
  var niconicoUrlWithAddToPlaylist = convertToNiconicoProtocolUrl(url, options);
  var add_to_playlist = document.getElementById('add_to_playlist');
  add_to_playlist.href = niconicoUrlWithAddToPlaylist;
  
  var niconicoContentId = extractNiconicoContentId(url);
  var content_id = document.getElementById('content_id');
  content_id.textContent = niconicoContentId;

  console.log("isChrome:" + isChrome);
  console.log("isEdge:" + isIEedge);
  if (isChrome || isIEedge)
  {
    console.log("chrome or edge popup click handling.");
    var playButton = document.getElementById("play-button-id");
    playButton.addEventListener("click", (element, ev) => 
    {
        console.log("chrome [Play] " + niconicoUrl );
        OpenNiconicoProtocol(niconicoUrl, () => 
        {
          window.close();
        });
    });
    var addToPlaylistButton = document.getElementById("add-to-playlist-button-id");
    add_to_playlist.addEventListener("click", (element, ev) => 
    {
        console.log("chrome [Add Playlist] " + niconicoUrl );
        OpenNiconicoProtocol(niconicoUrlWithAddToPlaylist, () => 
        {
          window.close();
        });
    });
  }
    
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];
    setContentId(tab.url);
  });
});

