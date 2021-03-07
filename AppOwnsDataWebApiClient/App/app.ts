import 'bootstrap';

import * as $ from 'jquery';

import * as powerbi from "powerbi-client";
import * as pbimodels from "powerbi-models";

require('powerbi-models');
require('powerbi-client');

import SpaAuthService from './services/SpaAuthService';
import AppOwnsDataWebApi from './services/AppOwnsDataWebApi'

import { Workspace, Report, Dataset, ViewModel, ActivityLogEntry } from './models/models';

export class App {

  // fields for UI elemenets in DOM
  private static userGreeting: JQuery;
  private static login: JQuery;
  private static logout: JQuery;
  private static viewAnonymous: JQuery;
  private static viewAuthenticated: JQuery;
  private static loadingSpinner: JQuery;
  private static embeddingInstructions: JQuery;
  private static embedToolbar: JQuery;
  private static embedContainer: HTMLElement;

  private static powerbi: powerbi.service.Service = window.powerbi;
  private static viewModel: ViewModel;

  public static onDocumentReady = () => {

    // initialize fields for UI elemenets 
    App.userGreeting = $("#user-greeting");
    App.login = $("#login");
    App.logout = $("#logout");
    App.viewAnonymous = $("#view-anonymous");
    App.viewAuthenticated = $("#view-authenticated");
    App.loadingSpinner = $("#loading-spinner-row");
    App.embeddingInstructions = $("#embedding-instructions");
    App.embedToolbar = $("#embed-toolbar");
    App.embedContainer = document.getElementById('embed-container');

    // set up authentication callback
    SpaAuthService.uiUpdateCallback = App.onAuthenticationCompleted;

    App.login.on("click", async () => {
      await SpaAuthService.login();
    });

    App.logout.on("click", () => {
      SpaAuthService.logout();
      App.refreshUi();
    });

    // Uncomment to enable auto-authentication on startup
    // SpaAuthService.attemptSillentLogin();

    App.refreshUi();
  }

  private static refreshUi = () => {

    if (SpaAuthService.userIsAuthenticated) {
      App.userGreeting.text("Welcome " + SpaAuthService.userDisplayName);
      App.login.hide()
      App.logout.show();
      App.viewAnonymous.hide();
    }
    else {
      App.userGreeting.text("");
      App.login.show();
      App.logout.hide();
      App.viewAnonymous.show();
      App.viewAuthenticated.hide();
    }
  }

  private static onAuthenticationCompleted = async () => {
    await AppOwnsDataWebApi.LoginUser(SpaAuthService.userName, SpaAuthService.userDisplayName);
    App.refreshUi();
    App.initializeAppData();
  }

  private static initializeAppData = async () => {
    App.loadingSpinner.show();
    App.viewModel = await AppOwnsDataWebApi.GetEmbeddingData();
    App.loadViewModel(App.viewModel);
  }

  private static loadViewModel = (viewModel: ViewModel, reportId?: string) => {

    App.embedToolbar.hide();
    App.viewAuthenticated.hide();

    App.powerbi.reset(App.embedContainer);

    var workspaceSelector: JQuery = $("#workspace-selector");
    var workspacesList: JQuery = $("#workspaces-list").empty();
    var reportsList: JQuery = $("#reports-list").empty();
    var datasetsList: JQuery = $("#datasets-list").empty();

    workspaceSelector.text(viewModel.currentWorkspaceName);

    viewModel.workspaces.forEach((workspace: Workspace) => {
      var link = $("<a>", { "href": "javascript:void(0)" })
        .text(workspace.name)
        .addClass("dropdown-item")
        .click(async () => {
          App.viewAuthenticated.hide();
          App.loadingSpinner.show();
          App.viewModel = await AppOwnsDataWebApi.GetEmbeddingData(workspace.id);
          App.loadViewModel(App.viewModel);
        });
      workspacesList.append(link);
    });

    if (viewModel.reports.length == 0) {
      reportsList.append($("<li>")
        .text("no reports in workspace")
        .addClass("no-content"));
    }
    else {
      viewModel.reports.forEach((report: Report) => {
        var li = $("<li>");
        li.append($("<i>").addClass("fa fa-bar-chart"));
        li.append($("<a>", {
          "href": "javascript:void(0);"
        }).text(report.name).click(() => { App.embedReport(report) }));
        reportsList.append(li);
      });
    }

    if (viewModel.datasets.length == 0) {
      datasetsList.append($("<li>")
        .text("no datasets in workspace")
        .addClass("no-content"));
    }
    else {
      viewModel.datasets.forEach((dataset: Dataset) => {
        var li = $("<li>");
        li.append($("<i>").addClass("fa fa-database"));
        li.append($("<a>", {
          "href": "javascript:void(0);"
        }).text(dataset.name).click(() => { App.embedNewReport(dataset) }));
        datasetsList.append(li);
      });
    }

    App.viewAuthenticated.show("fast");
    App.loadingSpinner.hide();

    if (reportId !== undefined) {
      var newReport: Report = viewModel.reports.find((report) => report.id === reportId);
      App.embedReport(newReport, true);
    }
    else {
      App.embeddingInstructions.show("slow");
    }

  }

  private static embedReport = async (report: Report, editMode: boolean = false) => {

    $("#embedding-instructions").hide();

    var models = pbimodels;

    var config: powerbi.IEmbedConfiguration = {
      type: 'report',
      id: report.id,
      embedUrl: report.embedUrl,
      accessToken: App.viewModel.embedToken,
      tokenType: models.TokenType.Embed,
      permissions: models.Permissions.All,
      viewMode: editMode ? models.ViewMode.Edit : models.ViewMode.View,
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: true }
        }
      }
    };

    App.powerbi.reset(App.embedContainer);

    var timerStart: number = Date.now();
    var initialLoadComplete: boolean = false;
    var loadDuration: number;
    var renderDuration: number;

    var embeddedReport: powerbi.Report = <powerbi.Report>App.powerbi.embed(App.embedContainer, config);

    embeddedReport.on("loaded", async (event: any) => {
      loadDuration = Date.now() - timerStart;
    });

    embeddedReport.on("rendered", async (event: any) => {
      if (!initialLoadComplete) {
        renderDuration = Date.now() - timerStart;
        var correlationId: string = await embeddedReport.getCorrelationId();
        await App.logViewReportActivity(correlationId, report, loadDuration, renderDuration);
        initialLoadComplete = true;
      }

      console.log("rendered", event);
    });

    embeddedReport.on("saved", async (event: any) => {
      if (event.detail.saveAs) {
        console.log("SaveAs Event", event);
        var orginalReportId = report.id;
        var reportId: string = event.detail.reportObjectId;
        var reportName: string = event.detail.reportName;
        await App.logCopyReportActivity(report, reportId, reportName);
        App.viewModel = await AppOwnsDataWebApi.GetEmbeddingData(App.viewModel.currentWorkspaceId);
        App.loadViewModel(App.viewModel, reportId);
      }
      else {
        console.log("Save Event", event);
        await App.logEditReportActivity(report);
      }
    });

    var viewMode = editMode ? "edit" : "view";

    $("#breadcrumb").text("Reports > " + report.name);
    $("#embed-toolbar").show();

    if (App.viewModel.currentWorkspaceIsReadOnly) {
      $("#toggle-edit").hide();
    }
    else {
      $("#toggle-edit").show();
      $("#toggle-edit").off("click");
      $("#toggle-edit").on("click", () => {
        // toggle between view and edit mode
        viewMode = (viewMode == "view") ? "edit" : "view";
        embeddedReport.switchMode(viewMode);
        // show filter pane when entering edit mode
        var showFilterPane = (viewMode == "edit");
        embeddedReport.updateSettings({
          panes: {
            filters: { visible: showFilterPane, expanded: false }
          }
        });
      });

      $("#full-screen").off("click");
      $("#full-screen").on("click", () => {
        embeddedReport.fullscreen();
      });
    };
  }

  private static embedNewReport = (dataset: Dataset) => {

    App.embeddingInstructions.hide();

    var models = pbimodels;

    var config: powerbi.IEmbedConfiguration = {
      datasetId: dataset.id,
      embedUrl: "https://app.powerbi.com/reportEmbed",
      accessToken: App.viewModel.embedToken,
      tokenType: models.TokenType.Embed,
      settings: {
        panes: {
          filters: { visible: true, expanded: false }
        }
      }
    };


    // Embed the report and display it within the div container.
    App.powerbi.reset(App.embedContainer);
    var embeddedReport = App.powerbi.createReport(App.embedContainer, config);

    $("#breadcrumb").text("Datasets > " + dataset.name + " > New Report");
    $("#embed-toolbar").show();

    $("#toggle-edit").hide();
    $("#full-screen").off("click");
    $("#full-screen").on("click", () => {
      embeddedReport.fullscreen();
    });

    // handle save action on new report
    embeddedReport.on("saved", async (event: any) => {
      console.log("Create Report Event", event);
      var reportId: string = event.detail.reportObjectId;
      var reportName: string = event.detail.reportName;
      await App.logCreateReportActivity(dataset, reportId, reportName);
      App.viewModel = await AppOwnsDataWebApi.GetEmbeddingData(App.viewModel.currentWorkspaceId);
      App.loadViewModel(App.viewModel, reportId);
    });

  };

  private static logViewReportActivity = async (correlationId: string, report: Report, loadDuration: number, renderDuration) => {
    var logEntry: ActivityLogEntry = new ActivityLogEntry();
    logEntry.CorrelationId = correlationId;
    logEntry.Activity = "ViewReport";
    logEntry.UserId= App.viewModel.user;
    logEntry.Workspace = App.viewModel.currentWorkspaceName;
    logEntry.WorkspaceId = App.viewModel.currentWorkspaceId;
    logEntry.Report = report.name;
    logEntry.ReportId= report.id;
    logEntry.DatasetId = report.datasetId;
    logEntry.Dataset = (App.viewModel.datasets.find((dataset) => dataset.id === report.datasetId)).name; 
    logEntry.LoadDuration = loadDuration;
    logEntry.RenderDuration = renderDuration;
    await AppOwnsDataWebApi.LogActivity(logEntry);    
  };

  private static logEditReportActivity = async (report: Report) => {
    var logEntry: ActivityLogEntry = new ActivityLogEntry();
    logEntry.CorrelationId = "";
    logEntry.Activity = "EditReport";
    logEntry.UserId= App.viewModel.user;
    logEntry.Workspace = App.viewModel.currentWorkspaceName;
    logEntry.WorkspaceId = App.viewModel.currentWorkspaceId;
    logEntry.Report = report.name;
    logEntry.ReportId = report.id;
    logEntry.DatasetId = report.datasetId;
    logEntry.Dataset = (App.viewModel.datasets.find((dataset) => dataset.id === report.datasetId)).name;
    await AppOwnsDataWebApi.LogActivity(logEntry);
  };

  private static logCopyReportActivity = async(orginalReport: Report, reportId: string, reportName) => {
    var logEntry: ActivityLogEntry = new ActivityLogEntry();
    logEntry.Activity = "CopyReport";
    logEntry.UserId = App.viewModel.user;
    logEntry.Workspace = App.viewModel.currentWorkspaceName;
    logEntry.WorkspaceId = App.viewModel.currentWorkspaceId;
    logEntry.Report = reportName;
    logEntry.ReportId = reportId;
    logEntry.OriginalReportId = orginalReport.id;
    logEntry.DatasetId = orginalReport.datasetId;
    logEntry.Dataset = (App.viewModel.datasets.find((dataset) => dataset.id === orginalReport.datasetId)).name;
    await AppOwnsDataWebApi.LogActivity(logEntry);
  };

  private static logCreateReportActivity = async (dataset: Dataset, reportId: string, reportName) => {
    var logEntry: ActivityLogEntry = new ActivityLogEntry();
    logEntry.Activity = "CreateReport";
    logEntry.UserId = App.viewModel.user;
    logEntry.Workspace = App.viewModel.currentWorkspaceName;
    logEntry.WorkspaceId = App.viewModel.currentWorkspaceId;
    logEntry.Report = reportName;
    logEntry.ReportId = reportId;
    logEntry.DatasetId = dataset.id;
    logEntry.Dataset = dataset.name;
    await AppOwnsDataWebApi.LogActivity(logEntry);
  };

}

$(App.onDocumentReady);
