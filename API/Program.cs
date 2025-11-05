using System.Text.Json;
using BeatAPI;
using Microsoft.AspNetCore.Mvc;
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
app.MapGet("/songs", async (AppDbContext db, [FromQuery] string? text) =>
{
    var query = db.Musicas.AsQueryable();

    if (!string.IsNullOrWhiteSpace(text))
    {
        text = text.ToLower();

        query = query.Where(m =>
            m.Nome.ToLower().Contains(text)
            || m.Genero.ToLower().Contains(text)
            || m.Autor.ToLower().Contains(text)
            || m.Album.ToLower().Contains(text));
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


//Método PUT - Alterar dados de uma música existente.
app.MapPut("/songs/{id}", async (int id, AppDbContext db, Musica musicaAtualizada) =>
{
    var Musica = await db.Musicas.FindAsync(id);

    if (Musica is null)
    {
        return Results.NotFound("Música não encontrada!");
    }

    Musica.Nome = musicaAtualizada.Nome;
    Musica.Duracao = musicaAtualizada.Duracao;
    Musica.Genero = musicaAtualizada.Genero;
    Musica.Autor = musicaAtualizada.Autor;
    Musica.Album = musicaAtualizada.Album;
    Musica.Capa = musicaAtualizada.Capa;

    await db.SaveChangesAsync();

    return Results.Ok(Musica);

});


//Método DELETE - Remover uma música existente na Playlist.
app.MapDelete("/songs/{id}", async (int id, AppDbContext db) =>
{
    var Musica = await db.Musicas.FindAsync(id);

    if (Musica is null)
    {
        return Results.NotFound("Música não encontrada!");
    }

    db.Musicas.Remove(Musica);
    await db.SaveChangesAsync();

    return Results.NoContent();
});


await app.RunAsync();
