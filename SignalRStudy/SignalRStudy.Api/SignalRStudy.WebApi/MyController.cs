using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace SignalRStudy.WebApi
{
    public class MyController: Controller
    {
        private IActionDescriptorCollectionProvider _actionDescriptorProvider;
        public MyController(IActionDescriptorCollectionProvider actionDescriptorProvider)
        {
            _actionDescriptorProvider = actionDescriptorProvider;
        }

        [HttpGet("/my")]
        public IActionResult GetInfo()
        {
            
            
            return Ok();
        }
    }
}