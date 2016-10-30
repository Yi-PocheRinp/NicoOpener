
console.log("twitter inject 1.");

function ModifyTimelineItem(node)
{
	var tweetList = node.querySelectorAll(".tweet.has-cards");
	tweetList.forEach(function (tweetElem) 
	{
		// nico.msでの投稿
		var urlElem = tweetElem.querySelector('a[data-expanded-url^="http://nico.ms/"]'); 
		if (urlElem == null)
		{
			return;
		}

		console.log(urlElem);

		var tweetActionList = tweetElem.querySelector('.ProfileTweet-actionList');
		if (tweetActionList == null)
		{
			return;
		}

		console.log(tweetActionList);

		
		var shorterUrl = urlElem.getAttribute("data-expanded-url");
		var nicoContentId = shorterUrl.split("/")[3];
		console.log(nicoContentId);
		var niconicoSchemeUrl = "niconico://" + nicoContentId;
		console.log(niconicoSchemeUrl);
		
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
		tweetActionList.appendChild(openWithNicoActionElem);
		

		// Note: nioc.ms以外のURL直接のTwitter投稿はコンテンツIDがTwitterTL上で取れないため、対応を見送り
		// URLを解決して、リダイレクト先のURLを取得、URLがコンテンツIDを含む場合は、ボタン表示、って流れ？

	});
}

console.log("twitter inject 2.");


function TwitterTimelineContentModify()
{
	console.log("twitter inject started.");
	var streamItemsContainer = document.querySelectorAll("#stream-items-id")[0];

	console.log(streamItemsContainer);
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			console.log(mutation.type);

			if (mutation.addedNodes == null) { return; }

			mutation.addedNodes.forEach(function (node) 
			{
				ModifyTimelineItem(node);
			});
		});    
	});


	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };
	observer.observe(streamItemsContainer, config );

	console.log("twitter inject initialized.");

}

console.log("twitter inject 3");

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");

	TwitterTimelineContentModify();
});

//TwitterTimelineContentModify();



