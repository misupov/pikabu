using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace PikaWeb
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var now = DateTimeOffset.Now;
            Console.WriteLine("Application started at: " + now);
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseUrls("http://localhost:5000").UseStartup<Startup>(); });
    }
}