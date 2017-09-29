<%@ Page Language="C#" AutoEventWireup="true" Inherits="ExpectedError" Title="<%$Resources:PageTitles, ExpectedError %>" CodeBehind="ExpectedError.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:content id="Content1" contentplaceholderid="pc" runat="Server">    
    <div class="row">
        <div class="col-lg-12" id="error">
            <Dea:WebText ID="ErrorText" runat="server" ParentType="none" isHelpText="true" LookupKey="VEMSExpectedErrorHelp" ></Dea:WebText>
        </div>
     </div>
     <div class="row">
        <div class="col-lg-12">
            <div><%=ErrorMessage %></div>          
        </div>
    </div>
</asp:content>

