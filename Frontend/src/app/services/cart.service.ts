import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../model/Product';
import * as alertyfy from 'alertifyjs';
@Injectable({
  providedIn: 'root'
})


export class CartService {
  placeholder: Product[] = [];
  cartItems = new BehaviorSubject([]);
  sumToPay!: number;
  numOfItems: any;
  cartTotal = 0;
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {
    const ls = this.getCartData();
    if (ls) this.cartItems.next(ls);
  }

  getSumOfCart() {
    let zum = 0;
    let cart = JSON.parse(localStorage.getItem('cart')!);
    cart.forEach((x: { qty: number; price: number; }) => zum += x.qty * x.price);
    if (zum <= 4999)
      zum += 15;
    return +zum;
  }
  addItem(product: Product) {
    product.qty = 1;
    const ls = this.getCartData();
    let exist: Product;

    if (ls)
      exist = ls.find((item: Product) => {
        return item.id === product.id;
      });

    if (exist!) {
      if ((exist.stock - exist.qty) <= 0) {
        alertyfy.error("A-ti atins numarul maxim pe stock!");
        return;
      } else {
        alertyfy.success("Produs adaugat!");
        exist.qty++;
        this.setCartData(ls);
      }
    }
    else {
      if (ls) {
        const newData = [...ls, product];
        this.setCartData(newData);
      };
      this.placeholder.push(product);
      this.setCartData(this.placeholder);
      alertyfy.success("Produs adaugat!");
    }
    this.placeholder = this.getCartData();
  }

  setCartData(data: any) {
    localStorage.setItem('cart', JSON.stringify(data));
    this.cartItems.next(this.getCartData());
  }
  getCartData() {
    return JSON.parse(localStorage.getItem('cart')!);
  }
  deleteItem(id: number) {
    const ls = this.getCartData();

    let exist: Product;
    if (ls)
      exist = ls.find((item: { id: number; }) => {
        return item.id === id;
      });

    if (exist!)
      if (exist.qty <= 1) {
        exist.qty--;
        ls.forEach((exist: Product, index: any) => {
          if (exist.id == id) ls.splice(index, 1);
        });
        this.setCartData(ls);
      }
      else {
        exist.qty--;
        this.setCartData(ls);
      }

    this.placeholder = this.getCartData();
  }
  deleteCart() {
    this.placeholder = [];
    localStorage.removeItem('cart');
  }


}
