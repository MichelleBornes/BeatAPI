using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using BeatAPI;

namespace BeatAPI;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Musica> Musicas => Set<Musica>();
}