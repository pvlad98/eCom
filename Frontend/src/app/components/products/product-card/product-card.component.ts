import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/model/Product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import * as alertyfy from 'alertifyjs';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!:Product;
  Desc: string[]=[];
  constructor(
    private productService:ProductService,
    private route: ActivatedRoute,
    private cartService:CartService) { }

  ngOnInit(): void {
    this.Desc = this.product.description.split(",");
  }

  addToCart(product: Product){
    this.cartService.addItem(product);
  }

}
