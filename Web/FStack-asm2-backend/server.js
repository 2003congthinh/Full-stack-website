const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const connection_string = "mongodb+srv://thinhdeptrai:T12namhsgioiT@cluster02703.syx3xrh.mongodb.net/fbl?retryWrites=true&w=majority"

mongoose.connect(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())



//PRODUCT SCHEMA

const productSchema = new mongoose.Schema({
  "c_id": String,
  "category_name": String,
  "parent": String,
  "products":[
    {
      "p_id": String,      
      "name": String,
      "price": Number,
      "seller": String,
      "added_date" : String,
      "description": String,
      "img": String
    }
  ],
  "subcategories": [String],
})

const accountSchema = new mongoose.Schema({
  "email": String,
  "password": String,
  "phone": String,
  "address": String,
  "cart": Array,
  "cus_id": String
})

const sellerSchema = new mongoose.Schema({
  "email": String,
  "password": String,
  "phone": String,
  "address": String,
  "business_name": String,
  "status": String,
  "s_id": String
})

const orderSchema = new mongoose.Schema ({
  "o_id": String,
  "account": String,
  "order_items": Array
})

const products = new mongoose.model('products', productSchema)
const accounts = new mongoose.model('accounts', accountSchema, 'Accounts')
const seller = new mongoose.model('seller', sellerSchema, 'Seller')
const orders = new mongoose.model('orders', orderSchema)


// Function to print all data to the frontend
const printAllData = async () => {
  try {
    const found_products = await products.find();
    // console.log(found_products);
    res.send(found_products);
  } catch (error) {
    console.log(error);
  }
};
const idTest = async () => {
  try {
    const found_categories = await products.findOne({category_name: "electronic"})
    // console.log("The cat is: " + found_categories)
    if (!found_categories) {
      return res.status(404).json({ error: 'No category found.' });
    }
    // Creating product's id
    const pIds = found_categories.products.map(product => product.p_id);
    console.log("All the ids: " + pIds)
    const largestNumber = Math.max(...pIds.map(pId => parseInt(pId.slice(3))));
    const newPid = found_categories.c_id + "p" + (largestNumber + 1).toString();
    console.log("The largest number is:" + largestNumber)
    console.log("new pid is: " + newPid)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}
// idTest()
// printAllData();


// Products handler backend functions
app.get('/printAllData', async (req, res) => {
  try {
    // console.log(1)
    const found_categories = await products.find();
    // console.log(found_categories)
    const found_categories_products = found_categories.map(category => category.products);
    // console.log(found_categories_products);
    res.send({"result": found_categories_products});
  } catch (error) {
    console.log(error);
  }
});

app.post('/printSellerData', async (req, res) => {
  try {
    const email  = req.body.email;
    const sellerProducts = await products.find({
      "products": {
        $elemMatch: {
          "seller": email,
        }
      }
    });
    let productsToSend = []
    // sellerProducts.forEach((cat) => {cat.products.forEach((product) => {products.push(product)})})
    for (const cat of sellerProducts) {
      for (const product of cat.products) {
        productsToSend.push(product)
      }
    }
    res.json({ result: productsToSend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/addNewProduct', async (req, res) => {
  try {
    const category_name = req.body.categoryName;
    const found_categories = await products.findOne({ category_name });

    if (!found_categories) {
      return res.status(404).json({ error: 'No category found.' });
    }

    const newP = req.body.newItem;
    let productExists = false;
    let existingProductIndex = -1; // Initialize the index variable

    // Check if the product exists
    for (let i = 0; i < found_categories.products.length; i++) {
      if (found_categories.products[i].name === newP.name && found_categories.products[i].seller === newP.seller) {
        productExists = true;
        existingProductIndex = i; // Store the index of the existing product
        break;
      }
    }

    if (productExists) {
      // Update the existing product
      const newPrice = parseInt(newP.price);
      const newAddedDate = newP.date_added;
      const newDes = newP.description;
      const newImg = newP.picture;

      found_categories.products[existingProductIndex].price = newPrice;
      found_categories.products[existingProductIndex].added_date = newAddedDate;
      found_categories.products[existingProductIndex].description = newDes;
      found_categories.products[existingProductIndex].img = newImg;
    } else {
      // Create a new product
      const pIds = found_categories.products.map(product => parseInt(product.p_id.slice(3)));
      const largestNumber = Math.max(...pIds);
      const newPid = found_categories.c_id + "p" + (largestNumber + 1).toString();

      const newProduct = {
        p_id: newPid,
        name: newP.name,
        price: newP.price,
        seller: newP.seller,
        added_date: newP.date_added,
        description: newP.description,
        img: newP.picture
      };

      found_categories.products.push(newProduct);
    }

    await found_categories.save();
    return res.status(201).json({ message: 'Add new product successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/deleteItem/:productID', async (req, res) => {
  try {
    const productId = req.params.productID;
    const categoryID = productId.split("p")[0];
    const found_categories = await products.findOne({ c_id: categoryID });

    if (!found_categories) {
      return res.status(404).json({ error: 'No product found.' });
    }

    const productIndex = found_categories.products.findIndex(product => product.p_id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'No product found with the provided productId.' });
    }

    found_categories.products.splice(productIndex, 1);
    await found_categories.save();
    res.json({ message: 'Product removed successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Recursive related functions
app.post('/filterProductsByCategory', async (req, res) => {
  try{
  const found_products_of_category = await products.findOne({category_name: req.body.categoryName})
  res.send({'productsFilteredByCategory':found_products_of_category.products})
  } catch (error) {
    console.log(error);
  }
})

app.get('/fetchAllCategoriesNames', async (req, res) => {
  try {
    const distinctCategories = await products.distinct('category_name');
    res.send({ categories_names: distinctCategories });
  } catch (error) {
    console.log(error);
  }
});

app.get('/fetchTLCsNames', async (req, res) => {
  try {
    const foundTLCs = await products.find({'parent':'n/a'})
    // console.log(foundTLCs[0])
    res.send({"foundTLCsNames":foundTLCs.map((e) => e.category_name)});
  } catch (error) {
    console.log(error);
  }
});

app.get('/fetchCategoriesNames', async (req,res) => {
  try {
      const found_categories = await products.find({parent:'n/a'})
      const categories_names = found_categories.map(e => e.category_name)
      res.send({"categories_names":categories_names})
  } catch (error) {
      console.log(error)
  }
})

app.post('/fetchParentAndChildren', async (req, res) => {
  try {
      const found_category = await products.findOne({category_name:req.body.categoryName})
      res.send({
          'parent': found_category.parent,
          'children': found_category.subcategories
      })
  } catch (error) {
      console.log(error)
  }
})

app.post('/makeNTLC', async (req,res) => {
  try {
      const matched_categories = await products.find({category_name:req.body.NTLCName})

      if (matched_categories.length === 0) {
          const number_of_categories = await products.find()
          const new_c_id = 'c' + (number_of_categories.length + 1).toString()
           
          const result = await products.create({
              "c_id": new_c_id,
              "category_name": req.body.NTLCName,
              "parent": "n/a",
              "products": [],
              "subcategories": []
          })
          res.send({'status': 1})
      } else {
          res.send({'status': 0})
      }
  } catch (error) {
      console.log(error)
  }
})

app.post('/makeNewSubcat', async (req,res) => {
  try {
      const matched_categories = await products.find({category_name:req.body.newSubcat})

      if (matched_categories.length === 0) {
          const number_of_categories = await products.find()
          const new_c_id = 'c' + (number_of_categories.length + 1).toString()
           
          const result = await products.create({
              "c_id": new_c_id,
              "category_name": req.body.newSubcat,
              "parent": req.body.parent,
              "products": [],
              "subcategories": []
          })

          await products.findOneAndUpdate({category_name:req.body.parent}, {$push: {subcategories:req.body.newSubcat}})
          console.log("subcat made")
          res.send({'status': 1})
      } else {
          console.log("subcat NOT made")
          res.send({'status': 0})
      }
  } catch (error) {
      console.log(error)
  }
})


app.post('/deleteCategory', async(req,res) => {
  const found_category = await products.findOne({category_name:req.body.categoryName})

  const lookForAssociatedProducts = (cat) => {
      if (cat.products.length !== 0) {
          return 1
      } 
      for (const subcat of cat.subcategories) {
          if (lookForAssociatedProducts(subcat) === 1) {
              return 1;
          }
      }
      return 0
  }

  const result = lookForAssociatedProducts(found_category)

  if (found_category === undefined) {
      res.send({'status':-1})
  } else {
      if (found_category.subcategories.length > 0) {
          res.send({'status':0}) 
      } else if (lookForAssociatedProducts(found_category) === 1) {
          res.send({'status': -2})
      } else {
          if (found_category.parent !== 'n/a') {
              const parent = await products.findOne({category_name:found_category.parent})
              const new_subcategories = parent.subcategories.filter((e) => e !== req.body.categoryName)
              await products.findOneAndUpdate({category_name: parent.category_name},{subcategories: new_subcategories})
          }
          await products.deleteOne({category_name:req.body.categoryName})
          res.send({'status':1})
      }
  }
})



// Seller status function for admin
app.get("/fetchSellers", async (req, res) => {
  try {
    const sellers = await seller.find().exec();
    res.json(sellers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/updateSellerStatus/:s_id", async (req, res) => {
  try {
    const { s_id } = req.params;
    const { status } = req.body;

    // Update the seller status in the MongoDB collection
    const updatedSeller = await seller.findOneAndUpdate(
      { s_id },
      { status },
      { new: true }
    );

    res.json(updatedSeller);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Cart backend functions
// easier way to add things is to send a whole object
app.post('/addCart', async (req, res) => {
  try{
    const { email, pro, quantity } = req.body;
    const account = await accounts.findOne({ email: email });

    if (!account) {
      return res.status(404).json({ error: 'No person found.' });
    }
    let productExists = false;

    for (let i = 0; i < account.cart.length; i++) {
      if (account.cart[i].product.p_id === pro.p_id) {
        productExists = true;
        const currentQuantity = parseInt(account.cart[i].quantity);
        const newQuantity = currentQuantity + parseInt(quantity);

        console.log("The supposedly assigned value: " + newQuantity)
        await accounts.findOneAndUpdate ({email:email,'cart.product.p_id':pro.p_id},{$set:{'cart.$.quantity': newQuantity}})
        break;
      }
    }

    if (!productExists) {
      const cartItem = {
        product: {
          p_id: pro.p_id,
          name: pro.name,
          description: pro.description,
          price: pro.price,
          added_date: pro.added_date,
          seller: pro.seller,
          img: pro.img
        },
        quantity: parseInt(quantity)
      };
      account.cart.push(cartItem);
    }
    await account.save(); // Await the save() method to ensure changes are persisted

    res.json({ message: 'Item added to cart successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
})

app.post('/printCart', async (req,res) => {
  const email = req.body.email; 
  const person = await accounts.findOne({email: email});
  if (!person) {
    return res.status(404).json({ error: "No person found with the provided email." });
  }
  const cart = person['cart'];
  res.send(cart)
})

app.delete('/deleteCart/:productId/:email', async (req, res) => {
  try {
    const { productId, email } = req.params;
    const person = await accounts.findOne({ email });

    if (!person) {
      return res.status(404).json({ error: 'No person found with the provided email.' });
    }

    const cartItemIndex = person.cart.findIndex(item => item.product.p_id === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ error: 'No item found in the cart with the provided productId.' });
    }

    person.cart.splice(cartItemIndex, 1);
    await person.save();
    res.json({ message: 'Item removed from cart successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/makeOrder", async (req,res) => {
  try {
    const account = await accounts.findOne({ email: req.body.email})
    // make order
    let orderItems = [];
    let sellersList = [];
    const status = "New";
    const mail = req.body.email;

    account['cart'].forEach(({product,quantity}) => {
      if (!sellersList.includes(product['seller'])) {
        orderItems.push({
          seller: product['seller'],
          batches: [{product, quantity, status}],
        })
        sellersList.push(product.seller)
      } else {
        for (const orderItem of orderItems) {
          const { seller, batches } = orderItem
          if (seller === product.seller) {
              batches.push({product,quantity, status})
          }
        }
      }
    })
  
    const oAmt = await orders.countDocuments()
    const o_id = 'c' + (oAmt+1).toString()
    await orders.create({
      o_id: o_id,
      account: mail,
      order_items: orderItems
    })
    res.send({message: "success"})
  
    // delete cart
    account.cart = [];
    await account.save();
  } catch (error) {
    console.log(error)
    res.status(400).json({error: "Bad Request"})
  }
})

app.post("/printOrder", async (req,res) => {
  const email = req.body.email; 
  const order = await orders.find({account: email});
  if (!order || orders.length === 0) {
    return res.status(404).json({ error: "No order found with the provided email." });
  }
  const myOrder = [].concat(...order.map((ord) => ord.order_items));
  res.send(myOrder);
})

app.post("/printSellerOrder", async (req,res) => {
  const email = req.body.email; 
  const order = await orders.find({});
  const myOrder = order.flatMap((ord) => ord.order_items.filter((item) => item.seller === email)); // Filter order_items with matching seller email
  res.send(myOrder);
  console.log("My order is: " + myOrder)
})

app.post('/updateOrderStatus', async (req, res) => {
  try {
    const { p_id, newStatus, email } = req.body;
    const ordersArray = await orders.find();
    console.log("ordersArray: " + ordersArray)
    const myOrder = ordersArray.flatMap((ord) => ord.order_items.filter((item) => item.seller === email));
    console.log("myOrder: " + myOrder)
    const detailOrder = myOrder.map((ord) => ord.batches.map((p)=>p.status))
    console.log("detailOrder: " + detailOrder)
    const batches = myOrder.map((ord) => ord.batches.map((p)=>p.product.p_id))
    console.log("batches: " + batches)
    const foundID = batches.filter
    // const batches = myOrder.flatMap((ord) => ord.batches.map((p)=>p.product.filter((id) => id.p_id === p_id)))
    // console.log("batches: " + batches)

    // for (let i = 0; i < account.cart.length; i++) {
    //   if (account.cart[i].product.p_id === pro.p_id) {
    //     productExists = true;
    //     const currentQuantity = parseInt(account.cart[i].quantity);
    //     const newQuantity = currentQuantity + parseInt(quantity);

    //     console.log("The supposedly assigned value: " + newQuantity)
    //     await accounts.findOneAndUpdate ({email:email,'cart.product.p_id':pro.p_id},{$set:{'cart.$.quantity': newQuantity}})
    //     break;
    //   }
    // }
    

  
  
    // Save the modified order
    // await modifiedOrder.save();
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Fetching info for login and signup
app.post('/customerLogin', async (req, res) => {
  const { credential, password } = req.body;
  try {
    // Find the account by either email or phone
    const accountFound = await accounts.findOne({
      $or: [{ email: credential }, { phone: credential }],
    });
    if (!accountFound) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use bcrypt to compare the entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, accountFound.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    } else {
      return res.status(200).json({ email: accountFound.email, message: 'Login successful' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/sellerLogin', async (req, res) => {
  const { credential, password } = req.body;
  try {
    // Find the seller by either email or phone
    const sellerFound = await seller.findOne({
      $or: [{ email: credential }, { phone: credential }],
    });
    if (!sellerFound) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use bcrypt to compare the entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, sellerFound.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (sellerFound.status !== 'Approved') {
      return res.status(401).json({ message: 'Seller not approved' });
    }
      return res.status(200).json({ email: sellerFound.email, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/customerSignup', async (req, res) => {
  const { email, password, phone, address } = req.body;
  try {
    const accountExists = await accounts.findOne({ email });
    const phoneExists = await seller.findOne({ phone });
    if (accountExists) { 
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (phoneExists) { 
      return res.status(400).json({ message: 'Phone already registered' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const numberOfCustomer = await accounts.countDocuments()
    const new_cus_id = 'cus' + (numberOfCustomer + 1).toString()
    const newAccount = new accounts({
      email,
      password: hashedPassword,
      phone,
      address,
      cus_id: new_cus_id
    });

    await newAccount.save();
    return res.status(201).json({ message: 'Signup successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/sellerSignup', async (req, res) => {
  const { email, password, phone, address, business_name } = req.body;
  try {
    const accountExists = await seller.findOne({ email });
    const phoneExists = await seller.findOne({ phone });
    if (accountExists) { 
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (phoneExists) { 
      return res.status(400).json({ message: 'Phone already registered' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const numberOfSeller = await seller.countDocuments()
    const new_s_id = 's' + (numberOfSeller + 1).toString()
    const newSeller = new seller({
      email,
      password: hashedPassword,
      phone,
      address,
      business_name,
      s_id: new_s_id,
      status: "Pending"
    });

    await newSeller.save();
    return res.status(201).json({ message: 'Signup successful' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

app.listen(8000, () => console.log("Express Server started on port 8000"));