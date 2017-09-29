<%@ Page Language="C#" AutoEventWireup="true" Inherits="PortalAuth" Codebehind="PortalAuth.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<script runat="server">
    
        /// <summary>
        /// Add your logic here to validate the call came from portal auth and should proceed
        /// </summary>
        /// <returns>Return true for portal authentication to be performed, otherwise return false</returns>
        public override bool ValidateFromPortal()
        {
            return base.ValidateFromPortal();
        }

        /// <summary>
        /// Send the user to the home page if everything is ok, otherwise send then to the error page
        /// </summary>
        /// <param name="e"></param>
        protected override void OnPreRender(EventArgs e)
        {
            if (ValidateFromPortal())
            {
                if (base.WebUser.IsAuthenticated)
                {
                    Dea.Web.Core.Utilities.RedirectUser(Dea.Web.Core.Constants.Pages.Default);
                }
                else
                {
                    if (System.Configuration.ConfigurationManager.AppSettings["samlErrorOrGuest"] == "Error")
                        Dea.Web.Core.Utilities.RedirectToExpectedError("SamlValidUnknownUser");
                    else
                        Dea.Web.Core.Utilities.RedirectUser(Dea.Web.Core.Constants.Pages.Default);
                }
            }
            else
            {
                Dea.Web.Core.Utilities.RedirectToExpectedError("PortalValidationFailed");
            }
        }
    
    </script>