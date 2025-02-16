import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import './ListUser.css';
import search_icon from '../../assets/people.png';


const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [finduser, setFindUser] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);


    useEffect(()=>{
        fetch('http://localhost:4000/getorder')
        .then((res) => res.json()).then((data) => {
          const fetchedUser = data.map((item) => ({
            ...item,
            time: item.time_out.split("T")[0],
            productArray: JSON.parse(item.product.replace(/{/g, "[").replace(/}/g, "]")),
            categoryArray: JSON.parse(item.category.replace(/{/g,"[").replace(/}/g,"]")),
          }))
          setUsers(fetchedUser);
          setFilteredUsers(fetchedUser)
        }) 
        
    },[])

    function handleChange(e){
      const query = e.target.value;
     setFindUser(query)

     if(query.trim() === ""){
      setFilteredUsers(users)
     }else{
      const matchUsers = users.filter((item) => 
        item.fullname.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(matchUsers)
     }

    }

    //  To Find User base on Search query
    function searchUser(e) {
      e.preventDefault();
      if (finduser.trim() === "") {
        setFilteredUsers(users); // Show all users if input is empty
      } else {
        const matchedUsers = users.filter((item) =>
          item.fullname.toLowerCase().includes(finduser.toLowerCase())
        );
        setFilteredUsers(matchedUsers);
      }
    }

    

    return (
        <div className='listuser'>
        <div className='search-list'>
          <h1>User Orders List</h1>
          <div className='search-icon'>
            <input type='text'  value={finduser} onChange={handleChange} name='search' placeholder='Search here'   />
            <img onClick={searchUser} src={search_icon}  alt='icon'  />
          </div>
        </div>
          <div className='listuser-format-main'>
            <p>FullName</p>
            <p>Payment Method</p>
            <p>Location</p>
            <p>Product ID</p>
            <p>Category</p>
            <p>Price</p>
            <p>Delivry Time</p>
          </div>
          <div className='listuser-allproducts'>
            <hr />
           
            {filteredUsers.length > 0 ? (filteredUsers.map((product, index) =>{
              return  <div key={index}>  
              {/* <Link to='/productshow' style={{textDecoration: 'none'}}> */}
              <div  className='listuser-format-main  listuser-format'>
                    <p>{product.fullname}</p>
                    <p>{product.payment_methods}</p>
                    <p>{product.user_location}</p>
                    <p className='item'>{product.productArray.map((item, i) => {
                      return <p key={i}>{item},</p>
                    })}</p>
                    <p className='item'>{product.categoryArray.map((item, i) => {
                      return <p key={i}>{item}, </p>
                    })}</p>
                    <p>${product.price}</p>
                    <p>{product.time}</p>
              </div>
              {/* </Link> */}
              <hr />
              </div>
            })): <p>No User is Found with Order</p>}
          </div>
        </div>
      )
}

export default ListUser;
