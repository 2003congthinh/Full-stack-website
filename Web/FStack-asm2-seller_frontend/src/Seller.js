import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import pict from './pict/Iphone12.png';
import './Seller.css';
import { useNavigate } from 'react-router-dom';

const Category = ({ categoryName, categoryFilter, category, setCategory }) => {
    const [selected, setSelected] = useState(false);
    const [parent, setParent] = useState([]);
    const [children, setChildren] = useState([]);
  
    const handleToggleSelected = async (e) => {
      e.target.classList.toggle("is_selected");
      const currentlySelected = !selected;
      await setSelected(currentlySelected);
  
      if (categoryFilter && currentlySelected) {
        categoryFilter(categoryName); // Call the categoryFilter function for filtering
      }
  
      if (setCategory) {
        if (currentlySelected) {
          setCategory(categoryName); // Update the category state
        } else {
          setCategory(""); // Reset the category state
        }
      }
  
      if (currentlySelected) {
        try {
          const response = await fetch(
            "http://localhost:8000/fetchParentAndChildren",
            {
              method: "POST",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                categoryName: categoryName,
              }),
            }
          );
          const result = await response.json();
          setParent(result["parent"]);
          setChildren(result["children"]);
        } catch (error) {
          console.log(error);
        }
      }
    };
  
    return (
      <div>
        <div onClick={handleToggleSelected}>{categoryName}</div>
        {selected && children.length !== 0 && (
          <div>
            {children.map((child, index) => (
              <Category
                key={child + index}
                categoryName={child}
                categoryFilter={categoryFilter}
                category={category}
                setCategory={setCategory}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


export default function Seller () {
    const navigate = useNavigate();
    const [storedEmail, setStoredEmail] = useState('');
    const [products, setProducts] = useState([]);
    const [dups, setDups] = useState([]);
    const [original, setOriginal] = useState([]);
    const [orders,setOrders] = useState([]);
    // const [dups2, setDups2] = useState([])
    // Initialize the selected value and a function to set the selected value
    const [sortByPrice, setSortByPrice] = useState(false);
    const [sortByDate, setSortByDate] = useState(false);
    const [searchByName, setSearchByName] = useState('');
    const [TLCsNames, setTLCsNames] = useState([]); //TLC = Top Level Categories

    /* Const for update list */
    const [name, setName] = useState('');
    const [des, setDes] = useState('');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState('');
    const [img, setImg] = useState('');
    const [category, setCategory] = useState('');

    /* Frontend functions */

    const filterPrice = (event) => {
        const isChecked = event.target.checked;
        setSortByPrice(isChecked);
        if (isChecked) {
            const sortedProducts = [...products].sort((a, b) => b.price - a.price);
            setProducts(sortedProducts);
        } else {
            setProducts(original);
        }
    }

    const filterDate = (event) => {
        const isChecked = event.target.checked;
        setSortByDate(isChecked);
        if (isChecked) {
            const sortedProducts = [...products].sort((a, b) => {
                const [dayA, monthA, yearA] = a.added_date.split('/');
                const [dayB, monthB, yearB] = b.added_date.split('/');
                const dateA = new Date(Number(yearA), Number(monthA) - 1, Number(dayA));
                const dateB = new Date(Number(yearB), Number(monthB) - 1, Number(dayB));
                return dateA - dateB;
            });
            setProducts(sortedProducts);
        } else {
            setProducts(original);
        }
    }

    const searchName = (event) => {
        setSearchByName(event.target.value);
    }
    const findName = () => {
        if(searchByName === ''){
            setProducts(original)
        } else {
            const findPro = [...original].filter(product => product.name.trim().toLowerCase() === searchByName.trim().toLowerCase());
            setProducts(findPro);
        }
    }

    const logout = () => {
        localStorage.removeItem('email')
        navigate('/');
    }

    const handleCategoryChange = (categoryName) => {
        // Perform any additional actions with the selected category
        setCategory(categoryName);
    };



    /* Backend data */
    const getSellerData = async () => {
        try {
            const response = await fetch('http://localhost:8000/printSellerData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: storedEmail }),
            });
            const data = await response.json();
            const fetchedProducts= data.result;
            const sellerProducts = fetchedProducts.filter(pro => pro.seller === storedEmail)
            console.log(sellerProducts)
            setProducts(sellerProducts)
            setOriginal(sellerProducts);
            setDups(sellerProducts);
            // setDups2(data);
        } catch (error) {
            console.log(error);
        }
    };

    const addItem = async () => {
        try {
            const newItem = {
                name: name,
                price: price,
                seller: storedEmail,
                date_added: date,
                description: des,
                picture: img
            };
            // Update the products 
            const response = await fetch('http://localhost:8000/addNewProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({categoryName: category, newItem}),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); 
                // Clear the input fields
                setName("");
                setDes("");
                setPrice("");
                setDate("");
                setImg("");
                setCategory("");
                getSellerData();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const deleteItem = async (proId) => {
        try {
            // " ` " not " ' " , there is a difference  =") 
            const response = await fetch(`http://localhost:8000/deleteItem/${proId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); 
                getSellerData();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const fetchTLCsNames = async() => {
        const response = await fetch('http://localhost:8000/fetchTLCsNames',{
            method: 'GET',  
            headers: { 'Content-type': 'application/json'}
        })

        const result = await response.json()
        const foundTLCs = result['foundTLCsNames']
        setTLCsNames(foundTLCs)
    }

    const handleCategoryFilter = async (categoryName) => {
        try {
            const response = await fetch ('http://localhost:8000/filterProductsByCategory',{
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({categoryName: categoryName})
            })
            const result = await response.json()
            const productsFilteredByCategory = result['productsFilteredByCategory']
            setProducts(productsFilteredByCategory.filter(pro => pro.seller === storedEmail))
            setOriginal(productsFilteredByCategory.filter(pro => pro.seller === storedEmail))
        } catch (error) {
            console.log(error)
        } 
    }

    const myOrders = async() => {
        try {
            const response = await fetch('http://localhost:8000/printSellerOrder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({email: storedEmail}),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }
            const data = await response.json();
            setOrders(data)
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const updateOrderStatus = async (p_id, newStatus) => {
        try {
          const response = await fetch("http://localhost:8000/updateOrderStatus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({p_id, newStatus, email: storedEmail }),
          });
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          console.log("Order status updated successfully.");
        } catch (error) {
          console.log(error);
        }
    };

    useEffect(()=>{
        const storedEmail = localStorage.getItem('email');
        setStoredEmail(storedEmail);
        if (storedEmail) {
            getSellerData();
            myOrders();
        }
    },[])

    useEffect(() => {
        fetchTLCsNames()
        if (storedEmail) {
            getSellerData();
            myOrders();
        }
    }, [storedEmail]);


    return(
        <div>
            {/* Header */}
            <div className="App">
                <header className="App-header">
                    <div className="App-logo">
                        <img src={"https://png.pngtree.com/element_our/20200610/ourmid/pngtree-shopping-mall-logo-image_2235997.jpg"} className="App-logo" alt="logo" />
                    </div>
                    {storedEmail}
                    <div className='App-header-nav'> 
                        <button className='button' onClick={logout}>Log Out</button>
                    </div>
                </header>
            </div>

            {/* Content */}
            <div className="content-container">
                <div className='options'>
                    <br/>
                    {/* Filter options */}
                    <h3>Filter options:</h3>
                    <div>
                        <button className='button' onClick={() => setProducts(dups)}> Return all </button>
                        <div className='bold'>Category:</div>
                        {TLCsNames.map((categoryName) => (
                            <Category
                                key={categoryName}
                                categoryName={categoryName}
                                categoryFilter={handleCategoryFilter}
                            />
                        ))}
                    </div>
    
                    <label>Price</label>
                    <input type="checkbox" checked={sortByPrice} onChange={filterPrice} />
                    <label>Date</label>
                    <input type="checkbox" checked={sortByDate} onChange={filterDate} />
                    <div>
                        <label>Search by name</label>
                        <input className='input-pro' placeholder="Name" type='text' value={searchByName} onChange={searchName} />
                        <button className='button' onClick={findName}>Find</button>
                    </div>
                    
                    <br/><br/>
                    {/* Add products options */}
                    <h3>Add new product:</h3>
                    <div>
                        <label>Name:</label>
                        <input className='input-pro' placeholder="Name" type='text' value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div>
                        <label>Description:</label>
                        <input className='input-pro' placeholder="Description" type='text' value={des} onChange={(e) => setDes(e.target.value)}/>
                    </div>
                    <div>
                        <label>Price:</label>
                        <input className='input-pro' placeholder="Price"  type='text' value={price} onChange={(e) => setPrice(e.target.value)}/>
                    </div>
                    <div>
                        <label>Date:</label>
                        <input className='input-pro' placeholder="Date" type='text' value={date} onChange={(e) => setDate(e.target.value)}/>
                    </div>
                    <div>
                        <label>Picture link:</label>
                        <input className='input-pro' placeholder="Img URL" type='text' value={img} onChange={(e) => setImg(e.target.value)}/>
                    </div>
                    <div>
                        <div className='bold'>Category: {category}</div>
                        {TLCsNames.map((categoryName) => (
                            <Category
                                key = {categoryName}
                                categoryName = {categoryName}
                                category={category}
                                setCategory={setCategory}
                            />
                        ))}
                    </div>
                    <button className='button' onClick={addItem}>Add item</button>
                </div>
                <div className='display'>
                    <h1>Your Product:</h1>
                    {/* Products list */}
                    <div className='tab'>
                        {products.map((pro) => (
                            <div className='info' key={pro.p_id}>
                                <img src={pro.img} alt='Image' className='image'/>
                                <h3>Name: {pro.name}</h3>
                                <p>Description: {pro.description}</p>
                                <p>Price: {pro.price}</p>
                                <p>Date: {pro.added_date}</p>
                                <button className='button-pro' onClick={() => deleteItem(pro.p_id)}>Delete item</button>
                                {/* Render other properties of the product */}
                            </div>
                        ))}
                    </div>
    
                    {/* Orders */}
                    <h2>My orders:</h2>
                    <div>
                        {orders.map((ord) => (
                        <div className="order">
                            <ul>
                                {ord.batches.map((ba) => (
                                <li key={ba.product.p_id}>
                                    Key: {ba.product.p_id},
                                    Product: {ba.product.name}, Quantity: {ba.quantity}
                                    <div className="order">Status: {ba.status}</div>
                                    {ba.status !== "Shipped" && ba.status !== "Canceled" && (
                                        <button className='button-pro' onClick={() => updateOrderStatus(ba.product.p_id, "Shipped")}>Mark as Shipped</button>
                                    )}
                                    {ba.status !== "Shipped" && ba.status !== "Canceled" && (
                                        <button className='button-pro' onClick={() => updateOrderStatus(ba.product.p_id, "Canceled")}>Cancel Order</button>
                                    )}
                                </li>
                                ))}
                            </ul>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className='App'>
                <footer className='App-footer'>
                    <div className='col-md-4-1'>
                        <div className="App-logo">
                            <img src={"https://png.pngtree.com/element_our/20200610/ourmid/pngtree-shopping-mall-logo-image_2235997.jpg"} className="App-logo" alt="logo" />
                        </div>
                        <div className='copyright'>© Copyright 2023</div>
                    </div>
                    <div className='col-md-4-2'>
                        <h3> Contact us:</h3>
                        <ul>
                            <li className='footer-item'>Le Ngoc Hieu: s3927205@rmit.edu.vn</li>
                            <li className='footer-item'>Nguyen Cong Thinh: s3926387@rmit.edu.vn</li>
                            <li className='footer-item'>Nguyen Dang Ha: s3924594@rmit.edu.vn</li>
                        </ul>
                    </div>
                </footer>
            </div>
        </div>
    )
}