<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="Reservations_Recurrence" Title="<%$Resources:PageTitles, Recurrence %>" Codebehind="Recurrence.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register Src="Controls/MiniCalendar.ascx" TagName="Cal" TagPrefix="EMS" %>
<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder">
<link href="Content/small-calendar.css" type="text/css" rel="stylesheet" />
<script type="text/javascript" src="Scripts/vems/small-calendar.js" ></script>
<script type="text/javascript" src="Scripts/vems/recurrence.js" ></script>
 <!--[if IE 7]>
<style type="text/css">
#emsCon{width:40em;}
</style>
<![endif]-->
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" Runat="Server">


<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-all"><asp:Literal ID="Legend2" runat="server" Text="<%$Resources:ScreenText, Time %>" /></h3>
<div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-widget-content clearfix" style="padding:.5em; width:35em;" >

<div class="float" style="padding-right:2em;">
<Dea:TextBoxWithLabel  ID="StartTime" runat="server" Prompt="<%$ Resources:ScreenText, StartTime %>" DisplayLabelAs="TopLeft" 
     IsRequired="true" EmsDataId="StartTime" SuppressSubmitOnReturn="true" BoxWidth="75" />
     </div>
<div class="float">
<Dea:TextBoxWithLabel ID="EndTime" runat="server" Prompt="<%$ Resources:ScreenText, EndTime %>" DisplayLabelAs="TopLeft"
     IsRequired="true" EmsDataId="EndTime" SuppressSubmitOnReturn="true" BoxWidth="75"/>
     </div>
</div>


<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-all"><asp:Literal ID="RecurrencePatter" runat="server" Text="<%$Resources:ScreenText, RecurrencePattern %>" /> </h3>
<div  class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-widget-content clearfix" style="padding:.5em; width:35em;" >
   <div id="recurTypes">
   <asp:RadioButton ID="DailyOption" runat="server" Text="<%$Resources:ScreenText, Daily %>" GroupName="RecurrenceOptions" onclick="Dea.Recurrence.toggleRadio(0)" />
   <asp:RadioButton ID="WeeklyOption" runat="server" Text="<%$Resources:ScreenText, Weekly %>" GroupName="RecurrenceOptions" onclick="Dea.Recurrence.toggleRadio(1)"  />
   <asp:RadioButton ID="MonthlyOption" runat="server" Text="<%$Resources:ScreenText, Monthly %>" GroupName="RecurrenceOptions" onclick="Dea.Recurrence.toggleRadio(2)" />
   <asp:RadioButton ID="RandomOption" runat="server" Text="<%$Resources:ScreenText, Random %>" GroupName="RecurrenceOptions" onclick="Dea.Recurrence.toggleRadio(3)" />
   </div>
    <hr />
  
   <div id="dailyOptions" class="row" style="display:none;" aria-hidden="true" aria-labelledby="<%= DailyOption.ClientID %>">
        <div class="row">
       <asp:RadioButton ID="DailyByDay" runat="server" Text="<%$Resources:ScreenText, DailyByDay %>" GroupName="DailyPattern" Checked="true" />
       <Dea:DeaTextBox ID="DailyByDayDate" runat="server" ToolTip="<%$Resources:ScreenText, DailyByDayDateTip %>" Width="2em" Text="1" NumericOnly="true" MaxLength="2"   />&nbsp;<asp:Label ID="DaysLabel" runat="server" Text="<%$Resources:ScreenText, Days %>"  /> 
       </div>
       <div class="row">
       <asp:RadioButton ID="DailyByWeekday" runat="server" Text="<%$Resources:ScreenText, DailyByWeekday %>" GroupName="DailyPattern" />
       </div>
   </div>
   
   <div id="weeklyOptions" class="row" style="display:none;" aria-hidden="true" aria-labelledby="<%= WeeklyOption.ClientID %>">
   <div class="row">
        <asp:label ID="WeeklyLabel1" runat="server" Text="<%$Resources:ScreenText, RecurEvery %>"  />&nbsp;
		<Dea:DeaTextBox id="WeeklyNumber" runat="server" text="1" width="2em" MaxLength="2"  NumericOnly="true" />&nbsp;<asp:label  id="WeeklyLabel2" runat="server" text="<%$Resources:ScreenText, WeeksOn %>"/>
    </div>
		<div class="row" id="dow">
			<asp:CheckBoxList id="DaysOfWeek" runat="server" RepeatDirection="Horizontal" RepeatColumns="7"></asp:CheckBoxList>
		</div>
   </div>
   
   <div id="monthlyOptions" class="row" style="display:none"  aria-hidden="true" aria-labelledby="<%= MonthlyOption.ClientID %>">
    <div class="row">
      <asp:RadioButton ID="MonthlyByDayOfMonth" runat="server" Text="<%$Resources:ScreenText, MonthlyByDay %>" GroupName="MonthlyPattern" Checked="true" />
      <Dea:DeaTextBox id="MonthlyDayX" runat="server" text="1"  width="2em" MaxLength="2" NumericOnly="true"  />&nbsp;<asp:label  id="Label1" runat="server" text="<%$Resources:ScreenText, OfEvery %>"/>
      <Dea:DeaTextBox id="MonthlyDayOfMonthX" runat="server" text="1" width="2em" MaxLength="2" NumericOnly="true"  />&nbsp;<asp:label  id="Label2" runat="server" text="<%$Resources:ScreenText, Months %>"/>
      </div>
      <div class="row">
        <asp:RadioButton ID="MonthlyByTypeOfDayOption" runat="server" Text="<%$Resources:ScreenText, MonthlyTypeOfDay %>" GroupName="MonthlyPattern" />
        <asp:DropDownList id="MonthlyByTypeFrequency" runat="server" >
            <asp:ListItem Value="1" Text="<%$Resources:ScreenText, First %>"  />
           <asp:ListItem Value="2" Text="<%$Resources:ScreenText, Second %>"  />
          <asp:ListItem Value="3" Text="<%$Resources:ScreenText, Third %>"  />
          <asp:ListItem Value="4" Text="<%$Resources:ScreenText, Fourth %>"  />
          <asp:ListItem Value="-1" Text="<%$Resources:ScreenText, Last %>"  />
       </asp:DropDownList>
       <asp:DropDownList id="MonthlyByTypeOfDay" runat="server"  />
        &nbsp;<asp:label  id="Label3" runat="server" text="<%$Resources:ScreenText, OfEvery %>"/>
       <Dea:DeaTextBox id="MonthlyByTypeOfMonth" runat="server" text="1" width="2em" MaxLength="2" NumericOnly="true"  />&nbsp;<asp:label  id="Label4" runat="server" text="<%$Resources:ScreenText, Months %>"/> 
      </div>
     
    
   </div>
   <div id="randomOptions" class="row" style="display:none;"  aria-hidden="true" aria-labelledby="<%= RandomOption.ClientID %>">
   <EMS:Cal ID="randomDates" runat="server" />
   </div>


</div>

<div id="recurrenceRange">
<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-all"><asp:Literal ID="Literal1" runat="server" Text="<%$Resources:ScreenText, RangeOfRecurrence %>" /> </h3>
<div  class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-widget-content clearfix" style="padding:.5em; width:35em;" >
        
        <Dea:DatePicker ID="StartDate" runat="server" Prompt="<%$ Resources:ScreenText, StartDate %>" DisplayLabelAs="AsRow" EmsDataId="StartDate" CssClass="clear" CalendarPickerAltText="<%$ Resources:ScreenText, Calendar %>" UseIconTrigger="true" SuppressSubmitOnReturn="true" /> 
       <div class="row">
      <asp:RadioButton ID="EndAfterXOption" runat="server" Text="<%$Resources:ScreenText, EndAfter %>" GroupName="EndAfterOptions" Checked="true"/>
       <Dea:DeaTextBox id="EndAfterX" runat="server" text="1" width="2em" MaxLength="3" NumericOnly="true"  />&nbsp;<asp:label  id="Label5" runat="server" text="<%$Resources:ScreenText, Occurrences %>"/>                      
       </div>
       <div class="row">
       <div class="float">
       <asp:RadioButton ID="EndAfterDateOption" runat="server" Text="<%$Resources:ScreenText, EndBy %>" GroupName="EndAfterOptions" />
       </div>
       <Dea:DatePicker ID="EndBy" runat="server" DisplayLabelAs="none" IncludeColon="false" EmsDataId="StartDate" CssClass="float" CalendarPickerAltText="<%$ Resources:ScreenText, Calendar %>" UseIconTrigger="true" SuppressSubmitOnReturn="true"/> 
       </div>
 
</div>
</div>   
<asp:Button runat="server" Text="<%$Resources:ScreenText, ApplyRecurrence %>" ID="ApplyRecurrence" OnClick="ApplyRecurrence_Click" OnClientClick="return Dea.Recurrence.dateChecks();"/>
<asp:Button runat="server" Text="<%$Resources:ScreenText, RemoveRecurrence %>" ID="RemoveRecurrence" OnClick="RemoveRecurrence_Click" />

</asp:Content>

