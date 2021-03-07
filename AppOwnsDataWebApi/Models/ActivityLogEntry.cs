using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppOwnsDataWebApi.Models {
  public class ActivityLogEntry {
    public int Id { get; set; }
    public string CorrelationId { get; set; }
    public string UserId { get; set; }
    public string Activity { get; set; }
    public string Workspace { get; set; }
    public string WorkspaceId { get; set; }
    public string Dataset { get; set; }
    public string DatasetId { get; set; }
    public string Report { get; set; }
    public string ReportId { get; set; }
    public string OriginalReportId { get; set; }
    public int? LoadDuration { get; set; }
    public int? RenderDuration { get; set; }
    public DateTime Created { get; set; }
  }
}