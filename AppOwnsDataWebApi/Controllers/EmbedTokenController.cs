//namespace  {
//  public class EmbedTokenController : ControllerBase {

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppOwnsDataWebApi.Models;
using AppOwnsDataWebApi.Services;

using Microsoft.Identity.Web.Resource;
using Microsoft.AspNetCore.Cors;

namespace AppOwnsDataWebApi.Controllers {

  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  [RequiredScope("Reports.Embed")]
  [EnableCors("AllowOrigin")]
  public class EmbedTokenController : ControllerBase {

    private PowerBiServiceApi powerBiServiceApi;

    public EmbedTokenController(PowerBiServiceApi powerBiServiceApi) {
      this.powerBiServiceApi = powerBiServiceApi;
    }

    [HttpGet]
    public async Task<string> Get(string workspaceId) {

      string user = this.User.FindFirst("preferred_username").Value;
      return await this.powerBiServiceApi.GetEmbedToken(workspaceId, user);

    }

  }

}
