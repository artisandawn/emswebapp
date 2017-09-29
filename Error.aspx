<%@ Page Language="C#" AutoEventWireup="true" Inherits="Error" Codebehind="Error.aspx.cs" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1" runat="server">
    <title>EMS Web App Error</title>
       <style media="screen" type="text/css">
        /*The Text that is centered about the menu*/
        h1
        {
	        color: #225d92;
	        float:left;
	        margin-left:auto;
	        text-align:center;
	        width:80%;
	        display:block;
        }
        .float
        {
            float:left;   
        }
        .row
        {
            clear:both;
            padding-top:.3em;
        }
        </style> 
</head>
<body>
    <form id="VirtualEmsForm" runat="server">
       <asp:Image runat="server" ID="HeaderImage" AlternateText="Virtual EMS Logo" CssClass="float" ImageUrl="~/Images/Logo.png" Height="50"></asp:Image>
       <h1>EMS Web App</h1>
       <div class="row">
            <asp:Label ID="ErrorMessage" Runat="server" Text=""></asp:Label>
		</div>
		<div class="row">
			<p><strong><asp:Label ID="DetailsLabel" Runat="server"></asp:Label></strong>&nbsp;&nbsp;<asp:Label ID="ErrorDetails" Runat="server"></asp:Label></p>
		</div>
    </form>
</body>
</html>
