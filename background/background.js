
const NiconicoScheme = "niconico://";
const NiconicoPrefixList = ["sm", "lv", "so"];
const NiconicoPrefixListRegexStr = NiconicoPrefixList.join("|");

const NiocvideoContentIdRegex = new RegExp("https?:\\/\\/(?:www|live)\\.nicovideo.jp\\/watch\\/((?:"+NiconicoPrefixListRegexStr+")\\d*|\\d*)");
//const NiocvideoContentIdRegex = /https?:\/\/(?:www|live)\.nicovideo.jp\/watch\/((?:sm|lv|so)\d*|\d*)/;
const NiocvideoShortContentIdRegex = new RegExp("https?:\\/\\/nico.ms\\/((?:"+NiconicoPrefixListRegexStr+")\\d*|\\d*)");

const TargetUrls = ["*://www.nicovideo.jp/*", "*://live.nicovideo.jp/*", "*://nico.ms/*"];

function isNiconicoUrlWithContentId(url)
{
	return NiocvideoContentIdRegex.test(url) || NiocvideoShortContentIdRegex.text(url);
}

function extractNiconicoContentId(url)
{
	console.log(NiocvideoContentIdRegex);
	var match = url.match(NiocvideoContentIdRegex);
	console.log("match -> " + match);
	if (match != null && match.length >= 2)
	{
		return match[1];
	}

	match = url.match(NiocvideoShortContentIdRegex);
	console.log("short match -> " + match);
	if (match != null && match.length >= 2)
	{
		return match[1];
	}
	return null;
	
}

function convertToNiconicoProtocolUrl(url)
{
	var contentId = extractNiconicoContentId(url);
	if (contentId != null)
	{
		return NiconicoScheme + contentId;
	}
	else 
	{
		return null;
	}
}

function isNiconicoSchemeUrl(url)
{
	return url.startsWith(NiconicoScheme);
}


function OpenNiconicoProtocol(niocnicoUrl)
{
	chrome.tabs.query({ currentWindow: true, active: true }, function (maybeCurrentTab) {
		var currentTab = maybeCurrentTab[0];

		// 新しいタブとして開く
		// niconico://に対応するアプリを選択するよう表示されるはず
		chrome.tabs.create({url: niocnicoUrl, active:false});

		// カスタムスキームURLは tabs.create のコールバックが呼ばれない
		// 少ししてから不要なタブを閉じる処理を実行する
		setTimeout(function() {
			// queryに 渡す url がカスタムスキームかつ
			// host部分がないURLパターンの場合
			// invalid patternとなり対応していない
			// すべてのタブを取得して不要なタブを逐次判断する形で回避する 
			chrome.tabs.query( {}, (tabs) => 
			{
					if (tabs && tabs.length)
					{
						for (var tabIndex in tabs)
						{
							var tab = tabs[tabIndex];
							var isRemoveTarget = false;
							if (tab.url && isNiconicoSchemeUrl(tab.url))
							{
								isRemoveTarget = true;
							}
							else if (currentTab.index < tabIndex)
							{
								// httpとしてレンダリングが実行されてないページは
								// tab.urlがabout:blankのままっぽい (firefoxで確認)
								// 現在のタブより新しく開いたっぽい空ページタブを対象として判断
								if (tab.url && tab.url == "about:blank")
								{
									isRemoveTarget = true;
								}
							}
							
							if (isRemoveTarget)
							{
								chrome.tabs.remove(tab.id, () => 
								{
									if (chrome.runtime.lastError) {
										console.log("failed: " + chrome.runtime.lastError);
									} else {
										console.log("removed tab");
									}
								});
							}								
						}
					}
			});
		}, 500);
	});
	
}


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

