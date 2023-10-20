import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import pict from './pict/Iphone12.png';
import './Customer.css';
import { useNavigate } from 'react-router-dom';

const Category = ({categoryName, categoryFilter}) => {
    const [selected, setSelected] = useState(false)
    const [parent,setParent] = useState([])
    const [children,setChildren] = useState([])

    const handleToggleSelected = async(e) => {
        e.target.classList.toggle("is_selected")
        const currentlySelected = !selected
        await setSelected(currentlySelected)

        if (currentlySelected === true) {
            try {
                const response = await fetch('http://localhost:8000/fetchParentAndChildren',
                    {
                        method: "POST",
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            categoryName: categoryName
                        })
                    }
                )
                const result = await response.json()
                setParent(result['parent'])
                setChildren(result['children'])
            } catch (error) {
                console.log(error)
            }
            try {
                categoryFilter(categoryName)
                console.log(1)
            } catch (error) {
                console.log(error)
            }
        }
    }


    return (
        <div>
            <div onClick={handleToggleSelected}>{categoryName}</div>
            {selected && (children.length !== 0) && (
                <div>
                    {children.map((child) => (
                        <Category
                            key={child}
                            categoryName={child}
                            categoryFilter = {categoryFilter}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}


export default function Customer() {
    const navigate = useNavigate();
    const [storedEmail, setStoredEmail] = useState('');
    const [products, setProducts] = useState([]);
    const [dups, setDups] = useState([]);
    const [original, setOriginal] = useState([]);
    const [cartList, setCartList] = useState([]);
    const [orders,setOrders] = useState([]);
    // const [dups2, setDups2] = useState([])
    // Initialize the selected value and a function to set the selected value
    const [showProducts, setShowProducts] = useState(true);
    const [sortByPrice, setSortByPrice] = useState(false);
    const [sortByDate, setSortByDate] = useState(false);
    const [searchByName, setSearchByName] = useState('');
    const [TLCsNames, setTLCsNames] = useState([]); //TLC = Top Level Categories
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [quan, setQuan] = useState()
    const [pName, setPName] = useState('');
    const [pro, setPro] = useState([]);


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
            const findPro = [...original].filter(product => product.name.toLowerCase().trim() === searchByName.toLowerCase().trim());
            setProducts(findPro);
        }
    }

    const handleToggleShow = () => {
        setShowProducts(!showProducts);
        getCart();
    }

    const label = () => {
        if (showProducts) {
            return(<p>Product:</p>)
        } else {
            return(<p>Cart:</p>)
        }
    }

    const logout = () => {
        localStorage.removeItem('email')
        window.location.reload();
    }

    const login = () => {
        navigate('/Login')
    }

    const signup = () => {
        navigate('/Signup')
    }


    
    /* Backend data */
    const getData = async () => {
        try {
            const response = await fetch('http://localhost:8000/printAllData');
            const data = await response.json();
            const categories_products = data['result']
            setProducts(categories_products.flatMap((array) => array))
            setOriginal(categories_products.flatMap((array) => array));
            setDups(categories_products.flatMap((array) => array));
            // setDups2(data);
        } catch (error) {
            console.log(error);
        }
    };

    // easier way to add things is to send a whole object
    const addCart = (pro) => {
        console.log("Is Adding To Cart")
        setIsAddingToCart(true)
        setPName(pro.name)
        setPro(pro)
    }

    const getCart = async () => {
        try {
            const response = await fetch('http://localhost:8000/printCart',{
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({email:storedEmail})
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }
            const dataPromise = await response.json();
            // const data = dataPromise
            setCartList(dataPromise);
            // console.log(data)
        } catch (error) {
            console.log(error);
        }
    }
    // useEffect(()=>{cartList.forEach(p => console.log(p.name))},[cartList])
    const deleteCart = async (pid) => {
        try {
            // " ` " not " ' " , there is a difference  =") 
            const response = await fetch(`http://localhost:8000/deleteCart/${pid}/${storedEmail}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
              alert(data.message); 
              getCart();
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
            setProducts(productsFilteredByCategory);
            setOriginal(productsFilteredByCategory);
        } catch (error) {
            console.log(error)
        } 
    }

    const handleSubmitAddToCart = async() => {
        try {
            const response = await fetch('http://localhost:8000/addCart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({email: storedEmail, pro, quantity: quan}),
              });
              if (!response.ok) {
                  throw new Error(`Error: ${response.status}`);
              }
                console.log('Item added to cart successfully!');
            setIsAddingToCart(false)
            alert("Item added to cart!")
            setQuan("")
        } catch (error) {
            console.log(error)
        }
    }

    const handleMakeOrder = async() => {
        try {
            const response = await fetch('http://localhost:8000/makeOrder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({email: storedEmail}),
              });
              if (!response.ok) {
                  throw new Error(`Error: ${response.status}`);
              }
            alert("Order created successfully!!!")
        } catch (error) {
            console.log(error)
        }
    }
    
    const handleToggleShowOrders = async() => {
        try {
            const response = await fetch('http://localhost:8000/printOrder', {
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
            setOrders(data.flatMap((array) => array))
            console.log(data.flatMap((array) => array))
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(()=>{
        const storedEmail = localStorage.getItem('email');
        setStoredEmail(storedEmail);
        if (storedEmail) {
            handleToggleShowOrders();
        }
    },[])

    useEffect(() => {
        // console.log("The stored email is: " + storedEmail )
        getData();
        getCart();
        fetchTLCsNames();
        if (storedEmail) {
            handleToggleShowOrders();
        }
    }, [storedEmail]);

    return (
        <div>
            <div className="App">
            {storedEmail ? (
                <header className="App-header">
                    <div className="App-logo">
                        <img src={"https://png.pngtree.com/element_our/20200610/ourmid/pngtree-shopping-mall-logo-image_2235997.jpg"} className="App-logo" alt="logo" />
                    </div>
                        {storedEmail}
                    <div className='App-header-nav'> 
                        <button className='button' onClick={logout}>Log Out</button>
                    </div>
                </header>
                ) : (      
                <header className="App-header">
                    <div className="App-logo">
                        <img src={"https://png.pngtree.com/element_our/20200610/ourmid/pngtree-shopping-mall-logo-image_2235997.jpg"} className="App-logo" alt="logo" />
                    </div>
                    <div className='App-header-nav'>
                        <button className='button' onClick={login}>Log In</button>
                        <button className='button' onClick={signup}>Sign Up</button>
                    </div>
                </header>
              )}
            </div>
            <div className='display-container'>
            <div>
                    <div><button className='button' onClick={handleToggleShow}>Show Cart/Products</button></div>
                    {/* <div><button onClick={handleToggleShowOrders}>Show Orders</button></div> */}
                    <br/>
                    {/* Choose quantity */}
                    {showProducts &&
                    <div>
                        {isAddingToCart && 
                            <div>
                                <h3>Add To Cart</h3>
                                <div>
                                    <span>Product to add: </span>
                                    <span>{pName}</span>
                                </div>
                                <span>
                                    <div>Quantity</div>
                                    <input type="text" value={quan} onChange={(e) => setQuan(e.target.value)} />
                                    <button className='button' onClick={handleSubmitAddToCart}>Submit</button>
                                </span>
                            </div>
                        }
                    </div>
                    }
                    
                    <br/>
                    {/* Filter options */}
                    {showProducts && (
                        <div className='filterFunctions'>
                        <h3>Filter options:</h3>
                            <div>
                                <button className='button' onClick={() => setProducts(dups)}> Return all </button>
                                <br/><div className='bold'>Category:</div>
                                {TLCsNames.map((categoryName) => (
                                    <Category
                                        key = {categoryName}
                                        categoryName = {categoryName}
                                        categoryFilter = {handleCategoryFilter}
                                    />
                                ))}
                            </div>
                            <label>Price</label>
                            <input type="checkbox" checked={sortByPrice} onChange={filterPrice} />
                            <label>Date</label>
                            <input type="checkbox" checked={sortByDate} onChange={filterDate} />
                            <div>
                                <label>Search by name</label>
                                <input type='text' className='input-pro' placeholder="Name" value={searchByName} onChange={searchName} />
                                <button className='button' onClick={findName}>Find</button>
                            </div>
                        </div>
                    )}
                </div>
                <br/>
                <div className='display'>
                    <h1>{label()}</h1>
                    {/* Products list */}
                    {showProducts && 
                        <div className='tab'>
                        {/* Render other properties of the product */}
                            {products.map((pro) => (
                                <div className='info' key={pro.p_id}>
                                <img src={pro.img} alt='Image' className='image'/>
                                <h3>Name: {pro.name}</h3>
                                <p>Description: {pro.description}</p>
                                <p>Price: {pro.price}</p>
                                <p>Date: {pro.added_date}</p>
                                <button className='button-pro' onClick={() => addCart(pro)}>Add to cart</button>
                                </div>
                            ))}
                        </div>
                    }
                    {/* Cart list */}
                    {!showProducts && 
                        <div>
                            {/* Cart */}
                            <div className='tab'>
                                {cartList.map(({product, quantity}) => (
                                    <div className='info' key={product.p_id}>
                                        <img src={product.img} alt='Image' className='image'/>
                                        <h3>Name: {product.name}</h3>
                                        <p>Price: {product.price}</p>
                                        <p>Date: {product.added_date}</p>
                                        <p>Des: {product.description}</p>
                                        <p>Quan: {quantity}</p>
                                        <p>Seller email: {product.seller}</p>
                                        <button className='button-pro' onClick={() => deleteCart(product.p_id)}>Delete</button>
                                    </div>
                                ))}
                            </div>
                            <button className='button' onClick = {handleMakeOrder}>Make An Order</button>
                            {/* Orders */}
                            <div>
                                {orders.map((ord) => (
                                <div className="order">
                                    <h3>Seller: {ord.seller}</h3>
                                    <ul>
                                        {ord.batches.map((ba) => (
                                            <li>
                                            Product: {ba.product.name}, Quantity: {ba.quantity}
                                            <div className="order">Status: {ba.status}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                ))}
                            </div>
                        </div>
                    }
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
    );
}