
/*
ニコニコ動画で開くためのコンテキストメニュー
*/
chrome.contextMenus.create({
  id: "play",
  title: chrome.i18n.getMessage("contextMenuItemPlay"),
  contexts: ["link"],
	targetUrlPatterns: TargetUrls,
  onclick : (info, tab) => 
	{
		console.log(info);
		var niconicoUri = convertToNiconicoProtocolUrl(info.linkUrl);
		if (niconicoUri != null)
		{
			console.log("[PLAY] " + niconicoUri);

			OpenNiconicoProtocol(niconicoUri);
		}
	}
});

chrome.contextMenus.create({
  id: "separator",
  contexts: ["link"],
	targetUrlPatterns:TargetUrls,
  type: "separator"
});

chrome.contextMenus.create({
  id: "add-playlist",
  title: chrome.i18n.getMessage("contextMenuItemNicoAddToPlaylist"),
  contexts: ["link"],
	targetUrlPatterns:TargetUrls,
  onclick : (info, tab) => 
	{
		console.log(info.linkUrl);
		var niconicoUri = convertToNiconicoProtocolUrl(info.linkUrl);
		if (niconicoUri != null)
		{
			var niconicoUriWithAddPlaylist = niconicoUri + "?addplaylist=1"; 
			console.log("[Add Playlist] " + niconicoUriWithAddPlaylist);

			OpenNiconicoProtocol(niconicoUriWithAddPlaylist);
		}
	}
});

