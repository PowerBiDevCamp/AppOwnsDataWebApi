using System.Collections.Generic;
using Microsoft.PowerBI.Api.Models;

namespace AppOwnsDataWebApi.Models {

  public class EmbeddedWorkspace {
    public string id;
    public string name;
    public bool isReadOnly;
  }

  public class EmbeddedReport {
    public string id;
    public string name;
    public string datasetId;
    public string embedUrl;
    public string webUrl;
  }

  public class EmbeddedDataset {
    public string id;
    public string name;
  }

  public class EmbeddedViewModel {
    public string currentWorkspaceId { get; set; }
    public string currentWorkspaceName { get; set; }
    public IList<Group> workspaces { get; set; }
    public IList<Report> reports { get; set; }
    public IList<Dataset> datasets { get; set; }
    public string embedToken { get; set; }
    public string user { get; set; }
  }
}
