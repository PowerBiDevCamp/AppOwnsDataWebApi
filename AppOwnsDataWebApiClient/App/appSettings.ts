export default class AppSettings {
  public static clientId: string = "11111111-1111-1111-1111-111111111111";
  public static tenant: string = "YOUR_TENANT.onMicrosoft.com";
  public static apiRoot: string = "https://localhost:44300/api/";
  public static apiScopes: string[] = [
    "api://" + AppSettings.clientId + "/Reports.Embed"
  ];
}