<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_Tabs" Codebehind="Tabs.ascx.cs" %>

   <script type="text/javascript">
   
function setTab(e)
{
   setTabColor(this);
   return false;
}

function setTabColor(tab) {
  /*
  document.getElementById("ems_" + tab.tabKey + "_onTab").value = tab.tabNumber; 
  
  var tabs = eval(tab.tabKey + "tabs");
  for(var j = 0; j < tabs.length; j++)
   {
       tabs[j].className = "";
       tabs[j].listItem.className = "";
       
       if(tabs[j].contentDiv != null)
           tabs[j].contentDiv.style.display = "none";
   }

   tab.className = "selected";
   tab.listItem.className = "selected";
   if(tab.contentDiv)
       tab.contentDiv.style.display = "";   
       */
}

</script>
<div id="tabs">
<ul runat="server" id="tabList" enableviewstate="false" role="tablist"></ul>
</div>
