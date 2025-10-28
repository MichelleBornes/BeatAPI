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

// GET - Consultando todos os dados do banco de dados
app.MapGet("/songs", async (AppDbContext db) =>
{
    var songs = await db.Musicas.ToArrayAsync();

    return Results.Ok(songs);
});

await app.RunAsync();
