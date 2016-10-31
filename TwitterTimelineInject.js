const isChromium = window.chrome,
	winNav = window.navigator,
	vendorName = winNav.vendor,
	isOpera = winNav.userAgent.indexOf("OPR") > -1,
	isIEedge = winNav.userAgent.indexOf("Edge") > -1,
	isIOSChrome = winNav.userAgent.match("CriOS");

const isChrome = isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false; 

const alreadyCheckedTweets = {};

function ModifyTimelineItem(node)
{


	var tweetList = node.querySelectorAll(".tweet.has-cards");
	for (var tweetElem of tweetList)
	{
		// 
		var tweetId = tweetElem.getAttribute("data-item-id");
		if (alreadyCheckedTweets[tweetId])
		{
			return;
		}

		//console.log("check" + tweetId);

		// nico.msでの投稿
		var urlElem = tweetElem.querySelector('a[data-expanded-url^="http://nico.ms/"]'); 
		if (urlElem == null)
		{
			return;
		}

		var tweetActionList = tweetElem.querySelector('.ProfileTweet-actionList');
		if (tweetActionList == null)
		{
			return;
		}
		
		
		var shorterUrl = urlElem.getAttribute("data-expanded-url");
		console.log(shorterUrl);
		var nicoContentId = shorterUrl.split("/")[3].split("?")[0];

		var niconicoSchemeUrl = "niconico://" + nicoContentId;

		console.log("detect niconicoId: " + nicoContentId);
		
		var openWithNicoActionElem = document.createElement("div");
		openWithNicoActionElem.setAttribute("class", "ProfileTweet-action");

		{
			var anchor = document.createElement("a");
			anchor.setAttribute("href", niconicoSchemeUrl);
			

			var actionButton = document.createElement('button');
			actionButton.setAttribute("class", "ProfileTweet-actionButton u-textUserColorHove");			
			{
				var divIconContainer = document.createElement("div");
				divIconContainer.setAttribute("class", "IconContainer");
				divIconContainer.style = "height:16px; width:16px;";

				var iconElem = document.createElement("div");
				var buttonIconUrl = chrome.extension.getURL('/assets/icons/button-nicoopener-icon.png');
				iconElem.style = 'position: absolute; background:url(' + buttonIconUrl + '); background-position: left; background-repeat: no-repeat; width:16px; height:16px; ';


				divIconContainer.appendChild(iconElem);

				actionButton.appendChild(divIconContainer);
			}

			anchor.appendChild(actionButton);
			
			openWithNicoActionElem.appendChild(anchor);				
		}

		if (isChrome || isIEedge)
		{
			anchor.addEventListener("click", (sender, ev) => 
			{
				var w = (window.parent)?window.parent:window;
    			w.location.assign(niconicoUrl);
			});
		}
		tweetActionList.appendChild(openWithNicoActionElem);
		
		// ツイートアイテムをチェック済みにマーク
		alreadyCheckedTweets[tweetId] = true;

		// Note: nioc.ms以外のURL直接のTwitter投稿はコンテンツIDがTwitterTL上で取れないため、対応を見送り
		// URLを解決して、リダイレクト先のURLを取得、URLがコンテンツIDを含む場合は、ボタン表示、って流れ？

	}
}

const TwitterStreamObserver = new MutationObserver(function(mutations) {

	console.log("twitter stream modified.");

	mutations.forEach(function(mutation) {

		if (mutation.addedNodes == null) { return; }

		console.log("had added nodes");
		for (var node of mutation.addedNodes)
		{
			ModifyTimelineItem(node);
		}
	});    
});

const _ObserveConfig = { childList: true };

function TwitterTimelineContentModify()
{
	try 
	{
		TwitterStreamObserver.disconnect();
	}
	catch (e)
	{
		console.log(e);
	}

	var streams = document.querySelectorAll("#stream-items-id");
	console.log(streams);
	var streamItemsContainer = streams[0];

	console.log(streamItemsContainer);

	// configuration of the observer:
	TwitterStreamObserver.observe(streamItemsContainer, _ObserveConfig );

	// #stream-items-id が検索ページだと遅れて反映された上で、
	// observeに反応しないので、長めに待ってから
	// チェックする
	setTimeout(() => {
		for (var node of streamItemsContainer.children) 
		{
			ModifyTimelineItem(node);
		}
	}, 3000);
}

const TwitterDocElemObserver = new MutationObserver(function(mutations) {
	// docが変わったら再度ハンドリング
	console.log("twitter doc modified.");
	TwitterTimelineContentModify();    
});

const TwitterDialogElemObserver = new MutationObserver(function(mutations) {
	console.log("twitter dialog modified.");
	if (mutations.addedNodes != null)
	{
		setTimeout(() => 
		{
			for (var node of mutations.addedNodes)
			{
				ModifyTimelineItem(node);
			}
		}
		, 3000);
	}
});

document.addEventListener("DOMContentLoaded", function(event) {

	// Twitterのタイムラインが含まれる要素の変更をチェックする
	// （タイムライン→検索結果表示の切り替えなどの時に対応するため）
	var docElem = document.getElementById("page-container");
	TwitterDocElemObserver.observe(docElem, _ObserveConfig);

	// Twitterのツイートの詳細表示を行うダイアログの要素変更をチェックする
	//var dialogElem = document.getElementById("PermalinkOverlay-content"); 
	//TwitterDialogElemObserver.observe(dialogElem, _ObserveConfig);

	// 最初に読み込まれたときはdocElemの更新は発生しないので
	// 最初だけチェックする
	TwitterTimelineContentModify();    
});



