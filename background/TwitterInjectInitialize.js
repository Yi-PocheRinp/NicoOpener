
const TwitterUrlRegex = /^https:\/\/twitter.com\/.*/;


function isTwitterUrl(url)
{
    if (url)
    {
        return url.match(TwitterUrlRegex);
    }
    else 
    {
        return false;
    }
}
function onExecuted(result) {
  console.log(result);
}

function onTabUpdated(tabId, changeInfo, tab)
{
    var url = changeInfo.url;
    if (isTwitterUrl(url))
    {
        console.log("is Twitter page, apply timeline modify script.");
        chrome.tabs.executeScript(
            tabId
            , {file: "/niconico.js"}
            , (result) => 
            {
                chrome.tabs.executeScript(
                    tabId
                    , {file: "/TwitterTimelineInject.js"}
                    , onExecuted
                )
            });
    }
}

chrome.tabs.onUpdated.addListener(onTabUpdated);