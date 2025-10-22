using BeatAPI;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar o SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=playlist.db"));

var app = builder.Build();

// GET - Consultando todos os dados do banco de dados
app.MapGet("/", async (AppDbContext db) =>
    await db.Musicas.ToListAsync()
);

app.Run();