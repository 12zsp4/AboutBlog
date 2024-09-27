import React from 'react'
import { Route, Routes, BrowserRouter} from 'react-router-dom'
import  AppMenu  from '../pages/Index'
import RegisterForm from '../pages/register'
import LoginForm from '../pages/login'
import UserInfoTable from '../pages/userInfo'; 
import UploadFile from '../pages/uploadBook';
import BookList from '../pages/bookList';
import PersonalList from '../pages/personalList';
export default function MyRoute() {
    return (
        <BrowserRouter>
            <Routes>
                 <Route path="/api/" element={<AppMenu />}>
                 <Route path="register" element={<RegisterForm />} /> 
                 <Route path="login" element={<LoginForm />} /> 
                 <Route path="userInfo" element={<UserInfoTable />} /> 
                 <Route path="uploadBook" element={<UploadFile />} />
                 <Route path="bookList" element={<BookList />} />
                 <Route path="personalList" element={<PersonalList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

