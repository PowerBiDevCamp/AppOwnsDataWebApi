using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace AppOwnsDataWebApi.Models {
  public class User {
    public string UserId { get; set; }
    public string UserName { get; set; }
    public bool CanEdit { get; set; }
    public bool CanCreate { get; set; }
    public DateTime Created { get; set; }
    public DateTime LastLogin { get; set; }

  }
}
