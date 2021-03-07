using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppOwnsDataWebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.Identity.Web.Resource;

namespace AppOwnsDataWebApi.Controllers {
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  [RequiredScope("Reports.Embed")]
  [EnableCors("AllowOrigin")]
  public class ActivityLogController : ControllerBase {

    private readonly AppOwnsDataWebApiDB _context;

    public ActivityLogController(AppOwnsDataWebApiDB context) {
      _context = context;
    }

    // GET: api/ActivityLog
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLogEntry>>> GetActivityLog() {
      return await _context.ActivityLog.ToListAsync();
    }

    // GET: api/ActivityLog/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityLogEntry>> GetActivityLogEntry(int id) {
      var activityLogEntry = await _context.ActivityLog.FindAsync(id);

      if (activityLogEntry == null) {
        return NotFound();
      }

      return activityLogEntry;
    }

    [HttpPost]
    public async Task<ActionResult<ActivityLogEntry>> PostActivityLogEntry(ActivityLogEntry activityLogEntry) {
      activityLogEntry.Created = DateTime.Now;
      _context.ActivityLog.Add(activityLogEntry);
      await _context.SaveChangesAsync();

      return CreatedAtAction("GetActivityLogEntry", new { id = activityLogEntry.Id }, activityLogEntry);
    }


    private bool ActivityLogEntryExists(int id) {
      return _context.ActivityLog.Any(e => e.Id == id);
    }

  }
}
