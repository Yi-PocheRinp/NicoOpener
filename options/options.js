
function yetConnectedApp()
{
    document.getElementById("already-connected-app").style.display = "none";
}

function alreadyConnectedApp()
{
    document.getElementById("already-connected-app").style.display = "block";
}

yetConnectedApp();

protocolCheck("niconico://"
    , function failed() 
    {
        yetConnectedApp();
    }
    , function successed() 
    {
        setTimeout();
        alreadyConnectedApp();
    }
    );