<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="PamUploadAttachment" Title="<%$Resources:PageTitles, PamUploadAttachment %>" Codebehind="PamUploadAttachment.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="HeadContent" ContentPlaceHolderID="headContentHolder" runat="server">
<script type="text/javascript">
    $(document).ready(function () {
        Dea.setPopup();
    });
function setAttachment(s) {
    parent.emsAttachment.fileName = s;
    parent.attachedFile();
}
</script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
        <asp:FileUpload runat="server" ID="fileToAttach" />
        <div class="row">
        <asp:Button ID="AddAttach" runat="server" Text="<%$Resources:ScreenText, Upload %>" onclick="AddAttach_Click" />
        </div>
</asp:Content>

