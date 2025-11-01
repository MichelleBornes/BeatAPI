using BeatAPI;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar o SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=playlist.db"));

var app = builder.Build();

// Método GET - Ler
app.MapGet("/beatapi", async (AppDbContext db) =>
{
    return await db.Musicas.ToListAsync();
});

// Método POST - adicionar nova música
app.MapPost("/beatapi", async (AppDbContext db, Musica novaMusica) =>
{
    db.Musicas.Add(novaMusica);
    await db.SaveChangesAsync();
    return Results.Created($"/beatapi/{novaMusica.Id}", novaMusica);
});

app.Run();