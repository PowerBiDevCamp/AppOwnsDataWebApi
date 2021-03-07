
export class Workspace {
  id: string;
  name: string;
  isReadOnly: boolean;
}

export class Report {
  id: string;
  name: string;
  datasetId: string;
  embedUrl: string;
  webUrl: string;
}

export class Dataset {
  id: string;
  name: string;
}

export class ViewModel {
  currentWorkspaceName: string;
  currentWorkspaceId: string;
  currentWorkspaceIsReadOnly: boolean;
  workspaces: Workspace[];
  reports: Report[];
  datasets: Dataset[];
  embedToken: string;
  user: string
}

export class ActivityLogEntry {
  CorrelationId: string ;
  UserId: string;
  Activity: string;
  Workspace: string;
  WorkspaceId: string;
  Dataset: string;
  DatasetId: string;
  Report: string;
  ReportId: string;
  OriginalReportId: string;
  LoadDuration: number;
  RenderDuration: number;
}

export class User {
  UserId: string;
  UserName: string;
}