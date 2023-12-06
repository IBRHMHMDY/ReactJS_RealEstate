import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import {app} from '../firebase.js'
import { updateUserStart,updateUserSuccess,updateUserFailure,
   deleteUserStart,deleteUserSuccess,deleteUserFailure, 
   signOutStart,signOutSuccess,signOutFailure } from "../redux/user/userSlice.js"


export default function Profile() {
  const {currentUser, loading, error} = useSelector((state)=> state.user)
  const dispatch = useDispatch()
  const fileRef = useRef(null)
  const [imageFile, setImageFile] = useState(undefined)
  const [uploadPerc, setUploadPerc] = useState(0)
  const [uploadFileError, setUploadFileError] = useState(false)
  const [formData, setFormData] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(()=>{
    if(imageFile){
      // console.log(imageFile);
      handleUploadFile(imageFile)
    }
  }, [imageFile])
  
  // Firebase Storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')
  const handleUploadFile = (image)=>{
    const storage = getStorage(app)
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef,image)

    uploadTask.on('state_changed', (snapshot)=> {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setUploadPerc(Math.round(progress))
    },
    (error) => {
      setUploadFileError(true)
    },
    ()=> {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
        setFormData({...formData, avatar: downloadUrl})
      })
    });
  }

  const handleChange = (e)=>{
    setFormData({...formData, [e.target.id] : e.target.value})
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method: "POST",
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json()
      console.log(data);
      if(data.success === false){
        dispatch(updateUserFailure(data.message))
        return
      }
      dispatch(updateUserSuccess(data))
      setSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }
  
  const handleDeleteUser = async()=>{
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method: 'DELETE'
      })

      const data = await res.json()

      if(data.success === false){
        dispatch(deleteUserFailure(data.message))
        return
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOutUser = async()=>{
    try {
      dispatch(signOutStart())
      const res = await fetch('/api/auth/signout')
      const data = await res.json()
      if(data.success === false){
        dispatch(deleteUserFailure(data.message))
        return
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  return (
    <div className='max-w-lg mx-auto p-3'>
      <h1 className='text-3xl text-center font-semibold my-7'>Profile</h1>
      <form onSubmit={handleSubmit} 
            className='flex flex-col gap-7'>
        <input 
          onChange={(e)=> setImageFile(e.target.files[0])} 
          type="file" 
          ref={fileRef} 
          hidden 
          accept="image/*"/>
        
        <img src={formData.avatar || currentUser.avatar} alt="Profile"
            onClick={()=> fileRef.current.click()} 
            className="rounded-full w-24 h-24 object-cover self-center mt-2 cursor-pointer"/>
        
        {uploadFileError ? 
          (<p className="text-red-700 text-center">Error Image Upload</p>) :
          uploadPerc > 0 && uploadPerc < 100 ?
          (<p className="text-slate-700 text-center">Uploading {uploadPerc}%</p>) :
          uploadPerc === 100 ? 
          (<p className="text-green-900 text-center">Image Successfully Uploaded!</p>) : ''
        }

        <input 
          type="text" 
          defaultValue={currentUser.username} 
          onChange={handleChange} 
          className='p-3 rounded-lg border' 
          placeholder='UserName' 
          id="username" />
        
        <input 
          type="email" 
          defaultValue={currentUser.email} 
          onChange={handleChange} 
          className='p-3 rounded-lg border' 
          placeholder='Email' 
          id="email" />
        
        <input 
          type="password" 
          defaultValue={currentUser.password} 
          onChange={handleChange} 
          className='p-3 rounded-lg border' 
          placeholder='Password' 
          id="password" />
        
        <button disabled={loading}
          className='text-white bg-slate-700 p-3 rounded-lg hover:opacity-95 disabled:opacity-80 uppercase'>
          {loading ? 'Loading..' : 'Update'}
        </button>
      </form>
      <div className="flex justify-between items-center">
        <button onClick={handleDeleteUser} className="text-red-700 font-semibold p-3 mt-3">Delete Account</button>
        <button onClick={handleSignOutUser} className='text-red-700 font-semibold p-3 mt-3'>SignOut</button>
      </div>
      {error ? (<p className="bg-red-100 rounded-lg border border-red-700 font-semibold py-3 mt-5 text-red-900 text-center">{error}</p>) : ''}
      {success ? (<p className="bg-green-100 rounded-lg border border-green-700 font-semibold py-3 mt-5 text-green-900 text-center">'User is Updated Successfully'</p>) : ''}
    </div>
  )
}
