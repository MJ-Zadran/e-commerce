import React, { useState } from 'react';
import './AddProduct.css';
import upload_img from '../../assets/upload.png'; 

const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        new_price: "",
        old_price: ""
    })

    const imageHandler = (e) =>{
        setImage(e.target.files[0])
    }

    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]: e.target.value})
    }

    const addProduct = async() => {
        let resposeData;
        let product = productDetails;

        let formDate = new FormData();
        formDate.append("product", image);

        await fetch('http://localhost:4000/upload', {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
            body: formDate,
        }).then((res) => res.json()).then((data) => {resposeData = data});

        if(resposeData.success){
            product.image = resposeData.image_url;
            await fetch('http://localhost:4000/addproduct',{
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    "Content-Type":'application/json'
                },
                body: JSON.stringify(product),
            }).then((res) => res.json()).then((data)=> {
                data.success? alert("Product Added") : alert("Failed")
            })
        }
        console.log(productDetails);
    }

  return (
    <div className='addproduct'>
      <div className='addproduct-itemfeild'>
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler}  type='text' name='name' placeholder='Type here'/>
      </div>
      <div className='addproduct-price'>
        <div className='addproduct-itemfeild'>
            <p>Price</p>
            <input value={productDetails.old_price} onChange={changeHandler} type='text'  name='old_price' placeholder='Type here' />
        </div>
        <div className='addproduct-itemfeild'>
            <p>Offer Price</p>
            <input value={productDetails.new_price} onChange={changeHandler} type='text'  name='new_price' placeholder='Type here' />
        </div>
      </div>
      <div className='addproduct-category-img'>
        <div className='addproduct-itemfeild'>
            <p>Product Category</p>
            <select value={productDetails.category} onChange={changeHandler} name='category' className='addproduct-selector'>
                <option value="women" >Women</option>
                <option value="men" >Men</option>
                <option value="kids" >kids</option>
            </select>
        </div>
        <div className='addproduct-itemfeild'>
            <label htmlFor='file-input'>
                <img  src={image ? URL.createObjectURL(image): upload_img} className='addproduct-thumnail-img'  alt='img' />
            </label>
            <input onChange={imageHandler} type='file' name='image' id='file-input' hidden />
        </div>
      </div>
      <button onClick={()=>{addProduct()}} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct
