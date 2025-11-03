using BeatAPI;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar o SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=playlist.db"));

var app = builder.Build();

// Método GET - Ler
app.MapGet("/beatapi", async (AppDbContext db, string? nome, string? genero, string? autor, string? album) =>
{
    var query = db.Musicas.AsQueryable();

    if (!string.IsNullOrWhiteSpace(nome))
        query = query.Where(m => EF.Functions.Like(m.Nome, $"%{nome}%"));

    if (!string.IsNullOrWhiteSpace(genero))
        query = query.Where(m => EF.Functions.Like(m.Genero, $"%{genero}%"));

    if (!string.IsNullOrWhiteSpace(autor))
        query = query.Where(m => EF.Functions.Like(m.Autor, $"%{autor}%"));

    if (!string.IsNullOrWhiteSpace(album))
        query = query.Where(m => EF.Functions.Like(m.Album, $"%{album}%"));

    return await query.ToListAsync();
});

// Método POST - adicionar nova música
app.MapPost("/beatapi", async (AppDbContext db, Musica novaMusica) =>
{
    db.Musicas.Add(novaMusica);
    await db.SaveChangesAsync();
    return Results.Created($"/beatapi/{novaMusica.Id}", novaMusica);
});

//Método PUT - Alterar dados de uma música existente.
app.MapPut("/beatapi/{id}", async (int id, AppDbContext db, Musica musicaAtualizada) =>
{
    var Musica = await db.Musicas.FindAsync(id);
    if (Musica is null) return Results.NotFound("Música não encontrada!");

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
app.MapDelete("/beatapi/{id}", async (int id, AppDbContext db) =>
{
    var Musica = await db.Musicas.FindAsync(id);
    if (Musica is null) return Results.NotFound("Música não encontrada!");

    db.Musicas.Remove(Musica);
    await db.SaveChangesAsync();
    return Results.NoContent();
});