import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cros_icon from '../../assets/close.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);

  const fetctInfo = async() => {
      await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => {setAllProducts(data)});
  }

  useEffect(() => {
    fetctInfo();
  },[])

  const remove_Product = async(id) => {
    await fetch("http://localhost:4000/removeproduct",{
      method:"POST",
      headers: {
        Accept: 'application/json',
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({id:id})
    })
    await fetctInfo();
  }

  return (
    <div className='listproduct'>
      <h1>All Product List</h1>
      <div className='listproduct-format-main'>
        <p>Product</p>
        <p>ID</p>
        <p>Title</p>
        <p>Old Pirce</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className='listproduct-allproducts'>
        <hr />
        {allProducts.map((product, index) =>{
          return <> 
          <div key={index} className='listproduct-format-main  listproduct-format'>
                <img  src={product.image} className='listproduct-product-icon' alt='img' />
                <p>{product.id}</p>
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img onClick={() => {remove_Product(product.id)}} className='listproduct-remove-icon' src={cros_icon} alt='crose'  />
          </div>
          <hr />
          </>
        })}
      </div>
    </div>
  )
}

export default ListProduct
