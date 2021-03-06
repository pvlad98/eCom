using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IProductRepository
    {
         Task<IEnumerable<Product>> GetProductsAsync() ;

         void AddProduct(Product product);

         void DeleteProduct(int ProductId);
        Task <Product> FindProduct(int id);
        Task<Product> GetProduct(int ProductId);

    }
}