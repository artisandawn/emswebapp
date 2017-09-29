<%@ WebHandler Language="C#" Class="UploadHandler" %>

using System;
using System.Data;
using System.Collections.Generic;
using System.Net.Mail;
using System.IO;
using System.Web;
using System.Web.SessionState;
using Dea.Ems.Configuration;
using Dea.Ems.Web.Sites.VirtualEms;
using Dea.Ems.Web.Sites.VirtualEms.Models;
using Dea.Ems.Web.Sites.VirtualEms.Security;
using Dea.Ems.Web.Sites.VirtualEms.Reservations;
using Newtonsoft.Json;

public class UploadHandler : IHttpHandler, IRequiresSessionState
{
    #region Properties
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    #endregion

    public void ProcessRequest(HttpContext context)
    {
        JsonResponse jsonResponse = new JsonResponse();
        try
        {
            long sizeLimit;
            string attachmentType = context.Request["attachmentType"];

            if (attachmentType == "2") //attendee PAM attachments
                sizeLimit = Dea.Ems.Configuration.EmsParameters.PamMaxAttachmentSize * 1000;
            else
            {
                if (System.Configuration.ConfigurationManager.AppSettings["MaximumUploadSizeInBytes"] != null)
                    sizeLimit = long.Parse(System.Configuration.ConfigurationManager.AppSettings["MaximumUploadSizeInBytes"]);
                else
                    sizeLimit = 4096000;
            }
            HttpPostedFile file = null;
            if (context.Request.Files.Count > 0)
            {
                file = context.Request.Files[0];

                if (file.ContentLength > sizeLimit)
                {
                    //context.Response.Write("0");
                    jsonResponse.ErrorMessage = "File is too big.";
                    jsonResponse.Success = false;
                    context.Response.Write(JsonConvert.SerializeObject(jsonResponse));
                    return;
                }
            }
            else
            {
                jsonResponse.ErrorMessage = "No files to upload.";
                jsonResponse.Success = false;
                context.Response.Write(JsonConvert.SerializeObject(jsonResponse));
                //context.Response.Write("0");
                return;
            }
            string templateId = context.Request["TemplateId"];
            //get process template
            var user =  BasePage.GetIdentityForStaticContext();
            var templateData = SecurityDatabase.GetProcessTemplateData(Convert.ToInt32(templateId), user);
            MakeReservationProcessTemplate wptRules = new MakeReservationProcessTemplate();
            wptRules.Load(templateData.Tables[0], templateData.Tables["Parameters"]);

            string extensions = wptRules.GetParameter(EmsParameters.Keys.AllowedAttachmentExtensions, EmsParameters.AllowedAttachmentsExtensions);

            string[] allowedExt = extensions.Split(',');
            string ext = file.FileName;
            bool safeExt = false;
            for (int j = 0; j < allowedExt.Length; j++)
            {
                if (ext.EndsWith(allowedExt[j], StringComparison.InvariantCultureIgnoreCase) && allowedExt[j].Length > 0)
                {
                    safeExt = true;
                    break;
                }
            }

            if (!safeExt)
            {
                jsonResponse.ErrorMessage = "This file type is not allowed.";
                jsonResponse.Success = false;
                context.Response.Write(JsonConvert.SerializeObject(jsonResponse));
                return;
            }

            string sessionKey = Dea.Ems.Web.Sites.VirtualEms.Constants.ApplicationAndSessionTokens.ReservationAttachments + templateId;
            if (attachmentType=="2")
                sessionKey = Dea.Ems.Web.Sites.VirtualEms.Constants.ApplicationAndSessionTokens.AttendeeAttachments + templateId;

            //we don't have a parent yet, they must be in the process of making a reservation
            if (context.Request["parentId"] == "-1" || attachmentType == "2")
            {
                Dictionary<string, Attachment> resAttachments;
                if (context.Session[sessionKey] == null)
                    resAttachments = new Dictionary<string, Attachment>();
                else
                    resAttachments = (Dictionary<string, Attachment>)context.Session[sessionKey];

                //hash the filename for uniqueness
                //string key = Dea.Security.PasswordHash.ComputeHash(file.FileName, System.Text.UTF8Encoding.UTF8.GetBytes("EMS"));
                if (resAttachments.ContainsKey(file.FileName))
                    resAttachments.Remove(file.FileName);

                resAttachments.Add(file.FileName, new Attachment(file.InputStream, file.FileName));

                context.Session[sessionKey] = resAttachments;

            }
            else
            {
                int parentId = Dea.Core.Utilities.GetInt(context.Request["parentId"]);
                int parentTypeId = Dea.Core.Utilities.GetInt(context.Request["parentTypeId"]);
                string auditName = context.Request["auditName"];
                byte[] fileData;
                using (System.IO.BinaryReader reader = new System.IO.BinaryReader(file.InputStream))
                {
                    fileData = reader.ReadBytes((int)file.InputStream.Length);
                    var description = (file.FileName.Length > 50) ? file.FileName.Substring(0, 50) : file.FileName;  // the db only allows 50 characters
                        
                    Dea.Ems.Web.Sites.VirtualEms.Reservations.ReservationsDatabase.AddAttachment(parentId, parentTypeId, file.FileName, fileData, description, auditName);
                }
                //send back the updated list
                DataSet ds = ReservationsDatabase.GetAttachments(parentId, -42);
                var reservationFiles = ServerApi.LoadAttachmentListFromDataTable(ds.Tables["Attachments"]);
                jsonResponse.JsonData = JsonConvert.SerializeObject(reservationFiles);
            }

            jsonResponse.Success = true;
            context.Response.Write(JsonConvert.SerializeObject(jsonResponse));
        }
        catch (Exception ex)
        {
            Dea.ExceptionHandling.ExceptionPrep.LogError(ex, "UploadHandler", "Error in Upload Handler");
            jsonResponse.ErrorMessage = "Error in Upload Handler.";
            jsonResponse.Success = false;
            context.Response.Write(JsonConvert.SerializeObject(jsonResponse));
            //context.Response.Write("0");
        }
    }


}