<%@ Page Language="C#" %>

<script runat="server">
    
    private static void addTimingMesage(System.Text.StringBuilder sb, string msg)
    {
        if (logTimings)
            sb.AppendFormat("{0}: {1}{2}", DateTime.Now, msg, Environment.NewLine);
    }

    private static void writeTimingMessageToFile(System.Text.StringBuilder sb)
    {
        System.Collections.Specialized.NameValueCollection addinfo = new System.Collections.Specialized.NameValueCollection();
        if (logTimings)
        {
            addinfo.Add("Timing Log", sb.ToString());
            Exception tolog = new Exception("No Error: just diagnostic timing");
            Dea.ExceptionHandling.ExceptionPrep.LogError(tolog, "Diagnostic timing", "Condeco Connector Diagnositcs", addinfo);
        }
    }

    private static bool logTimings
    {
        get
        {
            string s = System.Web.Configuration.WebConfigurationManager.AppSettings["LogTimings"];
            if (StringComparer.InvariantCultureIgnoreCase.Compare(s, "true") == 0)
                return true;
            else
                return false;
        }
    }
    
    private const int UNKNOWN_GROUP_ID = 5395;
    private const int STATUS_ID = 2;
    private const int BUMPED_STATUS_ID = 13;
    private const int EVENT_TYPE_ID = 4;
    private const int EVENT_TYPE_ID_ROOM = 4;
    private const int EVENT_TYPE_ID_DESK = 1;

    private const int RESERVATION_SOURCE = 4;
    private const int RESERVATION_SOURCE_ID = 12;
    private const int MEETING_ROOM_TYPE_ID = 7;

    private const string CONN_STRING = "deaConnection";
    private const string CONNECTOR_NAME = "Condeco Connector";
    private const string ERROR_CODE_SUCCESS = "100";
    private const string ERROR_CODE_GENERAL_ERROR = "300";
    private const string ERROR_CODE_SPECIFIC_ERROR = "400";
    private const string ERROR_CODE_ROOM_UNAVALABLE = "401";
    private const string ERROR_CODE_BAD_REQUEST = "402";

    private const string DATE_FORMAT = "yyyy'-'MM'-'dd'T'HH':'mm'Z'";

    private static class Nodes
    {
        public const string returnInfo = "ReturnInfo";
        public const string result = "Result";

        //system        
        public const string system = "System";
        public const string utcDateTime = "UTCDateTime";
        public const string connector = "ConnectorName";

        //return codes
        public const string returnCode = "ReturnCode";
        public const string DebugInformation = "DebugInformation";
        public const string code = "Code";
        public const string error = "Error";

        //Booking 
        public const string bookings = "Bookings";
        public const string booking = "Booking";
        public const string resourceId = "ResourceId";
        public const string bookingId = "BookingId";
        public const string title = "Title";
        public const string startDateTime = "StartDateTime";
        public const string endDateTime = "EndDateTime";
        public const string host = "Host";
        public const string hostEmail = "HostEmail";
        public const string bookedBy = "BookedBy";
        public const string hostPhone = "HostPhone";
        public const string started = "Started";
        public const string udf = "Udf";

        public const string resourceAvailability = "ResourceAvailability";
        public const string freeBusy = "FreeBusy";
        
    }


    private bool _haveErrored = false;
    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

        StringBuilder diag = new StringBuilder();
        addTimingMesage(diag, "Enter Page Load");
      
        
        System.Text.StringBuilder sb = new StringBuilder();
        System.IO.StringWriter w = new System.IO.StringWriter(sb, System.Globalization.CultureInfo.InvariantCulture);
        System.Xml.XmlTextWriter writer = new System.Xml.XmlTextWriter(w);
        writer.WriteRaw("<?xml version=\"1.0\" encoding=\"utf-8\" ?>");
        writer.WriteStartElement(Nodes.result);
        writeSystem(writer);

        string instruction = Request["instruction"];

        instruction = instruction == null ? String.Empty : instruction.ToLowerInvariant();
        addTimingMesage(diag, "Instruction:" + instruction);
        switch (instruction)
        {
            case "getbookingsforaday":
                getBookingsForADate(writer, diag);
                break;
            case "getbookingbybookingid":
                getBookingById(writer, diag);
                break;
            case "savebooking":
                saveBooking(writer, diag);
                break;
            case "startbooking":
                startBooking(writer, diag);
                break;
            case "endbooking":
                endBooking(writer, diag);
                break;
            case "extendbooking":
                extendBooking(writer, diag);
                break;
            case "checkfreebusy":
                checkFreeBusy(writer, diag);
                break;
            default:
                writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "Bad Instruction");
                break;
        }

        writer.WriteEndElement();
        writer.Flush();
        writer.Close();

        Response.Write(sb.ToString());
        addTimingMesage(diag, "Exit Final");
        writeTimingMessageToFile(diag);
    }

    private void writeSystem(System.Xml.XmlTextWriter writer)
    {
        writer.WriteStartElement(Nodes.system);
        writeNode(writer, Nodes.utcDateTime, System.DateTime.UtcNow.ToString(DATE_FORMAT));
        writeNode(writer, Nodes.connector, CONNECTOR_NAME);
        writer.WriteEndElement();
    }

    private void writeReturnCode(System.Xml.XmlTextWriter writer, string code, string error, string debug)
    {
        if (!_haveErrored)
        {
            _haveErrored = true;
            writer.WriteStartElement(Nodes.returnCode);
            writeNode(writer, Nodes.code, code);
            writeNode(writer, Nodes.error, error);
            writeNode(writer, Nodes.DebugInformation, debug);
            writer.WriteEndElement();
        }
    }

    private void getBookingsForADate(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter getBookingsForADate");
        int roomId;
        if (!int.TryParse(Request["ResourceId"], out roomId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST,  ERROR_CODE_BAD_REQUEST, "ResourceId not a number");
            addTimingMesage(diag, "Exit getBookingsForADate");
            return;
        }

        DateTime forDate;
        if (!DateTime.TryParse(Request["Date"], out forDate))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "Date not valid");
            addTimingMesage(diag, "Exit getBookingsForADate");
            return;
        }

        if (forDate != DateTime.MinValue)
        {
            try
            {
                System.Data.DataSet ds = null;
                using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_GetBookingsForADate"))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@RoomId", roomId));
                    cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@ForDate", forDate));
                    cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@MeetingRoomTypeId", MEETING_ROOM_TYPE_ID));
                    
                    ds = ExecuteCommand(cmd);
                }
                addBookingNodes(writer, ds.Tables[0], forDate);
            }
            catch (Exception errorBuildingResult)
            {
                writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, errorBuildingResult.ToString());
                addTimingMesage(diag, "Exit getBookingsForADate");
                return;
            }
            writeSuccess(writer);
        }
        addTimingMesage(diag, "Exit getBookingsForADate");
    }

    private void getBookingById(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter getBookingById");
        
        int bookingId;
        if (!int.TryParse(Request["bookingId"], out bookingId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "bookingId not a number");
            addTimingMesage(diag, "Exit getBookingById");
            return;
        }

        try
        {
            System.Data.DataSet ds = null;
            using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_GetBookingById"))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@BookingId", bookingId));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@MeetingRoomTypeId", MEETING_ROOM_TYPE_ID));
                ds = ExecuteCommand(cmd);
                addBookingNodes(writer, ds.Tables[0], DateTime.MinValue);
            }
            writeSuccess(writer);
        }
        catch (Exception errorBuildingResult)
        {
            writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, errorBuildingResult.ToString());
        }
        addTimingMesage(diag, "exit getBookingById");
    }

    private void checkFreeBusy(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter checkFreeBusy");
        
        int roomId;
        if (!int.TryParse(Request["ResourceId"], out roomId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "ResourceId not a number");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        DateTime startDate;
        
        if(!DateTime.TryParse(Request["DateTimeFrom"], out startDate))
        {        
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeFrom not valid");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        DateTime endDate;
        if(!DateTime.TryParse(Request["DateTimeTo"], out endDate))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeTo not valid");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        int interval;
        if (!int.TryParse(Request["TimeSlot"], out interval))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "TimeSlot not a number");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        if (interval <= 0)
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "TimeSlot must be greater than 0");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        if (startDate >= endDate)
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeFrom must be before DateTimeTo");
            addTimingMesage(diag, "exit checkFreeBusy");
            return;
        }

        DateTime gmtStart = startDate.ToUniversalTime();
        DateTime gmtEnd = endDate.ToUniversalTime();
        
        System.Data.DataSet ds = null;
        using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_DataForAvailabilityCheck"))
        {
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@RoomId", roomId));
            cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@StartDate", gmtStart));
            cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@EndDate", gmtEnd));
            ds = ExecuteCommand(cmd);
        }

        System.Data.DataView dv = ds.Tables[0].DefaultView;
        System.Text.StringBuilder sb = new StringBuilder();
        while (gmtStart <= gmtEnd)
        {
            dv.RowFilter = "'" + gmtStart.ToString() + "' >= GMTStartTime AND " + "'" + gmtStart.ToString() + "' <= GMTEndTime";
            if (dv.Count > 0)
                sb.Append("1");
            else
                sb.Append("0");

            gmtStart = gmtStart.AddMinutes(interval);
        }

        writer.WriteStartElement(Nodes.resourceAvailability);
        writeNode(writer, Nodes.resourceId, roomId.ToString(System.Globalization.CultureInfo.InvariantCulture));
        writeNode(writer, Nodes.freeBusy, sb.ToString());
        writer.WriteEndElement();

        writeSuccess(writer);
        addTimingMesage(diag, "exit checkFreeBusy");
        
    }
    
    private void writeSuccess(System.Xml.XmlTextWriter writer)
    {
        writeReturnCode(writer, ERROR_CODE_SUCCESS, "0", String.Empty);
    }


    private void saveBooking(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter saveBooking");
        
        DateTime bookingStart;
        DateTime bookingEnd;
        int roomId;
        string groupName = Request["host"];
        string groupEmail = Request["hostemail"];
        string eventName = Request["title"];
        string phone = Request["phone"];
        string auditName = Request["trackuser"];
        string resourceType = Request["resourcetype"];
        int resourceTypeId = EVENT_TYPE_ID_ROOM;

        if (!int.TryParse(Request["resourceID"], out roomId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "resourceID not a number");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if(!DateTime.TryParse(Request["DateTimeFrom"], out bookingStart))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeFrom not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if (!DateTime.TryParse(Request["DateTimeTo"], out bookingEnd))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeTo not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if (String.IsNullOrEmpty(groupName))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "host not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }
        if (String.IsNullOrEmpty(groupEmail))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "host email not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }
        if (String.IsNullOrEmpty(eventName))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "title not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }
        if (String.IsNullOrEmpty(phone))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "phone not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }
        if (String.IsNullOrEmpty(auditName))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "trackuser not valid");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if (bookingEnd <= bookingStart)
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeTo must be after DateTimeFrom");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if (bookingEnd.Subtract(bookingStart).TotalMinutes > 1440)
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "Event must be 24 hours or less");
            addTimingMesage(diag, "exit saveBooking");
            return;
        }

        if (resourceType == "DESK")
            resourceTypeId = EVENT_TYPE_ID_DESK;

        try
        {
            System.Data.DataSet ds;
            using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_SaveBooking"))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@GmtStart", bookingStart.ToUniversalTime()));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@GmtEnd", bookingEnd.ToUniversalTime()));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@RoomId", roomId));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@GroupName", groupName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@GroupEmail", groupEmail));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@Phone", phone));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@EventName", eventName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@AuditName", auditName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@StatusID", STATUS_ID));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@UnknownGroupID", UNKNOWN_GROUP_ID));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@EventTypeID", System.Data.SqlDbType.Int));
                cmd.Parameters["@EventTypeId"].Value = resourceTypeId;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@ReservationSource", RESERVATION_SOURCE));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@ReservationSourceID", System.Data.SqlDbType.Int));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@MeetingRoomTypeId", MEETING_ROOM_TYPE_ID));
                cmd.Parameters["@ReservationSourceID"].Value = RESERVATION_SOURCE_ID;

                ds = ExecuteCommand(cmd);
            }

            if (ds.Tables.Count == 6)
            {
                addBookingNodes(writer, ds.Tables[5], DateTime.MinValue);
                writeSuccess(writer);
            }
            else
            {
                writeNode(writer, Nodes.bookings, String.Empty);
                writeReturnCode(writer, ERROR_CODE_ROOM_UNAVALABLE, ERROR_CODE_ROOM_UNAVALABLE, "Room Unavailable");
            }
        }
        catch (Exception error)
        {
            writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, error.ToString());
        }
        addTimingMesage(diag, "exit saveBooking");
    }

    private void addBookingNodes(System.Xml.XmlTextWriter writer, System.Data.DataTable dt, DateTime forDate)
    {
        writer.WriteStartElement(Nodes.returnInfo);
        writer.WriteStartElement(Nodes.bookings);
        foreach (System.Data.DataRow row in dt.Rows)
        {
            // Seems like a lot of work here, but this is done here for performance reasons.  Trying to do this in the database
            // will result in a lot heavier load on the database.
            DateTime eventStart = Convert.ToDateTime(row["TimeEventStart"], System.Globalization.CultureInfo.InvariantCulture);
            DateTime eventEnd = Convert.ToDateTime(row["TimeEventEnd"], System.Globalization.CultureInfo.InvariantCulture);
            DateTime bookingStart = Convert.ToDateTime(row["TimeBookingStart"], System.Globalization.CultureInfo.InvariantCulture);
            DateTime bookingEnd = Convert.ToDateTime(row["TimeBookingEnd"], System.Globalization.CultureInfo.InvariantCulture);
            DateTime gmtBookingStart = Convert.ToDateTime(row["GMTStartTime"], System.Globalization.CultureInfo.InvariantCulture);
            DateTime gmtBookingEnd = Convert.ToDateTime(row["GMTEndTime"], System.Globalization.CultureInfo.InvariantCulture);
            double setupMinutes = bookingStart.Subtract(eventStart).TotalMinutes;
            double tearDownMinutes = bookingEnd.Subtract(eventEnd).TotalMinutes;

            DateTime eventGmtStart = gmtBookingStart; //.AddMinutes(-1 * setupMinutes);
            DateTime eventGmtEnd = gmtBookingEnd; //.Subtract(TimeSpan.FromMinutes(tearDownMinutes));

            DateTime searchEndDate = forDate.AddMinutes(1439);

            if (forDate == DateTime.MinValue || (eventStart > forDate && eventStart < searchEndDate)
                || (eventEnd > forDate && eventEnd < searchEndDate))
            {
                writer.WriteStartElement(Nodes.booking);
                writeNode(writer, Nodes.resourceId, row["RoomId"].ToString());
                writeNode(writer, Nodes.bookingId, row["Id"].ToString());
                writeNode(writer, Nodes.title, row["EventName"].ToString());
                writeNode(writer, Nodes.startDateTime, eventGmtStart.ToString(DATE_FORMAT));
                writeNode(writer, Nodes.endDateTime, eventGmtEnd.ToString(DATE_FORMAT));
                writeNode(writer, Nodes.host, row["GroupName"].ToString());
                writeNode(writer, Nodes.hostEmail, row["HostEmail"].ToString());
                writeNode(writer, Nodes.bookedBy, row["EMailAddress"].ToString());
                writeNode(writer, Nodes.hostPhone, row["Phone"].ToString());
                writeNode(writer, Nodes.started, row["IsStarted"].ToString());
                writeNode(writer, Nodes.udf, String.Empty);
                writer.WriteEndElement();
            }
        }
        writer.WriteEndElement();
        writer.WriteEndElement();
    }

    private void startBooking(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter startBooking");
        
        int bookingId;
        if (!int.TryParse(Request["bookingId"], out bookingId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "bookingId not a number");
            addTimingMesage(diag, "Exit startBooking");
            return;
        }

        string auditName = Request["trackuser"];
        if (String.IsNullOrEmpty(auditName))
        {
            //writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "trackuser not valid");
            //return;
            auditName = "digital.signage@ey.com";
        }

        try
        {
            System.Data.DataSet ds = null;
            using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_AddCheckinRecord"))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@BookingId", bookingId));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@AuditName", auditName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@MeetingRoomTypeId", MEETING_ROOM_TYPE_ID));
                ds = ExecuteCommand(cmd);

                int success = Convert.ToInt32(ds.Tables[0].Rows[0]["Success"]);
                if (success == 0)
                {
                    writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, ds.Tables[0].Rows[0]["FailReason"].ToString());
                    addTimingMesage(diag, "Exit startBooking");
                    return;
                }
                else if (success == -1)
                {
                    writeReturnCode(writer, ERROR_CODE_ROOM_UNAVALABLE, ERROR_CODE_ROOM_UNAVALABLE, ds.Tables[0].Rows[0]["FailReason"].ToString());
                    addTimingMesage(diag, "Exit startBooking");
                    return;
                }
                else
                {
                    addBookingNodes(writer, ds.Tables[1], DateTime.MinValue);
                }
            }
            writeSuccess(writer);
        }
        catch (Exception errorBuildingResult)
        {
            writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, errorBuildingResult.ToString());
        }
        addTimingMesage(diag, "Exit startBooking");
    }

    private void endBooking(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter endBooking");
        int bookingId;
        if (!int.TryParse(Request["bookingId"], out bookingId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "bookingId not a number");
            addTimingMesage(diag, "Exit endBooking");
            return;
        }

        string auditName = Request["trackuser"];
        if (String.IsNullOrEmpty(auditName))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "trackuser not valid");
            addTimingMesage(diag, "Exit endBooking");
            return;
        }

        bool isBumped = false;
        bool.TryParse(Request["IsBumped"], out isBumped);
        
        try
        {
            System.Data.DataSet ds = null;
            using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_EndBooking"))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@BookingId", bookingId));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@AuditName", auditName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@IsBumped", isBumped));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@StatusId", BUMPED_STATUS_ID));
                ds = ExecuteCommand(cmd);

                if (Convert.ToInt32(ds.Tables[0].Rows[0]["Success"]) == 0)
                {
                    writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, ds.Tables[0].Rows[0]["FailReason"].ToString());
                    addTimingMesage(diag, "Exit endBooking");
                    return;
                }
                else
                {
                    writeNode(writer, Nodes.returnInfo, String.Empty);
                }
            }
            writeSuccess(writer);
        }
        catch (Exception errorBuildingResult)
        {
            writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, errorBuildingResult.ToString());
        }
        addTimingMesage(diag, "Exit endBooking");
    }

    private void extendBooking(System.Xml.XmlTextWriter writer, StringBuilder diag)
    {
        addTimingMesage(diag, "Enter extendBooking");
        int bookingId;
        DateTime bookingEnd;
        if (!int.TryParse(Request["bookingId"], out bookingId))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "bookingId not a number");
            addTimingMesage(diag, "Exit extendBooking");
            return;
        }

        if (!DateTime.TryParse(Request["DateTimeTo"], out bookingEnd))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "DateTimeTo not valid");
            addTimingMesage(diag, "Exit extendBooking");
            return;
        }

        string auditName = Request["trackuser"];
        if (String.IsNullOrEmpty(auditName))
        {
            writeReturnCode(writer, ERROR_CODE_BAD_REQUEST, ERROR_CODE_BAD_REQUEST, "trackuser not valid");
            addTimingMesage(diag, "Exit extendBooking");
            return;
        }

        try
        {
            System.Data.DataSet ds = null;
            using (System.Data.SqlClient.SqlCommand cmd = new System.Data.SqlClient.SqlCommand("dbo.condeco_ExtendBooking"))
            {
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@BookingId", bookingId));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@NewEventGmtEndTime", bookingEnd.ToUniversalTime()));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@AuditName", auditName));
                cmd.Parameters.Add(new System.Data.SqlClient.SqlParameter("@MeetingRoomTypeId", MEETING_ROOM_TYPE_ID));
                ds = ExecuteCommand(cmd);

                int success = Convert.ToInt32(ds.Tables[0].Rows[0]["Success"]);
                if (success == 0)
                {
                    writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, ds.Tables[0].Rows[0]["FailReason"].ToString());
                    addTimingMesage(diag, "Exit extendBooking");
                    return;
                }
                else if (success == -1)
                {
                    writeReturnCode(writer, ERROR_CODE_ROOM_UNAVALABLE, ERROR_CODE_ROOM_UNAVALABLE, ds.Tables[0].Rows[0]["FailReason"].ToString());
                    addTimingMesage(diag, "Exit extendBooking");
                    return;
                }
                else
                {
                    addBookingNodes(writer, ds.Tables[1], DateTime.MinValue);
                }
            }
            writeSuccess(writer);
        }
        catch (Exception errorBuildingResult)
        {
            writeReturnCode(writer, ERROR_CODE_SPECIFIC_ERROR, ERROR_CODE_SPECIFIC_ERROR, errorBuildingResult.ToString());
        }
        addTimingMesage(diag, "Exit extendBooking");

    }

    private System.Data.DataSet ExecuteCommand(System.Data.SqlClient.SqlCommand cmd)
    {
        System.Data.DataSet ds = new System.Data.DataSet();
        using (System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(connectionString))
        {
            cmd.Connection = conn;
            using (System.Data.SqlClient.SqlDataAdapter da = new System.Data.SqlClient.SqlDataAdapter())
            {
                da.SelectCommand = cmd;
                da.Fill(ds);
                return ds;
            }
        }
    }

    private string connectionString
    {
        get
        {
            ConnectionStringSettings css = System.Configuration.ConfigurationManager.ConnectionStrings[CONN_STRING];
            string cs = css.ConnectionString;
            if (cs.IndexOf("Trusted_Connection=True", StringComparison.CurrentCultureIgnoreCase) < 0
                && cs.IndexOf("Integrated Security", StringComparison.CurrentCultureIgnoreCase) < 0)
            {
                if (!cs.EndsWith(";"))
                {
                    cs += ";";
                }
                cs += "User Id=EMS_User;Password=p3CTU9i8";
            }
            return cs;
        }
    }


    private void writeNode(System.Xml.XmlTextWriter writer, string nodeName, string text)
    {
        writer.WriteStartElement(nodeName);
        writer.WriteString(text);
        writer.WriteEndElement();

    }
  

    
    
</script>
