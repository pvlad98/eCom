using System;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Extensions;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Controllers
{   
    public class AccountController : BaseController
    {
        private readonly IUnitOfWork uow;
        private readonly IConfiguration configuration;

        public AccountController(IUnitOfWork uow, IConfiguration configuration)
        {
            this.uow = uow;
            this.configuration = configuration;
        }
        //API/ACCOUNT/UPDATE/"parola"
        [HttpPut("update/password/{passToChange}")]
        public async Task<IActionResult> UpdateUserPassword(string passToChange,LoginResponseDto loginDto)
        {   
            
            var userFromDb = await uow.UserRepository.GetUser(loginDto.UserName);
            if (userFromDb == null)
            {
                return BadRequest("Update not allowed");
            }
            if (passToChange!="")
            {
                byte[] passwordHash, passwordKey;
                using (var hmac = new HMACSHA512())
                {
                    passwordKey = hmac.Key;
                    passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(passToChange));
                    userFromDb.Password = passwordHash;
                    userFromDb.PasswordKey = passwordKey;
                }
            }
            await uow.SaveAsync();
            return Ok(200);
        }

        //API/ACCOUNT/get
        [HttpGet("get/{userName}")]
        public async Task<IActionResult> GetUser(string userName)
        {   
            var userFromDb = await uow.UserRepository.GetUser(userName);
            if (userFromDb == null)
            {
                return BadRequest("User doesn't exist!");
            }
            GetUserResponse user = new GetUserResponse();
            user.UserName = userFromDb.Username;
            user.Email = userFromDb.Email;
            user.Mobile = userFromDb.Mobile;
            user.Tara = userFromDb.Tara;
            user.Judet = userFromDb.Judet;
            user.Oras = userFromDb.Oras;
            user.Strada = userFromDb.Strada;
            user.Numar = userFromDb.Numar;
            user.Pfp = userFromDb.Pfp;
            await uow.SaveAsync();
            return Ok(user);
        }
        //API/ACCOUNT/UPDATE
        [HttpPut("update/profile")]
        public async Task<IActionResult> UpdateUser(GetUserResponse loginDto)
        {   
            
            var userFromDb = await uow.UserRepository.GetUser(loginDto.UserName);
            if (userFromDb == null)
            {
                return BadRequest("Update not allowed");
            }
            userFromDb.Email = loginDto.Email;
            userFromDb.Mobile = loginDto.Mobile;
            userFromDb.Tara = loginDto.Tara;
            userFromDb.Judet = loginDto.Judet;
            userFromDb.Oras = loginDto.Oras;
            userFromDb.Strada = loginDto.Strada;
            userFromDb.Numar = loginDto.Numar;
            await uow.SaveAsync();
            return Ok(userFromDb);
        }
       
        //API/ACCOUNT/LOGIN
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginReqDto loginReq)
        {
            var user = await uow.UserRepository.Authenticate(loginReq.UserName, loginReq.Password);

            ApiError apiError = new ApiError();

            if (user == null)
            {
                apiError.ErrorCode = Unauthorized().StatusCode;
                apiError.ErrorMessage = "Nume sau parola gresita!";
                apiError.ErrorDetails = "Aceasta erroare apare cand userul si parola nu exista.";
                return Unauthorized(apiError);
            }
            var loginRes = new LoginResponseDto();
            loginRes.UserName = user.Username;
            loginRes.Token = CreateJWT(user);
            return Ok(loginRes);
        }
       
        //API/ACCOUNT/REGISTER
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterReqDto registerReq)
        {

            ApiError apiError = new ApiError();
            if (registerReq.UserName.IsEmpty() || registerReq.UserName.IsEmpty())
            {
                apiError.ErrorCode = BadRequest().StatusCode;
                apiError.ErrorMessage = "Numele sau parola nu pot fi lasate locuri libere";
                return BadRequest(apiError);
            }
            if (await uow.UserRepository.UserAlreadyExist(registerReq.UserName))
            {
                apiError.ErrorCode = BadRequest().StatusCode;
                apiError.ErrorMessage = "Utilizatorul exista deja,folositi alt nume";
                return BadRequest(apiError);
            }


            uow.UserRepository.Register(registerReq.UserName, registerReq.Password, registerReq.Email, registerReq.Mobile);
            await uow.SaveAsync();
            return StatusCode(201);
        }
        private string CreateJWT(User user)
        {
            var secretKey = configuration.GetSection("AppSettings:Key").Value;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var claims = new Claim[]{
                new Claim(ClaimTypes.Name,user.Username),
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString())
            };
            var signingCredentials = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256Signature
            );

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(10),
                SigningCredentials = signingCredentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}