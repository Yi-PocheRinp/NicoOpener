
var NiocvideoContentIdRegex = /^https?:\/\/.*nicovideo.jp\/watch\/((sm|lv|so)\d*|\d*)/;

function isNiconicoUrlWithContentId(url)
{
	return NiocvideoContentIdRegex.test(url);
}

function extractNiconicoContentId(url)
{
	var match = url.match(NiocvideoContentIdRegex);
	console.log("match -> " + match);
	if (match != null && match.length >= 2)
	{
		return match[1];
	}
	else 
	{
		return null;
	}
}

function convertToNiconicoProtocolUrl(url)
{
	var contentId = extractNiconicoContentId(url);
	if (contentId != null)
	{
		return "niconico://" + contentId;
	}
	else 
	{
		return null;
	}
}

/*
ニコニコ動画で開くためのコンテキストメニュー
*/
chrome.contextMenus.create({
  id: "play",
  title: chrome.i18n.getMessage("contextMenuItemPlay"),
  contexts: ["link"],
	targetUrlPatterns:["*://*.nicovideo.jp/*"],
  onclick : (info, tab) => 
	{
		console.log(info.linkUrl);
		var niconicoUri = convertToNiconicoProtocolUrl(info.linkUrl);
		if (niconicoUri != null)
		{
			console.log("[PLAY] " + niconicoUri);

			chrome.tabs.create({url: niconicoUri}, (tab) => {
				chrome.tabs.remove(tab.id);
			});

		}
	}
});

chrome.contextMenus.create({
  id: "separator",
  contexts: ["link"],
	targetUrlPatterns:["*://*.nicovideo.jp/*"],
  type: "separator"
});

chrome.contextMenus.create({
  id: "add-playlist",
  title: chrome.i18n.getMessage("contextMenuItemNicoAddToPlaylist"),
  contexts: ["link"],
	targetUrlPatterns:["*://*.nicovideo.jp/*"],
  onclick : (info, tab) => 
	{
		console.log(info.linkUrl);
		var niconicoUri = convertToNiconicoProtocolUrl(info.linkUrl);
		if (niconicoUri != null)
		{
			var niconicoUriWithAddPlaylist = niconicoUri + "?addplaylist=1"; 
			console.log("[Add Playlist] " + niconicoUriWithAddPlaylist);

			chrome.tabs.create({url: niconicoUriWithAddPlaylist}, (tab) => {
				chrome.tabs.remove(tab.id);
			});

		}
	}
});

