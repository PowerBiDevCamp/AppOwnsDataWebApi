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
  public class EmbedController : ControllerBase {

    private PowerBiServiceApi powerBiServiceApi;

    public EmbedController(PowerBiServiceApi powerBiServiceApi) {
      this.powerBiServiceApi = powerBiServiceApi;
    }

    [HttpGet]
    public async Task<EmbeddedViewModel> Get(string workspaceId) {

      string user = this.User.FindFirst("preferred_username").Value;
 
      return await this.powerBiServiceApi.GetEmbeddedViewModel(workspaceId, user);
    }

  }

}
