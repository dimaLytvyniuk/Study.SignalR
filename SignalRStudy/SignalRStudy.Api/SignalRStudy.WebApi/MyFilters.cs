using System.Security.Authentication;
using Microsoft.AspNetCore.Mvc.Filters;
using Serilog;

namespace SignalRStudy.WebApi
{
    public class EndpointAccessFilter : IActionFilter
    {

        public EndpointAccessFilter()
        {
        }
        
        public void OnActionExecuted(ActionExecutedContext context)
        {

        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            Log.Error("in filter");
        }
    }
}