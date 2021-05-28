import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/model/product';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart:Product[] = []
  constructor(
    private cartService:CartService
  ) { }

  ngOnInit(): void {
    this.cart = this.cartService.placeholder;
  }
  removeQuant(item:Product){
    this.cartService.deleteItem(item.id);
    this.cart = this.cartService.getCartData();
  }
  addQuant(item:Product){
    this.cartService.addItem(item);
    this.cart = this.cartService.getCartData();
  }

}
