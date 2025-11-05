using System.Text.Json;
using BeatAPI;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Configurar o SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite("Data Source=playlist.db");
});

builder.Services.AddCors(options => options
    .AddPolicy(
        name: "UI",
        policy => policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://127.0.0.1:5500")
    ));

await using var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await context.Database.MigrateAsync();
}

app.UseCors("UI");

// Método GET - Ler
app.MapGet("/songs", async (AppDbContext db, string? text) =>
{
    var query = db.Musicas.AsQueryable();

    if (!string.IsNullOrWhiteSpace(text))
    {
        query = query.Where(m => m.Nome.Contains(text))
            .Where(m => m.Genero.Contains(text))
            .Where(m => m.Autor.Contains(text))
            .Where(m => m.Album.Contains(text));
    }

    var songs = await query.ToListAsync();

    return songs;
});

// Método POST - adicionar nova música
app.MapPost("/songs", async (AppDbContext db, Musica novaMusica) =>
{
    db.Musicas.Add(novaMusica);
    await db.SaveChangesAsync();
    return Results.Created($"/songs/{novaMusica.Id}", novaMusica);
});

await app.RunAsync();
