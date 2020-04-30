﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PikaModel;
using PikaWeb.Controllers.DataTransferObjects;

namespace PikaWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        // GET api/comment/{id}
        [HttpGet("{id}")]
        public async Task<CommentDTO> Get(long id)
        {
            using (var db = new PikabuContext())
            {
                return await db.Comments
                    .Where(comment => comment.CommentId == id)
                    .Select(c => new CommentDTO
                    {
                        StoryId = c.StoryId,
                        UserName = c.UserName,
                        AvatarUrl = db.Users.Single(u => u.UserName == c.UserName).AvatarUrl,
                        StoryTitle = c.Story.Title,
                        CommentId = c.CommentId,
                        ParentId = c.ParentId,
                        DateTimeUtc = c.DateTimeUtc,
                        CommentBody = c.CommentContent.BodyHtml,
                        IsAuthor = c.UserName == c.Story.Author,
                        Rating = c.Rating
                    })
                    .SingleOrDefaultAsync();
            }
        }
    }
}