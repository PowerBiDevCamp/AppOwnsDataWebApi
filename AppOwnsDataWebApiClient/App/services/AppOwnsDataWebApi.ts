import * as $ from 'jquery';
import { ViewModel, ActivityLogEntry, User} from '../models/models';

import AppSettings from '../appSettings';
import SpaAuthService from './SpaAuthService';
import { Report } from 'powerbi-client';

export default class AppOwnsDataWebApi {
  
  static GetEmbeddingData = async (workspaceId?: string): Promise<ViewModel> => {
    var accessToken: string = await SpaAuthService.getAccessToken();
    var restUrl = AppSettings.apiRoot + "Embed/";
    if (workspaceId !== undefined) {
      restUrl += "?workspaceId=" + workspaceId;
    }
   return $.ajax({
      url: restUrl,
      crossDomain: true,
      headers: {
        "Accept": "application/json;",
        "Authorization": "Bearer " + accessToken
      }
    });
  }

  static GetEmbedToken = async (workspaceId: string): Promise<string> => {
    var accessToken: string = await SpaAuthService.getAccessToken();
    var restUrl = AppSettings.apiRoot + "EmbedToken/" + "?workspaceId=" + workspaceId;
    return $.ajax({
      url: restUrl,
      crossDomain: true,
      headers: {
        "Accept": "application/json;",
        "Authorization": "Bearer " + accessToken
      }
    });
  }

  static LogActivity = async (activityLogEntry: ActivityLogEntry) => {
    var accessToken: string = await SpaAuthService.getAccessToken();
    var postData: string = JSON.stringify(activityLogEntry);

    var restUrl = AppSettings.apiRoot + "ActivityLog/";
    return $.ajax({
      url: restUrl,
      method: "POST",
      contentType: "application/json",
      data: postData,
      crossDomain: true,
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      }
    });
  }


  static LoginUser = async (UserId: string, UserName: string) => {

    var user = new User();
    user.UserId = UserId;
    user.UserName = UserName;

    var accessToken: string = await SpaAuthService.getAccessToken();
    var postData: string = JSON.stringify(user);

    var restUrl = AppSettings.apiRoot + "UserLogin/";
    return $.ajax({
      url: restUrl,
      method: "POST",
      contentType: "application/json",
      data: postData,
      crossDomain: true,
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer " + accessToken
      }
    });
  }



}
