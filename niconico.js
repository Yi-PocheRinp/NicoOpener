

const NiconicoScheme = "niconico://";
const NiconicoPrefixList = ["sm", "lv", "so"];
const NiconicoPrefixListRegexStr = NiconicoPrefixList.join("|");

const NiocvideoContentIdRegex = new RegExp("https?:\\/\\/(?:www|live)\\.nicovideo.jp\\/watch\\/((?:"+NiconicoPrefixListRegexStr+")\\d*|\\d*)");
//const NiocvideoContentIdRegex = /https?:\/\/(?:www|live)\.nicovideo.jp\/watch\/((?:sm|lv|so)\d*|\d*)/;
const NiocvideoShortContentIdRegex = new RegExp("https?:\\/\\/nico.ms\\/((?:"+NiconicoPrefixListRegexStr+")\\d*|\\d*)");

const TargetUrls = ["*://www.nicovideo.jp/*", "*://live.nicovideo.jp/*", "*://nico.ms/*"];

class NiconicoSchemeOptions 
{
	constructor()
	{
		this.AddToPlaylist = false;

		this.getQueryText = () => 
		{
			var text = "";
			if (this.AddToPlaylist == true)
			{
				text += "addplaylist=1"; 
			}

			return text;
		};
	}


	
}

function isNiconicoUrlWithContentId(url)
{
	return NiocvideoContentIdRegex.test(url) || NiocvideoShortContentIdRegex.test(url);
}

function extractNiconicoContentId(url)
{
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

function convertToNiconicoProtocolUrl(url, options)
{
	if (options == null || options == undefined) 
	{
		options = {};
	}

	var resultUrl = null;
	var contentId = extractNiconicoContentId(url);
	var queryParam = {};
	if (contentId != null)
	{
		resultUrl = NiconicoScheme + contentId;
	}
	else 
	{
		return null;
	}

	if (Object.is(options, NiconicoSchemeOptions))
	{
		var query = options.getQueryText();
		if (query != null && query != "")
		{
			resultUrl += "?" + query;
		}
	}

	return resultUrl;
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
