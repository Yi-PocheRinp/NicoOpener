




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
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  var tab = tabs[0];
  console.log(tab);
  setContentId(tab.url);
});