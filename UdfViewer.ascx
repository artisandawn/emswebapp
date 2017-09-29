<%@ Control Language="C#" AutoEventWireup="true" Inherits="UdfViewer" Codebehind="UdfViewer.ascx.cs" %>

<asp:Repeater ID="udqRepeater" runat="server" OnItemDataBound="BindAnswers" >
    <HeaderTemplate>
        <ul class="questions">
    </HeaderTemplate>
    <ItemTemplate>
        <li class="question">
            <asp:Literal ID="questionLabel" runat="server" Text='<%# Eval("Prompt") %>' />
             <asp:Repeater ID="udqAnswerRepeater" runat="server">
                <HeaderTemplate>
                    <ul class="answers">
                </HeaderTemplate>
                <ItemTemplate>
                    <li class="answer"><asp:Literal ID="answerLabel" runat="server" Text='<%# FormatLineBreaks(Eval("FieldValue")) %>' /></li>
                </ItemTemplate>
                <FooterTemplate>
                    </ul>
                </FooterTemplate>
             </asp:Repeater>
        </li>
    </ItemTemplate>
    <FooterTemplate>
    </ul>
    </FooterTemplate>
</asp:Repeater>