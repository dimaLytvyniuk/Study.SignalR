using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Serilog;

namespace SignalRStudy.WebApi
{
    public class ChatHub: Hub, IEnglishLearningHub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendBytes(string user, object[] bytes)
        {
            Log.Error("Receive Bytes: " + bytes.Length);
            await Clients.All.SendAsync("ReceiveBytes", bytes);
        }
    }
}