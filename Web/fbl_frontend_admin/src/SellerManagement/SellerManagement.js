import { useState, useEffect } from 'react'
import './SellerManagement.css'

const SellerManagement = () => {
    const [sellers,setSellers] = useState([])
    
    // THIS PART IS FOR FETCHING THE LATER ON sellerDB 
    // the state sellers are going to be set to the returned value of this function
    const fetchSellers = async () => {
        try {
            const response = await fetch ('http://localhost:8000/fetchSellers',{
                method: "GET",
                headers: {
                    'Content-type':'application/json'
                }
            })
            const sellersDB = await response.json()
            setSellers(sellersDB)
        } catch (error) {
            console.log(error)
        }        
    }

    useEffect(()=>{fetchSellers()},[])
    
    

    // let sellersDB = [
    //     {
    //         's_id': 's1',
    //         'name': 'Andy',
    //         'age': 24,
    //         'status': 'approved'
    //     },
    //     {
    //         's_id': 's2',
    //         'name': 'Bobby',
    //         'age': 20,
    //         'status': 'rejected'      
    //     },
    //     {
    //         's_id': 's3',
    //         'name': 'Cody',
    //         'age': 18,
    //         'status': 'pending'      
    //     }
    // ]

    // const [sellers,setSellers] = useState(sellersDB)



    // REMEMBER TO ALSO UPDATE MONGODB
    const handleStatusChangeSelect = async (s, e) => {
        let updatedStatus;
        if (e.target.value === "Approve") {
          updatedStatus = "Approved";
        } else if (e.target.value === "Reject") {
          updatedStatus = "Rejected";
        }
      
        try {
          const response = await fetch(`http://localhost:8000/updateSellerStatus/${s.s_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: updatedStatus }),
          });
      
          if (response.ok) {
            // Update the seller's status in the frontend state if the backend update was successful
            setSellers((prevSellers) =>
              prevSellers.map((_s) => {
                if (_s.s_id === s.s_id) {
                  return { ..._s, status: updatedStatus };
                }
                return _s;
              })
            );
          } else {
            // Handle error response
            console.log("Error updating seller status");
          }
        } catch (error) {
          console.log(error);
        }
      };
      
      const handleStatusChangeButton = async (s, e) => {
        let updatedStatus;
        if (e.target.value === "Reject") {
          updatedStatus = "Rejected";
        } else if (e.target.value === "Approve") {
          updatedStatus = "Approved";
        }
      
        try {
          const response = await fetch(`http://localhost:8000/updateSellerStatus/${s.s_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: updatedStatus }),
          });
      
          if (response.ok) {
            // Update the seller's status in the frontend state if the backend update was successful
            setSellers((prevSellers) =>
              prevSellers.map((_s) => {
                if (_s.s_id === s.s_id) {
                  return { ..._s, status: updatedStatus };
                }
                return _s;
              })
            );
          } else {
            // Handle error response
            console.log("Error updating seller status");
          }
        } catch (error) {
          console.log(error);
        }
      };



    return (
        <div>
            <div id ='space'></div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
                    {sellers.map((s) => (
                        <tr key = {s.s_id}>
                            <td>{s.s_id}</td>
                            <td>{s.business_name}</td>
                            <td>{s.status}</td>
                            <td>
                                { s.status === 'Approved' && (
                                    <button value='Reject' onClick={(e) => handleStatusChangeButton(s,e)}>Reject</button>
                                )}
                                { s.status === 'Rejected' && (
                                    <button value='Approve' onClick={(e) => handleStatusChangeButton(s,e)}>Approve</button>
                                )}
                                { s.status === 'Pending' && (
                                    <select onChange={(e) => handleStatusChangeSelect(s,e)}>
                                        <option>Select Approve or Reject</option>
                                        <option value='Approve'>Approve</option>
                                        <option value='Reject'>Reject</option>
                                    </select>
                                )}

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SellerManagement