using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Study.SignalR.Streams;

namespace SignalRStudy.WebApi
{
    public class ChatHub: Hub, IEnglishLearningHub
    {
        private readonly ILogger<ChatHub> _logger;
        private static Dictionary<string, IAsyncEnumerable<VideoPartModel>> _streams = new Dictionary<string, IAsyncEnumerable<VideoPartModel>>(); 
        
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

        public async Task UploadVideo(string session, IAsyncEnumerable<VideoPartModel> stream)
        {
            _logger.Log(LogLevel.Error, "In uploader");
            _streams[session] = stream;
            await Task.Delay(TimeSpan.FromDays(1));
        }

        public async IAsyncEnumerable<VideoPartModel> StreamVideo(string session)
        {
            _logger.Log(LogLevel.Error, "In streamer");
            if (!_streams.TryGetValue(session, out var stream))
            {
                throw new ArgumentException(nameof(session));
            }
            
            await foreach (var chunk in stream)
            {
                yield return chunk;
            }
        }
    }
}
