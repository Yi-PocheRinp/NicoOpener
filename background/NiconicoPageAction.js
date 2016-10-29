

/*

    URLにニコニココンテンツIDが含まれるか確認して
    PageActionを追加するかを決める

*/

function AddNiconicoPageAction(tabId)
{
  console.log("add niconico page action");

  chrome.pageAction.show(tabId);
}

function RemoveNiconicoPageAction(tabId)
{
  console.log("remove niconico page action");

  chrome.pageAction.hide(tabId);
}

function OnTabUpdated(tabId, changeInfo, tab)
{
  if (changeInfo.url)
  {
    var url = changeInfo.url;
    if (isNiconicoUrlWithContentId(url))
    {
      AddNiconicoPageAction(tabId, url);
    }
    else 
    {
      RemoveNiconicoPageAction(tabId);
    }
  }
}

chrome.tabs.onUpdated.addListener(OnTabUpdated);