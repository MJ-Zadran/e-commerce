import React from 'react';
import './Navbar.css';
import navlogo from '../../assets/logo.png';
import arrow from '../../assets/arrows.png';



const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <img src={navlogo} alt='logo' />
        <div>
            <h1>SHOPPER</h1>
            <p>Admin Panel</p>
        </div>
      </div>
      <div className='arrow'>
        <img  src={arrow} alt='arrow' />
      </div>
    </div>
  )
}

export default Navbar
