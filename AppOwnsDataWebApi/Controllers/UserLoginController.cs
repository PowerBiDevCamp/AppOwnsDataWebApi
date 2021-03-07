using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppOwnsDataWebApi.Models;

namespace AppOwnsDataWebApi.Controllers {
  [Route("api/[controller]")]
  [ApiController]
  public class UserLoginController : ControllerBase {
    private readonly AppOwnsDataWebApiDB _context;

    public UserLoginController(AppOwnsDataWebApiDB context) {
      _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers() {
      return await _context.Users.ToListAsync();
    }

    // GET: api/UserLogin/5
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(string id) {
      var user = await _context.Users.FindAsync(id);

      if (user == null) {
        return NotFound();
      }

      return user;
    }

    // PUT: api/UserLogin/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(string id, User user) {
      if (id != user.UserId) {
        return BadRequest();
      }

      _context.Entry(user).State = EntityState.Modified;

      try {
        await _context.SaveChangesAsync();
      }
      catch (DbUpdateConcurrencyException) {
        if (!UserExists(id)) {
          return NotFound();
        }
        else {
          throw;
        }
      }

      return NoContent();
    }

    // POST: api/UserLogin
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<User>> PostUser(User user) {
      if (UserExists(user.UserId)) {
        var currentUser = await _context.Users.FindAsync(user.UserId);
        currentUser.LastLogin = DateTime.Now;
       await _context.SaveChangesAsync();
        return NoContent();
      }
      else {
        user.Created = DateTime.Now;
        user.LastLogin = DateTime.Now;
        user.CanEdit = false;
        user.CanCreate = false;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return NoContent(); ;
      }

    }

    // DELETE: api/UserLogin/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id) {
      var user = await _context.Users.FindAsync(id);
      if (user == null) {
        return NotFound();
      }

      _context.Users.Remove(user);
      await _context.SaveChangesAsync();

      return NoContent();
    }

    private bool UserExists(string id) {
      return _context.Users.Any(e => e.UserId == id);
    }
  }
}
