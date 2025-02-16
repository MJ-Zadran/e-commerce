import './Sidebar.css';
import {Link} from 'react-router-dom';
import add_product_icon from '../../assets/shopping-cart.png';
import folder from '../../assets/folder.png'; 
import user_icon from '../../assets/team.png';


const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration: "none"}}>
        <div className='sidebar-item'>
            <img src={add_product_icon} alt='icon' />
            <p>Add Product</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration: "none"}}>
        <div className='sidebar-item'>
            <img src={folder} alt='icon' />
            <p>Product List</p>
        </div>
      </Link>
      <Link to={'/listusers'} style={{textDecoration: "none"}}>
          <div className='sidebar-item'>
              <img src={user_icon} alt='user' />
              <p>Order List</p>
          </div>
      </Link>
    </div>
  )
}

export default Sidebar
