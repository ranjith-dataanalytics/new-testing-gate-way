const products=[
 {id:1,name:"Gold Ring",price:25000,image:"https://images.unsplash.com/photo-1605100804763-247f67b3557e"},
 {id:2,name:"Diamond Necklace",price:55000,image:"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f"},
 {id:3,name:"Gold Bracelet",price:35000,image:"https://images.unsplash.com/photo-1611652022419-a9419f74343d"}
];
let cart=[];

document.getElementById("products").innerHTML=products.map(p=>`
 <div class="card">
  <img src="${p.image}" alt="${p.name}">
  <h3>${p.name}</h3><div class="price">₹${p.price.toLocaleString("en-IN")}</div>
  <button class="add" onclick="add(${p.id})">Add to Cart</button>
 </div>`).join("");

function add(id){cart.push(products.find(p=>p.id===id)); update();}

function update(){
 document.getElementById("count").textContent=cart.length;
 let total=cart.reduce((s,p)=>s+p.price,0);
 document.getElementById("total").textContent=total.toLocaleString("en-IN");
 document.getElementById("items").innerHTML=cart.map((p,i)=>
 `<div class="item"><span>${p.name}</span><span>₹${p.price.toLocaleString("en-IN")}
 <button onclick="removeItem(${i})">X</button></span></div>`).join("");
}
function removeItem(i){cart.splice(i,1);update();}
function openCart(){document.getElementById("cart").style.display="flex";update();}
function closeCart(){document.getElementById("cart").style.display="none";}

async function payNow(){
 if(!cart.length)return alert("Cart is empty");
 const amount=cart.reduce((s,p)=>s+p.price,0);
 const productName=cart.map(p=>p.name).join(", ");

 const r=await fetch("/create-order",{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({amount,productName})});
 const data=await r.json();
 if(!data.success)return alert("Could not create order");

 const options={
   key:"YOUR_RAZORPAY_KEY_ID",
   amount:data.order.amount,currency:"INR",
   name:"RK Jewelry",description:productName,order_id:data.order.id,
   handler:async function(response){
     const v=await fetch("/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify(response)});
     const result=await v.json();
     if(result.success){alert("Payment successful!");cart=[];update();closeCart();}
     else alert("Payment verification failed");
   },
   theme:{color:"#222222"}
 };
 new Razorpay(options).open();
}