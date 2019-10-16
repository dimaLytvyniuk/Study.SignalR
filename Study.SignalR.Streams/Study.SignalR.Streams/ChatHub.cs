using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace SignalRStudy.WebApi
{
    public class ChatHub: Hub, IEnglishLearningHub
    {
        private readonly ILogger<ChatHub> _logger;
        
        public ChatHub(ILogger<ChatHub> logger)
        {
            _logger = logger;
        }
        
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendBytes(string user, object[] bytes)
        {
            _logger.Log(LogLevel.Error, "Receive Bytes: " + bytes.Length);
            await Clients.All.SendAsync("ReceiveBytes", bytes);
        }
    }
}
