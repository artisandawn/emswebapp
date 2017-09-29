<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_ReservationDetails" Codebehind="ReservationDetails.ascx.cs" %>
    <asp:DetailsView ID="Details" runat="server" AutoGenerateRows="false" Width="350px" GridLines="None"  >
        <Fields>
         <Dea:deaBoundField HeaderText="<%$ Resources:ScreenText, ReservationId %>" DataField="ReservationId" HeaderStyle-CssClass="bold"/>
           <Dea:deaBoundField HeaderTextParameterKeys="VEMS_EventTitleSingular" HeaderText="<%$Resources:ScreenText, EventName %>"
                DataField="EventName" HeaderStyle-CssClass="bold" HtmlEncode="false"  /> 
            <Dea:deaBoundField HeaderText="<%$ Resources:ScreenText, FirstBooking %>" DataField="FirstBooking"
                DataFormatString="{0:D}" HtmlEncode="false" HeaderStyle-CssClass="bold" />
            <Dea:deaBoundField HeaderText="<%$ Resources:ScreenText, LastBooking %>" DataField="LastBooking"
                DataFormatString="{0:D}" HtmlEncode="false" HeaderStyle-CssClass="bold" />           
          <Dea:deaBoundField HeaderText="<%$ Resources:ScreenText, TotalNumberBooking %>" DataField="TotalNumberOfBookings"
               HeaderStyle-CssClass="bold" />  
            
           <Dea:LabelOrLinkField  HeaderText="<%$Resources:ScreenText, Group %>" HeaderTextParameterKeys="GroupTitleSingular"
                    TextField="GroupName" LinkField="GroupURL" HeaderStyle-CssClass="bold" Target="_blank"  />
                
             <asp:TemplateField>
                <HeaderTemplate>
                    <Dea:Div ID="contactNameLabel" runat="server" Text='<%# Dea.Ems.Web.Sites.VirtualEms.WebUtilities.GetContactLabel(Eval("CourseId")) %>' CssClass="bold"  />
                </HeaderTemplate>
                <ItemTemplate>
                    <Dea:Div ID="cn" runat="server" Text='<%# Eval("ContactName") %>' />
                </ItemTemplate>
            </asp:TemplateField>
               <asp:TemplateField>
              <HeaderTemplate>
                    <dea:div ID="ContactPhoneLabel" runat="server" Text='<%# Dea.Ems.Web.Sites.VirtualEms.WebUtilities.GetLabelFromResource(Eval("PhoneLabel"), "PhoneLabel") %>' CssClass="bold" />
              </HeaderTemplate>
              <ItemTemplate><dea:div ID="ContactPhone" runat="server" Text='<%# Eval("ContactPhone") %>' /></ItemTemplate>
               </asp:TemplateField> 
                              <asp:TemplateField>
              <HeaderTemplate>
                    <dea:div ID="ContactFaxLabel" runat="server" Text='<%# Dea.Ems.Web.Sites.VirtualEms.WebUtilities.GetLabelFromResource(Eval("FaxLabel"), "FaxLabel") %>' CssClass="bold" />
              </HeaderTemplate>
              <ItemTemplate><dea:div ID="ContactFax" runat="server" Text='<%# Eval("ContactFax") %>' /></ItemTemplate>
               </asp:TemplateField> 
            <Dea:deaBoundField HeaderTextParameterKeys="FirstContactTitle" HeaderText="<%$Resources:ScreenText, ContactEmail %>"
                DataField="ContactEmail" HeaderStyle-CssClass="bold" HtmlEncode="false"  /> 
            <Dea:deaBoundField HeaderTextParameterKeys="VEMS_EventTitleSingular" HeaderText="<%$Resources:ScreenText, EventType %>"
                DataField="EventType" HeaderStyle-CssClass="bold" HtmlEncode="false" />
               <Dea:deaBoundField HeaderTextParameterKeys="EventCoordinatorTitle" HeaderText="<%$Resources:ScreenText, EventCoordinator %>"
                DataField="EventCoordinator" HeaderStyle-CssClass="bold" /> 
               <Dea:deaBoundField HeaderTextParameterKeys="SalespersonTitle" HeaderText="<%$Resources:ScreenText, SalesPerson %>"
                DataField="Salesperson" HeaderStyle-CssClass="bold" />  
                <Dea:LabelOrLinkField  HeaderText="<%$Resources:ScreenText, RegistrationUrl %>" 
                    TextField="RegistrationUrl" LinkField="RegistrationUrl" HeaderStyle-CssClass="bold"  Target="_blank"  />
        </Fields>
    </asp:DetailsView>
