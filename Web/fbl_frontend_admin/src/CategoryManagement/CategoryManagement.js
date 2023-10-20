import { useState,useEffect } from 'react'
import './CategoryManagement.css'

const Category = ({categoryName}) => {
    const [selected, setSelected] = useState(false)
    const [parent,setParent] = useState([])
    const [children,setChildren] = useState([])
    const [isMakingNewSubcat, setIsMakingNewSubcat] = useState (false)
    const [newSubcatInput, setNewSubcatInput] = useState('')

    const handleToggleSelected = async(e) => {
        e.target.classList.toggle("is_selected")
        const currentlySelected = !selected
        await setSelected(currentlySelected)

        if (currentlySelected === true) {
            try {
                const response = await fetch(
                    'http://localhost:8000/fetchParentAndChildren',
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
        }
    }

    useEffect(()=> {children.forEach(e => {console.log(e)})},[children])

    const handleDelete = async() => {
        try {
            const response = await fetch ('http://localhost:8000/deleteCategory', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    categoryName: categoryName
                })
            })
            const result = await response.json()
            if (result['status'] === 1){
                alert("Category deleted sucecssfully")
            } else if (result['status'] === 0) {
                alert("Category NOT deleted! Category is associated with more Subcategories or Products!")
            } else if (result['status'] === -1) {
                alert("Category NOT deleted! No such category")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleAddSubcategory = () => {
        setIsMakingNewSubcat(true)
    }

    const handleSubcatInputChange = (e) => {
        setNewSubcatInput(e.target.value)
    } 

    const handleCancelMakingNewSubcategory = () => {
        setIsMakingNewSubcat(false)
    }

    const handleSubmitMakingNewSubcategory = async() =>{
        try {
            const response = await fetch('http://localhost:8000/makeNewSubcat', {
                method: 'POST',
                headers: {'Content-type':'application/json'},
                body: JSON.stringify({
                    parent: categoryName,
                    newSubcat: newSubcatInput,
                })
            })
            const result = await response.json()
            const status = result['status']
            console.log("status is "+ status)
            if (status === 1){
                alert("New Subcategory created Successfully!")
            } else {
                alert("This Category Exists!")
            } 
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <div className='catNameAndDelBut'>
                <div onClick={handleToggleSelected}>{categoryName}</div>
                {selected &&
                    <button onClick={handleDelete}>Delete Category</button>
                }
            </div>
            {selected && (children.length !== 0) && (
                <div className='subcatAndAddBut'>
                    <div>
                        {children.map((child) => (
                            <Category
                                key={child}
                                categoryName={child}
                            />
                        ))}
                    </div>
                    <button onClick={handleAddSubcategory}>Add New Subcategory To {categoryName}</button>
                    {isMakingNewSubcat && (
                        <div>
                            <div>Enter New Subcategory Name</div>
                            <input type='text' value={newSubcatInput} onChange={handleSubcatInputChange}></input>
                            <button onClick={handleCancelMakingNewSubcategory}>Cancel</button>
                            <button onClick={handleSubmitMakingNewSubcategory}>Submit</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}








const CategoryManagement = () => {

    // VARIABLES
    const [categoriesNames,setCategoriesNames] = useState([])
    const [makingNTLC, setMakingNTLC] = useState(false)
    const [NTLCInput, setNTLCInput] = useState('')
    

    // FUNCTIONS
    const fetchCategoriesNames = async() => {
        try {
            const response = await fetch(
                "http://localhost:8000/fetchCategoriesNames",
                {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }
            )
            const result = await response.json()
            const categories_names = result["categories_names"]
            setCategoriesNames(categories_names)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{fetchCategoriesNames()},[])

    // Making New Top Layer Category  // NTLC
    const handleNTLCButtonClicked = async() => {
        setMakingNTLC(true)
    }

    const handleCancelMakingNTLC = () => {
        setMakingNTLC(false)
    }
    const handleNTLCInputChange = (e) => {
        setNTLCInput(e.target.value)
    }
    const handleSubmitMakingNTLC = async() => {
        // alert(NTLCInput)
        try {
            const response = await fetch ('http://localhost:8000/makeNTLC', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    NTLCName: NTLCInput.toLowerCase()
                })
            })
            const result = await response.json()
            const status = result['status']
            if (status === 1) {
                alert("NTLC made!")
            } else if (status === 0) {
                alert("NTLC NOT made!")
            }
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div>
            {categoriesNames.map((categoryName) => (
                <Category 
                    key = {categoryName}
                    categoryName = {categoryName}
                />
            ))}
            <div id = "space1"></div>
            <button onClick={handleNTLCButtonClicked}>New Top Level Category</button>



            <div id = "space1"></div>
            {makingNTLC && (
                <div>
                    <div>New Category</div>
                    <input type = "text" value = {NTLCInput} onChange={handleNTLCInputChange}></input>
                    <button onClick={handleCancelMakingNTLC}>Cancel</button>
                    <button onClick={handleSubmitMakingNTLC}>Submit</button>
                </div>
            )}

        </div> 
    )
}    

export default CategoryManagement