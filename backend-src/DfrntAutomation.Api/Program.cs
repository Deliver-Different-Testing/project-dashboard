using DfrntAutomation.Api.Middleware;
using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using DfrntAutomation.Infrastructure.Repositories;
using DfrntAutomation.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AutomationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IAutomationRepository, AutomationRepository>();

// Services
builder.Services.AddScoped<IAutomationEngineService, AutomationEngineService>();
builder.Services.AddScoped<IPlaceholderResolver, PlaceholderResolver>();
builder.Services.AddScoped<IAppConfigService, AppConfigService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<WorkflowResolutionService>();

// HTTP client for Mailtrap email
builder.Services.AddHttpClient<IMailtrapEmailService, MailtrapEmailService>();

// SMS uses existing TMS queue (tucManualMessage), no external HTTP client needed
builder.Services.AddScoped<ISmsService, SmsService>();

// Background service
builder.Services.AddHostedService<AutomationTimerService>();

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-dev-key-change-in-production")),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
