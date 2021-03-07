using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace AppOwnsDataWebApi.Models {

  public class AppOwnsDataWebApiDB : DbContext {

    public AppOwnsDataWebApiDB(DbContextOptions<AppOwnsDataWebApiDB> options)
    : base(options) {
    }

    public DbSet<ActivityLogEntry> ActivityLog { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {}

    protected override void OnModelCreating(ModelBuilder modelBuilder) {}

  }
}
