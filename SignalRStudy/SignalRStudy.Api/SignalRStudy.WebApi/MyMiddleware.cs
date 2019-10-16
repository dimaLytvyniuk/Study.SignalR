using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace SignalRStudy.WebApi
{
    public class MyMiddleware
    {
        private readonly RequestDelegate _next;
        
        public MyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
        {
            var hubs = serviceProvider.GetServices(typeof(IEnglishLearningHub));
            Log.Error("in middleware " + context.Request.Path);
            await _next.Invoke(context);
        }
    }
}